# 06 — UI / UX Specification

This document defines the design system, navigation, and every screen of the SuperKids
**web app**. Layouts are described in words and ASCII wireframes; the implementer builds them
as React components styled with Tailwind CSS.

## 1. Design principles

1. **Kid-first clarity.** Big click targets, big icons, little text. A young child must be
   able to use the app before they can read fluently.
2. **Playful and rewarding.** Bright colours, rounded shapes, a celebratory moment whenever
   Stars are earned or an item is bought.
3. **Two distinct moods.** The child UI is colourful and game-like. The parent UI is cleaner
   and more efficient (it is a management tool) but shares the brand.
4. **The Star is the hero.** The current Star balance is always visible to a child.
5. **No dead ends.** Every list has a friendly empty state telling the user what to do next.
6. **Responsive.** Designed for desktop and tablet first; remains usable on a phone browser.

## 2. Design tokens

### Colours (define as Tailwind theme extensions)
| Token | Hex | Use |
|-------|-----|-----|
| `primary` | `#5B5BD6` | Primary actions, parent accents |
| `secondary` | `#FF8A3D` | Secondary accents, highlights |
| `star` | `#FFC93C` | Stars, currency, rewards |
| `success` | `#3CC97A` | Approved, completed, redeemed |
| `danger` | `#E5484D` | Destructive actions, errors |
| `bgLight` | `#F6F7FB` | Page background |
| `surface` | `#FFFFFF` | Cards, panels, dialogs |
| `textPrimary` | `#1F2030` | Main text |
| `textMuted` | `#6B6C7E` | Secondary text |

### Typography
A rounded, friendly font (e.g. **Nunito** or **Baloo 2**), self-hosted via `@fontsource` or
loaded from Google Fonts.
| Style | Size / weight |
|-------|---------------|
| Display (balance) | 34px / Bold |
| Page title | 24px / Bold |
| Section header | 18px / SemiBold |
| Body | 16px / Regular |
| Caption | 13px / Regular |

### Shape, spacing, layout
- Spacing scale (Tailwind defaults): 4, 8, 12, 16, 24, 32 px.
- Corner radius: cards `rounded-2xl` (16px), buttons `rounded-xl` (12px), images `rounded-xl`.
- Primary buttons: prominent, height ~52px, bold label, generous padding.
- Cards: white `surface`, soft shadow, 16px padding.
- **Content max-width:** centred container, max ~960px, so the app does not stretch
  uncomfortably wide on large monitors.
- **Breakpoints:** `< 768px` = compact (single column, bottom nav); `≥ 768px` = regular
  (multi-column grids, top nav).

### Reusable React components
`StarChip` (star icon + count) · `PrimaryButton` / `SecondaryButton` · `TaskCard` ·
`StoreItemCard` · `BackpackItemCard` · `ChildCard` · `StatusBadge` (colour-coded by status) ·
`EmptyState` (icon + message + optional action) · `AppLayout` (header + nav + page outlet) ·
`LoadingView` (spinner / skeleton) · `ErrorView` · `ConfirmDialog` (modal) · `Modal` ·
`TextField` / `NumberStepper` / `ImagePicker` (form controls) · `RewardCelebration`
(confetti / star-burst overlay).

## 3. Navigation

Routing uses React Router v6. A route guard (a wrapper component / loader) redirects:
not signed in → auth flow; signed in → the home for the account's role. The login role
choice never overrides the profile role.

### Route map
```
/                    → redirects by auth state
/role-select
/parent/login        /parent/signup
/child/login
/parent              (AppLayout shell, parent nav)
    /parent/tasks        /parent/tasks/add        /parent/tasks/:id/edit
    /parent/store        /parent/store/add        /parent/store/:id/edit
    /parent/family       /parent/family/add       /parent/family/:childId
    /parent/profile
/child               (AppLayout shell, child nav)
    /child/tasks
    /child/store
    /child/backpack
    /child/profile
```
Hosting rewrites every path to `index.html` so React Router owns navigation. Unknown routes
render a friendly 404 page.

### Primary navigation
`AppLayout` renders a persistent header and a primary nav:
- **Header:** SuperKids logo (left). For a child, the current Star balance as a `StarChip`
  (right) on every page.
- **Nav** — on `≥ 768px` a horizontal tab bar under the header; on `< 768px` a fixed
  bottom bar. Each item is a large icon + label.
  - **Parent:** Tasks · Store · Family · Profile
  - **Child:** Tasks · Store · Backpack · Profile

## 4. Authentication screens

### 4.1 Initial load
While Firebase initialises and resolves auth state, show a centred `LoadingView` with the
logo. Then redirect: signed-in → role home; signed-out → `/role-select`.

### 4.2 Role select — `/role-select`
```
            ⭐  SuperKids
   ┌─────────────────────────────┐
   │   👨‍👩‍👧   I'm a Parent          │
   └─────────────────────────────┘
   ┌─────────────────────────────┐
   │   🧒   I'm a Kid              │
   └─────────────────────────────┘
```
Parent → parent login. Kid → child login. Centred card, friendly background.

### 4.3 Parent login / sign up
- **Login:** email, password, "Log In" button, link to "Create an account".
- **Sign up:** display name, email, password, confirm password, "Create Account".
- Use `react-hook-form` for inline validation; friendly errors (wrong password, email in
  use, weak password).

### 4.4 Child login — `/child/login`
Email + password the parent provided. No sign-up link. Help text:
"Ask your parent for your login." Errors are extra-simple ("That didn't work — check with
your parent.").

## 5. Parent screens

### 5.1 Tasks — `/parent/tasks`
Page header: "Tasks" + an **Add Task** button. Body: tasks grouped by child, each a
`TaskCard` showing title, `StarChip`, and a `StatusBadge`. **Pending approval** tasks sort to
the top and show **Approve** / **Reject** buttons inline. Clicking a non-completed card opens
the edit page. Empty state: "No tasks yet — click Add Task to assign one."

`TaskCard` (parent):
```
┌───────────────────────────────────────────┐
│  Make your bed                    ⭐ 5      │
│  Sam · Pending approval                     │
│            [ Reject ]      [ Approve ]       │
└───────────────────────────────────────────┘
```
Approve calls `approveTask`; on success show a brief confirmation toast. Reject calls
`rejectTask` (or the guarded write).

### 5.2 Add / Edit Task — `/parent/tasks/add`, `/parent/tasks/:id/edit`
Fields: Title, Description (optional), Star Reward (`NumberStepper`, min 1), Assign to
(child select — required, lists this parent's children). Save writes/updates the `tasks`
doc. The edit page also offers Delete (hidden once `completed`).

### 5.3 Store — `/parent/store`
Header: "Store" + **Add Item**. Responsive grid of `StoreItemCard` (image, name, `StarChip`
price). Inactive items show a muted "Hidden" badge. Click a card → edit page.
Empty state: "Your store is empty — add a reward for your kids."

### 5.4 Add / Edit Store Item — `/parent/store/add`, `/parent/store/:id/edit`
Fields: Image (optional `ImagePicker` → upload to Cloud Storage), Name, Description
(optional), Star Price (`NumberStepper`, min 1), Active toggle. Save uploads the image then
writes/updates the `storeItems` doc. Edit offers Delete (also deletes the Storage image).

### 5.5 Family — `/parent/family`
Header: "Family" + **Add Child**. List of `ChildCard` (avatar, name, current `StarChip`
balance). Click a card → child detail.
Empty state: "Add your first child to get started."

### 5.6 Add Child — `/parent/family/add`
Fields: Display Name, Email, Password (with show/hide). On save calls `createChildAccount`.
Show a clear confirmation with the credentials so the parent can pass them to the child:
"Sam can now log in as a Kid with this email and password." Handle the `already-exists` error.

### 5.7 Child detail — `/parent/family/:childId`
Header: child name + Star balance. Sections: recent tasks; this child's Backpack items (with
**Mark Redeemed** on `redeem_requested` items); Star transaction history. Actions: Edit name
/ Reset password (→ `updateChildCredentials`), Remove child (→ `ConfirmDialog` →
`deleteChildAccount`).

### 5.8 Parent profile — `/parent/profile`
Display name (editable), email (read-only), Log Out.

## 6. Child screens

The child UI is larger, brighter, more illustrated. The Star balance sits in the header on
every child page as a `StarChip`.

### 6.1 Tasks — `/child/tasks`
"My Tasks". List of `TaskCard`s for tasks assigned to this child.
- `available`: shows a big **Done!** button.
- `pending_approval`: shows "Waiting for parent…" — not actionable.
- `completed`: shows a success badge with the Stars earned.
Clicking **Done!** sets `pending_approval`. Empty state: "No tasks right now — nice!"

`TaskCard` (child):
```
┌───────────────────────────────────────────┐
│   🧹  Tidy your toys                         │
│       Earn  ⭐ 8                             │
│       [          Done!          ]           │
└───────────────────────────────────────────┘
```

### 6.2 Store — `/child/store`
"Star Store". Responsive grid of `StoreItemCard` (image, name, price). Each card shows a
**Buy** button: enabled and bright when affordable, disabled with "Need more Stars" when not.
Buy → `ConfirmDialog` ("Buy \<item\> for ⭐\<price\>?") → `purchaseStoreItem`. On success
play `RewardCelebration` and update the balance. On `failed-precondition` show the friendly
"not enough Stars" message.

### 6.3 Backpack — `/child/backpack`
"My Backpack". Grid of `BackpackItemCard` (image, name) with a `StatusBadge`:
- `owned`: button **Show Parent** → sets `redeem_requested`.
- `redeem_requested`: "Waiting for parent…".
- `redeemed`: "Got it! 🎉".
Empty state: "Buy something from the Star Store to fill your backpack!"

### 6.4 Child profile — `/child/profile`
Large Star balance display. Below it, the transaction history list (earn = green `+`,
spend = orange `−`, with reason and date). Display name (editable), Log Out.

## 7. Cross-cutting UX

- **Loading:** show `LoadingView` (skeleton or spinner) while a Firestore listener has no
  first snapshot.
- **Empty:** every list uses `EmptyState` with a guiding message.
- **Errors:** Cloud-Function errors map to friendly copy via `functionsService`; never show
  raw error codes. Offline during an action → "You need internet to do that. Try again in a
  moment."
- **Confirmation:** destructive actions (delete task/item, remove child) use `ConfirmDialog`.
- **Real-time:** all lists are driven by Firestore listeners — no manual refresh needed.
- **Celebration:** earning Stars (a task the child sees become approved) and buying an item
  both trigger `RewardCelebration` (confetti / star burst) — the core "reward" feeling.
- **Toasts:** brief success/info confirmations use a lightweight toast.
- **Accessibility:** semantic HTML, visible focus states, full keyboard navigation, minimum
  44×44px click targets, WCAG-AA contrast, `alt` text on every image.

## 8. Branding & app shell

A friendly star mascot. Primary brand colour `#5B5BD6` with the `#FFC93C` star. Provide a
`favicon`, social/`og:image` preview, an accurate page `<title>`, and a `manifest.json` so
the app is installable as a PWA (optional polish — see doc 07, Phase 6).
