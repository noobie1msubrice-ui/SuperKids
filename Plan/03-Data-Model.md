# 03 — Data Model (Cloud Firestore)

All application data lives in Cloud Firestore. This document defines every collection, every
field, relationships, indexes, and lifecycle. Field names are `camelCase`. Timestamps are
Firestore `Timestamp`. IDs are Firestore auto-IDs unless stated otherwise.

## 1. Collection overview

| Collection | Doc ID | Holds |
|------------|--------|-------|
| `users` | Firebase Auth UID | One profile per parent or child. |
| `tasks` | auto-ID | One task assigned by a parent to a child. |
| `storeItems` | auto-ID | One reward defined by a parent. |
| `backpackItems` | auto-ID | One item a child has purchased. |
| `users/{uid}/transactions` | auto-ID | Star ledger entries for a child (subcollection). |

```
users/{uid}                 ← parent OR child profile
   └─ transactions/{txnId}   ← only present under child users
tasks/{taskId}               ← childId + parentId fields
storeItems/{itemId}          ← parentId field
backpackItems/{itemId}       ← childId + parentId + storeItemId fields
```

## 2. Relationships

```
        users (parent)  1 ───< many  users (child)        via child.parentId
        users (parent)  1 ───< many  tasks                via task.parentId
        users (child)   1 ───< many  tasks                via task.childId
        users (parent)  1 ───< many  storeItems           via storeItem.parentId
        users (child)   1 ───< many  backpackItems        via backpackItem.childId
        storeItems      1 ───< many  backpackItems        via backpackItem.storeItemId
        users (child)   1 ───< many  transactions         (subcollection)
```

A child has exactly one `parentId`. A parent has many children. Store items are owned by a
parent and visible to all of that parent's children. Tasks are owned by a parent and
assigned to exactly one child.

---

## 3. `users/{uid}`

One document per account. The document ID equals the Firebase Auth UID.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `role` | string | yes | `"parent"` or `"child"`. Immutable after creation. |
| `displayName` | string | yes | Shown throughout the app. 1–40 chars. |
| `email` | string | yes | Mirrors the Auth email (for display/search). |
| `createdAt` | Timestamp | yes | Set on creation. |
| `photoUrl` | string | no | Optional avatar (future use). |
| **Parent-only** | | | |
| — *(children are found by querying `users where parentId == uid`)* | | | |
| **Child-only** | | | |
| `parentId` | string | yes (child) | UID of the owning parent. Immutable. |
| `starBalance` | number | yes (child) | Current Stars. Integer ≥ 0. **Writable only by Cloud Functions.** |
| `fcmToken` | string | no | Device push token (Phase 6). |

Example — parent:
```json
{
  "role": "parent",
  "displayName": "Alex Carter",
  "email": "alex@example.com",
  "createdAt": "<Timestamp>"
}
```
Example — child:
```json
{
  "role": "child",
  "displayName": "Sam",
  "email": "sam.carter@example.com",
  "parentId": "PARENT_UID_123",
  "starBalance": 45,
  "createdAt": "<Timestamp>"
}
```

---

## 4. `tasks/{taskId}`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `parentId` | string | yes | UID of the parent who created the task. |
| `childId` | string | yes | UID of the assigned child. |
| `title` | string | yes | Short task name. 1–80 chars. |
| `description` | string | no | Optional detail. ≤ 300 chars. |
| `starReward` | number | yes | Integer ≥ 1. Stars credited on approval. |
| `status` | string | yes | See state machine below. |
| `dueDate` | Timestamp | no | Optional; not surfaced in MVP UI (see open question 2). |
| `createdAt` | Timestamp | yes | Set on creation. |
| `completedAt` | Timestamp | no | Set when the child marks it done. |
| `approvedAt` | Timestamp | no | Set when the parent approves. |

### Task status state machine
```
   available ──(child taps Done)──▶ pending_approval
   pending_approval ──(parent Approve)──▶ completed     [credits Stars]
   pending_approval ──(parent Reject)───▶ available
```
- `available` — assigned, not yet done.
- `pending_approval` — child marked done, awaiting parent.
- `completed` — approved; Stars credited; terminal state.

A parent may edit or delete a task only while `status != completed`.

Example:
```json
{
  "parentId": "PARENT_UID_123",
  "childId": "CHILD_UID_456",
  "title": "Make your bed",
  "description": "Pillows tidy too!",
  "starReward": 5,
  "status": "available",
  "createdAt": "<Timestamp>"
}
```

---

## 5. `storeItems/{itemId}`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `parentId` | string | yes | UID of the owning parent. |
| `name` | string | yes | Item name. 1–80 chars. |
| `description` | string | no | Optional detail. ≤ 300 chars. |
| `starPrice` | number | yes | Integer ≥ 1. Cost in Stars. |
| `imageUrl` | string | no | Cloud Storage download URL of the item image. |
| `imagePath` | string | no | Cloud Storage path (kept so the file can be deleted). |
| `isActive` | boolean | yes | `false` hides the item from children without deleting it. |
| `createdAt` | Timestamp | yes | Set on creation. |

Visible to a child when `parentId == child.parentId && isActive == true`.

Example:
```json
{
  "parentId": "PARENT_UID_123",
  "name": "30 min extra screen time",
  "description": "Use any evening this week",
  "starPrice": 20,
  "imageUrl": "https://.../screen-time.png",
  "imagePath": "storeItems/PARENT_UID_123/abc.png",
  "isActive": true,
  "createdAt": "<Timestamp>"
}
```

---

## 6. `backpackItems/{itemId}`

Created by the `purchaseStoreItem` Cloud Function. Store-item details are **copied in
(denormalised)** so the Backpack is stable even if the parent later edits or deletes the
source store item.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `childId` | string | yes | Owner child UID. |
| `parentId` | string | yes | The child's parent UID (copied for easy parent queries). |
| `storeItemId` | string | yes | Source store item ID (reference only). |
| `name` | string | yes | Copied from the store item at purchase time. |
| `description` | string | no | Copied at purchase time. |
| `imageUrl` | string | no | Copied at purchase time. |
| `pricePaid` | number | yes | Stars spent (copied `starPrice` at purchase time). |
| `status` | string | yes | `"owned"` → `"redeem_requested"` → `"redeemed"`. |
| `purchasedAt` | Timestamp | yes | Set by the purchase function. |
| `redeemRequestedAt` | Timestamp | no | Set when the child requests redemption. |
| `redeemedAt` | Timestamp | no | Set when the parent marks it redeemed. |

### Backpack status state machine
```
   owned ──(child requests redeem)──▶ redeem_requested ──(parent marks done)──▶ redeemed
```

---

## 7. `users/{childUid}/transactions/{txnId}`

An append-only Star ledger for trust and history. Written only by Cloud Functions.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `type` | string | yes | `"earn"` or `"spend"`. |
| `amount` | number | yes | Positive integer — Stars moved. |
| `reason` | string | yes | Human-readable, e.g. `"Task: Make your bed"` or `"Bought: extra screen time"`. |
| `refType` | string | yes | `"task"` or `"purchase"`. |
| `refId` | string | yes | ID of the related task / backpack item. |
| `balanceAfter` | number | yes | The child's `starBalance` after this transaction. |
| `createdAt` | Timestamp | yes | Set by the function. |

---

## 8. Required composite indexes

Single-field indexes are automatic. Define these composite indexes in `firestore.indexes.json`:

| Collection | Fields | Used by |
|------------|--------|---------|
| `tasks` | `childId` ASC, `createdAt` DESC | Child's task list |
| `tasks` | `parentId` ASC, `createdAt` DESC | Parent's task list |
| `tasks` | `childId` ASC, `status` ASC, `createdAt` DESC | Filtered task views |
| `storeItems` | `parentId` ASC, `isActive` ASC, `createdAt` DESC | Child's store browse |
| `storeItems` | `parentId` ASC, `createdAt` DESC | Parent's store management |
| `backpackItems` | `childId` ASC, `purchasedAt` DESC | Child's backpack |
| `backpackItems` | `parentId` ASC, `status` ASC, `purchasedAt` DESC | Parent's redeem queue |

The Emulator and console will also suggest indexes at query time — add any it reports.

## 9. Data lifecycle & integrity rules

- **Star balance** is the single source of truth on `users/{childId}.starBalance` and is
  mutated only inside Cloud Function transactions, always alongside a `transactions` entry.
- **Denormalisation:** `backpackItems` copies store-item fields so history survives edits.
  `parentId` is duplicated onto `tasks` and `backpackItems` to keep parent queries to one
  field and to let Security Rules authorise without extra reads where possible.
- **Cascade on child removal** (`deleteChildAccount`, doc 04): delete the child's `tasks`,
  `backpackItems`, `transactions`, the `users/{childUid}` doc, and the Auth user. Store
  items are parent-owned and stay.
- **Cascade on store-item delete:** delete the Cloud Storage image at `imagePath`. Existing
  `backpackItems` are untouched (they hold their own copies).
- **No hard deletes of `transactions`** — the ledger is append-only.

## 10. Cloud Storage layout

```
storeItems/{parentId}/{itemId}.{ext}     ← Store item images
```
Image rules: max 5 MB, content-type `image/*`. Access rules in `05-Security-Rules-and-Privacy.md`.
