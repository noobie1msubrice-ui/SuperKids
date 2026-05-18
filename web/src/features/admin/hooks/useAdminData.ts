import { useMemo } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { firestoreService } from '../../../core/services/firestoreService'
import { useCollectionData } from '../../../core/hooks/useCollectionData'
import type { UserProfile } from '../../../models/userProfile'
import type { Task } from '../../../models/task'
import type { StoreItem } from '../../../models/storeItem'

/** Live list of every user account — admin only. */
export function useAllUsers() {
  const { profile } = useAuth()
  const query = useMemo(
    () => (profile?.role === 'admin' ? firestoreService.allUsersQuery() : null),
    [profile],
  )
  return useCollectionData<UserProfile>(query)
}

/** Live list of every task in the system — admin only. */
export function useAllTasks() {
  const { profile } = useAuth()
  const query = useMemo(
    () => (profile?.role === 'admin' ? firestoreService.allTasksQuery() : null),
    [profile],
  )
  return useCollectionData<Task>(query)
}

/** Live list of every store item in the system — admin only. */
export function useAllStoreItems() {
  const { profile } = useAuth()
  const query = useMemo(
    () =>
      profile?.role === 'admin' ? firestoreService.allStoreItemsQuery() : null,
    [profile],
  )
  return useCollectionData<StoreItem>(query)
}
