# SuperKids

A web app where parents assign chores to their children, children earn an in-app
currency called **Stars** for completing them, and spend those Stars in a
parent-curated **Store**. Purchased items land in the child's **Backpack** as a
wishlist the parent fulfils in real life.

The full specification lives in [`Plan/`](./Plan).

## Repository layout

```
SuperKids/
├─ Plan/           ← product & technical specification
├─ web/            ← React + TypeScript web app (Vite)
├─ functions/      ← Cloud Functions (TypeScript)
├─ firebase.json   ← emulator + hosting + deploy config
├─ .firebaserc     ← project aliases (dev / prod)
├─ firestore.rules
├─ firestore.indexes.json
└─ storage.rules
```

## Prerequisites

| Tool          | Version                                  |
|---------------|------------------------------------------|
| Node.js       | 20.x LTS                                 |
| npm           | 10.x (bundled with Node)                 |
| Firebase CLI  | latest — `npm i -g firebase-tools`       |
| Java JDK      | 17 — only needed to run the Emulator Suite |

## First-time setup

```bash
# 1. install dependencies
cd web && npm install && cd ..
cd functions && npm install && cd ..

# 2. create the Firebase web config
#    copy web/.env.development and fill in your superkids-dev values
```

## Develop locally (against the Emulator Suite)

```bash
# terminal 1 — emulators
firebase emulators:start

# terminal 2 — web dev server (set VITE_USE_EMULATOR=true in .env.development)
cd web && npm run dev
```

## Useful commands

| Action               | Command                                              |
|----------------------|------------------------------------------------------|
| Web dev server       | `cd web && npm run dev`                              |
| Web production build | `cd web && npm run build`                            |
| Web tests            | `cd web && npm test`                                 |
| Functions build      | `cd functions && npm run build`                      |
| Lint                 | `npm run lint` (in `web/` or `functions/`)           |
| Deploy rules         | `firebase deploy --only firestore:rules,storage`     |
| Deploy indexes       | `firebase deploy --only firestore:indexes`           |
| Deploy functions     | `firebase deploy --only functions`                   |
| Deploy web app       | `cd web && npm run build && firebase deploy --only hosting` |

Use the `--project dev` / `--project prod` flag to target an environment.
A development build must never point at `superkids-prod`.
