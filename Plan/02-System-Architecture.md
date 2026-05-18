# 02 — System Architecture

## 1. Architecture at a glance

```
        ┌──────────────────────┐        ┌──────────────────────┐
        │  Browser (Parent)    │        │  Browser (Child)     │
        │  SuperKids web app   │        │  SuperKids web app   │
        │  React + TypeScript  │        │  React + TypeScript  │
        └──────────┬───────────┘        └──────────┬───────────┘
                   │   same SPA, role-aware UI      │
                   └───────────────┬────────────────┘
                                   │ Firebase JS SDK (HTTPS / WebSocket)
              ┌────────────────────┼─────────────────────┐
              │                    │                     │
     ┌────────▼────────┐  ┌────────▼────────┐  ┌─────────▼────────┐
     │ Firebase Auth   │  │ Cloud Firestore │  │ Cloud Functions  │
     │ email/password  │  │ real-time DB    │  │ TypeScript/Node  │
     └─────────────────┘  └────────┬────────┘  └─────────┬────────┘
                                   │                     │
                          ┌────────▼────────┐   ┌─────────▼────────┐
                          │ Security Rules  │   │ Firebase Admin   │
                          │ (access control)│   │ SDK (privileged) │
                          └─────────────────┘   └──────────────────┘
   ┌──────────────────┐   ┌─────────────────────────────────────────┐
   │ Firebase Hosting │   │ Cloud Storage (Store item images)        │
   │ serves the SPA   │   └─────────────────────────────────────────┘
   └──────────────────┘
```

SuperKids is a **single-page web application** (SPA) served by Firebase Hosting. The same
React app renders a Parent or a Child experience depending on the authenticated user's role.
There is **no custom backend server** — Firebase provides auth, database, file storage, static
hosting, and a place to run privileged logic (Cloud Functions).

## 2. Tech stack and rationale

| Layer | Choice | Why |
|-------|--------|-----|
| UI framework | **React 18 + TypeScript** | Mature, widely supported, type-safe; large ecosystem and excellent Firebase support. |
| Build tool | **Vite** | Fast dev server and optimised production builds; first-class TypeScript and env-mode handling. |
| Styling | **Tailwind CSS** | Rapid, consistent styling from design tokens; no separate CSS files to drift. |
| Routing | **React Router v6** | Declarative routes with role-based redirect guards. |
| Server state | **Firestore listeners via custom hooks** | Real-time `onSnapshot` subscriptions give instant parent→child propagation with no polling. |
| Auth | **Firebase Authentication** | Managed email/password auth, secure token handling, password reset built-in. |
| Database | **Cloud Firestore** | Real-time listeners deliver live updates to every open browser tab. |
| Privileged logic | **Cloud Functions (TypeScript)** | Needed for operations a client must not be trusted with: creating child auth accounts, crediting Stars, processing purchases. |
| File storage | **Cloud Storage** | Hosts Store item images; integrates with Security Rules. |
| Hosting | **Firebase Hosting** | Global CDN, free TLS, atomic deploys, one toolchain with the rest of Firebase. |
| Notifications | **Firebase Cloud Messaging (web push)** | Phase 6, optional. |

**Why Firebase over a custom backend:** the core requirement is that a parent's action
appears instantly in the child's browser. Firestore's real-time listeners deliver this for
free. The team is small and data volume is low; a managed backend removes server ops
entirely. App and Cloud Functions are both TypeScript — one language across the project.

## 3. Client application architecture

The React app uses a layered, feature-first architecture. Dependencies point downward only.

```
  Pages / Routes  →  Route components (Tasks, Store, Backpack, Family, Auth …)
        │
  Components      →  Presentational + shared UI (StarChip, TaskCard, EmptyState …)
        │
  Hooks           →  Custom hooks: data hooks (useTasks) + action hooks (useApproveTask)
        │
  Context         →  AuthContext — current Firebase user + profile, app-wide
        │
  Models / Types  →  TypeScript types + Firestore data converters
        │
  Services        →  Firebase wrappers: authService, firestoreService,
                      functionsService, storageService
```

- **Pages and components** never touch Firebase directly — only hooks and context.
- **Data hooks** wrap `onSnapshot` and return `{ data, loading, error }`; they convert raw
  Firestore documents into typed models via converters.
- **Action hooks** perform writes or call Cloud Functions and expose `{ run, pending, error }`.
- **Cloud Function calls** all go through `functionsService` so there is one place to handle
  callable-function errors and map them to friendly messages.

The feature-first folder layout is defined in `08-Project-Setup-and-Conventions.md`.

## 4. Backend responsibilities split

| Operation | Where it runs | Why |
|-----------|---------------|-----|
| Read tasks / store / backpack | Client (Firestore listeners, guarded by rules) | Reads are safe and need to be live. |
| Create / edit / delete a task | Client write (guarded by rules) | Only the owning parent may write; rules enforce it. |
| Child marks task *Done* | Client write (guarded by rules) | Only a status field change; no Star movement. |
| Parent approves task → credit Stars | **Cloud Function `approveTask`** | Must atomically move Stars; client must not be trusted. |
| Create / edit / delete child account | **Cloud Function `createChildAccount` etc.** | Creating an Auth user requires the Admin SDK. |
| Child buys a store item | **Cloud Function `purchaseStoreItem`** | Must atomically check balance, deduct, and create the Backpack item. |
| Mark Backpack item redeemed | Client write (guarded by rules) | Status change only; parent-restricted by rules. |

The principle: **anything that moves Stars or creates accounts runs server-side.** Everything
else is a rules-guarded client write. See `04-Cloud-Functions-API.md` and
`05-Security-Rules-and-Privacy.md`.

## 5. Key data flows

### 5.1 Parent assigns a task → child sees it
1. Parent submits the Add Task form; the client writes a new doc to `tasks` (rules verify the
   parent owns the assigned child).
2. The child's browser holds a live listener on `tasks where childId == myUid`.
3. Firestore pushes the new doc over its socket; the task appears in the child's Tasks page
   with no page reload.

### 5.2 Child completes a task → parent approves → Stars credited
1. Child clicks Done; the client updates `tasks/{id}.status` to `pending_approval`.
2. The parent's listener shows it as pending. Parent clicks Approve.
3. The app calls Cloud Function `approveTask(taskId)`.
4. The function, in a Firestore transaction: verifies the caller is the owning parent and the
   task is pending; sets status `completed`; increments `users/{childId}.starBalance`;
   writes a `transactions` ledger entry.
5. Both browsers' listeners reflect the new status and balance instantly.

### 5.3 Child buys a store item
1. Child clicks Buy. The app calls Cloud Function `purchaseStoreItem(itemId)`.
2. The function, in a transaction: loads the item and the child; verifies the item is active
   and belongs to the child's parent; verifies `starBalance >= price`; decrements the
   balance; creates a `backpackItems` doc; writes a `transactions` entry.
3. If the balance is insufficient the function returns a `failed-precondition` error and the
   app shows a friendly message; no data changes.

## 6. Environments

| Environment | Firebase project | Purpose |
|-------------|------------------|---------|
| `dev` | `superkids-dev` | Day-to-day development and automated tests (use the Emulator Suite locally). |
| `prod` | `superkids-prod` | Live, publicly hosted app. |

The web app selects the environment with Vite env modes (`.env.development`,
`.env.production`); all Firebase config values are `VITE_`-prefixed env vars (see doc 08).
A development build must never point at `superkids-prod`.

## 7. Non-functional requirements

| Concern | Target |
|---------|--------|
| Performance | First meaningful paint < 2.5 s on a typical broadband connection; real-time updates < 1 s. Code-split routes to keep the initial bundle small. |
| Responsive | Layout works on desktop and tablet (primary) and is usable down to a 360 px-wide phone browser. |
| Offline | Firestore web persistence (`persistentLocalCache`, IndexedDB) is enabled so cached reads survive a brief disconnect. Cloud-Function actions (approve, buy) require connectivity and show a clear "needs internet" message offline. |
| Browsers | Google Chrome (latest 2 versions), desktop and tablet. Other browsers are not a support target for the MVP — no cross-browser testing or polyfills required. |
| Scale | Designed for thousands of families; Firestore/Functions/Hosting autoscale. No design changes needed for MVP scale. |
| Cost | Stays within Firebase free/Blaze low tier at MVP volume; Cloud Functions require the Blaze plan. |
| Security | See `05-Security-Rules-and-Privacy.md`. All traffic is HTTPS (enforced by Hosting). |
| Accessibility | Keyboard navigable, large click targets, high contrast, semantic HTML, alt text on images. |

## 8. Third-party dependencies

npm packages (exact versions pinned in doc 08): `react`, `react-dom`, `react-router-dom`,
`firebase`, `tailwindcss`, `react-hook-form` (form validation), `date-fns` (date
formatting), `clsx` (conditional class names). Dev: `vite`, `typescript`, `vitest`,
`@testing-library/react`, `eslint`, `prettier`.

## 9. Deployment topology

- The React app is built (`vite build`) to static assets and deployed to **Firebase
  Hosting**, which serves it over a global CDN with automatic TLS.
- Hosting is configured as an SPA: all routes rewrite to `index.html` so React Router
  controls navigation.
- Cloud Functions, Firestore rules/indexes, and Storage rules deploy via the Firebase CLI to
  the same project. See `08-Project-Setup-and-Conventions.md` §11.
