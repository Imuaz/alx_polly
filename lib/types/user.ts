export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
  role: 'user' | 'admin'
  isVerified: boolean
}

export interface UserProfile {
  id: string
  userId: string
  bio?: string
  location?: string
  website?: string
  socialLinks?: {
    twitter?: string
    github?: string
    linkedin?: string
  }
  preferences: UserPreferences
}

export interface UserPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  privacyLevel: 'public' | 'private' | 'friends'
  theme: 'light' | 'dark' | 'system'
}

export interface UserStats {
  totalPolls: number
  totalVotes: number
  pollsCreated: number
  pollsVotedOn: number
  averageParticipation: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}
