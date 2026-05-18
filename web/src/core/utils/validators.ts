import { LIMITS } from './constants';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns true for a plausibly valid email address. */
export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/**
 * react-hook-form validation rules, reused across the auth and family forms so
 * the same constraints apply wherever a field appears.
 */
export const rules = {
  displayName: {
    required: 'Please enter a name.',
    minLength: { value: LIMITS.displayNameMin, message: 'Name is too short.' },
    maxLength: {
      value: LIMITS.displayNameMax,
      message: `Name must be ${LIMITS.displayNameMax} characters or fewer.`,
    },
  },
  email: {
    required: 'Please enter an email.',
    validate: (value: string) =>
      isValidEmail(value) || 'That email address looks wrong.',
  },
  password: {
    required: 'Please enter a password.',
    minLength: {
      value: LIMITS.passwordMin,
      message: `Password must be at least ${LIMITS.passwordMin} characters.`,
    },
  },
} as const;
