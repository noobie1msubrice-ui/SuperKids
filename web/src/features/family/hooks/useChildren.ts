import { useMemo } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { firestoreService } from '../../../core/services/firestoreService';
import { useCollectionData } from '../../../core/hooks/useCollectionData';
import type { UserProfile } from '../../../models/userProfile';

/** Live list of the signed-in parent's children, sorted by name. */
export function useChildren() {
  const { profile } = useAuth();

  const query = useMemo(
    () =>
      profile?.role === 'parent'
        ? firestoreService.childrenQuery(profile.id)
        : null,
    [profile],
  );

  const { data, loading, error } = useCollectionData<UserProfile>(query);
  const children = useMemo(
    () => [...data].sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [data],
  );

  return { children, loading, error };
}
