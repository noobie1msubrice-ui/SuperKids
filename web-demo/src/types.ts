export interface UserProfile {
  id: string
  role: 'parent' | 'child'
  displayName: string
  email: string
  parentId?: string
  starBalance?: number
}

export interface Task {
  id: string
  parentId: string
  childId: string
  title: string
  description?: string
  starReward: number
  status: 'available' | 'pending_approval' | 'completed'
  createdAt: number
}

export interface StoreItem {
  id: string
  parentId: string
  name: string
  description?: string
  starPrice: number
  emoji: string
  isActive: boolean
}

export interface BackpackItem {
  id: string
  childId: string
  parentId: string
  storeItemId: string
  name: string
  emoji: string
  pricePaid: number
  status: 'owned' | 'redeem_requested' | 'redeemed'
  purchasedAt: number
}

export interface Transaction {
  id: string
  childId: string
  type: 'earn' | 'spend'
  amount: number
  reason: string
  balanceAfter: number
  createdAt: number
}
