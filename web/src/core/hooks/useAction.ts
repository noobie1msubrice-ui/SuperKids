import { useCallback, useState } from 'react';
import { COPY } from '../utils/constants';

interface ActionState<Args extends unknown[], Result> {
  /** Runs the action; resolves to its result, or `undefined` if it failed. */
  run: (...args: Args) => Promise<Result | undefined>;
  /** True while the action is in flight. */
  pending: boolean;
  /** A user-facing error message from the last failed run, or null. */
  error: string | null;
  clearError: () => void;
}

/**
 * Wraps an async action (a service or Cloud Function call) with `pending` and
 * `error` state. The `action` must be a stable reference — service objects are
 * module-level singletons, so their methods qualify.
 */
export function useAction<Args extends unknown[], Result>(
  action: (...args: Args) => Promise<Result>,
): ActionState<Args, Result> {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (...args: Args): Promise<Result | undefined> => {
      setPending(true);
      setError(null);
      try {
        return await action(...args);
      } catch (err) {
        setError((err as Error).message || COPY.genericError);
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [action],
  );

  return { run, pending, error, clearError: () => setError(null) };
}
