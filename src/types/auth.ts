export type UserRole = 'creator' | 'manager'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface LoginPayload {
  email: string
  password: string
  device_name?: string
}

export interface LoginResponse {
  token: string
  token_type: string
  user: AuthUser
}
