export type TransactionType = 'campaign' | 'live_gift' | 'withdrawal'
export type TransactionStatus = 'success' | 'pending'
export type WithdrawMethod = 'bank' | 'paypal'

export interface WalletSummary {
  availableBalance: number
  estimatedMonthlyRevenue: number
  pendingFunds: number
  lifetimeWithdrawn: number
}

export interface WalletTransaction {
  id: string
  date: string
  description: string
  type: TransactionType
  status: TransactionStatus
  /** Positive = income, negative = outflow */
  amount: number
}

export interface WalletData {
  summary: WalletSummary
  transactions: WalletTransaction[]
}
