export type DashboardTab = 'short_video' | 'live'

export interface DateRange {
  start: string
  end: string
}

export interface CalendarEvent {
  id: string
  time: string
  title: string
  type: 'live' | 'video' | 'meeting'
  status: 'past' | 'upcoming'
}

export interface CreatorProfile {
  id: string
  name: string
  avatarUrl: string
  followers: number
  following: number
  likes: number
}

export interface TrendHistoryPoint {
  date: string
  value: number
}

export interface OverviewStat {
  id: string
  labelKey: string
  value: number
  unit?: string
  prefix?: string
  /** compact | currency | duration (value in seconds → mm:ss) */
  format?: 'compact' | 'currency' | 'duration'
  icon: 'eye' | 'heart' | 'dollar' | 'cart' | 'users' | 'clock' | 'gift'
  trendPercent: number
  trendLabelKey: string
  /** Last 7 daily values for sparkline expand view */
  trendHistory?: TrendHistoryPoint[]
}

export interface ChartPoint {
  date: string
  value: number
}

export interface ChartSeries {
  nameKey: string
  /** Left Y-axis label i18n key (read from dual chart container too) */
  yAxisName1Key?: string
  /** Right Y-axis label i18n key */
  yAxisName2Key?: string
  points: ChartPoint[]
}

export interface DualChartData {
  /** Left Y-axis name (i18n key) */
  yAxisName1Key: string
  /** Right Y-axis name (i18n key) */
  yAxisName2Key: string
  /** Left-axis series (views / concurrent viewers) */
  views: ChartSeries
  /** Right-axis series (revenue / GMV) */
  revenue: ChartSeries
}

export interface DemographicSlice {
  id: string
  labelKey: string
  value: number
}

export interface ListCardItem {
  id: string
  title: string
  coverUrl?: string
  subtitle?: string
  metricLabelKey?: string
  metricValue?: string
}

export interface DashboardListColumn {
  id: string
  titleKey: string
  items: ListCardItem[]
}

export interface DashboardData {
  profile: CreatorProfile
  stats: OverviewStat[]
  chart: DualChartData
  demographics: DemographicSlice[]
  lists: DashboardListColumn[]
  eventsMap: Record<string, CalendarEvent[]>
}
