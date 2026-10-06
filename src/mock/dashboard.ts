/**
 * Dashboard Mock — Single Source of Truth (SSOT)
 *
 * Pipeline (order is intentional — never reverse):
 *   1. Catalogs (videos / live sessions) with engagement clamped to 4–9%
 *   2. Daily series = catalog long-tail floor + release/long-tail spikes
 *   3. Cards / chart derive from that series; trend% = current vs previous totals
 *   4. Sparkline (trendHistory) = current-period daily slice (what the user expects to see)
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
  TrendHistoryPoint,
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
  publishTime: string
}

interface VideoDailyPoint {
  date: string
  views: number
  likes: number
  revenue: number
}

interface LiveDailyPoint {
  date: string
  viewers: number
  gmv: number
  gifts: number
  avgWatchSec: number
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

/** Release-day weight + 3-day long-tail (sums to 1). */
const LONG_TAIL_WEIGHTS = [0.55, 0.25, 0.15, 0.05] as const
const ENGAGEMENT_MIN = 0.04
const ENGAGEMENT_MAX = 0.09

/** Catalog long-tail floor — keeps idle days off absolute zero (no 90° cliffs). */
const BASE_VIEWS_MIN = 5_000
const BASE_VIEWS_MAX = 8_000
const BASE_REVENUE_MIN = 50
const BASE_REVENUE_MAX = 80

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

function rangeDayCount(range: DateRange): number {
  return dayOffset(range.start, range.end) + 1
}

/** Same-length window immediately before `range`. */
function previousRange(range: DateRange): DateRange {
  const days = rangeDayCount(range)
  return {
    start: shiftIso(range.start, -days),
    end: shiftIso(range.start, -1),
  }
}

function sliceSeries<T extends { date: string }>(series: T[], range: DateRange): T[] {
  const start = parseDate(range.start).getTime()
  const end = parseDate(range.end).getTime()
  return series.filter((point) => {
    const t = parseDate(point.date).getTime()
    return t >= start && t <= end
  })
}

function percentChange(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

/** Force like/view rate into the commercial [4%, 9%] band. */
function clampLikes(views: number, likes: number): number {
  if (views <= 0) return 0
  const rate = likes / views
  if (rate < ENGAGEMENT_MIN) return Math.round(views * ENGAGEMENT_MIN)
  if (rate > ENGAGEMENT_MAX) return Math.round(views * ENGAGEMENT_MAX)
  return likes
}

/** Deterministic 0..1 hash from an ISO date (stable across reloads). */
function dayUnitNoise(iso: string, salt = 17): number {
  let hash = salt >>> 0
  for (let i = 0; i < iso.length; i += 1) {
    hash = (hash * 31 + iso.charCodeAt(i)) >>> 0
  }
  return (hash % 1000) / 1000
}

/**
 * Soft catalog floor for one day: gentle sine + weekend lift + tiny noise.
 * Stays inside views 5–8k / revenue $50–80 so idle days still look like real long-tail traffic.
 */
function catalogFloorForDay(iso: string, index: number): Pick<VideoDailyPoint, 'views' | 'likes' | 'revenue'> {
  const dow = parseDate(iso).getDay()
  const weekend = dow === 0 || dow === 6 ? 1.06 : 1
  const wave = 0.5 + 0.5 * Math.sin(index * 0.65)
  const noise = dayUnitNoise(iso)

  const viewsRaw =
    BASE_VIEWS_MIN +
    (BASE_VIEWS_MAX - BASE_VIEWS_MIN) * wave +
    (noise - 0.5) * 900
  const views = Math.round(
    Math.min(BASE_VIEWS_MAX, Math.max(BASE_VIEWS_MIN, viewsRaw * weekend)),
  )

  const revenueRaw =
    BASE_REVENUE_MIN +
    (BASE_REVENUE_MAX - BASE_REVENUE_MIN) * wave +
    (noise - 0.5) * 10
  const revenue =
    Math.round(
      Math.min(BASE_REVENUE_MAX, Math.max(BASE_REVENUE_MIN, revenueRaw * weekend)) * 10,
    ) / 10

  const er = ENGAGEMENT_MIN + (ENGAGEMENT_MAX - ENGAGEMENT_MIN) * (0.35 + 0.3 * noise)
  const likes = clampLikes(views, Math.round(views * er))

  return { views, likes, revenue }
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
 * Master short-video catalog. releaseDate offsets are relative to "today"
 * so the default 14-day picker always covers every video.
 * Likes are clamped to 4–9% ER after construction.
 */
function buildMockVideos(today = new Date()): MockVideo[] {
  const day = (offsetFromToday: number) => {
    const d = new Date(today)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + offsetFromToday)
    return formatDate(d)
  }

  const raw: MockVideo[] = [
    // Older releases so the previous same-length window has real WoW signal
    {
      id: 'v-hist-01',
      title: 'Brand Collab Recap',
      coverUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=320&h=200&fit=crop',
      duration: '01:48',
      releaseDate: day(-22),
      views: 312_000,
      likes: 21_840,
      revenue: 890,
      publishTime: '18:30',
    },
    {
      id: 'v-hist-02',
      title: 'Editing Workflow Deep Dive',
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83b536e735b?w=320&h=200&fit=crop',
      duration: '04:12',
      releaseDate: day(-18),
      views: 198_600,
      likes: 14_900,
      revenue: 560,
      publishTime: '16:00',
    },
    {
      id: 'v-hist-03',
      title: 'Q&A: Creator Taxes',
      coverUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=320&h=200&fit=crop',
      duration: '02:55',
      releaseDate: day(-15),
      views: 145_200,
      likes: 9_440,
      revenue: 410,
      publishTime: '19:00',
    },
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
      likes: 68_768, // ~7% ER (was 25.6% — clamped at source)
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

  return raw.map((video) => ({
    ...video,
    likes: clampLikes(video.views, video.likes),
  }))
}

/**
 * Daily series SSOT for short video.
 * Start from catalog long-tail floor, then add release + weighted long-tail spikes.
 */
function buildVideoDailySeries(range: DateRange, videos: MockVideo[]): VideoDailyPoint[] {
  const days = eachDay(range)
  const map = new Map(
    days.map((date, index) => {
      const floor = catalogFloorForDay(date, index)
      return [date, { date, ...floor }]
    }),
  )

  for (const video of videos) {
    for (let offset = 0; offset < LONG_TAIL_WEIGHTS.length; offset += 1) {
      const key = shiftIso(video.releaseDate, offset)
      const point = map.get(key)
      if (!point) continue
      const weight = LONG_TAIL_WEIGHTS[offset]
      point.views += video.views * weight
      point.likes += video.likes * weight
      point.revenue += video.revenue * weight
    }
  }

  return days.map((date) => {
    const point = map.get(date)!
    return {
      date,
      views: Math.round(point.views),
      likes: Math.round(point.likes),
      revenue: Math.round(point.revenue * 10) / 10,
    }
  })
}

function sumVideoSeries(series: VideoDailyPoint[]) {
  return series.reduce(
    (acc, point) => {
      acc.views += point.views
      acc.likes += point.likes
      acc.revenue += point.revenue
      return acc
    },
    { views: 0, likes: 0, revenue: 0 },
  )
}

function toTrendHistory(
  series: { date: string; value: number }[],
): TrendHistoryPoint[] {
  return series.map((point) => ({ date: point.date, value: point.value }))
}

function buildChartFromVideoSeries(series: VideoDailyPoint[]): DualChartData {
  return {
    yAxisName1Key: 'dashboard.chart.views',
    yAxisName2Key: 'dashboard.chart.revenue',
    views: {
      nameKey: 'dashboard.chart.views',
      yAxisName1Key: 'dashboard.chart.views',
      yAxisName2Key: 'dashboard.chart.revenue',
      points: series.map((point) => ({ date: point.date, value: point.views })),
    },
    revenue: {
      nameKey: 'dashboard.chart.revenue',
      points: series.map((point) => ({ date: point.date, value: point.revenue })),
    },
  }
}

/**
 * Cards: totals from current series; WoW % vs previous totals;
 * sparkline = current-period daily path (matches what the card is summarizing).
 */
function buildStatsFromVideoSeries(
  current: VideoDailyPoint[],
  previous: VideoDailyPoint[],
): OverviewStat[] {
  const cur = sumVideoSeries(current)
  const prev = sumVideoSeries(previous)
  const gpm = cur.views > 0 ? (cur.revenue / cur.views) * 1000 : 0
  const prevGpm = prev.views > 0 ? (prev.revenue / prev.views) * 1000 : 0

  const viewsSpark = toTrendHistory(current.map((p) => ({ date: p.date, value: p.views })))
  const likesSpark = toTrendHistory(current.map((p) => ({ date: p.date, value: p.likes })))
  const revenueSpark = toTrendHistory(current.map((p) => ({ date: p.date, value: p.revenue })))
  const gpmSpark = toTrendHistory(
    current.map((p) => ({
      date: p.date,
      value: p.views > 0 ? Math.round((p.revenue / p.views) * 1000 * 10) / 10 : 0,
    })),
  )

  return [
    {
      id: 'views',
      labelKey: 'dashboard.stats.views',
      value: Math.round(cur.views),
      icon: 'eye',
      format: 'compact',
      trendPercent: percentChange(cur.views, prev.views),
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: viewsSpark,
    },
    {
      id: 'engagement',
      labelKey: 'dashboard.stats.engagement',
      value: Math.round(cur.likes),
      icon: 'heart',
      format: 'compact',
      trendPercent: percentChange(cur.likes, prev.likes),
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: likesSpark,
    },
    {
      id: 'revenue',
      labelKey: 'dashboard.stats.estRevenue',
      value: Math.round(cur.revenue),
      icon: 'dollar',
      prefix: '$',
      format: 'currency',
      trendPercent: percentChange(cur.revenue, prev.revenue),
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: revenueSpark,
    },
    {
      id: 'gpm',
      labelKey: 'dashboard.stats.gpm',
      value: Math.round(gpm * 10) / 10,
      icon: 'cart',
      prefix: '$',
      format: 'currency',
      trendPercent: percentChange(gpm, prevGpm),
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: gpmSpark,
    },
  ]
}

function buildMockLiveSessions(today = new Date()): MockLiveSession[] {
  const day = (offset: number) => {
    const d = new Date(today)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + offset)
    return formatDate(d)
  }

  return [
    // Prior-window streams so WoW / sparklines are not comparing against empty zeros
    {
      id: 'live-hist-01',
      title: 'Mid-month Skincare Drop',
      coverUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=320&h=200&fit=crop',
      date: day(-20),
      durationMins: 90,
      peakViewers: 11_200,
      avgWatchSec: 252,
      gmv: 15_400,
      gifts: 1_890,
    },
    {
      id: 'live-hist-02',
      title: 'Desk Accessories Clearance',
      coverUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=320&h=200&fit=crop',
      date: day(-16),
      durationMins: 105,
      peakViewers: 19_800,
      avgWatchSec: 310,
      gmv: 27_500,
      gifts: 3_420,
    },
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
 * Live daily series: metrics only on stream days. Non-stream days are strictly zero
 * (no phantom GMV / residual viewers).
 */
function buildLiveDailySeries(
  range: DateRange,
  sessions: MockLiveSession[],
): LiveDailyPoint[] {
  const sessionByDate = new Map(sessions.map((s) => [s.date, s]))
  return eachDay(range).map((date) => {
    const session = sessionByDate.get(date)
    if (!session) {
      return { date, viewers: 0, gmv: 0, gifts: 0, avgWatchSec: 0 }
    }
    return {
      date,
      viewers: session.peakViewers,
      gmv: session.gmv,
      gifts: session.gifts,
      avgWatchSec: session.avgWatchSec,
    }
  })
}

function buildChartFromLiveSeries(series: LiveDailyPoint[]): DualChartData {
  return {
    yAxisName1Key: 'dashboard.chart.viewers',
    yAxisName2Key: 'dashboard.chart.gmv',
    views: {
      nameKey: 'dashboard.chart.viewers',
      yAxisName1Key: 'dashboard.chart.viewers',
      yAxisName2Key: 'dashboard.chart.gmv',
      points: series.map((point) => ({ date: point.date, value: point.viewers })),
    },
    revenue: {
      nameKey: 'dashboard.chart.gmv',
      points: series.map((point) => ({ date: point.date, value: point.gmv })),
    },
  }
}

function maxOf(series: number[]): number {
  return series.reduce((max, value) => Math.max(max, value), 0)
}

function avgOfPositive(values: number[]): number {
  const positive = values.filter((v) => v > 0)
  if (positive.length === 0) return 0
  return positive.reduce((sum, v) => sum + v, 0) / positive.length
}

function buildLiveStatsFromSeries(
  current: LiveDailyPoint[],
  previous: LiveDailyPoint[],
): OverviewStat[] {
  const curPeak = maxOf(current.map((p) => p.viewers))
  const prevPeak = maxOf(previous.map((p) => p.viewers))
  const curAvgWatch = avgOfPositive(current.map((p) => p.avgWatchSec))
  const prevAvgWatch = avgOfPositive(previous.map((p) => p.avgWatchSec))
  const curGmv = current.reduce((sum, p) => sum + p.gmv, 0)
  const prevGmv = previous.reduce((sum, p) => sum + p.gmv, 0)
  const curGifts = current.reduce((sum, p) => sum + p.gifts, 0)
  const prevGifts = previous.reduce((sum, p) => sum + p.gifts, 0)

  return [
    {
      id: 'peakViewers',
      labelKey: 'dashboard.stats.peakConcurrent',
      value: curPeak,
      icon: 'users',
      format: 'compact',
      trendPercent: percentChange(curPeak, prevPeak),
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: toTrendHistory(current.map((p) => ({ date: p.date, value: p.viewers }))),
    },
    {
      id: 'avgWatch',
      labelKey: 'dashboard.stats.avgWatchTime',
      value: Math.round(curAvgWatch),
      icon: 'clock',
      format: 'duration',
      trendPercent: percentChange(curAvgWatch, prevAvgWatch),
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: toTrendHistory(
        current.map((p) => ({ date: p.date, value: p.avgWatchSec })),
      ),
    },
    {
      id: 'liveGmv',
      labelKey: 'dashboard.stats.liveGmv',
      value: curGmv,
      icon: 'cart',
      prefix: '$',
      format: 'currency',
      trendPercent: percentChange(curGmv, prevGmv),
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: toTrendHistory(current.map((p) => ({ date: p.date, value: p.gmv }))),
    },
    {
      id: 'gifts',
      labelKey: 'dashboard.stats.giftsTips',
      value: curGifts,
      icon: 'gift',
      prefix: '$',
      format: 'currency',
      trendPercent: percentChange(curGifts, prevGifts),
      trendLabelKey: 'dashboard.stats.vsLastWeek',
      trendHistory: toTrendHistory(current.map((p) => ({ date: p.date, value: p.gifts }))),
    },
  ]
}

function formatCompactCurrencyLike(value: number): string {
  return `$${formatCompactNumber(value)}`
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

function relativeDaysAgo(iso: string, now = new Date()): string {
  const days = Math.max(0, dayOffset(iso, formatDate(now)))
  if (days === 0) return 'today'
  if (days === 1) return '1d ago'
  return `${days}d ago`
}

/**
 * Calendar: derived from the same mockVideos.
 * - Day before release → prep meeting (for mid/high performers)
 * - Release day → video publish (+ evening live for viral hits)
 * - Day after viral → sponsor follow-up meeting
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

  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => a.time.localeCompare(b.time))
  }

  return map
}

/** Videos whose release (or long-tail spill) contributes inside `range`. */
function videosTouchingRange(range: DateRange, videos: MockVideo[]): MockVideo[] {
  const start = parseDate(range.start).getTime()
  const end = parseDate(range.end).getTime()
  return videos.filter((video) => {
    for (let offset = 0; offset < LONG_TAIL_WEIGHTS.length; offset += 1) {
      const t = parseDate(shiftIso(video.releaseDate, offset)).getTime()
      if (t >= start && t <= end) return true
    }
    return false
  })
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
  const scoped = videosTouchingRange(range, videos)
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
  const prev = previousRange(range)
  const extended: DateRange = { start: prev.start, end: range.end }

  if (tab === 'live') {
    const allSessions = buildMockLiveSessions()
    const liveSeries = buildLiveDailySeries(extended, allSessions)
    const currentSeries = sliceSeries(liveSeries, range)
    const previousSeries = sliceSeries(liveSeries, prev)
    const scopedSessions = sessionsInRange(range, allSessions)

    return {
      profile: buildProfile(),
      stats: buildLiveStatsFromSeries(currentSeries, previousSeries),
      chart: buildChartFromLiveSeries(currentSeries),
      demographics: demographics(),
      lists: buildLiveLists(scopedSessions.length > 0 ? scopedSessions : allSessions),
      eventsMap,
    }
  }

  const videoSeries = buildVideoDailySeries(extended, mockVideos)
  const currentSeries = sliceSeries(videoSeries, range)
  const previousSeries = sliceSeries(videoSeries, prev)

  return {
    profile: buildProfile(),
    stats: buildStatsFromVideoSeries(currentSeries, previousSeries),
    chart: buildChartFromVideoSeries(currentSeries),
    demographics: demographics(),
    lists: buildLists(range, mockVideos),
    eventsMap,
  }
}
