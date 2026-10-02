/** Formats large numbers for dashboard displays: 1284500 → 1.28M, 92400 → 92.4K */
export function formatCompactNumber(value: number, digits = 1): string {
  const absolute = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (absolute >= 1_000_000) {
    return `${sign}${(absolute / 1_000_000).toFixed(digits)}M`
  }
  if (absolute >= 1_000) {
    return `${sign}${(absolute / 1_000).toFixed(digits)}K`
  }
  return `${sign}${Math.round(absolute).toLocaleString()}`
}

/** Formats a currency amount with compact suffix when large: 12450 → $12.5K */
export function formatCompactCurrency(value: number, prefix = '$'): string {
  const absolute = Math.abs(value)
  if (absolute >= 1_000) {
    return `${prefix}${formatCompactNumber(value)}`
  }
  const digits = Number.isInteger(value) ? 0 : 1
  return `${prefix}${absolute.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`
}

/** Formats a fixed currency amount: 12450 → $12,450.00 */
export function formatCurrency(value: number, prefix = '$'): string {
  const absolute = Math.abs(value)
  const formatted = absolute.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const sign = value < 0 ? '-' : ''
  return `${sign}${prefix}${formatted}`
}

/** Formats a signed wallet amount: +$500.00 / -$200.00 */
export function formatSignedCurrency(value: number, prefix = '$'): string {
  const absolute = Math.abs(value)
  const formatted = absolute.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const sign = value < 0 ? '-' : '+'
  return `${sign}${prefix}${formatted}`
}


