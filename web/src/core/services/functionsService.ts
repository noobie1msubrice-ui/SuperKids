import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { COPY } from '../utils/constants';

/** An error already mapped to a message safe to show any user, child included. */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Maps a raw error from `httpsCallable` to an `AppError`. Cloud Functions throw
 * `HttpsError` with messages written to be child-safe (doc 04 §1), so the
 * message passes through; network failures become the friendly offline copy.
 */
function mapError(err: unknown): AppError {
  if (err instanceof Error && 'code' in err) {
    const code = String((err as { code: unknown }).code);
    if (code.includes('unavailable') || code.includes('deadline-exceeded')) {
      return new AppError(code, COPY.offlineAction);
    }
    return new AppError(code, err.message || COPY.genericError);
  }
  return new AppError('unknown', COPY.genericError);
}

/** Wraps a callable so every call returns typed data or throws an `AppError`. */
function callable<Req, Res>(name: string): (data: Req) => Promise<Res> {
  const fn = httpsCallable<Req, Res>(functions, name);
  return async (data: Req) => {
    try {
      const result = await fn(data);
      return result.data;
    } catch (err) {
      throw mapError(err);
    }
  };
}

export const functionsService = {
  createChildAccount: callable<
    { displayName: string; email: string; password: string },
    { childUid: string }
  >('createChildAccount'),

  updateChildCredentials: callable<
    { childUid: string; displayName?: string; newPassword?: string },
    { success: true }
  >('updateChildCredentials'),

  deleteChildAccount: callable<{ childUid: string }, { success: true }>(
    'deleteChildAccount',
  ),

  approveTask: callable<{ taskId: string }, { success: true; newBalance: number }>(
    'approveTask',
  ),

  rejectTask: callable<{ taskId: string }, { success: true }>('rejectTask'),

  purchaseStoreItem: callable<
    { storeItemId: string },
    { success: true; newBalance: number; backpackItemId: string }
  >('purchaseStoreItem'),
};
