# SuperKids — Technical Documentation Set

> A mobile app where parents assign chores/tasks to their children, children earn an
> in-app currency called **Stars** for completing them, and spend those Stars in a
> parent-curated **Store**. Purchased items land in the child's **Backpack** as a wishlist
> the parent fulfils in real life.

This `Plan/` folder is the complete, implementation-ready specification for SuperKids.
It is written so an AI engineering team can build the product without further design work.

---

## 1. How to use this documentation

Read the documents in order. Each builds on the previous one.

| # | Document | Purpose | Primary audience |
|---|----------|---------|------------------|
| — | `README.md` (this file) | Index, assumptions, decisions log | Everyone |
| 01 | `01-Product-Requirements.md` | What we are building and why; user stories | Everyone |
| 02 | `02-System-Architecture.md` | Tech stack, components, data flow | All engineers |
| 03 | `03-Data-Model.md` | Firestore schema, every field and index | Backend / data engineers |
| 04 | `04-Cloud-Functions-API.md` | Server function contracts | Backend engineers |
| 05 | `05-Security-Rules-and-Privacy.md` | Firestore rules, auth, child-safety | Backend / security |
| 06 | `06-UI-UX-Specification.md` | Design system, every screen | App / frontend engineers |
| 07 | `07-Implementation-Plan.md` | Phased, dependency-ordered task list | Tech lead / all |
| 08 | `08-Project-Setup-and-Conventions.md` | Repo layout, tooling, coding standards | All engineers |

**Start work from `07-Implementation-Plan.md`.** Tasks there are dependency-ordered and
each references the documents that define its acceptance criteria.

---

## 2. Product summary (one paragraph)

SuperKids has two user roles: **Parent** and **Child**. A parent signs up, then creates one
or more child accounts (the parent supplies each child's login email and password — the
child does not self-register). Parents post **Tasks** with a Star reward. Tasks appear
instantly in the connected child's app. The child marks a task done; the parent approves
it, which credits the Stars. Parents stock a **Store** with items priced in Stars. A child
with enough Stars buys an item; it moves into the child's **Backpack**. The Backpack acts
as a wishlist the parent reviews and fulfils with the real-world item, then marks redeemed.

---

## 3. Tech stack (decided)

| Layer | Choice |
|-------|--------|
| Web app | React + TypeScript, built with Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Server state | Cloud Firestore real-time listeners via custom React hooks |
| Authentication | Firebase Authentication (email + password) |
| Database | Cloud Firestore (real-time sync) |
| Server logic | Cloud Functions for Firebase (TypeScript / Node.js) |
| File storage | Cloud Storage for Firebase (Store item images) |
| Hosting | Firebase Hosting |
| Notifications (Phase 6, optional) | Firebase Cloud Messaging (web push) |

Full rationale is in `02-System-Architecture.md`.

---

## 4. Assumptions made by the architect

These were not stated in the brief. They are reasonable defaults — **flag any you want changed.**

| ID | Assumption |
|----|-----------|
| A1 | Platform is a **responsive web app** (browser-based). No native iOS/Android apps in the MVP. *(Confirmed by product owner.)* |
| A2 | A **child cannot self-register**. The parent creates the child account and sets its email + password. |
| A3 | Task completion needs **parent approval** before Stars are credited (a child tapping "Done" does not auto-pay). This prevents a child crediting themselves. |
| A4 | Store items are **templates with unlimited stock**; a parent can deactivate an item but quantity tracking is out of MVP scope. |
| A5 | Store items added by a parent are visible to **all** of that parent's children (not targeted per child). Tasks **are** assigned to one specific child. |
| A6 | Stars have **no real-money value** and are never purchasable with money. They are earned only by approved tasks. |
| A7 | "Backpack → show to parent" is modelled as a **redeem** flow: the child requests redemption, the parent marks the item *Redeemed* once they have given the real item. |
| A8 | One child belongs to **exactly one** parent. One parent has **many** children. |
| A9 | App language is **English** for the MVP; localisation is out of scope. |
| A10 | A Star transaction **ledger** is kept for history/audit even though the brief did not ask for it (cheap to add, valuable for trust). |

## 5. Open questions for the product owner

Answers will refine the spec but **do not block** starting Phases 0–2.

1. Should tasks be **recurring** (e.g. "make bed" every day) or always one-off? *Spec assumes one-off; recurring is noted as a future enhancement.*
2. Can a parent set a **deadline** on a task? *Spec includes an optional `dueDate` field, unused in UI for MVP.*
3. Should a child be able to **cancel a purchase** / refund Stars before redeeming? *Spec assumes no refunds for MVP.*
4. Do you want **email verification** on parent sign-up? *Spec assumes no for MVP, recommended later.*

## 6. Decisions log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-17 | Platform is a responsive web app, not native mobile | Product owner confirmed web-only for the MVP |
| 2026-05-17 | React + TypeScript + Firebase chosen as the stack | Real-time parent→child sync is native to Firestore; widely supported web stack; minimal infra for a small team |
| 2026-05-17 | Critical Star operations run in Cloud Functions, not the client | A child must not be able to mint Stars by editing client data |
| 2026-05-17 | Parent provisions child accounts | Matches the brief ("parent adds kid's email and password") and is the standard model for young-child apps |
| 2026-05-17 | Google Chrome is the only supported browser for the MVP | Product owner specified Chrome |

---

## 7. Out of scope for the MVP

Recurring tasks · task deadlines/reminders · in-app chat · multiple parents/guardians per
family · native iOS / Android apps · real-money payments · Star refunds · localisation ·
analytics dashboards · social/leaderboard features.
