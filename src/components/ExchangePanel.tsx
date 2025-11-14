'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/store'
import { FluxorService } from '@/services/fluxor'
import PaymentQRCode from './PaymentQRCode'
import { formatUSD, formatBalance } from '@/utils/format'

// XIN Asset ID
const XIN_ASSET_ID = 'c94ac88f-4671-3976-b60a-09064f1811e8'

export default function ExchangePanel() {
  const {
    selectedAssets,
    totalSelectedValue,
    clearSelection,
    balances
  } = useAppStore()

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [payUrl, setPayUrl] = useState<string | null>(null)
  const [traceIds, setTraceIds] = useState<string[]>([])

  // Calculate estimated XIN amount
  const estimatedXIN = useMemo(() => {
    if (totalSelectedValue === 0) return 0

    // Get XIN price from balances
    const xinBalance = balances[XIN_ASSET_ID]
    const xinPrice = parseFloat(xinBalance?.asset?.price_usd || '100') // Default to 100 if not found

    // Fee calculation: 8% (5% price slippage + 3% fee)
    const fee = 0.08
    const returnAmount = (totalSelectedValue * (1 - fee)) / xinPrice

    return returnAmount
  }, [totalSelectedValue, balances])

  const handleExchange = () => {
    if (selectedAssets.length === 0) return

    setIsGenerating(true)
    setError(null)

    try {
      // 使用 Mixin SDK 直接生成 Invoice，不需要调用后端
      const response = FluxorService.generateInvoice(selectedAssets, false)

      if (response.payUrl) {
        // Show QR code instead of redirecting
        setPayUrl(response.payUrl)
        setTraceIds(response.traceIds || [])
      } else {
        setError('Failed to generate invoice: No payUrl returned')
      }
    } catch (error) {
      console.error('Exchange error:', error)
      setError('Failed to initiate exchange. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBurn = () => {
    if (selectedAssets.length === 0) return

    setIsGenerating(true)
    setError(null)

    try {
      // 使用销毁地址生成 Invoice
      const response = FluxorService.generateInvoice(selectedAssets, true)

      if (response.payUrl) {
        setPayUrl(response.payUrl)
        setTraceIds(response.traceIds || [])
      } else {
        setError('Failed to generate burn invoice: No payUrl returned')
      }
    } catch (error) {
      console.error('Burn error:', error)
      setError('Failed to initiate burn. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearSelection = () => {
    clearSelection()
    setError(null)
  }

  const handleCloseQRCode = () => {
    setPayUrl(null)
    setTraceIds([])
    clearSelection()
  }

  return (
    <div>
      {payUrl && (
        <PaymentQRCode
          payUrl={payUrl}
          traceIds={traceIds}
          onClose={handleCloseQRCode}
        />
      )}

      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">资产操作</h2>

        {selectedAssets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p>选择资产进行操作</p>
            <p className="text-sm mt-1">仅支持小于 $10 的资产</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-blue-800">已选资产</span>
                <span className="text-sm font-medium text-blue-800 break-all">{formatUSD(totalSelectedValue)}</span>
              </div>
              <div className="space-y-2 mb-3">
                {selectedAssets.map((asset) => {
                  const assetValue = parseFloat(asset.total_amount) * parseFloat(asset.asset?.price_usd || '0')
                  return (
                    <div key={asset.asset_id} className="flex items-center justify-between gap-2 text-sm bg-white rounded-lg p-2">
                      <div className="flex items-center gap-2 min-w-0 flex-shrink">
                        <img
                          src={asset.asset?.icon_url || ''}
                          alt={asset.asset?.symbol || ''}
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-icon.png'
                          }}
                        />
                        <span className="text-blue-700 font-medium truncate">{asset.asset?.symbol}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-blue-700 font-medium text-xs md:text-sm break-all">
                          {formatUSD(assetValue)}
                        </div>
                        <div className="text-xs text-blue-600 break-all">
                          {formatBalance(parseFloat(asset.total_amount), '')}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-blue-300 pt-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm font-medium text-blue-800">预计可兑换</span>
                  <div className="text-base md:text-lg font-bold text-blue-900 break-all">
                    {formatBalance(estimatedXIN, 'XIN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={handleExchange}
            disabled={isGenerating || selectedAssets.length === 0}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>生成支付码中...</span>
              </div>
            ) : (
              `兑换 XIN (${selectedAssets.length} 个资产)`
            )}
          </button>

          <button
            onClick={handleBurn}
            disabled={isGenerating || selectedAssets.length === 0}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>生成支付码中...</span>
              </div>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2 inline-block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {`销毁资产 (${selectedAssets.length} 个资产)`}
              </>
            )}
          </button>

          <button
            onClick={handleClearSelection}
            className="btn-secondary w-full"
          >
            清除选择
          </button>
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-sm">
              💡 <strong>兑换 XIN：</strong>小额资产兑换服务，支付确认后 XIN 将自动发送到您的钱包
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">
              🔥 <strong>销毁资产：</strong>将资产永久转移到 Mixin 网络销毁地址，此操作不可逆
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}