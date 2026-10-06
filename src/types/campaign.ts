export type CampaignStatus = 'pending' | 'in_progress' | 'under_review' | 'completed'

export type CampaignFilter = 'all' | CampaignStatus

export interface CampaignAttachment {
  path: string
  name: string
  url: string
}

export interface CampaignUserBrief {
  id: number
  name: string
  email: string
  role: 'creator' | 'manager'
}

/** UI-facing campaign model (mapped from Laravel API). */
export interface Campaign {
  id: number
  title: string
  budget: number
  dueDate: string
  status: CampaignStatus
  videoUrl?: string | null
  brandName: string
  brandLogoUrl: string
  creatorAvatarUrl?: string
  managerAvatarUrl?: string
  brief: string
  attachments: CampaignAttachment[]
  submissionFile?: string | null
  submissionFileUrl?: string | null
  submissionOriginalName?: string | null
  submissionDesc?: string | null
  managerId: number
  creatorId: number
  managerName?: string
  creatorName?: string
  creatorEmail?: string
}

export interface CreateCampaignPayload {
  creator_ids: number[]
  title: string
  budget: number
  due_date: string
  attachments?: File[]
}

export interface UpdateCampaignStatusPayload {
  status: CampaignStatus
  submission_file?: File | null
  submission_desc?: string | null
  video_url?: string | null
}

/** Raw Laravel campaign JSON (snake_case). */
export interface ApiCampaign {
  id: number
  manager_id: number
  creator_id: number
  title: string
  budget: string | number
  due_date: string
  status: CampaignStatus
  video_url: string | null
  attachments?: string[] | null
  attachment_files?: CampaignAttachment[] | null
  submission_file: string | null
  submission_file_url?: string | null
  submission_original_name?: string | null
  submission_desc: string | null
  manager?: CampaignUserBrief | null
  creator?: CampaignUserBrief | null
}
