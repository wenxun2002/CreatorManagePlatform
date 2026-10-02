export interface NavItem {
  key: string
  labelKey: string
  to: string
  icon: 'layout' | 'megaphone' | 'clapperboard' | 'wallet'
}

export interface UserBrief {
  id: string
  name: string
  avatarUrl: string
  status: 'online' | 'away' | 'offline'
}
