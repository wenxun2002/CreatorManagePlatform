import type { UserRole } from '@/types/auth'

export interface NavItem {
  key: string
  labelKey: string
  to: string
  icon: 'layout' | 'megaphone' | 'clapperboard' | 'wallet'
  /** Roles that can see this nav item */
  roles: UserRole[]
}

export interface UserBrief {
  id: string
  name: string
  avatarUrl: string
  status: 'online' | 'away' | 'offline'
}
