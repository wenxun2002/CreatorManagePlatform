import { delay } from './delay'
import type { ContentItem } from '@/types/content'

const contentItems: ContentItem[] = [
  {
    id: 'vid-01',
    title: 'Morning skincare routine — 60s tips',
    coverUrl: 'https://picsum.photos/seed/creator-vid-01/640/360',
    durationSec: 58,
    status: 'published',
    date: '2026-09-28',
  },
  {
    id: 'vid-02',
    title: 'Desk setup tour with soft lamp',
    coverUrl: 'https://picsum.photos/seed/creator-vid-02/640/360',
    durationSec: 142,
    status: 'published',
    date: '2026-09-22',
  },
  {
    id: 'vid-03',
    title: 'Cafe hopping reel #1 — Lumen Roast',
    coverUrl: 'https://picsum.photos/seed/creator-vid-03/640/360',
    durationSec: 34,
    status: 'published',
    date: '2026-09-18',
  },
  {
    id: 'vid-04',
    title: 'Weekend stretch warm-up',
    coverUrl: 'https://picsum.photos/seed/creator-vid-04/640/360',
    durationSec: 75,
    status: 'published',
    date: '2026-09-12',
  },
  {
    id: 'vid-05',
    title: 'Night city walkthrough B-roll cut',
    coverUrl: 'https://picsum.photos/seed/creator-vid-05/640/360',
    durationSec: 96,
    status: 'published',
    date: '2026-09-05',
  },
  {
    id: 'vid-06',
    title: 'Product unboxing draft — SoftLight',
    coverUrl: 'https://picsum.photos/seed/creator-vid-06/640/360',
    durationSec: 210,
    status: 'draft',
    date: '2026-10-01',
  },
  {
    id: 'vid-07',
    title: 'Editing tips challenge (rough cut)',
    coverUrl: 'https://picsum.photos/seed/creator-vid-07/640/360',
    durationSec: 48,
    status: 'draft',
    date: '2026-09-30',
  },
  {
    id: 'vid-08',
    title: 'Travel teaser — Kyoto alleys',
    coverUrl: 'https://picsum.photos/seed/creator-vid-08/640/360',
    durationSec: 28,
    status: 'draft',
    date: '2026-09-29',
  },
  {
    id: 'vid-09',
    title: 'Spring launch teaser drop',
    coverUrl: 'https://picsum.photos/seed/creator-vid-09/640/360',
    durationSec: 22,
    status: 'scheduled',
    date: '2026-10-08T10:00:00',
  },
  {
    id: 'vid-10',
    title: 'Live premiere highlight reel',
    coverUrl: 'https://picsum.photos/seed/creator-vid-10/640/360',
    durationSec: 185,
    status: 'scheduled',
    date: '2026-10-15T20:30:00',
  },
  {
    id: 'vid-11',
    title: 'Cafe hopping reel #2 — Night roast',
    coverUrl: 'https://picsum.photos/seed/creator-vid-11/640/360',
    durationSec: 41,
    status: 'scheduled',
    date: '2026-10-10T18:15:00',
  },
  {
    id: 'vid-12',
    title: 'Q4 brand collab teaser',
    coverUrl: 'https://picsum.photos/seed/creator-vid-12/640/360',
    durationSec: 55,
    status: 'published',
    date: '2026-08-28',
  },
]

export async function fetchContentItems(): Promise<ContentItem[]> {
  await delay(600)
  return contentItems.map((item) => ({ ...item }))
}
