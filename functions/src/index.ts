import { setGlobalOptions } from 'firebase-functions/v2';
import { onCall } from 'firebase-functions/v2/https';

// One region for every function in the project (see doc 04 §1).
setGlobalOptions({ region: 'us-central1' });

/** Health-check callable used to verify deployment (see task T-0.4). */
export const ping = onCall(() => ({ ok: true, at: Date.now() }));

export { createChildAccount } from './createChildAccount';
export { updateChildCredentials } from './updateChildCredentials';
export { deleteChildAccount } from './deleteChildAccount';
export { approveTask } from './approveTask';
export { rejectTask } from './rejectTask';
export { purchaseStoreItem } from './purchaseStoreItem';
