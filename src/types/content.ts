export type ContentStatus = 'published' | 'draft' | 'scheduled'

export interface ContentItem {
  id: string
  title: string
  coverUrl: string
  durationSec: number
  status: ContentStatus
  /** ISO date or datetime — publish date, last edit, or scheduled time */
  date: string
}
