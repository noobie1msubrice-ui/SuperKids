/**
 * Inline SVG icons. Each accepts a `className` so size and colour come from
 * Tailwind utilities at the call site. `currentColor` lets text colour drive
 * the fill where that is wanted.
 */

interface IconProps {
  className?: string;
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5l2.95 5.98 6.6.96-4.77 4.65 1.13 6.57L12 17.55l-5.9 3.11 1.13-6.57L2.46 9.44l6.6-.96L12 2.5z" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function TasksIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

export function StoreIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
      <path d="M3 9h18" />
      <path d="M9 13h6" />
    </svg>
  );
}

export function BackpackIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 8a6 6 0 0 1 12 0v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
      <path d="M9 14h6" />
    </svg>
  );
}

export function FamilyIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20v-1a6 6 0 0 1 12 0v1" />
      <path d="M15 20v-1a5 5 0 0 1 6.5-4.8" />
    </svg>
  );
}

export function ProfileIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20v-1a8 8 0 0 1 16 0v1" />
    </svg>
  );
}

/** Two adult figures side by side — used for the Parent role. */
export function ParentIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M2 20v-1a5 5 0 0 1 10 0v1" />
      <path d="M12 20v-1a5 5 0 0 1 10 0v1" />
    </svg>
  );
}

/** A small smiley-faced figure — used for the Kid role. */
export function KidIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M10 8h.01" />
      <path d="M14 8h.01" />
      <path d="M9.5 10.5a3 3 0 0 0 5 0" />
      <path d="M5 20v-1a7 7 0 0 1 14 0v1" />
    </svg>
  );
}

/** A wrapped gift box — used for rewards and the store. */
export function GiftIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      <path d="M12 8v14" />
      <path d="M12 8c-2 0-4-1-4-3a2 2 0 0 1 4 0c0 1.5-1 3-4 3z" />
      <path d="M12 8c2 0 4-1 4-3a2 2 0 0 0-4 0c0 1.5 1 3 4 3z" />
    </svg>
  );
}

/** A simple smiling face — used as a friendly avatar placeholder. */
export function SmileIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14a4 4 0 0 0 7 0" />
      <path d="M9 9h.01" />
      <path d="M15 9h.01" />
    </svg>
  );
}

/**
 * Gold trophy with a star on top — the Winkz brand mark. Designed in a
 * 24-wide viewBox so it slots into the same logo bubbles as the older
 * StarIcon. `fill="currentColor"` lets the call site colour it.
 */
export function TrophyIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 28"
      fill="currentColor"
      aria-hidden
    >
      {/* Star on top */}
      <path d="M12 0.5l1.2 2.6 2.85.4-2.05 2 .5 2.85L12 7l-2.5 1.35.5-2.85-2.05-2 2.85-.4Z" />
      {/* Left handle */}
      <path d="M5.5 8.5C3.2 8.5 1.5 10.2 1.5 12.5C1.5 14.7 3.2 16.5 5.5 16.5V14.5C4.3 14.5 3.5 13.6 3.5 12.5C3.5 11.4 4.3 10.5 5.5 10.5Z" />
      {/* Right handle */}
      <path d="M18.5 8.5C20.8 8.5 22.5 10.2 22.5 12.5C22.5 14.7 20.8 16.5 18.5 16.5V14.5C19.7 14.5 20.5 13.6 20.5 12.5C20.5 11.4 19.7 10.5 18.5 10.5Z" />
      {/* Cup body */}
      <path d="M5 7.5h14v6.5a7 7 0 0 1-14 0z" />
      {/* Stem */}
      <path d="M10.5 18h3v3.5h-3z" />
      {/* Base — two tiers */}
      <path d="M7 21h10v2H7z" />
      <path d="M8.5 23h7v2.5h-7z" />
    </svg>
  );
}

/** Closed padlock — marks a locked / expired account in the admin panel. */
export function LockIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

/** A wrench — used in the Admin chrome. */
export function AdminIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6 6a2 2 0 0 0 2.8 2.8l6-6a4 4 0 0 0 5.4-5.4l-2.4 2.4-2.4-2.4 2.4-2.4z" />
    </svg>
  );
}
