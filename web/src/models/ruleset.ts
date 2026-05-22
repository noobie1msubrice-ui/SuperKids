import type { Timestamp } from 'firebase/firestore';
import { idConverter } from './converter';

/**
 * Lifecycle:
 *   pending → kid taps Accept (and others accept too) → active
 *   pending → kid taps Deny → denied
 *   active → expires after 7 days → parent can write new rules
 */
export type RulesetStatus = 'pending' | 'active' | 'denied';

/**
 * One ruleset per family. The document ID equals the parent's UID, so a
 * family always has exactly one current ruleset at `/rulesets/{parentUid}`.
 */
export interface Ruleset {
  id: string;
  parentId: string;
  text: string;
  status: RulesetStatus;
  sentAt: Timestamp | null;
  /** UIDs of children who have tapped Accept. */
  acceptedBy: string[];
  /** UID of the child who denied — present only when status='denied'. */
  deniedBy?: string;
  /** When all children had accepted (status went 'active'). */
  lockedAt?: Timestamp;
  /** lockedAt + 7 days; rules can't be replaced until this passes. */
  expiresAt?: Timestamp;
}

export const rulesetConverter = idConverter<Ruleset>();
