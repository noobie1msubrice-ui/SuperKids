# 01 — Product Requirements Document (PRD)

## 1. Vision

SuperKids turns household responsibilities into a rewarding game. Parents motivate their
children with **Stars** — an in-app currency earned by completing assigned tasks and spent
on a store of rewards the parent personally chooses. It gives parents a structured tool for
encouraging good habits and gives children a clear, visible, motivating goal.

## 2. Goals

- Let a parent assign tasks to a child and reward completion with Stars.
- Let a child see their tasks, complete them, and watch their Star balance grow.
- Let a parent define real rewards in a Store; let a child spend Stars on them.
- Keep a child's purchases in a Backpack the parent can review and fulfil.
- Make the experience simple, safe, and visually delightful for young children.

## 3. Non-goals (MVP)

See `README.md` §7. In short: no recurring tasks, no chat, no payments, no web client.

## 4. Personas

### Parent — "Alex"
- Adult, comfortable using a web browser on a computer or tablet, wants children to build good habits.
- Creates the family, provisions child accounts, manages tasks and the store.
- Needs: quick task entry, a clear view of what each child has done, control over rewards.

### Child — "Sam" (age ~5–12)
- Uses a computer or tablet in a web browser. Limited reading ability — UI must be highly visual.
- Logs in with credentials the parent gave them.
- Needs: see "what do I do to earn Stars", a satisfying balance, a fun store to spend in.

## 5. Glossary

| Term | Definition |
|------|-----------|
| **Parent** | A user role that creates and manages a family, tasks, and the store. |
| **Child** | A user role that completes tasks, earns and spends Stars. |
| **Star** | The app's only currency. Earned via approved tasks, spent in the Store. No money value. |
| **Task** | A unit of work a parent assigns to one child, worth a fixed number of Stars. |
| **Store Item** | A reward a parent defines, priced in Stars, visible to all of that parent's children. |
| **Backpack** | A child's inventory of purchased Store Items, pending real-world fulfilment. |
| **Redeem** | The act of a parent giving the child the real item and marking the Backpack item done. |
| **Family / Link** | The connection between one parent account and its child accounts. |

## 6. App structure — the four categories

The brief names four sections. They map to navigation tabs (see `06-UI-UX-Specification.md`):

| Category | Parent sees | Child sees |
|----------|-------------|-----------|
| **Tasks** | All tasks per child + an **Add Task** button + approve/reject pending tasks | Their own assigned tasks; can mark one **Done** |
| **Store** | All store items + an **Add Item** button | All of the parent's store items; can **Buy** with Stars |
| **Backpack** | Each child's purchased items; can mark them **Redeemed** | Their own purchased items; can request **Redeem** |
| **Family** *(parent only)* | List of children + **Add Child** button + per-child detail | n/a |

(Children additionally have a **Profile** screen showing their Star balance and history.)

## 7. Feature list

| ID | Feature | Role | Priority |
|----|---------|------|----------|
| F1 | Role selection + login | Both | MVP |
| F2 | Parent sign-up | Parent | MVP |
| F3 | Create / edit / remove child accounts (linking) | Parent | MVP |
| F4 | Add / edit / delete a task | Parent | MVP |
| F5 | View assigned tasks; mark a task done | Child | MVP |
| F6 | Approve / reject a completed task (credits Stars) | Parent | MVP |
| F7 | Add / edit / deactivate a Store item | Parent | MVP |
| F8 | Browse Store; buy an item with Stars | Child | MVP |
| F9 | View Backpack; request redeem | Child | MVP |
| F10 | Review Backpack; mark item redeemed | Parent | MVP |
| F11 | Star balance + transaction history | Child | MVP |
| F12 | Profile (display name, sign out) | Both | MVP |
| F13 | Push notifications | Both | Phase 6 / optional |

## 8. User stories & acceptance criteria

> Format: **As a** \<role\> **I want** \<goal\> **so that** \<reason\>. AC = acceptance criteria.

### F1 — Role selection + login
**As a** user **I want** to choose Parent or Kid and log in **so that** I reach the right app.
- AC1: First screen offers two choices: "I'm a Parent" and "I'm a Kid".
- AC2: Parent path offers Log In and Sign Up. Kid path offers Log In only.
- AC3: Login uses email + password via Firebase Auth.
- AC4: After auth, the app reads the user's true role from their profile and routes to the
  matching home; if the chosen role mismatches the account role, show an error and sign out.
- AC5: Invalid credentials show a friendly, child-readable error message.

### F2 — Parent sign-up
**As a** parent **I want** to create an account **so that** I can manage my family.
- AC1: Form collects display name, email, password (and password confirmation).
- AC2: On success a `parent` profile is created and the parent lands on the parent home.
- AC3: Duplicate email or weak password shows an inline error.

### F3 — Create / manage child accounts
**As a** parent **I want** to add my children **so that** their apps connect to mine.
- AC1: The Family tab has an **Add Child** button.
- AC2: The form collects the child's display name, email, and password.
- AC3: On submit, a child account is created, linked to this parent, with a 0 Star balance.
- AC4: The child can immediately log in with that email + password via the Kid path.
- AC5: A parent can add **more than one** child.
- AC6: A parent can edit a child's display name, reset the child's password, and remove a
  child (removal deletes the child account and its tasks/store visibility/backpack).

### F4 — Add / manage tasks
**As a** parent **I want** to assign tasks worth Stars **so that** my child is motivated.
- AC1: The Tasks tab has an **Add Task** button (parent only).
- AC2: The form collects: title, optional description, **Star reward** (positive integer),
  and which child it is assigned to.
- AC3: On submit the task appears immediately in that child's Tasks tab.
- AC4: A parent can edit or delete a task while it is not yet approved.

### F5 — Child completes a task
**As a** child **I want** to mark a task done **so that** I can earn its Stars.
- AC1: The child's Tasks tab lists tasks assigned to them with title and Star reward.
- AC2: Each available task has a **Done** action.
- AC3: Tapping Done sets the task to *Pending approval*; it is no longer actionable by the child.
- AC4: Stars are **not** credited yet.

### F6 — Parent approves a task
**As a** parent **I want** to approve completed tasks **so that** Stars are awarded fairly.
- AC1: The parent's Tasks tab clearly marks tasks *Pending approval*.
- AC2: The parent can **Approve** or **Reject**.
- AC3: Approve credits the task's Star reward to the child's balance atomically and writes a
  ledger entry; the task becomes *Completed*.
- AC4: Reject returns the task to *Available* so the child can try again.

### F7 — Add / manage Store items
**As a** parent **I want** to stock a store of rewards **so that** my child can spend Stars.
- AC1: The Store tab has an **Add Item** button (parent only).
- AC2: The form collects: name, optional description, **Star price** (positive integer),
  and an optional image.
- AC3: On submit the item appears in every linked child's Store tab.
- AC4: A parent can edit, deactivate (hide), or delete an item.

### F8 — Child buys a Store item
**As a** child **I want** to buy items with my Stars **so that** I get rewards.
- AC1: The child's Store tab lists all active items from their parent with price and image.
- AC2: Each item has a **Buy** action showing whether the child can afford it.
- AC3: If the balance is sufficient, buying deducts the price atomically, writes a ledger
  entry, and adds the item to the child's Backpack.
- AC4: If the balance is insufficient, buying is blocked with a friendly message.

### F9 / F10 — Backpack and redeem
**As a** child **I want** to see what I bought and show it to my parent **so that** I get the
real item. **As a** parent **I want** to mark items redeemed **so that** the wishlist is current.
- AC1: The child's Backpack lists their purchased items with status (*Owned* / *Redeem requested* / *Redeemed*).
- AC2: The child can tap **Show parent / Request redeem** on an *Owned* item.
- AC3: The parent's Backpack view lists each child's items and their status.
- AC4: The parent can mark an item **Redeemed** once they have provided the real reward.

### F11 — Star balance & history
**As a** child **I want** to see my Stars and how I got/spent them **so that** I trust the count.
- AC1: The child's Profile shows the current Star balance prominently.
- AC2: A history list shows each transaction: earn/spend, amount, reason, date.

### F12 — Profile
- AC1: Both roles can view their display name and sign out.
- AC2: A parent can edit their display name.

## 9. Success criteria for the MVP

A parent can sign up, add two children, post a task to each, approve a completed task, add a
store item, and a child can buy that item and have it appear in their Backpack — all with
real-time updates and no manual refresh.
