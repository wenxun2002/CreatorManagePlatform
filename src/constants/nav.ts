import type { NavItem } from '@/types/common'

export const APP_NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', labelKey: 'nav.dashboard', to: '/dashboard', icon: 'layout' },
  { key: 'campaigns', labelKey: 'nav.campaigns', to: '/campaigns', icon: 'megaphone' },
  { key: 'content', labelKey: 'nav.content', to: '/content', icon: 'clapperboard' },
  { key: 'wallet', labelKey: 'nav.wallet', to: '/wallet', icon: 'wallet' },
]
