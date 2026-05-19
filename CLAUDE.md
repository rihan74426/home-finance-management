# CLAUDE.md — HOMY SESSION MEMORY

> Read this file at the start of every session.
> Update "Last Session" before ending every session.

---

## PROJECT IDENTITY

- **Product:** Homy — "Your home, finally organized"
- **Type:** Household management SaaS
- **Stack:** Next.js 14 App Router, JavaScript, MongoDB/Mongoose, Clerk auth, Tailwind CSS
- **Target:** Shared households — flatmates, families, co-living — South/Southeast Asia first
- **Stage:** Phase 1 feature-complete. Phase 2 = monetization + mobile.

---

## COMPLETE FILE INVENTORY

### Models (`src/models/`)

| File                  | Key exports                | Notes                                  |
| --------------------- | -------------------------- | -------------------------------------- |
| `User.js`             | default User               | Has `fcmTokens` array for push         |
| `House.js`            | default House              | Root entity                            |
| `Membership.js`       | default Membership         | `.isManager()` + `.isMember()` statics |
| `Ledgerentry.js`      | default LedgerEntry        | `.forMember()` strips managerNote      |
| `Bills.js`            | `{ Bill, BillSplit }`      | Named exports                          |
| `VaultItem.js`        | default VaultItem          | AES-256-GCM encryption helpers         |
| `Task.js`             | default Task               | Recurring tasks                        |
| `Grocery.js`          | default GroceryItem        |                                        |
| `Thread.js`           | `{ Thread, Message }`      | Named exports                          |
| `Polls.js`            | default Poll               | Votes embedded                         |
| `Invite.js`           | default Invite             | `.generateToken()`, `.createInvite()`  |
| `Notification.js`     | default Notification       |                                        |
| `MemberDocument.js`   | default MemberDocument     |                                        |
| `MoveOutChecklist.js` | default MoveOutChecklist   | `DEFAULT_CHECKLIST_ITEMS` export       |
| `HouseRule.js`        | `{ HouseRule, RuleAlert }` | Named exports                          |
| `ManagerNote.js`      | default ManagerNote        | Private + shared notes                 |
| `Meeting.js`          | default Meeting            | RSVP embedded                          |
| `MemberPermission.js` | default MemberPermission   | `PERMISSIONS`, `ROLE_DEFAULTS` exports |

### API Routes — Complete Map

```
PUBLIC:
  GET  /api/invites/[token]                                  look up invite
  POST /api/webhooks/clerk                                   user sync

HOUSES:
  GET  /api/houses                                           list user's houses
  POST /api/houses                                           create house
  GET  /api/houses/[id]                                      house detail + role
  PATCH /api/houses/[id]                                     update (manager)
  DELETE /api/houses/[id]                                    soft delete (manager)

MEMBERS:
  GET  /api/houses/[id]/members                              list (role-filtered)
  PATCH /api/houses/[id]/members/[membershipId]/role         change role (manager)
  DELETE /api/houses/[id]/members/[membershipId]             remove / leave
  GET  /api/houses/[id]/members/[membershipId]/permissions   effective permissions
  PATCH /api/houses/[id]/members/[membershipId]/permissions  set overrides (manager)
  DELETE /api/houses/[id]/members/[membershipId]/permissions reset overrides
  POST /api/houses/[id]/transfer                             ownership transfer

INVITES:
  POST /api/houses/[id]/invites                              create invite + email/SMS
  GET  /api/houses/[id]/invites                              list pending (manager)
  POST /api/invites/[token]                                  accept invite

LEDGER:
  GET  /api/houses/[id]/ledger                               entries (manager=all, member=own)
  POST /api/houses/[id]/ledger                               log payment (manager)
  PATCH /api/houses/[id]/ledger/[entryId]                    update amountPaid/method (manager)
  GET  /api/houses/[id]/ledger/export                        PDF export

BILLS:
  GET  /api/houses/[id]/bills                                list
  POST /api/houses/[id]/bills                                create (manager)
  PATCH /api/bills/[billId]                                  update details (manager)
  DELETE /api/bills/[billId]                                 delete unsplit bill (manager)
  POST /api/bills/[billId]/split                             split among members (manager)
  GET  /api/bills/[billId]/split                             list all splits + status
  PATCH /api/bills/[billId]/split/[splitId]                  mark share paid (manager)
  GET  /api/bills/[billId]/split/[splitId]                   get single split

VAULT:
  GET  /api/houses/[id]/vault                                list (visibility-filtered, decrypted)
  POST /api/houses/[id]/vault                                add (encrypted)
  PATCH /api/vault/[itemId]                                  update
  DELETE /api/vault/[itemId]                                 delete

TASKS:
  GET  /api/houses/[id]/tasks                                list
  POST /api/houses/[id]/tasks                                create
  PATCH /api/tasks/[taskId]                                  update / complete
  DELETE /api/tasks/[taskId]                                 delete

GROCERY:
  GET  /api/houses/[id]/grocery                              list
  POST /api/houses/[id]/grocery                              add
  PATCH /api/grocery/[itemId]                                mark bought / update
  DELETE /api/grocery/[itemId]                               delete

CHAT:
  GET  /api/houses/[id]/threads                              list threads
  POST /api/houses/[id]/threads                              create thread
  GET  /api/threads/[threadId]/messages                      messages (paginated + poll)
  POST /api/threads/[threadId]/messages                      send message

POLLS:
  GET  /api/houses/[id]/polls                                list with results + myVote
  POST /api/houses/[id]/polls                                create
  POST /api/polls/[pollId]/vote                              cast / toggle vote
  DELETE /api/polls/[pollId]/vote                            close poll (manager)

NOTIFICATIONS:
  GET  /api/notifications                                    list + unreadCount
  PATCH /api/notifications                                   mark read

DOCUMENTS:
  GET  /api/memberships/[membershipId]/documents             list
  POST /api/memberships/[membershipId]/documents             upload (member only)
  POST /api/memberships/[membershipId]/documents/[docId]     toggle verify (manager)
  DELETE /api/memberships/[membershipId]/documents/[docId]   delete (owner or manager)

RULES:
  GET  /api/houses/[id]/rules                                list rules + open alerts (manager)
  POST /api/houses/[id]/rules                                create rule (manager)
  PATCH /api/rules/[ruleId]                                  update rule (manager)
  DELETE /api/rules/[ruleId]                                 deactivate rule (manager)
  POST /api/rules/[ruleId]/alerts                            report violation (any member)
  PATCH /api/rules/[ruleId]/alerts/[alertId]                 resolve/dismiss (manager)

NOTES:
  GET  /api/houses/[id]/notes                                list (manager=all, member=shared)
  POST /api/houses/[id]/notes                                create (manager)
  PATCH /api/houses/[id]/notes/[noteId]                      update (manager)
  DELETE /api/notes/[noteId]                                 delete (manager)

MEETINGS:
  GET  /api/houses/[id]/meetings                             list upcoming/past
  POST /api/houses/[id]/meetings                             schedule + notify
  PATCH /api/meetings/[meetingId]                            rsvp / cancel / update
  GET  /api/meetings/[meetingId]                             single meeting detail

MOVE-OUT:
  GET  /api/houses/[id]/moveout                              get checklist(s)
  POST /api/houses/[id]/moveout                              initiate (member)
  PATCH /api/houses/[id]/moveout                             update_item/submit/approve/reject

PUSH:
  POST /api/push/subscribe                                   save FCM token
  DELETE /api/push/subscribe                                 remove FCM token

CRON:
  GET  /api/cron/rent-reminders                              daily reminders (CRON_SECRET)
```

### Dashboard Pages

```
/dashboard                           house list
/dashboard/profile                   user profile + activity
/dashboard/create-house              create house form
/dashboard/[houseId]                 house overview (cached, live stats)
/dashboard/[houseId]/ledger          rent ledger + inline mark-paid
/dashboard/[houseId]/bills           bills + split + per-member payments
/dashboard/[houseId]/vault           encrypted vault (undo delete)
/dashboard/[houseId]/tasks           task board (undo delete + toggle)
/dashboard/[houseId]/grocery         grocery list (undo delete + toggle)
/dashboard/[houseId]/chat            threaded chat + polls + 3s polling
/dashboard/[houseId]/polls           standalone polls page (undo close)
/dashboard/[houseId]/members         member list + invite + documents
/dashboard/[houseId]/rules           house rules + violation alerts (undo delete)
/dashboard/[houseId]/notes           manager notes (undo delete)
/dashboard/[houseId]/meetings        meetings + RSVP
/dashboard/[houseId]/moveout         move-out checklist
/dashboard/[houseId]/settings        house settings (tabs)
/invite/[token]                      invite acceptance
```

---

## BUGS FIXED (all sessions combined)

| #   | Bug                                                                             | Fix                                                              |
| --- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | `src/proxy.js` wrong filename                                                   | Rename to `src/middleware.js`                                    |
| 2   | `src/app/api/ledger/route.js` broken orphan                                     | Delete this file                                                 |
| 3   | `rules/[ruleId]/alerts/route.js` broken PATCH                                   | Rewrite; PATCH moved to `[alertId]/route.js`                     |
| 4   | `notes/page.jsx` calls `DELETE /api/notes/[noteId]` — no route                  | Created `/api/notes/[noteId]/route.js`                           |
| 5   | `src/lib/sw.js` — SW must be at root                                            | Moved to `public/sw.js`                                          |
| 6   | `memberships/.../documents/[docId]/verify/route.js` dead code                   | Deleted; `[docId]/route.js` handles POST + DELETE                |
| 7   | `User` model missing `fcmTokens` field                                          | Added `fcmTokens` array to User schema                           |
| 8   | Dashboard layout missing several pages in nav                                   | Full rewrite of sidebar                                          |
| 9   | `meetings/page.jsx` PATCH at wrong base path                                    | Created `/api/meetings/[meetingId]/route.js`                     |
| 10  | Sidebar not fixed on scroll                                                     | `position: fixed`, main content `margin-left: 220px`             |
| 11  | House overview no caching                                                       | Module-level `CACHE`, 30s TTL, silent background refresh         |
| 12  | No alert system                                                                 | `alert-pulse` CSS, red badge, alert banner                       |
| 13  | Bill split payment path wrong                                                   | Created `/api/bills/[billId]/split/[splitId]/route.js`           |
| 14  | No way to mark rent entry as paid                                               | Created `PATCH /api/houses/[id]/ledger/[entryId]/route.js`       |
| 15  | Bills page had no payment UI                                                    | `SplitPanel` + `MarkPaidModal` with per-member mark-paid flow    |
| 16  | Overview skeleton was text "Loading..."                                         | Proper `OverviewSkeleton` with pulse cards                       |
| 17  | `useUndo` had race condition — API could fire after cancel                      | Rewrote with ref-based `cancelled` flag, no stale closure issues |
| 18  | Undo had no countdown — user didn't know how long they had                      | Live countdown in toast label: `"Task deleted (4s)"`             |
| 19  | Undo only on tasks/grocery — missing vault, rules, notes, bills, polls, members | `usePageActions` hook covers all destructive actions             |
| 20  | Old `useUndo` left UI broken on API failure (no revert)                         | `apiCall` failure always calls `revert()` + shows error toast    |
| 21  | Multiple pending undos could stack and conflict                                 | New action silently cancels previous pending undo (no revert)    |

| 22 | `usePageActions.deleteTask` had no-op revert (`setTasks(p) => p`) | Replaced with snapshot-based revert |
| 23 | `layout.js` had two `<Toaster>` instances causing duplicate toasts | Merged into single Toaster with inline props |
| 24 | `layout.js` sidebar CSS `~ div` sibling selector didn't apply margin | Added `main-content` class, targeted directly in media query |
| 25 | `useUndo.js` mixed `countdownId`/`intervalId` naming causing potential interval leak | Standardized to `intervalId` throughout |
| 26 | `usePageActions` had dead `deleteMyThing` referencing `/api/things/` | Removed entirely |

---

## UNDO SYSTEM (complete, as of this session)

### Architecture

```
src/hooks/useUndo.js          — core hook + standalone undoable() utility
src/hooks/usePageActions.js   — all destructive actions wired with undo
```

### How it works

```
1. User clicks delete / toggle / close
2. optimisticUpdate() fires → UI changes instantly
3. Toast appears: "Task deleted (5s)" with [Undo] button
4. Countdown ticks: 5 → 4 → 3 → 2 → 1
5a. User clicks Undo → revert() called → toast dismissed → API never fires
5b. Countdown reaches 0 → apiCall() fires
6.  apiCall fails → revert() called → error toast shown
```

### Actions covered by undo

| Page    | Action         | Message                              |
| ------- | -------------- | ------------------------------------ |
| Tasks   | Delete task    | `Task "Clean kitchen" deleted (5s)`  |
| Tasks   | Toggle done    | `Task marked done (5s)`              |
| Grocery | Delete item    | `"Eggs" removed (5s)`                |
| Grocery | Toggle bought  | `"Eggs" marked bought (5s)`          |
| Vault   | Delete item    | `"Home WiFi" deleted (5s)`           |
| Rules   | Delete rule    | `Rule "No guests..." deleted (5s)`   |
| Notes   | Delete note    | `Note "Finance update" deleted (5s)` |
| Polls   | Close poll     | `Poll closed (5s)`                   |
| Bills   | Delete bill    | `Bill "Electricity" deleted (5s)`    |
| Members | Remove member  | `Rafiq removed (5s)`                 |
| Threads | Archive thread | `#maintenance archived (5s)`         |

### Key design decisions

- **ref-based cancellation** — `state.cancelled` is a plain object property, not a closure variable. Avoids stale closure bugs entirely.
- **silentCancel vs cancel** — when a new action supersedes an old one, `silentCancel()` stops the old API call without reverting the UI (since the new action already changed it). `cancel()` reverts.
- **unmount cleanup** — `useEffect` return clears timer + interval if component unmounts during countdown (e.g. user navigates away).
- **polling coexistence** — grocery polling checks `pendingOps` ref before overwriting items. Items with in-flight undo are skipped in merge.
- **toast countdown** — updates every 1s via `setInterval`. Dismissed automatically when timer fires.

### Usage pattern

```js
// In any page component:
import { usePageActions } from "@/hooks/usePageActions";

const { deleteTask, toggleTaskDone, deleteVaultItem } = usePageActions({
  houseId,
});

// Delete with undo:
function handleDelete(task) {
  deleteTask({ taskId: task._id, taskTitle: task.title, tasks, setTasks });
}

// Toggle with undo:
function handleToggle(task) {
  const newStatus = task.status === "done" ? "todo" : "done";
  toggleTaskDone({ task, newStatus, tasks, setTasks });
}
```

### Adding undo to a new action

```js
// In usePageActions.js, add a new function:
function deleteMyThing({ thingId, thingName, things, setThings }) {
  const snapshot = [...things];
  withUndo({
    message: `"${thingName}" deleted`,
    optimisticUpdate: () =>
      setThings((p) => p.filter((t) => t._id !== thingId)),
    revert: () => setThings(snapshot),
    apiCall: () => fetch(`/api/things/${thingId}`, { method: "DELETE" }),
  });
}
```

---

## PAYMENT LIFECYCLE (complete)

### Rent payments

```
Manager logs entry (POST /api/houses/[id]/ledger)
  → status auto-calculated by pre-save hook

Manager records payment (PATCH /api/houses/[id]/ledger/[entryId])
  → amountPaid updated → status recalculated → member notified if paid
```

### Bill payments

```
Manager creates bill → splits it → BillSplit + LedgerEntry created per member
Manager marks split paid (PATCH /api/bills/[billId]/split/[splitId])
  → BillSplit.status updated
  → linked LedgerEntry.amountPaid updated
  → pre-save hook recalculates LedgerEntry.status
  → member gets in-app notification
```

---

## DECISIONS (DON'T RE-DEBATE)

| Decision                                      | What                                     | Why                                     |
| --------------------------------------------- | ---------------------------------------- | --------------------------------------- |
| Polling not Socket.io                         | Chat + grocery use polling               | No Express server yet; upgrade Phase 3  |
| Mongoose v7+ async hooks                      | No `next()` in pre-save                  | v7 API change                           |
| `src/middleware.js`                           | Exact path required by Next.js           | Convention                              |
| Integers for money                            | All amounts in smallest unit (paisa)     | No float rounding bugs                  |
| AES-256-GCM vault                             | Server-side encryption                   | Simple and secure                       |
| Soft delete                                   | `deletedAt` field, not deletion          | Preserve history                        |
| Module-level cache for overview               | 30s TTL, silent background refresh       | Instant navigation, always fresh        |
| Fixed sidebar via `position: fixed`           | Not sticky; main gets `margin-left`      | Only reliable cross-browser approach    |
| Split payment path: `.../split/[splitId]`     | Nested under split resource              | RESTful, matches BillSplit entity       |
| ref-based undo cancellation                   | `state.cancelled` not closure variable   | No stale closure bugs                   |
| `silentCancel` for superseded undos           | New action cancels old without reverting | Correct — new action already changed UI |
| `usePageActions` centralises all undo actions | One file, consistent pattern             | Easy to add new actions, easy to audit  |

---

## CODING RULES (ALWAYS FOLLOW)

1. API response shape: `{ success: boolean, data?: any, error?: string }`
2. Auth: `const { userId: clerkId } = await auth()` → find User → check Membership
3. **Always `await params`**: `const { id } = await params;` (Next.js 15 requirement)
4. Money: store as integers (paisa/cents). Display with `Intl.NumberFormat`
5. No `next()` in Mongoose pre-save hooks — use `async function()`
6. Optimistic UI for all destructive actions — always wire through `usePageActions`
7. `LedgerEntry.managerNote` NEVER returned to member
8. Vault items ALWAYS decrypted server-side before returning
9. Route files: `route.js`. Page files: `page.jsx`
10. `fcmTokens` stripped in `User.toSafeObject()` — never sent to client
11. Alert styles use `.alert-pulse` class — never inline animation for reuse
12. `CACHE` object in overview page is module-level (resets on hard reload)
13. Every destructive action must go through `usePageActions` — no direct fetch+delete in pages

---

## ALERT SYSTEM CLASSES (globals.css)

```css
.alert-pulse          /* pulsing red dot — overdue/urgent indicators */
.alert-pulse-badge    /* pulsing red notification badge */
.alert-banner         /* red-themed container div for alert strips */
.text-urgent          /* color: #f87171 */
.border-urgent        /* border-color: rgba(248,113,113,0.3) */
.row-overdue          /* red left border + subtle bg for table rows */
```

---

## PHASE 2 REMAINING TASKS (priority order)

### Must-have before revenue

1. **Stripe subscriptions** — enforce free plan limits (1 house, 6 members, 5 vault items, 1 thread)
2. **File upload (Cloudinary)** — bill receipt photos, member document actual upload
3. **Push notification wiring** — register service worker + FCM token in layout

### Nice-to-have Phase 2

4. **Task recurrence** — auto-create next task when recurring task marked done
5. **Ledger pagination** — cursor-based; slow for 100+ entries
6. **Electricity meter tracker UI** — model supports it, needs UI section in bills page
7. **Socket.io chat** — replace 3s polling

### Phase 3

8. React Native mobile app (Expo)
9. bKash / Nagad / UPI payment collection via API
10. WhatsApp Business API reminders

---

## PRE-LAUNCH CHECKLIST

```
File operations:
  [ ] RENAME src/proxy.js → src/middleware.js
  [ ] DELETE src/app/api/ledger/route.js
  [ ] DELETE src/app/api/memberships/[id]/documents/[docId]/verify/route.js
  [ ] DELETE src/lib/sw.js
  [ ] ADD public/sw.js
  [ ] ADD vercel.json

New/updated files from all sessions:
  [ ] src/hooks/useUndo.js                                     (rewritten — ref-based, countdown)
  [ ] src/hooks/usePageActions.js                              (NEW — all undo actions)
  [ ] src/app/dashboard/layout.js                              (fixed sidebar, alert theme, Toaster)
  [ ] src/app/dashboard/[houseId]/page.jsx                     (caching + skeletons)
  [ ] src/app/dashboard/[houseId]/ledger/page.jsx              (inline mark-paid)
  [ ] src/app/dashboard/[houseId]/bills/page.jsx               (split payments UI)
  [ ] src/app/dashboard/[houseId]/tasks/page.jsx               (usePageActions undo)
  [ ] src/app/dashboard/[houseId]/grocery/page.jsx             (usePageActions undo)
  [ ] src/app/dashboard/[houseId]/rules/page.jsx               (usePageActions undo)
  [ ] src/app/dashboard/[houseId]/notes/page.jsx               (usePageActions undo)
  [ ] src/app/dashboard/[houseId]/vault/page.jsx               (update handleDelete to use usePageActions)
  [ ] src/app/api/bills/[billId]/split/[splitId]/route.js      (PATCH + GET)
  [ ] src/app/api/houses/[id]/ledger/[entryId]/route.js        (PATCH)
  [ ] src/app/globals.css                                       (append alert + undo toast CSS)

Toaster update in layout.js:
  [ ] Replace <Toaster> with TOASTER_PROPS from toaster_config.js
  [ ] Add sonner CSS overrides to globals.css

Environment variables:
  [ ] MONGODB_URI
  [ ] CLERK_SECRET_KEY + CLERK_WEBHOOK_SECRET
  [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  [ ] VAULT_ENCRYPTION_KEY (64-char hex)
  [ ] NEXT_PUBLIC_APP_URL
  [ ] CRON_SECRET
  [ ] RESEND_API_KEY
  [ ] TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_PHONE_NUMBER
  [ ] FIREBASE_SERVICE_ACCOUNT_JSON

Testing:
  [ ] npm run build — zero errors
  [ ] Delete a task → undo within 5s → task restored → no API call fired
  [ ] Delete a task → wait 5s → task gone → API called → DB updated
  [ ] Delete a task → API fails → task restored → error toast shown
  [ ] Two deletes in quick succession → only second one pending → first silently cancelled
  [ ] Navigate away during countdown → component unmounts → timer cleared → no orphan API call
  [ ] Sidebar fixed on scroll (desktop)
  [ ] Alert pulse visible on overdue items
  [ ] Overview page loads from cache on back-navigation
  [ ] Bill split → mark paid → member ledger updated → notification sent
```

---

## SESSION LOG

| Date      | What was done                                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session 1 | Foundation: models, auth, house creation, dashboard shell                                                                                                                       |
| Session 2 | Ledger, Vault, Tasks, Members, Settings                                                                                                                                         |
| Session 3 | Middleware rename, Mongoose hook fix, emoji removal, nav routing fix                                                                                                            |
| Session 4 | Grocery + Chat, architecture docs                                                                                                                                               |
| Session 5 | Bills splitting, Polls, Notifications, PDF export, Move-out, Rules, Notes, Meetings                                                                                             |
| Session 6 | Fixed sidebar, house overview caching + skeletons, red alert system, complete payment lifecycle                                                                                 |
| Session 7 | Rewrote useUndo (ref-based, countdown, silentCancel), usePageActions hook, undo on all destructive actions: tasks, grocery, vault, rules, notes, polls, bills, members, threads |

## | Session 8 | Bug fixes: usePageActions no-op revert, useUndo interval leak, double Toaster in layout, broken sidebar CSS sibling selector |

## LAST SESSION

**What was fixed:**

1. **`usePageActions.js` — broken deleteTask revert**
   - Old code had two versions of `deleteTask`: a no-op (`setTasks(p) => p`) and a working snapshot version
   - Removed the no-op version entirely, kept only snapshot-based revert
   - All `apiCall` functions now throw on `!j.success` so the catch block triggers revert correctly
   - Removed `deleteMyThing` placeholder that pointed to `/api/things/` (non-existent route)

2. **`useUndo.js` — interval leak on unmount**
   - Old code used both `countdownId` and `intervalId` inconsistently
   - Standardized to `intervalId` throughout — ensures `clearInterval` in cleanup always targets the correct reference
   - No behavioral change but prevents silent interval leak if component unmounts mid-countdown

3. **`layout.js` — double Toaster instance**
   - Old layout rendered `<Toaster>` inline AND spread `TOASTER_PROPS` from `toasterConfig.js` into a second `<Toaster>`
   - Two Toaster instances caused duplicate toasts and conflicting dismiss behavior
   - Fixed: single `<Toaster>` with all props defined inline, `toasterConfig.js` no longer imported in layout

4. **`layout.js` — broken sidebar CSS sibling selector**
   - Old code: `.desktop-sidebar ~ div { margin-left: 220px }`
   - CSS `~` sibling selector requires elements to be DOM siblings — they were not (main content was inside a wrapper div that was a child, not sibling)
   - Fixed: added `main-content` class to the wrapper div, applied `margin-left` via media query targeting `.main-content` directly

**Files changed:**

- `src/hooks/useUndo.js`
- `src/hooks/usePageActions.js`
- `src/app/dashboard/layout.js`

grocery page is refreshing after 2 seconds for /api/houses/69d67e7accebc45f83079b8c/grocery?showBought=false. that's why the undo feature that we designed is not working here. the frontend is updating but again replaced after a while. also there's a toast overlay happening. check it. manage the undo system professionally. we need to take care of it. suggest me if you have any better idea for the undo feature. otherwise make this one work perfectly.

also we need proper skeleton loader in every page of the application.

The notification mark as read should be triggered whenever user sees it or opens the notification tab.

the meetings page should be checked for dom update and proper undo feature and the proper api request and frontend update. because the update was taking as a new member could not find the userid.name from in the frontend rspv data update. it should be handled properly.
