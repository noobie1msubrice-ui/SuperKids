import type { Timestamp } from 'firebase/firestore';
import { idConverter } from './converter';

export type BackpackStatus = 'owned' | 'redeem_requested' | 'redeemed';

/**
 * One item a child has purchased. Store-item details are copied in
 * (denormalised) so the Backpack survives later edits to the source item.
 */
export interface BackpackItem {
  id: string;
  childId: string;
  parentId: string;
  storeItemId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  pricePaid: number;
  status: BackpackStatus;
  purchasedAt: Timestamp | null;
  redeemRequestedAt?: Timestamp;
  redeemedAt?: Timestamp;
}

export const backpackItemConverter = idConverter<BackpackItem>();
