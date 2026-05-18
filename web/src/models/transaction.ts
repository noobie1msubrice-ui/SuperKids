import type { Timestamp } from 'firebase/firestore';
import { idConverter } from './converter';

export type TransactionType = 'earn' | 'spend';

/** An append-only Star ledger entry, written only by Cloud Functions. */
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  reason: string;
  refType: 'task' | 'purchase';
  refId: string;
  balanceAfter: number;
  createdAt: Timestamp | null;
}

export const transactionConverter = idConverter<Transaction>();
