import { delay } from './delay'
import type { Campaign } from '@/types/campaign'

const campaigns: Campaign[] = [
  {
    id: 1,
    brandName: 'Aurora Beauty',
    brandLogoUrl: 'https://i.pravatar.cc/80?u=aurora-beauty',
    title: 'Spring skincare launch — 3 short videos',
    budget: 8500,
    dueDate: '2026-10-18',
    status: 'pending',
    brief: 'Create three vertical videos highlighting the spring skincare line.',
    attachments: [],
    managerId: 1,
    creatorId: 2,
    creatorName: 'Demo Creator',
  },
]

export async function fetchCampaigns(): Promise<Campaign[]> {
  await delay(800)
  return campaigns.map((item) => ({
    ...item,
    attachments: item.attachments.map((a) => ({ ...a })),
  }))
}
