import { useMemo } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { firestoreService } from '../../../core/services/firestoreService'
import { useCollectionData } from '../../../core/hooks/useCollectionData'

/** Live list of all store items owned by the signed-in parent. */
export function useParentStore() {
  const { profile } = useAuth()
  const query = useMemo(
    () =>
      profile?.role === 'parent'
        ? firestoreService.parentStoreQuery(profile.id)
        : null,
    [profile],
  )
  return useCollectionData(query)
}

/** Live list of active store items visible to the signed-in child. */
export function useChildStore() {
  const { profile } = useAuth()
  const query = useMemo(
    () =>
      profile?.role === 'child' && profile.parentId
        ? firestoreService.childStoreQuery(profile.parentId)
        : null,
    [profile],
  )
  return useCollectionData(query)
}
