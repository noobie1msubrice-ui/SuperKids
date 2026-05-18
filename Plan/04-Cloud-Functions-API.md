# 04 — Cloud Functions API

Privileged server logic runs as **callable Cloud Functions** (`onCall`), written in
**TypeScript** with the Firebase Admin SDK. The web app invokes them via the Firebase JS
SDK's `httpsCallable`. Callable functions automatically receive the caller's verified
auth context.

## 1. Conventions

- **Runtime:** Node.js 20, `firebase-functions` v2, region `us-central1` (set one region for all).
- **Auth:** every function rejects unauthenticated calls with `unauthenticated`.
- **Validation:** validate every input field; reject bad input with `invalid-argument`.
- **Atomicity:** any function that moves Stars uses a single Firestore `runTransaction`.
- **Errors:** throw `HttpsError(code, message)`; `message` must be safe to show a child.
- **Idempotency:** state-machine guards (checking current `status`) make a repeated call a
  harmless no-op error rather than a double credit.

### Standard error codes used
| Code | Meaning |
|------|---------|
| `unauthenticated` | No signed-in caller. |
| `permission-denied` | Caller is not allowed to act on this resource. |
| `invalid-argument` | Missing or malformed input. |
| `not-found` | Referenced document does not exist. |
| `failed-precondition` | Action invalid in the current state (e.g. not enough Stars). |
| `already-exists` | E.g. the child email is already in use. |

---

## 2. `createChildAccount`

Creates a child Auth user and links it to the calling parent.

**Caller:** an authenticated **parent**.

**Request**
```ts
{
  displayName: string;   // 1–40 chars
  email: string;         // valid, unique
  password: string;      // >= 6 chars
}
```
**Response**
```ts
{ childUid: string }
```
**Logic**
1. Reject if caller is not authenticated → `unauthenticated`.
2. Load `users/{caller.uid}`; require `role == "parent"` → else `permission-denied`.
3. Validate inputs → `invalid-argument`.
4. Create the Auth user with email + password (Admin SDK). If the email exists →
   `already-exists` ("That email is already in use.").
5. Create `users/{childUid}` with `role:"child"`, `displayName`, `email`,
   `parentId: caller.uid`, `starBalance: 0`, `createdAt: now`.
6. Return `{ childUid }`. If step 5 fails, delete the Auth user created in step 4 (rollback).

---

## 3. `updateChildCredentials`

Lets a parent rename a child or reset the child's password.

**Caller:** the **parent who owns** the child.

**Request**
```ts
{
  childUid: string;
  displayName?: string;   // optional new name
  newPassword?: string;   // optional, >= 6 chars
}
```
**Response** `{ success: true }`

**Logic**
1. Auth + parent-role check.
2. Load `users/{childUid}`; require it exists, `role == "child"`, and
   `parentId == caller.uid` → else `permission-denied`.
3. At least one of `displayName` / `newPassword` must be present → else `invalid-argument`.
4. If `displayName`: update `users/{childUid}.displayName`.
5. If `newPassword`: update the Auth user's password (Admin SDK).
6. Return success.

---

## 4. `deleteChildAccount`

Removes a child and all of their data.

**Caller:** the **parent who owns** the child.

**Request** `{ childUid: string }` · **Response** `{ success: true }`

**Logic**
1. Auth + parent-role check; verify ownership as in §3.
2. Delete (batched): all `tasks where childId == childUid`, all
   `backpackItems where childId == childUid`, all docs in
   `users/{childUid}/transactions`, then the `users/{childUid}` document.
3. Delete the child Auth user (Admin SDK).
4. Return success. (Parent-owned `storeItems` are not touched.)

---

## 5. `approveTask`

Approves a completed task and credits Stars.

**Caller:** the **parent who owns** the task.

**Request** `{ taskId: string }` · **Response** `{ success: true, newBalance: number }`

**Logic (single Firestore transaction)**
1. Auth + parent-role check.
2. Read `tasks/{taskId}` → `not-found` if missing.
3. Require `task.parentId == caller.uid` → else `permission-denied`.
4. Require `task.status == "pending_approval"` → else `failed-precondition`
   ("This task isn't waiting for approval.").
5. Read `users/{task.childId}`.
6. Compute `newBalance = child.starBalance + task.starReward`.
7. In the transaction:
   - update task: `status:"completed"`, `approvedAt: now`;
   - update child: `starBalance: newBalance`;
   - create `users/{childId}/transactions/{auto}` with `type:"earn"`,
     `amount: task.starReward`, `reason:"Task: " + task.title`, `refType:"task"`,
     `refId: taskId`, `balanceAfter: newBalance`, `createdAt: now`.
8. Return `{ success: true, newBalance }`.

---

## 6. `rejectTask`

Sends a pending task back so the child can redo it. *(May instead be a rules-guarded client
write — see doc 05. Documented here for completeness; either implementation is acceptable.)*

**Caller:** the **parent who owns** the task.

**Request** `{ taskId: string }` · **Response** `{ success: true }`

**Logic:** auth + ownership checks; require `status == "pending_approval"`; set
`status:"available"`, clear `completedAt`. No Star movement.

---

## 7. `purchaseStoreItem`

Lets a child buy a store item with Stars.

**Caller:** an authenticated **child**.

**Request** `{ storeItemId: string }`
**Response** `{ success: true, newBalance: number, backpackItemId: string }`

**Logic (single Firestore transaction)**
1. Reject if unauthenticated → `unauthenticated`.
2. Read `users/{caller.uid}`; require `role == "child"` → else `permission-denied`.
3. Read `storeItems/{storeItemId}` → `not-found` if missing.
4. Require `item.isActive == true` → else `failed-precondition` ("This item isn't available.").
5. Require `item.parentId == child.parentId` → else `permission-denied`.
6. Require `child.starBalance >= item.starPrice` → else `failed-precondition`
   ("You don't have enough Stars yet.").
7. Compute `newBalance = child.starBalance - item.starPrice`.
8. In the transaction:
   - update child: `starBalance: newBalance`;
   - create `backpackItems/{auto}` with `childId`, `parentId: child.parentId`,
     `storeItemId`, copied `name` / `description` / `imageUrl`,
     `pricePaid: item.starPrice`, `status:"owned"`, `purchasedAt: now`;
   - create `users/{childId}/transactions/{auto}` with `type:"spend"`,
     `amount: item.starPrice`, `reason:"Bought: " + item.name`, `refType:"purchase"`,
     `refId: <backpackItemId>`, `balanceAfter: newBalance`, `createdAt: now`.
9. Return `{ success: true, newBalance, backpackItemId }`.

---

## 8. Operations handled WITHOUT a Cloud Function

These are plain client writes, authorised by Security Rules (doc 05) — no Star movement and
no account creation, so no privileged code is needed:

| Operation | Who | Write |
|-----------|-----|-------|
| Create / edit / delete a task | Parent | `tasks` create/update/delete |
| Child marks a task done | Child | `tasks/{id}` → `status:"pending_approval"`, `completedAt:now` |
| Create / edit / deactivate / delete a store item | Parent | `storeItems` write |
| Child requests redeem | Child | `backpackItems/{id}` → `status:"redeem_requested"` |
| Parent marks item redeemed | Parent | `backpackItems/{id}` → `status:"redeemed"` |
| Edit own profile display name | Both | `users/{ownUid}.displayName` |
| Save FCM token | Both | `users/{ownUid}.fcmToken` |

## 9. Phase 6 — notification triggers (optional)

Firestore-trigger functions, build only in Phase 6:

| Trigger | Sends |
|---------|-------|
| `onCreate tasks/{id}` | Push to the assigned child: "New task: \<title\>". |
| `onUpdate tasks/{id}` → `pending_approval` | Push to the parent: "\<child\> finished a task". |
| `onUpdate tasks/{id}` → `completed` | Push to the child: "Task approved! +\<n\> Stars". |
| `onUpdate backpackItems/{id}` → `redeem_requested` | Push to the parent: "\<child\> wants to redeem \<item\>". |

## 10. Testing

Every function has unit tests run against the Firebase Emulator Suite. Mandatory cases:
`approveTask` double-call does not double-credit; `purchaseStoreItem` with insufficient
balance changes nothing; `createChildAccount` rolls back the Auth user if the profile write
fails; ownership checks reject a parent acting on another family's data.
