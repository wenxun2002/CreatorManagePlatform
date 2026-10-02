export type CampaignStatus = 'pending' | 'in_progress' | 'under_review' | 'completed'

export type CampaignFilter = 'all' | CampaignStatus

export interface CampaignAttachment {
  id: string
  name: string
  sizeLabel: string
}

export interface Campaign {
  id: string
  brandName: string
  brandLogoUrl: string
  title: string
  budget: number
  dueDate: string
  status: CampaignStatus
  category?: string
  brief: string
  attachments: CampaignAttachment[]
}
