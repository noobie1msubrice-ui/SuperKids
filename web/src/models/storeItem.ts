import type { Timestamp } from 'firebase/firestore';
import { idConverter } from './converter';

/** A reward a parent defines, priced in Stars, visible to all their children. */
export interface StoreItem {
  id: string;
  parentId: string;
  name: string;
  description?: string;
  starPrice: number;
  imageUrl?: string;
  imagePath?: string;
  isActive: boolean;
  createdAt: Timestamp | null;
}

export const storeItemConverter = idConverter<StoreItem>();
