# 08 — Project Setup & Conventions

This document defines the repository layout, tooling, environment configuration, and the
coding standards every contributor (human or AI) must follow.

## 1. Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20.x LTS |
| npm | 10.x (bundled with Node) |
| Firebase CLI | latest (`npm i -g firebase-tools`) |
| A modern browser | for development and testing |
| Java JDK | 17 — required only to run the Firebase Emulator Suite |

## 2. Repository structure

A single repository (monorepo) containing the web app and the Cloud Functions:

```
SuperKids/
├─ Plan/                       ← this documentation set
├─ web/                        ← React web application
│  ├─ index.html
│  ├─ src/
│  │  ├─ main.tsx              ← entry point
│  │  ├─ App.tsx               ← root component: providers + router
│  │  ├─ core/
│  │  │  ├─ theme/             ← Tailwind theme tokens, global styles
│  │  │  ├─ router/            ← route table + auth guard
│  │  │  ├─ components/        ← shared UI (StarChip, PrimaryButton, EmptyState …)
│  │  │  ├─ layout/            ← AppLayout, header, navigation
│  │  │  ├─ services/          ← firebase.ts, authService, firestoreService,
│  │  │  │                       functionsService, storageService
│  │  │  ├─ context/           ← AuthContext
│  │  │  └─ utils/             ← formatters, validators, constants
│  │  ├─ models/               ← TS types + Firestore converters
│  │  │                          (userProfile, task, storeItem, backpackItem, transaction)
│  │  └─ features/
│  │     ├─ auth/              ← pages/ + hooks/
│  │     ├─ family/
│  │     ├─ tasks/
│  │     ├─ store/
│  │     ├─ backpack/
│  │     └─ profile/
│  ├─ public/                  ← favicon, manifest.json, static images
│  ├─ test/                    ← test setup
│  ├─ .env.development         ← VITE_ vars → superkids-dev
│  ├─ .env.production          ← VITE_ vars → superkids-prod
│  ├─ index.css                ← Tailwind directives
│  ├─ tailwind.config.ts
│  ├─ vite.config.ts
│  ├─ tsconfig.json
│  └─ package.json
├─ functions/                  ← Cloud Functions (TypeScript)
│  ├─ src/
│  │  ├─ index.ts              ← exports all functions
│  │  ├─ createChildAccount.ts
│  │  ├─ updateChildCredentials.ts
│  │  ├─ deleteChildAccount.ts
│  │  ├─ approveTask.ts
│  │  ├─ rejectTask.ts
│  │  ├─ purchaseStoreItem.ts
│  │  └─ lib/                  ← shared helpers (validation, auth guards)
│  ├─ test/                    ← emulator-based function tests
│  ├─ package.json
│  └─ tsconfig.json
├─ test-rules/                 ← Security Rules emulator tests
├─ firebase.json               ← emulator + hosting + deploy config
├─ .firebaserc                 ← project aliases (dev / prod)
├─ firestore.rules
├─ firestore.indexes.json
├─ storage.rules
└─ README.md
```

Each `features/<name>/` folder contains `pages/` and `hooks/` for that feature.

## 3. Web app dependencies (`web/package.json`)

Pin exact versions; resolve to current stable at project start.

```jsonc
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "firebase": "^10",
    "react-hook-form": "^7",
    "date-fns": "^3",
    "clsx": "^2"
  },
  "devDependencies": {
    "vite": "^5",
    "@vitejs/plugin-react": "^4",
    "typescript": "^5",
    "tailwindcss": "^3",
    "postcss": "^8",
    "autoprefixer": "^10",
    "vitest": "^2",
    "@testing-library/react": "^16",
    "@testing-library/jest-dom": "^6",
    "jsdom": "^25",
    "eslint": "^9",
    "prettier": "^3",
    "@firebase/rules-unit-testing": "^4"
  }
}
```

npm scripts: `dev` (`vite`), `build` (`tsc && vite build`), `preview`, `test` (`vitest`),
`lint` (`eslint .`), `format` (`prettier --write .`).

## 4. Environment configuration

Two Firebase projects: `dev` → `superkids-dev`, `prod` → `superkids-prod`, aliased in
`.firebaserc`.

- The web app reads Firebase config from `VITE_`-prefixed env vars. Vite loads
  `.env.development` for `npm run dev` and `.env.production` for `npm run build`.
- Required vars: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
  `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
  `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
- An optional `VITE_USE_EMULATOR=true` flag makes `firebase.ts` connect to the local
  Emulator Suite instead of the cloud.
- Firebase web config values are **not secrets** (they are public by design; Security Rules
  are the real boundary) — but still commit only via `.env` files, never hard-coded.
  Service-account keys must **never** be committed.
- A development build must never point at `superkids-prod`.

## 5. State management conventions

- **Auth state:** a single `AuthContext` provides the Firebase user and the loaded
  `UserProfile` to the whole app. Components read it with a `useAuth()` hook.
- **Server data:** one custom hook per feature collection (e.g. `useTasks`,
  `useStoreItems`) wraps Firestore `onSnapshot` and returns `{ data, loading, error }`.
  Hooks unsubscribe on unmount.
- **Actions:** action hooks (e.g. `useApproveTask`) call a service and return
  `{ run, pending, error }`. Components never call Firebase directly.
- **Local UI state:** plain `useState` / `useReducer`. No global store library is needed at
  MVP scope.

## 6. Data layer conventions

- Every model has a Firestore **data converter** (`toFirestore` / `fromFirestore`) and a
  matching TypeScript type. Models are plain immutable objects.
- All Firestore queries live in `firestoreService` or feature hooks — pages never build
  queries inline.
- All Cloud Function calls go through `functionsService`, which wraps `httpsCallable` and
  maps `FunctionsError` codes to typed app errors with child-friendly messages.
- Never write `starBalance`, `transactions`, or `backpackItems` from the client — those are
  Cloud-Function-only (see docs 04 and 05).

## 7. Coding conventions

- **TypeScript:** `strict` mode on, no `any`. Shared types live in `models/`.
- **React:** function components and hooks only; one component per file. Keep components
  small — extract once a component passes ~120 lines or has nested logic.
- **Naming:** component files `PascalCase.tsx`; hooks `useThing.ts`; other files
  `camelCase.ts`. Components `PascalCase`; functions/vars `camelCase`; constants
  `SCREAMING_SNAKE_CASE` or grouped in a `constants.ts`.
- **Styling:** Tailwind utility classes only; colours/spacing come from the theme tokens in
  `tailwind.config.ts` — no arbitrary hex values in components.
- **No hard-coded user-facing strings scattered ad hoc** — keep shared copy in a constants
  file; component-local labels may be inline.
- **TypeScript (functions):** same `strict` rules; ESLint + Prettier; no `any`.
- Run `prettier` and `eslint` before every commit; zero lint errors.
- Comments explain *why*, not *what*; keep them sparse and accurate.

## 8. Testing strategy

| Layer | Tooling | Coverage expectation |
|-------|---------|----------------------|
| Models / converters | Vitest | `toFirestore` / `fromFirestore` round-trips. |
| Hooks / utils | Vitest | Core logic and error mapping. |
| Components | Vitest + React Testing Library | Key pages render in loading / empty / error / data states. |
| Cloud Functions | Emulator + `firebase-functions-test` | Every function: happy path, auth/ownership failure, precondition failure, idempotency. |
| Security Rules | Emulator + `@firebase/rules-unit-testing` | Every case in doc 05 §6. |

All tests run against the **Emulator Suite** — never against `dev` or `prod` data.
`firebase emulators:exec` runs the function and rules suites in CI.

## 9. Git workflow

- `main` is always releasable. Work happens on `feature/<task-id>-<slug>` branches
  (e.g. `feature/T-3.6-approve-task`).
- One pull request per implementation-plan task; the PR description links the task ID and
  states which "Done when" check it satisfies.
- A PR merges only when: it builds, ESLint is clean, and all relevant tests pass.
- Commit messages: imperative mood, reference the task ID
  (e.g. `T-3.6: add approveTask cloud function`).

## 10. CI (recommended)

A CI pipeline (GitHub Actions or similar) on every PR:
1. `npm ci`, `npm run lint`, `npm run build`, `npm test` for `web/`.
2. `npm ci` + lint + build for `functions/`.
3. `firebase emulators:exec` to run the function and Security Rules test suites.

Block merge on any failure.

## 11. Build & deployment

`firebase.json` configures Hosting to serve `web/dist` with an SPA rewrite (all paths →
`/index.html`).

| Artifact | Command |
|----------|---------|
| Security Rules | `firebase deploy --only firestore:rules,storage --project <alias>` |
| Indexes | `firebase deploy --only firestore:indexes --project <alias>` |
| Cloud Functions | `firebase deploy --only functions --project <alias>` |
| Web app | `npm run build` (in `web/`) then `firebase deploy --only hosting --project <alias>` |

Deploy rules, indexes, and functions to `superkids-dev` continuously during development.
Deploy everything — including Hosting — to `superkids-prod` only as part of Phase 7
(tasks T-7.1, T-7.2). Firebase Hosting keeps release history, so a bad deploy can be rolled
back from the console.
