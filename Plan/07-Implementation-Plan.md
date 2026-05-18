# 07 — Implementation Plan

A phased, dependency-ordered build plan for the AI engineering team. Phases are sequential;
tasks **within** a phase can often run in parallel. Each task lists its dependencies, the
documents that define it, and its acceptance criteria.

## How to read a task
- **ID** — stable reference (e.g. `T-3.2`).
- **Dep** — task IDs that must finish first.
- **Spec** — the document(s) that define the details and acceptance criteria.
- **Done when** — the concrete completion check.

## Definition of Done (applies to every task)
Code compiles · TypeScript strict, no errors · follows `08-Project-Setup-and-Conventions.md`
· has tests where the task says so · ESLint clean · the "Done when" check passes on the
`dev` Firebase project (or Emulator).

---

## Phase 0 — Foundations

| ID | Task | Dep | Spec | Done when |
|----|------|-----|------|-----------|
| T-0.1 | Create Firebase projects `superkids-dev` and `superkids-prod`; enable Auth (email/password), Firestore, Functions, Storage, and Hosting. | — | 02 | Both projects exist; services enabled. |
| T-0.2 | Scaffold the React + TypeScript app with Vite, Tailwind CSS, ESLint/Prettier, and the folder structure from doc 08. | — | 08 | `npm run dev` serves a placeholder page; `npm run build` succeeds. |
| T-0.3 | Add the Firebase JS SDK; build the Firebase service wrappers and `.env`-based config for dev/prod. | T-0.1, T-0.2 | 02, 08 | App initialises Firebase against `superkids-dev`. |
| T-0.4 | Initialise the `functions/` TypeScript project; deploy a `ping` callable. | T-0.1 | 04, 08 | `ping` deploys and returns from the app. |
| T-0.5 | Set up the Firebase Emulator Suite (Auth, Firestore, Functions, Storage, Hosting) and the test harness. | T-0.1 | 05, 08 | `firebase emulators:start` runs; a sample rules test passes. |
| T-0.6 | Build the design system: Tailwind theme tokens, typography, and the shared components from doc 06 §2. | T-0.2 | 06 | A `/dev/components` gallery route renders every shared component. |
| T-0.7 | Set up routing with React Router, including the route table, `AppLayout` shell, and the auth-redirect guard. | T-0.2 | 06 §3 | Routes resolve; the guard redirects an unauthenticated user to `/role-select`. |

## Phase 1 — Authentication & roles

| ID | Task | Dep | Spec | Done when |
|----|------|-----|------|-----------|
| T-1.1 | `UserProfile` type + Firestore converter; `authService` and user `firestoreService` methods; `AuthContext`. | T-0.3 | 02, 03 | Unit tests for the converter pass; `AuthContext` exposes the current profile. |
| T-1.2 | Initial-load loading state + Role-select page. | T-0.6, T-0.7 | 06 §4 | Choosing a role routes to the matching login. |
| T-1.3 | Parent sign-up: form, validation, Auth create, `users` profile create (`role:"parent"`). | T-1.1 | 01 F2, 03, 05 | A new parent can register and lands on the parent home. |
| T-1.4 | Parent & child login pages. | T-1.1 | 01 F1, 06 §4 | Valid credentials sign in; invalid show friendly errors. |
| T-1.5 | Post-login routing by profile role; log out; role-mismatch handling. | T-1.3, T-1.4 | 05 §1 | A child account routes to the child home; a mismatch logs out with a message. |
| T-1.6 | Deploy the Firestore Security Rules for `users` and write emulator tests. | T-0.5, T-1.1 | 05 | Rules tests for `users` pass. |

## Phase 2 — Family / account linking

| ID | Task | Dep | Spec | Done when |
|----|------|-----|------|-----------|
| T-2.1 | Cloud Function `createChildAccount` (+ emulator tests, incl. rollback). | T-0.4, T-1.6 | 04 §2 | Tests pass; a child profile + Auth user are created and linked. |
| T-2.2 | Cloud Functions `updateChildCredentials` and `deleteChildAccount` (+ tests). | T-2.1 | 04 §3–4 | Rename, password reset, and cascading delete all verified. |
| T-2.3 | Family page + `ChildCard` list (live listener on `users where parentId == me`). | T-1.5 | 06 §5.5 | Parent sees their children update in real time. |
| T-2.4 | Add Child page calling `createChildAccount`; show credentials confirmation. | T-2.1, T-2.3 | 06 §5.6 | Parent adds multiple children; each can then log in as a Kid. |
| T-2.5 | Child detail page: header, edit name, reset password, remove child. | T-2.2, T-2.3 | 06 §5.7 | All child-management actions work end to end. |

## Phase 3 — Tasks

| ID | Task | Dep | Spec | Done when |
|----|------|-----|------|-----------|
| T-3.1 | `Task` type + converter; `useTasks` data hook; task write helpers. | T-1.1 | 03 §4 | Converter tests pass. |
| T-3.2 | Security Rules for `tasks` (+ emulator tests for parent & child paths). | T-1.6, T-3.1 | 05 §3, §6 | All `tasks` rules tests pass. |
| T-3.3 | Parent Tasks page: grouped list, status badges, pending-first sorting. | T-3.1, T-2.3 | 06 §5.1 | Parent sees tasks per child, live. |
| T-3.4 | Add / Edit Task page with the child select; create/update/delete writes. | T-3.2, T-3.3 | 01 F4, 06 §5.2 | A created task appears instantly in the child's app. |
| T-3.5 | Child Tasks page; **Done!** sets `pending_approval`. | T-3.2 | 01 F5, 06 §6.1 | Child marks a task done; the parent sees it pending. |
| T-3.6 | Cloud Function `approveTask` (+ emulator tests incl. double-call). | T-0.4, T-3.2 | 04 §5 | Approval credits Stars exactly once and writes a ledger entry. |
| T-3.7 | `rejectTask` (function or guarded write); wire the Approve/Reject UI. | T-3.6, T-3.3 | 04 §6 | Approve credits Stars; Reject returns the task to `available`. |

## Phase 4 — Store

| ID | Task | Dep | Spec | Done when |
|----|------|-----|------|-----------|
| T-4.1 | `StoreItem` type + converter; `useStoreItems` hook; image upload to Cloud Storage. | T-1.1 | 03 §5, §10 | Converter tests pass; an image uploads and returns a URL. |
| T-4.2 | Security Rules for `storeItems` + Storage rules (+ tests). | T-1.6, T-4.1 | 05 §3–4, §6 | All store rules tests pass. |
| T-4.3 | Parent Store page + Add/Edit Item page (image picker, price, active toggle). | T-4.2 | 01 F7, 06 §5.3–5.4 | A created item appears instantly in the child's Store. |
| T-4.4 | Child Store page; affordability state on each card. | T-4.2, T-3.6 | 01 F8, 06 §6.2 | Child sees the parent's active items with correct Buy state. |
| T-4.5 | Cloud Function `purchaseStoreItem` (+ emulator tests incl. insufficient balance). | T-0.4, T-4.2 | 04 §7 | Buying deducts Stars, creates a backpack item, and writes a ledger entry atomically. |
| T-4.6 | Wire the Buy flow: confirm dialog, function call, error handling, celebration. | T-4.4, T-4.5 | 06 §6.2, §7 | Affordable buy succeeds; unaffordable buy is blocked gracefully. |

## Phase 5 — Backpack & Star history

| ID | Task | Dep | Spec | Done when |
|----|------|-----|------|-----------|
| T-5.1 | `BackpackItem` and `Transaction` types + converters; data hooks. | T-1.1 | 03 §6–7 | Converter tests pass. |
| T-5.2 | Security Rules for `backpackItems` and `transactions` (+ tests). | T-1.6, T-5.1 | 05 §3, §6 | All backpack/ledger rules tests pass. |
| T-5.3 | Child Backpack page; **Show Parent** → `redeem_requested`. | T-5.2, T-4.5 | 01 F9, 06 §6.3 | Purchased items appear; redeem request works. |
| T-5.4 | Parent backpack/redeem view (in child detail); **Mark Redeemed**. | T-5.2, T-2.5 | 01 F10, 06 §5.7 | Parent marks an item redeemed; the child sees the status change. |
| T-5.5 | Star balance + transaction history on both profiles. | T-5.1, T-3.6 | 01 F11, 06 §6.4 | History lists every earn/spend correctly. |
| T-5.6 | Profile pages for both roles (edit display name, log out). | T-1.5 | 01 F12, 06 §5.8, §6.4 | Profile editing and log-out work. |

## Phase 6 — Polish, notifications, hardening

| ID | Task | Dep | Spec | Done when |
|----|------|-----|------|-----------|
| T-6.1 | Empty states, loading states, and friendly error copy across all pages. | Phases 1–5 | 06 §7 | Every list/page has the specified states. |
| T-6.2 | `RewardCelebration` animations for earning and buying. | T-3.6, T-4.6 | 06 §7 | Celebration plays on task approval (child view) and on purchase. |
| T-6.3 | (Optional) FCM web-push notifications + Firestore-trigger functions. | T-3.6, T-4.5 | 04 §9 | The four notification triggers deliver to a browser. |
| T-6.4 | Offline behaviour: enable Firestore persistence; clear "needs internet" messaging for actions. | Phases 1–5 | 02 §7 | Cached reads work offline; actions show the offline message. |
| T-6.5 | Full Security Rules audit against doc 05 §6; close any gaps. | All rules tasks | 05 §6 | Every mandatory rules test passes. |
| T-6.6 | Parent-account deletion flow (cascades to all children). | T-2.2 | 05 §5 | A parent can delete their account and all family data. |
| T-6.7 | Branding: favicon, `og:image`, page titles, PWA `manifest.json`; responsive + accessibility pass. | Phases 1–5 | 06 §1, §8 | Branding assets set; responsive and accessibility checklist met. |

## Phase 7 — Release

| ID | Task | Dep | Spec | Done when |
|----|------|-----|------|-----------|
| T-7.1 | Configure the production build for `superkids-prod`; deploy prod rules, indexes, and functions. | Phase 6 | 02 §6, 03 §8 | Prod environment fully provisioned. |
| T-7.2 | Deploy the web app to Firebase Hosting with SPA rewrites. | T-7.1 | 02 §9, 08 §11 | The app loads at the Hosting URL; deep links resolve. |
| T-7.3 | End-to-end manual test of the MVP success scenario. | T-7.2 | 01 §9 | The full parent→child scenario passes on prod. |
| T-7.4 | Privacy policy + parental-consent step at child creation (product-owner input). | T-7.2 | 05 §5 | Consent step shipped; policy linked in-app. |

---

## Critical path
`T-0.x → T-1.x → T-2.1 (createChildAccount) → T-3.6 (approveTask) → T-4.5 (purchaseStoreItem)
→ T-5.x → Phase 6 → Phase 7`. The three Cloud Functions are the highest-risk items — schedule
them early within their phases and test them hard against the Emulator.

## Suggested parallelisation
After Phase 1, two tracks can run side by side:
- **Backend track:** Cloud Functions + Security Rules + emulator tests (T-2.1, T-2.2, T-3.2,
  T-3.6, T-4.2, T-4.5, T-5.2).
- **Frontend track:** pages, components, and data hooks (T-2.3–2.5, T-3.3–3.5, T-4.3–4.4,
  T-5.x).

They integrate at the wiring tasks (T-2.4, T-3.7, T-4.6, T-5.4).
