# 05 — Security Rules & Privacy

This document defines who may read and write what. **Security Rules are the real access
boundary** — the app UI hiding a button is not security. Treat the rules below as a
specification; the implementer must also write matching tests.

## 1. Authentication model

- Firebase Authentication, **email + password** only.
- A **parent** self-registers (sign-up form).
- A **child does not self-register.** The parent creates the child account via the
  `createChildAccount` Cloud Function, which sets the email and password the parent chose.
- Role lives in `users/{uid}.role`. After login the app reads this and routes accordingly.
  The "Parent / Kid" choice on the login screen is a UX hint only — the profile role is
  authoritative. If they mismatch, the app signs the user out with an explanatory message.

### Note on the parent-sets-child-password design
The brief asks that the parent supply the child's email and password. This is implemented as
**parent-provisioned accounts**, the standard model for young-child apps — the parent owns
and controls the credentials. It is acceptable. Two safeguards are included:
- A parent can reset a child's password at any time (`updateChildCredentials`).
- Recommended (post-MVP): support a non-email "username" by mapping it to a synthetic email
  internally, so a child does not need a real inbox. Logged as open question, not MVP-blocking.

## 2. Access matrix

| Resource | Parent | Child |
|----------|--------|-------|
| Own `users` doc | read; update `displayName`, `fcmToken` | read; update `displayName`, `fcmToken` |
| Their child's `users` doc | read | — |
| `starBalance` field | **no client write** (Functions only) | **no client write** |
| `tasks` they own (`parentId`) | create, read, update, delete (not if `completed`) | — |
| `tasks` assigned to them (`childId`) | — | read; update only `status`→`pending_approval` |
| `storeItems` they own | create, read, update, delete | — |
| `storeItems` of their parent | — | read when `isActive == true` |
| `backpackItems` of their child | read; update `status`→`redeemed` | — |
| `backpackItems` they own | — | read; update `status`→`redeem_requested` |
| `transactions` subcollection | read (their child's) | read (own) |
| any `transactions` write | **no** | **no** (Functions only) |

## 3. Firestore Security Rules

Target spec — implement and test in `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function myUid() { return request.auth.uid; }
    function userDoc(uid) { return get(/databases/$(database)/documents/users/$(uid)).data; }
    function myRole() { return userDoc(myUid()).role; }
    function isParent() { return isSignedIn() && myRole() == 'parent'; }
    function isChild() { return isSignedIn() && myRole() == 'child'; }
    // true when uid is a child of the signed-in parent
    function isMyChild(uid) {
      return isParent() && userDoc(uid).parentId == myUid();
    }
    // fields the request changes
    function changedKeys() {
      return request.resource.data.diff(resource.data).affectedKeys();
    }

    // ---------- users ----------
    match /users/{uid} {
      allow read: if isSignedIn() && (
        uid == myUid() ||
        isMyChild(uid) ||                              // parent reads their child
        (isChild() && userDoc(myUid()).parentId == uid) // child reads their parent
      );
      // Profiles are created by sign-up (parent) or the createChildAccount function.
      allow create: if isSignedIn() && uid == myUid()
                    && request.resource.data.role == 'parent';
      // Self-service updates: only displayName / fcmToken may change.
      allow update: if isSignedIn() && uid == myUid()
                    && changedKeys().hasOnly(['displayName', 'fcmToken']);
      allow delete: if false;  // children removed via deleteChildAccount function
    }

    // ---------- tasks ----------
    match /tasks/{taskId} {
      allow read: if isSignedIn() && (
        resource.data.parentId == myUid() ||
        resource.data.childId == myUid()
      );
      allow create: if isParent()
        && request.resource.data.parentId == myUid()
        && isMyChild(request.resource.data.childId)
        && request.resource.data.status == 'available'
        && request.resource.data.starReward is int
        && request.resource.data.starReward >= 1;
      // Parent edits/deletes only before completion.
      allow update, delete: if isParent()
        && resource.data.parentId == myUid()
        && resource.data.status != 'completed';
      // Child may only flip an available task to pending_approval.
      allow update: if isChild()
        && resource.data.childId == myUid()
        && resource.data.status == 'available'
        && request.resource.data.status == 'pending_approval'
        && changedKeys().hasOnly(['status', 'completedAt']);
      // status -> completed happens ONLY via the approveTask function (Admin bypasses rules).
    }

    // ---------- storeItems ----------
    match /storeItems/{itemId} {
      allow read: if isSignedIn() && (
        resource.data.parentId == myUid() ||
        (isChild() && resource.data.parentId == userDoc(myUid()).parentId)
      );
      allow create: if isParent()
        && request.resource.data.parentId == myUid()
        && request.resource.data.starPrice is int
        && request.resource.data.starPrice >= 1;
      allow update, delete: if isParent() && resource.data.parentId == myUid();
    }

    // ---------- backpackItems ----------
    match /backpackItems/{itemId} {
      allow read: if isSignedIn() && (
        resource.data.childId == myUid() ||
        resource.data.parentId == myUid()
      );
      allow create: if false;  // created only by purchaseStoreItem function
      // Child: owned -> redeem_requested.
      allow update: if isChild()
        && resource.data.childId == myUid()
        && resource.data.status == 'owned'
        && request.resource.data.status == 'redeem_requested'
        && changedKeys().hasOnly(['status', 'redeemRequestedAt']);
      // Parent: redeem_requested -> redeemed.
      allow update: if isParent()
        && resource.data.parentId == myUid()
        && resource.data.status == 'redeem_requested'
        && request.resource.data.status == 'redeemed'
        && changedKeys().hasOnly(['status', 'redeemedAt']);
      allow delete: if false;
    }

    // ---------- transactions (ledger) ----------
    match /users/{uid}/transactions/{txnId} {
      allow read: if isSignedIn() && (uid == myUid() || isMyChild(uid));
      allow write: if false;  // written only by Cloud Functions
    }
  }
}
```

### Notes for the implementer
- Cloud Functions use the **Admin SDK**, which **bypasses** these rules — that is why
  `starBalance`, `transactions`, `backpackItems` creation, and task completion are locked to
  `false`/Functions here.
- The rules call `get()` on `users` documents; this costs one read per evaluation. Acceptable
  at MVP scale. If cost matters later, mirror `role`/`parentId` into custom auth claims.
- `isMyChild` and the child-edits-task rules are the trickiest — they **must** have explicit
  emulator tests (see §6).

## 4. Cloud Storage Security Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /storeItems/{parentId}/{fileName} {
      // Any signed-in user may read an item image.
      allow read: if request.auth != null;
      // Only the owning parent may upload; <= 5 MB; images only.
      allow write: if request.auth != null
        && request.auth.uid == parentId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## 5. Privacy & child safety

- **Minimise child data.** Store only displayName and email for a child. No birthday, no
  location, no analytics on children in the MVP.
- **Parental control.** All of a child's data is created and removable by their parent. The
  parent is the data controller for the child's account.
- **No third-party trackers / ads** in the app — especially none in the child experience.
- **No social surface.** Children cannot see or contact anyone outside their own family.
- **Transport security** is provided by Firebase (TLS); at-rest encryption is managed by
  Google Cloud.
- **Account deletion.** `deleteChildAccount` fully removes a child. A parent-account deletion
  flow (removing the parent and cascading to all children) should be added before public
  release — logged as a pre-launch task in doc 07.
- **Regulatory note (not legal advice):** an app collecting data from children under 13 is in
  scope of regulations such as **COPPA** (US) and **GDPR-K** (EU). Before public release the
  product owner must add a privacy policy, parental-consent confirmation at child-account
  creation, and review data practices with a qualified advisor. Flagged as a launch
  prerequisite, outside engineering scope.

## 6. Mandatory security tests

Run against the Firestore Emulator (`@firebase/rules-unit-testing`):
- A parent **cannot** read or write another family's `users`, `tasks`, `storeItems`,
  `backpackItems`, or `transactions`.
- A child **cannot** write `starBalance` directly.
- A child **cannot** set a task straight to `completed` or to `pending_approval` on a task
  not assigned to them.
- A child **cannot** create a `backpackItems` or `transactions` document.
- A child **cannot** read store items of a parent who is not their own.
- A child **cannot** mark a backpack item `redeemed` (parent-only); a parent cannot set one
  to `redeem_requested` (child-only).
- An unauthenticated request is denied everywhere.
