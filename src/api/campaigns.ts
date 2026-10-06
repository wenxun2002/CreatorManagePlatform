import { request } from '@/utils/request'
import type {
  ApiCampaign,
  Campaign,
  CreateCampaignPayload,
  UpdateCampaignStatusPayload,
} from '@/types/campaign'

const MULTIPART_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const

function mapCampaign(raw: ApiCampaign): Campaign {
  const creatorEmail = raw.creator?.email
  const managerEmail = raw.manager?.email
  const avatarEmail = creatorEmail ?? managerEmail ?? String(raw.id)
  const brandName = raw.creator?.name ?? raw.manager?.name ?? 'Campaign'
  const attachments = raw.attachment_files ?? []

  let brief = 'No campaign brief provided yet. Follow the brand guidelines discussed with your manager.'
  if (raw.submission_desc) {
    brief = raw.submission_desc
  } else if (raw.video_url) {
    brief = `Deliverable submitted:\n${raw.video_url}`
  }

  return {
    id: raw.id,
    title: raw.title,
    budget: Number(raw.budget),
    dueDate: raw.due_date,
    status: raw.status,
    videoUrl: raw.video_url,
    brandName,
    /** Prefer creator avatar so manager assignment cards are easy to tell apart. */
    brandLogoUrl: `https://i.pravatar.cc/80?u=${encodeURIComponent(avatarEmail)}`,
    creatorAvatarUrl: creatorEmail
      ? `https://i.pravatar.cc/80?u=${encodeURIComponent(creatorEmail)}`
      : undefined,
    managerAvatarUrl: managerEmail
      ? `https://i.pravatar.cc/80?u=${encodeURIComponent(managerEmail)}`
      : undefined,
    brief,
    attachments,
    submissionFile: raw.submission_file,
    submissionFileUrl: raw.submission_file_url ?? null,
    submissionOriginalName: raw.submission_original_name ?? null,
    submissionDesc: raw.submission_desc,
    managerId: raw.manager_id,
    creatorId: raw.creator_id,
    managerName: raw.manager?.name,
    creatorName: raw.creator?.name,
    creatorEmail: raw.creator?.email,
  }
}

export async function getCampaigns(): Promise<Campaign[]> {
  const { data } = await request.get<{ data: ApiCampaign[] }>('/api/campaigns')
  return (data.data ?? []).map(mapCampaign)
}

export async function createCampaign(payload: CreateCampaignPayload): Promise<Campaign[]> {
  const form = new FormData()
  form.append('title', payload.title)
  form.append('budget', String(payload.budget))
  form.append('due_date', payload.due_date)
  for (const id of payload.creator_ids) {
    form.append('creator_ids[]', String(id))
  }
  for (const file of payload.attachments ?? []) {
    form.append('attachments[]', file)
  }

  const { data } = await request.post<{ data: ApiCampaign[] }>('/api/campaigns', form, {
    headers: MULTIPART_HEADERS,
    timeout: 120_000,
  })

  return (data.data ?? []).map(mapCampaign)
}

export async function updateCampaignStatus(
  id: number,
  status: UpdateCampaignStatusPayload['status'],
  extra?: Omit<UpdateCampaignStatusPayload, 'status'>,
): Promise<Campaign> {
  const form = new FormData()
  form.append('status', status)

  if (extra?.submission_desc != null) {
    form.append('submission_desc', extra.submission_desc)
  }
  if (extra?.submission_file) {
    form.append('submission_file', extra.submission_file)
  }
  if (extra?.video_url != null) {
    form.append('video_url', extra.video_url)
  }

  // POST: multipart file uploads are unreliable with PATCH in PHP
  const { data } = await request.post<{ data: ApiCampaign }>(`/api/campaigns/${id}/status`, form, {
    headers: MULTIPART_HEADERS,
    timeout: 120_000,
  })

  return mapCampaign(data.data)
}

export async function getCreators(): Promise<
  { id: number; name: string; email: string; role: 'creator' }[]
> {
  const { data } = await request.get<{
    data: { id: number; name: string; email: string; role: 'creator' }[]
  }>('/api/creators')
  return data.data ?? []
}
