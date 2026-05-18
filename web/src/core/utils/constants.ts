/** Firestore collection names — referenced everywhere queries are built. */
export const COLLECTIONS = {
  users: 'users',
  tasks: 'tasks',
  storeItems: 'storeItems',
  backpackItems: 'backpackItems',
  transactions: 'transactions',
} as const;

/** Field length limits, mirrored from the data model (doc 03). */
export const LIMITS = {
  displayNameMin: 1,
  displayNameMax: 40,
  titleMax: 80,
  descriptionMax: 300,
  itemNameMax: 80,
  passwordMin: 6,
  starRewardMin: 1,
  starPriceMin: 1,
  imageMaxBytes: 5 * 1024 * 1024,
} as const;

/** Shared user-facing copy that appears in more than one place. */
export const COPY = {
  genericError: 'Something went wrong. Please try again.',
  offlineAction: 'You need internet to do that. Try again in a moment.',
  childLoginError: "That didn't work — check with your parent.",
} as const;
