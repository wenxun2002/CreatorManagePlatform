import { delay } from './delay'
import type { WalletData, WalletSummary, WalletTransaction } from '@/types/wallet'

const summary: WalletSummary = {
  availableBalance: 12450,
  estimatedMonthlyRevenue: 3280.5,
  pendingFunds: 860,
  lifetimeWithdrawn: 45200,
}

const transactions: WalletTransaction[] = [
  {
    id: 'txn-01',
    date: '2026-10-01T14:22:00',
    description: 'Aurora Beauty — spring campaign payout',
    type: 'campaign',
    status: 'success',
    amount: 8500,
  },
  {
    id: 'txn-02',
    date: '2026-09-28T21:05:00',
    description: 'Live gifts — SoftLight premiere',
    type: 'live_gift',
    status: 'success',
    amount: 1260.4,
  },
  {
    id: 'txn-03',
    date: '2026-09-26T10:18:00',
    description: 'Withdrawal to Chase ****4821',
    type: 'withdrawal',
    status: 'success',
    amount: -2000,
  },
  {
    id: 'txn-04',
    date: '2026-09-22T16:40:00',
    description: 'NovaTech desk lamp campaign',
    type: 'campaign',
    status: 'pending',
    amount: 6200,
  },
  {
    id: 'txn-05',
    date: '2026-09-18T19:12:00',
    description: 'Live gifts — cafe night stream',
    type: 'live_gift',
    status: 'success',
    amount: 485.75,
  },
  {
    id: 'txn-06',
    date: '2026-09-15T09:30:00',
    description: 'Withdrawal to PayPal',
    type: 'withdrawal',
    status: 'pending',
    amount: -1500,
  },
  {
    id: 'txn-07',
    date: '2026-09-10T11:05:00',
    description: 'FitPulse weekend stretch payout',
    type: 'campaign',
    status: 'success',
    amount: 3200,
  },
  {
    id: 'txn-08',
    date: '2026-09-05T22:48:00',
    description: 'Live gifts — outdoor night walk',
    type: 'live_gift',
    status: 'success',
    amount: 912.2,
  },
  {
    id: 'txn-09',
    date: '2026-08-28T15:00:00',
    description: 'Withdrawal to Bank of America ****1190',
    type: 'withdrawal',
    status: 'success',
    amount: -5000,
  },
  {
    id: 'txn-10',
    date: '2026-08-20T13:26:00',
    description: 'Kyoto Trails travel partnership',
    type: 'campaign',
    status: 'success',
    amount: 15800,
  },
]

export async function fetchWalletData(): Promise<WalletData> {
  await delay(700)
  return {
    summary: { ...summary },
    transactions: transactions.map((item) => ({ ...item })),
  }
}

export async function submitWithdrawal(
  amount: number,
  _method: 'bank' | 'paypal',
): Promise<{ ok: true }> {
  await delay(1200)
  summary.availableBalance = Math.max(0, summary.availableBalance - amount)
  summary.lifetimeWithdrawn += amount
  summary.pendingFunds += amount * 0.05

  const entry: WalletTransaction = {
    id: `txn-${Date.now()}`,
    date: new Date().toISOString(),
    description: _method === 'paypal' ? 'Withdrawal to PayPal' : 'Withdrawal to bank account',
    type: 'withdrawal',
    status: 'pending',
    amount: -amount,
  }
  transactions.unshift(entry)

  return { ok: true }
}
