import { useEffect, useState } from 'react';
import { onSnapshot, type Query } from 'firebase/firestore';

interface CollectionState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

/**
 * Subscribes to a Firestore query and returns its documents live.
 *
 * The `query` argument MUST be memoised by the caller (feature hooks wrap it in
 * `useMemo`); a fresh query object every render would resubscribe endlessly.
 * Pass `null` while the query cannot yet be built (e.g. before auth resolves).
 */
export function useCollectionData<T>(query: Query<T> | null): CollectionState<T> {
  const [state, setState] = useState<CollectionState<T>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!query) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    setState({ data: [], loading: true, error: null });

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        setState({
          data: snapshot.docs.map((doc) => doc.data()),
          loading: false,
          error: null,
        });
      },
      (error) => {
        setState({ data: [], loading: false, error });
      },
    );

    return unsubscribe;
  }, [query]);

  return state;
}
