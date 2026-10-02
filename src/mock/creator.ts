import type { CreatorProfile } from '@/types/dashboard'

/** Shared creator identity — used by auth store and dashboard profile card. */
export const MOCK_CREATOR_PROFILE: CreatorProfile = {
  id: 'creator-001',
  name: 'Nova Chen',
  avatarUrl: 'https://i.pravatar.cc/160?u=nova-chen',
  followers: 1_280_000,
  following: 286,
  likes: 24_600_000,
}
