/**
 * 智能格式化数字，根据数值大小自动调整显示格式
 * @param value 要格式化的数字
 * @param options 格式化选项
 * @returns 格式化后的字符串
 */
export function formatSmartNumber(
  value: number | string,
  options: {
    prefix?: string // 前缀，如 "$"
    suffix?: string // 后缀，如 "BTC"
    maxDecimals?: number // 最大小数位数
    forceDecimals?: number // 强制小数位数
    compact?: boolean // 紧凑模式，更激进的缩写
  } = {}
): string {
  const { prefix = '', suffix = '', maxDecimals = 8, forceDecimals, compact = true } = options
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) return `${prefix}0${suffix}`

  let formatted: string

  // 处理非常大的数字（>= 1,000,000）- 使用缩写
  if (Math.abs(num) >= 1_000_000) {
    if (Math.abs(num) >= 1_000_000_000) {
      // 十亿级别
      formatted = (num / 1_000_000_000).toFixed(2) + 'B'
    } else {
      // 百万级别
      formatted = (num / 1_000_000).toFixed(2) + 'M'
    }
  }
  // 处理较大的数字（>= 1,000）- 使用千位分隔符或K缩写
  else if (Math.abs(num) >= 1_000) {
    if (compact && Math.abs(num) >= 10_000) {
      // 紧凑模式：>= 10K 使用 K 缩写
      formatted = (num / 1_000).toFixed(1) + 'K'
    } else {
      // 使用千位分隔符，减少小数位
      const decimals = forceDecimals !== undefined ? forceDecimals : Math.min(2, maxDecimals)
      formatted = num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      })
    }
  }
  // 处理中等数字（1 <= num < 1,000）- 适当小数位
  else if (Math.abs(num) >= 1) {
    const decimals = forceDecimals !== undefined ? forceDecimals : Math.min(4, maxDecimals)
    formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    })
  }
  // 处理小数（0 < num < 1）- 保持更多精度
  else if (Math.abs(num) > 0) {
    // 对于非常小的数字，使用科学计数法
    if (Math.abs(num) < 0.00000001) {
      formatted = num.toExponential(2)
    } else if (Math.abs(num) < 0.0001 && compact) {
      // 紧凑模式：极小数字使用科学计数法
      formatted = num.toExponential(2)
    } else {
      // 智能小数位数：显示有效数字
      let decimals = forceDecimals !== undefined ? forceDecimals : maxDecimals

      // 对于小数，确保至少显示2位有效数字
      if (Math.abs(num) < 0.01) {
        decimals = Math.min(6, maxDecimals)
      } else if (Math.abs(num) < 0.1) {
        decimals = Math.min(4, maxDecimals)
      }

      const fixed = num.toFixed(decimals)
      // 移除尾部的0
      formatted = parseFloat(fixed).toString()
    }
  }
  // 处理0
  else {
    formatted = '0'
  }

  return `${prefix}${formatted}${suffix ? ' ' + suffix : ''}`
}

/**
 * 格式化 USD 价值
 */
export function formatUSD(value: number | string): string {
  return formatSmartNumber(value, { prefix: '$', maxDecimals: 8 })
}

/**
 * 格式化资产余额
 */
export function formatBalance(value: number | string, symbol: string = ''): string {
  return formatSmartNumber(value, { suffix: symbol, maxDecimals: 8 })
}

/**
 * 获取完整的数字显示（用于 tooltip 或详情）
 */
export function formatFullNumber(value: number | string, decimals: number = 8): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}
