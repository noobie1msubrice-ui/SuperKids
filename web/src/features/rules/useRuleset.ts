import { useEffect, useMemo, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { firestoreService } from '../../core/services/firestoreService';
import type { Ruleset } from '../../models/ruleset';

/** Live subscription to the family's single Ruleset doc, keyed by parent UID. */
export function useRuleset(parentUid: string | null): {
  ruleset: Ruleset | null;
  loading: boolean;
} {
  const ref = useMemo(
    () => (parentUid ? firestoreService.rulesetDocRef(parentUid) : null),
    [parentUid],
  );
  const [ruleset, setRuleset] = useState<Ruleset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ref) {
      setRuleset(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(
      ref,
      (snap) => {
        setRuleset(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      () => {
        setRuleset(null);
        setLoading(false);
      },
    );
  }, [ref]);

  return { ruleset, loading };
}
