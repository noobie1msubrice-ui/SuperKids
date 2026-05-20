import { useEffect, useState } from 'react';
import { onSnapshot, type Timestamp } from 'firebase/firestore';
import { firestoreService } from '../services/firestoreService';

export interface AdminBroadcast {
  text: string;
  sentAt: Timestamp | null;
}

/**
 * Subscribes to the singleton `meta/adminMessage` doc. Returns the current
 * broadcast — or `null` when no admin message is set / it was cleared.
 */
export function useAdminBroadcast(): AdminBroadcast | null {
  const [msg, setMsg] = useState<AdminBroadcast | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      firestoreService.adminBroadcastDocRef(),
      (snap) => {
        if (!snap.exists()) {
          setMsg(null);
          return;
        }
        const data = snap.data() as { text?: string; sentAt?: Timestamp };
        if (typeof data.text !== 'string' || !data.text.trim()) {
          setMsg(null);
          return;
        }
        setMsg({ text: data.text, sentAt: data.sentAt ?? null });
      },
      () => setMsg(null),
    );
    return unsubscribe;
  }, []);

  return msg;
}
