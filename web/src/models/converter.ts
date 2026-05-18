import type {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';

/**
 * Builds a Firestore data converter for any model shaped `{ id: string; ... }`.
 *
 * `fromFirestore` folds the document ID into the model so components never
 * juggle a separate `snapshot.id`. `toFirestore` strips `id` back out — but
 * writes generally use plain objects (with `serverTimestamp()`) on un-converted
 * refs, so `toFirestore` is rarely exercised.
 */
export function idConverter<T extends { id: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(model: T) {
      const { id: _id, ...rest } = model;
      return rest;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
      return { id: snapshot.id, ...snapshot.data(options) } as T;
    },
  };
}
