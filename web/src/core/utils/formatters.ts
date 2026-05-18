import { format } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

/** Formats a Firestore Timestamp as a short, friendly date. */
export function formatDate(ts: Timestamp | null | undefined): string {
  if (!ts) {
    return '';
  }
  return format(ts.toDate(), 'd MMM yyyy');
}

/** Formats a Firestore Timestamp with the time of day included. */
export function formatDateTime(ts: Timestamp | null | undefined): string {
  if (!ts) {
    return '';
  }
  return format(ts.toDate(), 'd MMM yyyy, h:mm a');
}

/** Pluralises the word "Star" for a given count. */
export function starLabel(count: number): string {
  return count === 1 ? '1 Star' : `${count} Stars`;
}
