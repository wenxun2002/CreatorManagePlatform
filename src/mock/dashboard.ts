/**
 * Dashboard Mock — Single Source of Truth
 *
 * Data flow (all UI numbers derive from these masters):
 *   mockVideos  ──► chart spikes (release day + 3-day long-tail)
 *               ──► overview stats (sum of scoped videos)
 *               ──► list columns (top by views / recent by date)
 *               ──► calendar events (prep meeting / publish / live Q&A)
 *
 *   demographics ──► audience doughnut (static segment mix; not video-derived)
 *   profile      ──► identity card (followers/following static; likes ≈ video likes × lifetime)
 *
 * UI components must NOT invent business numbers — only render DashboardData from fetchDashboardData().
 */
import { delay } from './delay'
import { formatCompactNumber } from '@/utils/format'
import { MOCK_CREATOR_PROFILE } from '@/mock/creator'
import type {
  CalendarEvent,
  DashboardData,
  DashboardListColumn,
  DashboardTab,
  DateRange,
  DemographicSlice,
  DualChartData,
  ListCardItem,
  OverviewStat,
} from '@/types/dashboard'

export interface MockVideo {
  id: string
  title: string
  coverUrl: string
  duration: string
  releaseDate: string
  views: number
  likes: number
  revenue: number
  /** Publish / shoot clock time on release day */
  publishTime: string
}

const LONG_TAIL_WEIGHTS = [0.55, 0.25, 0.15, 0.05] as const
const BASE_DAILY_VIEWS = 10_000
const BASE_DAILY_REVENUE = 100

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function shiftIso(iso: string, days: number): string {
  const d = parseDate(iso)
  d.setDate(d.getDate() + days)
  return formatDate(d)
}

function eachDay(range: DateRange): string[] {
  const days: string[] = []
  const cursor = parseDate(range.start)
  const end = parseDate(range.end)
  while (cursor <= end) {
    days.push(formatDate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function dayOffset(fromIso: string, toIso: string): number {
  return Math.round((parseDate(toIso).getTime() - parseDate(fromIso).getTime()) / 86_400_000)
}

function eventStatus(iso: string, todayIso: string): CalendarEvent['status'] {
  return iso < todayIso ? 'past' : 'upcoming'
}

function pushEvent(
  map: Record<string, CalendarEvent[]>,
  dateKey: string,
  event: CalendarEvent,
) {
  if (!map[dateKey]) map[dateKey] = []
  map[dateKey].push(event)
}

/**
 * Master content catalog. releaseDate offsets are relative to "today"
 * so the default 14-day picker always covers every video.
 */
function buildMockVideos(today = new Date()): MockVideo[] {
  const day = (offsetFromToday: number) => {
    const d = new Date(today)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + offsetFromToday)
    return formatDate(d)
  }

  return [
    {
      id: 'v-viral-01',
      title: 'Morning Routine That Went Viral',
      coverUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=320&h=200&fit=crop',
      duration: '00:48',
      releaseDate: day(-8),
      views: 1_884_500,
      likes: 98_420,
      revenue: 4_860,
      publishTime: '18:00',
    },
    {
      id: 'v-viral-02',
      title: 'Desk Setup Tour 2026',
      coverUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=320&h=200&fit=crop',
      duration: '02:16',
      releaseDate: day(-4),
      views: 982_400,
      likes: 251_280,
      revenue: 2_140,
      publishTime: '19:30',
    },
    {
      id: 'v-03',
      title: 'Travel Vlog: Kyoto Alleys',
      coverUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=320&h=200&fit=crop',
      duration: '03:42',
      releaseDate: day(-12),
      views: 126_800,
      likes: 9_640,
      revenue: 420,
      publishTime: '17:00',
    },
    {
      id: 'v-04',
      title: 'Coffee Shop Finds',
      coverUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=320&h=200&fit=crop',
      duration: '01:05',
      releaseDate: day(-10),
      views: 84_200,
      likes: 6_120,
      revenue: 265,
      publishTime: '16:00',
    },
    {
      id: 'v-05',
      title: 'Behind the Scenes: Studio Day',
      coverUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=320&h=200&fit=crop',
      duration: '01:38',
      releaseDate: day(-6),
      views: 58_600,
      likes: 4_180,
      revenue: 180,
      publishTime: '15:30',
    },
    {
      id: 'v-06',
      title: 'Weekend Warm-up Stretch',
      coverUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=320&h=200&fit=crop',
      duration: '00:56',
      releaseDate: day(-3),
      views: 42_300,
      likes: 3_050,
      revenue: 125,
      publishTime: '10:00',
    },
    {
      id: 'v-07',
      title: 'Product Unboxing: Soft Light',
      coverUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=320&h=200&fit=crop',
      duration: '02:04',
      releaseDate: day(-2),
      views: 91_500,
      likes: 7_240,
      revenue: 510,
      publishTime: '14:00',
    },
    {
      id: 'v-08',
      title: 'Night City Walkthrough',
      coverUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=320&h=200&fit=crop',
      duration: '01:22',
      releaseDate: day(-1),
      views: 67_900,
      likes: 5_110,
      revenue: 240,
      publishTime: '21:00',
    },
    {
      id: 'v-09',
      title: 'Quick Edit Tips in 60s',
      coverUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=320&h=200&fit=crop',
      duration: '00:59',
      releaseDate: day(0),
      views: 38_400,
      likes: 2_860,
      revenue: 95,
      publishTime: '17:30',
    },
  ]
}

function videosInRange(range: DateRange, videos: MockVideo[]): MockVideo[] {
  const start = parseDate(range.start).getTime()
  const end = parseDate(range.end).getTime()
  return videos.filter((video) => {
    const t = parseDate(video.releaseDate).getTime()
    return t >= start && t <= end
  })
}

function relativeDaysAgo(iso: string, now = new Date()): string {
  const days = Math.max(0, dayOffset(iso, formatDate(now)))
  if (days === 0) return 'today'
  if (days === 1) return '1d ago'
  return `${days}d ago`
}

/** Chart: baseline + each video's views/revenue injected on release day with long-tail. */
function buildChartFromVideos(range: DateRange, videos: MockVideo[]): DualChartData {
  const days = eachDay(range)
  const viewsMap = new Map<string, number>()
  const revenueMap = new Map<string, number>()

  for (let i = 0; i < days.length; i += 1) {
    const day = days[i]
    const wobble = ((i % 5) - 2) * 180
    viewsMap.set(day, BASE_DAILY_VIEWS + wobble)
    revenueMap.set(day, BASE_DAILY_REVENUE + ((i % 4) - 1.5) * 8)
  }

  for (const video of videos) {
    for (let offset = 0; offset < LONG_TAIL_WEIGHTS.length; offset += 1) {
      const key = shiftIso(video.releaseDate, offset)
      if (!viewsMap.has(key)) continue
      const weight = LONG_TAIL_WEIGHTS[offset]
      viewsMap.set(key, (viewsMap.get(key) ?? 0) + video.views * weight)
      revenueMap.set(key, (revenueMap.get(key) ?? 0) + video.revenue * weight)
    }
  }

  return {
    yAxisName1Key: 'dashboard.chart.views',
    yAxisName2Key: 'dashboard.chart.revenue',
    views: {
      nameKey: 'dashboard.chart.views',
      yAxisName1Key: 'dashboard.chart.views',
      yAxisName2Key: 'dashboard.chart.revenue',
      points: days.map((date) => ({
        date,
        value: Math.round(viewsMap.get(date) ?? BASE_DAILY_VIEWS),
      })),
    },
    revenue: {
      nameKey: 'dashboard.chart.revenue',
      points: days.map((date) => ({
        date,
        value: Math.round((revenueMap.get(date) ?? BASE_DAILY_REVENUE) * 10) / 10,
      })),
    },
  }
}

interface MockLiveSession {
  id: string
  title: string
  coverUrl: string
  date: string
  durationMins: number
  peakViewers: number
  avgWatchSec: number
  gmv: number
  gifts: number
}

interface MockLiveProduct {
  id: string
  title: string
  coverUrl: string
  sold: number
  gmv: number
}

interface MockSupporter {
  id: string
  name: string
  avatarUrl: string
  contribution: number
}

function buildMockLiveSessions(today = new Date()): MockLiveSession[] {
  const day = (offset: number) => {
    const d = new Date(today)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + offset)
    return formatDate(d)
  }

  return [
    {
      id: 'live-01',
      title: 'Prime-time Beauty Drop',
      coverUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=320&h=200&fit=crop',
      date: day(-11),
      durationMins: 95,
      peakViewers: 12_400,
      avgWatchSec: 268,
      gmv: 18_600,
      gifts: 2_140,
    },
    {
      id: 'live-02',
      title: 'Desk Gear Flash Sale',
      coverUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=320&h=200&fit=crop',
      date: day(-8),
      durationMins: 128,
      peakViewers: 28_600,
      avgWatchSec: 342,
      gmv: 42_800,
      gifts: 5_620,
    },
    {
      id: 'live-03',
      title: 'Coffee Club Night Chat',
      coverUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=320&h=200&fit=crop',
      date: day(-6),
      durationMins: 72,
      peakViewers: 8_200,
      avgWatchSec: 214,
      gmv: 6_450,
      gifts: 980,
    },
    {
      id: 'live-04',
      title: 'SoftLight Product Premiere',
      coverUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=320&h=200&fit=crop',
      date: day(-3),
      durationMins: 110,
      peakViewers: 21_300,
      avgWatchSec: 318,
      gmv: 31_200,
      gifts: 3_870,
    },
    {
      id: 'live-05',
      title: 'Weekend Fitness Warm-up',
      coverUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=320&h=200&fit=crop',
      date: day(-1),
      durationMins: 88,
      peakViewers: 15_700,
      avgWatchSec: 296,
      gmv: 12_900,
      gifts: 2_560,
    },
    {
      id: 'live-06',
      title: 'Tonight: Edit Tips Live Q&A',
      coverUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=320&h=200&fit=crop',
      date: day(0),
      durationMins: 64,
      peakViewers: 9_850,
      avgWatchSec: 241,
      gmv: 7_820,
      gifts: 1_430,
    },
  ]
}

function buildMockLiveProducts(): MockLiveProduct[] {
  return [
    {
      id: 'prod-01',
      title: 'Aurora Vitamin C Serum',
      coverUrl: 'https://images.unsplash.com/photo-1620916567884-467e8d7b6c4c?w=160&h=100&fit=crop',
      sold: 1_842,
      gmv: 22_104,
    },
    {
      id: 'prod-02',
      title: 'NovaTech Soft Desk Lamp',
      coverUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=160&h=100&fit=crop',
      sold: 956,
      gmv: 28_680,
    },
    {
      id: 'prod-03',
      title: 'Lumen Pour-Over Kit',
      coverUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=160&h=100&fit=crop',
      sold: 724,
      gmv: 10_860,
    },
  ]
}

function buildMockSupporters(): MockSupporter[] {
  return [
    {
      id: 'fan-01',
      name: 'SkyWalker88',
      avatarUrl: 'https://i.pravatar.cc/80?u=skywalker88',
      contribution: 6_280,
    },
    {
      id: 'fan-02',
      name: 'LunaGifts',
      avatarUrl: 'https://i.pravatar.cc/80?u=lunagifts',
      contribution: 4_150,
    },
    {
      id: 'fan-03',
      name: 'PixelPatron',
      avatarUrl: 'https://i.pravatar.cc/80?u=pixelpatron',
      contribution: 2_970,
    },
  ]
}

/**
 * Live chart: concurrent viewers & GMV by stream day.
 * Curve is low at session start days, peaks mid-window, eases off — mimicking live audience flow.
 */
function buildChartFromLiveSessions(
  range: DateRange,
  sessions: MockLiveSession[],
): DualChartData {
  const days = eachDay(range)
  const sessionByDate = new Map(sessions.map((s) => [s.date, s]))
  const n = Math.max(days.length - 1, 1)

  const viewersPoints = days.map((date, i) => {
    const session = sessionByDate.get(date)
    if (session) {
      return { date, value: session.peakViewers }
    }
    // Soft background curve for non-stream days (warmup / residual)
    const progress = i / n
    const bell = Math.sin(progress * Math.PI)
    return { date, value: Math.round(1_200 + bell * 3_800) }
  })

  const gmvPoints = days.map((date, i) => {
    const session = sessionByDate.get(date)
    if (session) {
      return { date, value: session.gmv }
    }
    const progress = i / n
    const bell = Math.sin(progress * Math.PI)
    return { date, value: Math.round(180 + bell * 920) }
  })

  return {
    yAxisName1Key: 'dashboard.chart.viewers',
    yAxisName2Key: 'dashboard.chart.gmv',
    views: {
      nameKey: 'dashboard.chart.viewers',
      yAxisName1Key: 'dashboard.chart.viewers',
      yAxisName2Key: 'dashboard.chart.gmv',
      points: viewersPoints,
    },
    revenue: {
      nameKey: 'dashboard.chart.gmv',
      points: gmvPoints,
    },
  }
}

function buildLiveStats(sessions: MockLiveSession[]): OverviewStat[] {
  const peak = sessions.reduce((max, s) => Math.max(max, s.peakViewers), 0)
  const avgWatch =
    sessions.reduce((sum, s) => sum + s.avgWatchSec, 0) / Math.max(sessions.length, 1)
  const totalGmv = sessions.reduce((sum, s) => sum + s.gmv, 0)
  const totalGifts = sessions.reduce((sum, s) => sum + s.gifts, 0)

  const chartProxy = buildChartFromLiveSessions(
    {
      start: sessions[0]?.date ?? formatDate(new Date()),
      end: sessions[sessions.length - 1]?.date ?? formatDate(new Date()),
    },
    sessions,
  )
  const endDate =
    chartProxy.views.points[chartProxy.views.points.length - 1]?.date ??
    sessions[sessions.length - 1]?.date

  // Intentionally 2 up / 2 down so sparklines demonstrate both directions
  const peakTrend = 9.8
  const avgWatchTrend = -4.2
  const gmvTrend = 14.5
  const giftsTrend = -7.1

  return [
    {
      id: 'peakViewers',
      labelKey: 'dashboard.stats.peakConcurrent',
      value: peak,
      icon: 'users',
      format: 'compact',
      trendPercent: peakTrend,
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: buildTrendHistory(peak, peakTrend, endDate),
    },
    {
      id: 'avgWatch',
      labelKey: 'dashboard.stats.avgWatchTime',
      value: Math.round(avgWatch),
      icon: 'clock',
      format: 'duration',
      trendPercent: avgWatchTrend,
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: buildTrendHistory(Math.round(avgWatch), avgWatchTrend, endDate),
    },
    {
      id: 'liveGmv',
      labelKey: 'dashboard.stats.liveGmv',
      value: totalGmv,
      icon: 'cart',
      prefix: '$',
      format: 'currency',
      trendPercent: gmvTrend,
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: buildTrendHistory(totalGmv, gmvTrend, endDate),
    },
    {
      id: 'gifts',
      labelKey: 'dashboard.stats.giftsTips',
      value: totalGifts,
      icon: 'gift',
      prefix: '$',
      format: 'currency',
      trendPercent: giftsTrend,
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: buildTrendHistory(totalGifts, giftsTrend, endDate),
    },
  ]
}

function buildLiveLists(sessions: MockLiveSession[]): DashboardListColumn[] {
  const recentStreams = [...sessions]
    .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())
    .slice(0, 3)
    .map((s) => ({
      id: s.id,
      title: s.title,
      coverUrl: s.coverUrl,
      subtitle: `${s.durationMins} mins`,
      metricLabelKey: 'dashboard.lists.peakViewers',
      metricValue: formatCompactNumber(s.peakViewers),
    }))

  const products = buildMockLiveProducts().map((p) => ({
    id: p.id,
    title: p.title,
    coverUrl: p.coverUrl,
    subtitle: formatCompactCurrencyLike(p.gmv),
    metricLabelKey: 'dashboard.lists.soldUnits',
    metricValue: formatCompactNumber(p.sold),
  }))

  const supporters = buildMockSupporters().map((f, index) => ({
    id: f.id,
    title: f.name,
    coverUrl: f.avatarUrl,
    subtitle: `#${index + 1}`,
    metricLabelKey: 'dashboard.lists.contribution',
    metricValue: formatCompactCurrencyLike(f.contribution),
  }))

  return [
    {
      id: 'recentStreams',
      titleKey: 'dashboard.lists.recentStreams',
      items: recentStreams,
    },
    {
      id: 'topProducts',
      titleKey: 'dashboard.lists.topProducts',
      items: products,
    },
    {
      id: 'topSupporters',
      titleKey: 'dashboard.lists.topSupporters',
      items: supporters,
    },
  ]
}

function formatCompactCurrencyLike(value: number): string {
  return `$${formatCompactNumber(value)}`
}

/**
 * Calendar: derived from the same mockVideos.
 * - Day before release → prep meeting (for mid/high performers)
 * - Release day → video publish (+ evening live for viral hits)
 * - Day after viral → sponsor follow-up meeting
 * - Today also gets a standing business slot when a video publishes today
 */
function buildEventsMapFromVideos(
  videos: MockVideo[],
  today = new Date(),
): Record<string, CalendarEvent[]> {
  const todayIso = formatDate(today)
  const map: Record<string, CalendarEvent[]> = {}

  for (const video of videos) {
    const isViral = video.views >= 500_000
    const isNotable = video.views >= 80_000
    const release = video.releaseDate
    const dayBefore = shiftIso(release, -1)
    const dayAfter = shiftIso(release, 1)

    if (isNotable) {
      pushEvent(map, dayBefore, {
        id: `ev-prep-${video.id}`,
        time: '14:00',
        title: `Prep meeting: ${video.title}`,
        type: 'meeting',
        status: eventStatus(dayBefore, todayIso),
      })
    }

    pushEvent(map, release, {
      id: `ev-publish-${video.id}`,
      time: video.publishTime,
      title: `Publish: ${video.title}`,
      type: 'video',
      status: eventStatus(release, todayIso),
    })

    if (isViral) {
      pushEvent(map, release, {
        id: `ev-live-${video.id}`,
        time: '20:00 - 22:00',
        title: `Live premiere: ${video.title}`,
        type: 'live',
        status: eventStatus(release, todayIso),
      })
      pushEvent(map, dayAfter, {
        id: `ev-sponsor-${video.id}`,
        time: '11:00',
        title: `Sponsor debrief: ${video.title}`,
        type: 'meeting',
        status: eventStatus(dayAfter, todayIso),
      })
    }
  }

  // Stable recurring slots around "today" so the agenda is never empty on demo day
  // when the day's video already has events — only add if missing a business block.
  const todayEvents = map[todayIso] ?? []
  const hasMeetingToday = todayEvents.some((e) => e.type === 'meeting')
  if (!hasMeetingToday) {
    pushEvent(map, todayIso, {
      id: 'ev-standing-business',
      time: '14:00',
      title: 'Business meeting with sponsor',
      type: 'meeting',
      status: 'upcoming',
    })
  }

  const tomorrowIso = shiftIso(todayIso, 1)
  if (!(map[tomorrowIso]?.length)) {
    pushEvent(map, tomorrowIso, {
      id: 'ev-standing-thumb',
      time: '10:00',
      title: 'Thumbnail A/B review',
      type: 'meeting',
      status: 'upcoming',
    })
  }

  // Sort each day by time string for stable agenda order
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => a.time.localeCompare(b.time))
  }

  return map
}

function buildTopVideos(videos: MockVideo[]): ListCardItem[] {
  return [...videos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3)
    .map((video) => ({
      id: video.id,
      title: video.title,
      coverUrl: video.coverUrl,
      subtitle: video.duration,
      metricLabelKey: 'dashboard.lists.views',
      metricValue: formatCompactNumber(video.views),
    }))
}

function buildRecentPosts(videos: MockVideo[]): ListCardItem[] {
  return [...videos]
    .sort((a, b) => parseDate(b.releaseDate).getTime() - parseDate(a.releaseDate).getTime())
    .slice(0, 3)
    .map((video) => ({
      id: video.id,
      title: video.title,
      coverUrl: video.coverUrl,
      subtitle: relativeDaysAgo(video.releaseDate),
      metricLabelKey: 'dashboard.lists.views',
      metricValue: formatCompactNumber(video.views),
    }))
}

function buildLists(range: DateRange, videos: MockVideo[]): DashboardListColumn[] {
  const scoped = videosInRange(range, videos)
  return [
    {
      id: 'top',
      titleKey: 'dashboard.lists.topVideos',
      items: buildTopVideos(scoped),
    },
    {
      id: 'recent',
      titleKey: 'dashboard.lists.recentPosts',
      items: buildRecentPosts(scoped),
    },
    {
      id: 'opportunities',
      titleKey: 'dashboard.lists.opportunities',
      items: [],
    },
  ]
}

function percentChange(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

/**
 * Directed random walk over 7 days ending near `endValue` on `endDateIso`.
 * Overall direction follows `trendPercent`; day-to-day noise stays mild
 * so the curve reads like real business data (not a sine/sawtooth wave).
 */
function buildTrendHistory(
  endValue: number,
  trendPercent: number,
  endDateIso?: string,
  days = 7,
): { date: string; value: number }[] {
  const safeEnd = Math.max(Math.abs(endValue), 0.01)
  const isDown = trendPercent < 0
  const magnitude = Math.min(0.55, Math.abs(trendPercent) / 100)

  // Rising → low start; falling → high start. Gap sized by |trendPercent|.
  const startValue = isDown ? safeEnd / (1 - magnitude || 0.5) : safeEnd * (1 - magnitude)
  const safeStart = Math.max(startValue, safeEnd * 0.15)

  // Deterministic PRNG so mock stays stable across reloads for the same series
  let seed = Math.floor(safeEnd * 1000 + Math.abs(trendPercent) * 97) % 233280
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }

  const drift = (safeEnd - safeStart) / (days - 1)
  const values: number[] = []
  let current = safeStart

  for (let i = 0; i < days; i++) {
    if (i === 0) {
      values.push(roundHistoryValue(current, endValue))
      continue
    }
    if (i === days - 1) {
      values.push(roundHistoryValue(safeEnd, endValue))
      break
    }

    const noiseAmp = Math.abs(current) * 0.025
    const noise = (rand() - 0.5) * 2 * noiseAmp
    current = Math.max(0, current + drift + noise)

    const expected = safeStart + drift * i
    current = current * 0.72 + expected * 0.28

    if (isDown && current >= values[0]!) {
      current = values[0]! * (1 - 0.04 * i)
    } else if (!isDown && current <= values[0]!) {
      current = values[0]! * (1 + 0.04 * i)
    }

    values.push(roundHistoryValue(current, endValue))
  }

  const first = values[0]!
  const last = values[days - 1]!
  if (isDown && last >= first) {
    values[days - 1] = roundHistoryValue(first * (1 - Math.max(0.08, magnitude)), endValue)
  } else if (!isDown && last <= first) {
    values[days - 1] = roundHistoryValue(first * (1 + Math.max(0.08, magnitude)), endValue)
  }

  const endDate = endDateIso ? parseDate(endDateIso) : new Date()
  return values.map((value, index) => {
    const d = new Date(endDate)
    d.setDate(endDate.getDate() - (days - 1 - index))
    return { date: formatDate(d), value }
  })
}

function roundHistoryValue(value: number, endValue: number): number {
  return Number.isInteger(endValue) ? Math.round(value) : Math.round(value * 10) / 10
}

/** Overview cards + trends for short-video tab (derived from chart halves + video sums). */
function buildStatsFromChart(
  chart: DualChartData,
  videos: MockVideo[],
): OverviewStat[] {
  const viewsPoints = chart.views.points

  const totalViews = videos.reduce((sum, v) => sum + v.views, 0)
  const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0)
  const totalRevenue = videos.reduce((sum, v) => sum + v.revenue, 0)
  const gpm = totalViews > 0 ? (totalRevenue / totalViews) * 1000 : 0

  // Intentionally 2 up / 2 down so sparklines demonstrate both directions
  const viewsTrend = 12.5
  const engagementTrend = -8.3
  const revenueTrend = 15.2
  const gpmTrend = -5.6
  const endDate = viewsPoints[viewsPoints.length - 1]?.date

  return [
    {
      id: 'views',
      labelKey: 'dashboard.stats.views',
      value: Math.round(totalViews),
      icon: 'eye',
      format: 'compact',
      trendPercent: viewsTrend,
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: buildTrendHistory(Math.round(totalViews / 7), viewsTrend, endDate),
    },
    {
      id: 'engagement',
      labelKey: 'dashboard.stats.engagement',
      value: Math.round(totalLikes),
      icon: 'heart',
      format: 'compact',
      trendPercent: engagementTrend,
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: buildTrendHistory(Math.round(totalLikes / 7), engagementTrend, endDate),
    },
    {
      id: 'revenue',
      labelKey: 'dashboard.stats.estRevenue',
      value: Math.round(totalRevenue),
      icon: 'dollar',
      prefix: '$',
      format: 'currency',
      trendPercent: revenueTrend,
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: buildTrendHistory(Math.round(totalRevenue / 7), revenueTrend, endDate),
    },
    {
      id: 'gpm',
      labelKey: 'dashboard.stats.gpm',
      value: Math.round(gpm * 10) / 10,
      icon: 'cart',
      prefix: '$',
      format: 'currency',
      trendPercent: gpmTrend,
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: buildTrendHistory(Math.round(gpm * 10) / 10, gpmTrend, endDate),
    },
  ]
}

function buildProfile() {
  return { ...MOCK_CREATOR_PROFILE }
}

function demographics(): DemographicSlice[] {
  return [
    { id: '18-24', labelKey: 'dashboard.demographics.age1824', value: 45 },
    { id: '25-34', labelKey: 'dashboard.demographics.age2534', value: 30 },
    { id: '35-44', labelKey: 'dashboard.demographics.age3544', value: 15 },
    { id: 'other', labelKey: 'dashboard.demographics.other', value: 10 },
  ]
}

function sessionsInRange(range: DateRange, sessions: MockLiveSession[]): MockLiveSession[] {
  const start = parseDate(range.start).getTime()
  const end = parseDate(range.end).getTime()
  return sessions.filter((s) => {
    const t = parseDate(s.date).getTime()
    return t >= start && t <= end
  })
}

export async function fetchDashboardData(
  tab: DashboardTab,
  range: DateRange,
): Promise<DashboardData> {
  await delay(450)

  const mockVideos = buildMockVideos()
  const eventsMap = buildEventsMapFromVideos(mockVideos)

  if (tab === 'live') {
    const allSessions = buildMockLiveSessions()
    const sessions = sessionsInRange(range, allSessions)
    const scoped = sessions.length > 0 ? sessions : allSessions
    const chart = buildChartFromLiveSessions(range, scoped)

    return {
      profile: buildProfile(),
      stats: buildLiveStats(scoped),
      chart,
      demographics: demographics(),
      lists: buildLiveLists(scoped),
      eventsMap,
    }
  }

  const scopedVideos = videosInRange(range, mockVideos)
  const chart = buildChartFromVideos(range, mockVideos)

  return {
    profile: buildProfile(),
    stats: buildStatsFromChart(chart, scopedVideos),
    chart,
    demographics: demographics(),
    lists: buildLists(range, mockVideos),
    eventsMap,
  }
}
