'use client'

import { Asset } from '@/types'
import { useAppStore } from '@/store'
import clsx from 'clsx'
import { formatUSD, formatBalance, formatFullNumber } from '@/utils/format'
import { useState } from 'react'

interface AssetItemProps {
  asset: Asset
}

export default function AssetItem({ asset }: AssetItemProps) {
  const { selectedAssets, toggleAssetSelection } = useAppStore()
  const [showFullValue, setShowFullValue] = useState(false)
  const [showFullBalance, setShowFullBalance] = useState(false)

  const isSelected = selectedAssets.some(a => a.asset_id === asset.asset_id)
  const canSelect = asset.value_usd < 10

  const handleClick = () => {
    if (canSelect) {
      toggleAssetSelection({
        asset_id: asset.asset_id,
        total_amount: asset.balance,
        outputs: [],
        address: '',
        asset: {
          asset_id: asset.asset_id,
          chain_id: '',
          asset_key: '',
          precision: 0,
          name: asset.name,
          symbol: asset.symbol,
          price_usd: asset.price_usd,
          change_usd: '0',
          icon_url: asset.icon_url,
        }
      })
    }
  }

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'grid grid-cols-[auto_1fr_auto] gap-2 sm:gap-3 p-3 rounded-lg border transition-all duration-200 items-center',
        {
          'border-blue-500 bg-blue-50 cursor-pointer': isSelected,
          'border-gray-200 hover:border-gray-300 cursor-pointer': canSelect && !isSelected,
          'border-gray-300 bg-gray-200 cursor-not-allowed opacity-60': !canSelect,
        }
      )}
    >
      {/* Asset icon with chain icon overlay - 固定宽度 */}
      <div className="relative flex-shrink-0">
        <img
          src={asset.icon_url}
          alt={asset.symbol}
          className={clsx('w-10 h-10 rounded-full', {
            'opacity-50': !canSelect
          })}
          onError={(e) => {
            e.currentTarget.src = '/placeholder-icon.png'
          }}
        />
        {asset.chain_icon_url && (
          <img
            src={asset.chain_icon_url}
            alt="chain"
            className={clsx('absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white', {
              'opacity-50': !canSelect
            })}
          />
        )}
      </div>

      {/* Asset info - 占据剩余空间，最小宽度0允许收缩 */}
      <div className="min-w-0 overflow-hidden">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <h3 className={clsx('font-medium text-sm sm:text-base truncate', {
            'text-gray-900': canSelect,
            'text-gray-500': !canSelect
          })}>
            {asset.symbol}
          </h3>
          {!canSelect && (
            <span className="text-xs text-gray-600 bg-gray-300 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">
              不可兑换
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-500 truncate">
          {asset.name}
        </p>
        {!canSelect && (
          <p className="text-xs text-gray-500 mt-0.5">
            金额需小于 $10 才能兑换
          </p>
        )}
      </div>

      {/* Asset value - 固定宽度区域 */}
      <div className="text-right min-w-0 max-w-[140px] sm:max-w-[180px]">
        {/* USD 价值 - 点击切换显示格式 */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            setShowFullValue(!showFullValue)
          }}
          className={clsx('font-medium text-xs sm:text-sm cursor-pointer hover:underline break-words leading-tight', {
            'text-gray-900': canSelect,
            'text-gray-500': !canSelect
          })}
          title="点击查看完整数值"
        >
          {showFullValue ? `$${formatFullNumber(asset.value_usd, 8)}` : formatUSD(asset.value_usd)}
        </div>

        {/* 余额 - 点击切换显示格式 */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            setShowFullBalance(!showFullBalance)
          }}
          className="text-xs text-gray-500 cursor-pointer hover:underline break-words leading-tight mt-0.5"
          title="点击查看完整余额"
        >
          {showFullBalance
            ? `${formatFullNumber(parseFloat(asset.balance), 8)} ${asset.symbol}`
            : formatBalance(parseFloat(asset.balance), asset.symbol)}
        </div>
      </div>
    </div>
  )
}