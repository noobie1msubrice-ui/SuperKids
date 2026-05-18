import { useMemo } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { firestoreService } from '../../../core/services/firestoreService'
import { useCollectionData } from '../../../core/hooks/useCollectionData'

/** Live backpack contents for the signed-in child. */
export function useMyBackpack() {
  const { profile } = useAuth()
  const query = useMemo(
    () =>
      profile?.role === 'child'
        ? firestoreService.childBackpackQuery(profile.id)
        : null,
    [profile],
  )
  return useCollectionData(query)
}
