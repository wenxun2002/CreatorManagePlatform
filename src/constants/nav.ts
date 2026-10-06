import type { NavItem } from '@/types/common'
import type { UserRole } from '@/types/auth'

export const APP_NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    labelKey: 'nav.dashboard',
    to: '/dashboard',
    icon: 'layout',
    roles: ['creator'],
  },
  {
    key: 'campaigns',
    labelKey: 'nav.campaigns',
    to: '/campaigns',
    icon: 'megaphone',
    roles: ['creator', 'manager'],
  },
  {
    key: 'content',
    labelKey: 'nav.content',
    to: '/content',
    icon: 'clapperboard',
    roles: ['creator'],
  },
  {
    key: 'wallet',
    labelKey: 'nav.wallet',
    to: '/wallet',
    icon: 'wallet',
    roles: ['creator'],
  },
]

export function navItemsForRole(role: UserRole | null | undefined): NavItem[] {
  if (!role) return []
  return APP_NAV_ITEMS.filter((item) => item.roles.includes(role))
}

export function defaultHomeForRole(role: UserRole | null | undefined): string {
  if (role === 'manager') return '/campaigns'
  return '/dashboard'
}
