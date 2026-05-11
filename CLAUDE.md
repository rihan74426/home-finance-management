# CLAUDE.md — HOMIFY SESSION MEMORY

> Read this file at the start of every session.
> Update "Last Session" before ending every session.

---

## PROJECT IDENTITY

- **Product:** Homify — "Your home, finally organized"
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
  PATCH /api/houses/[id]/ledger/[entryId]                   update amountPaid/method (manager) ✅ NEW
  GET  /api/houses/[id]/ledger/export                        PDF export

BILLS:
  GET  /api/houses/[id]/bills                                list
  POST /api/houses/[id]/bills                                create (manager)
  PATCH /api/bills/[billId]                                  update details (manager)
  DELETE /api/bills/[billId]                                 delete unsplit bill (manager)
  POST /api/bills/[billId]/split                             split among members (manager)
  GET  /api/bills/[billId]/split                             list all splits + status
  PATCH /api/bills/[billId]/split/[splitId]                 mark share paid (manager) ✅ FIXED PATH
  GET  /api/bills/[billId]/split/[splitId]                  get single split

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
/dashboard/[houseId]                 house overview (cached, live stats)  ✅ UPDATED
/dashboard/[houseId]/ledger          rent ledger + inline mark-paid       ✅ UPDATED
/dashboard/[houseId]/bills           bills + split + per-member payments  ✅ UPDATED
/dashboard/[houseId]/vault           encrypted vault
/dashboard/[houseId]/tasks           task board
/dashboard/[houseId]/grocery         grocery list (real-time polling)
/dashboard/[houseId]/chat            threaded chat + polls + 3s polling
/dashboard/[houseId]/polls           standalone polls page
/dashboard/[houseId]/members         member list + invite + documents
/dashboard/[houseId]/rules           house rules + violation alerts
/dashboard/[houseId]/notes           manager notes
/dashboard/[houseId]/meetings        meetings + RSVP
/dashboard/[houseId]/moveout         move-out checklist
/dashboard/[houseId]/settings        house settings (tabs)
/invite/[token]                      invite acceptance
```

---

## BUGS FIXED (all sessions combined)

| #   | Bug                                                                                               | Fix                                                                            |
| --- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | `src/proxy.js` wrong filename                                                                     | Rename to `src/middleware.js`                                                  |
| 2   | `src/app/api/ledger/route.js` broken orphan — uses undefined `params.id`                          | Delete this file                                                               |
| 3   | `rules/[ruleId]/alerts/route.js` broken PATCH                                                     | Rewrite; PATCH moved to `[alertId]/route.js`                                   |
| 4   | `notes/page.jsx` calls `DELETE /api/notes/[noteId]` — no matching route                           | Created `/api/notes/[noteId]/route.js`                                         |
| 5   | `src/lib/sw.js` — service workers must be at root URL                                             | Moved to `public/sw.js`                                                        |
| 6   | `memberships/.../documents/[docId]/verify/route.js` — dead code                                   | Deleted; `[docId]/route.js` handles POST (verify) + DELETE                     |
| 7   | `User` model missing `fcmTokens` field used by push/subscribe route                               | Added `fcmTokens` array to User schema                                         |
| 8   | Dashboard layout missing `/polls`, `/rules`, `/notes`, `/meetings`, `/moveout`, `/profile` in nav | Full rewrite of sidebar                                                        |
| 9   | `meetings/page.jsx` calls `PATCH /api/meetings/[meetingId]` — route at wrong base path            | Created standalone `/api/meetings/[meetingId]/route.js`                        |
| 10  | **Sidebar not fixed** — `position: sticky` inside flex container doesn't work                     | Changed to `position: fixed`, main content gets `margin-left: 220px`           |
| 11  | **House overview no caching** — refetches all 7 endpoints on every visit                          | Module-level `CACHE` object, 30s TTL, silent background refresh                |
| 12  | **No alert system** — urgent notifications look same as normal ones                               | `alert-pulse` CSS class, red badge pulse, alert banner on overview             |
| 13  | **Bill split payment lifecycle broken** — `PATCH /api/bills/[billId]/splits/[splitId]` wrong path | Created correct route at `/api/bills/[billId]/split/[splitId]/route.js`        |
| 14  | **No way to mark rent entry as paid** — ledger had no update endpoint                             | Created `PATCH /api/houses/[id]/ledger/[entryId]/route.js`; inline panel in UI |
| 15  | **Bills page had no payment UI** — split details showed status only, no actions                   | Added `SplitPanel` + `MarkPaidModal` with per-member mark-paid flow            |
| 16  | **Overview skeleton was basic** — showed "Loading..." text on some pages                          | Proper `OverviewSkeleton` with pulse cards matching final layout               |

---

## PAYMENT LIFECYCLE (complete, as of this session)

### Rent payments

```
Manager creates ledger entry (POST /api/houses/[id]/ledger)
  → amountPaid = 0  → status = "pending"
  → amountPaid < amountDue → status = "partial"
  → amountPaid >= amountDue → status = "paid"

Manager updates payment (PATCH /api/houses/[id]/ledger/[entryId])
  → pre-save hook recalculates status automatically
  → member notified if status becomes "paid"
  → PDF export available at any time
```

### Bill payments

```
Manager creates bill (POST /api/houses/[id]/bills)
  → isSplit = false

Manager splits bill (POST /api/bills/[billId]/split)
  → creates BillSplit per member
  → creates LedgerEntry per member (type = "bill")
  → each BillSplit.ledgerEntryId links to the entry

Manager marks split paid (PATCH /api/bills/[billId]/split/[splitId])
  → updates BillSplit.status
  → updates linked LedgerEntry.amountPaid
  → LedgerEntry pre-save hook recalculates status
  → member receives in-app notification

Member view
  → sees their own LedgerEntry (status, amount)
  → never sees managerNote or other members' entries
```

---

## DECISIONS (DON'T RE-DEBATE)

| Decision                                          | What                                   | Why                                    |
| ------------------------------------------------- | -------------------------------------- | -------------------------------------- |
| Polling not Socket.io                             | Chat + grocery use polling             | No Express server yet; upgrade Phase 3 |
| Mongoose v7+ async hooks                          | No `next()` in pre-save                | v7 API change                          |
| `src/middleware.js`                               | Exact path required by Next.js         | Convention                             |
| Integers for money                                | All amounts in smallest unit (paisa)   | No float rounding bugs                 |
| AES-256-GCM vault                                 | Server-side encryption                 | Simple and secure                      |
| Soft delete                                       | `deletedAt` field, not actual deletion | Preserve history                       |
| `HouseRule.js` exports `{ HouseRule, RuleAlert }` | Named exports                          | Both used together                     |
| `Bills.js` exports `{ Bill, BillSplit }`          | Named exports                          | Both used together                     |
| Module-level cache for overview                   | 30s TTL, silent background refresh     | Instant navigation, always fresh       |
| Fixed sidebar via `position: fixed`               | Not sticky; main gets `margin-left`    | Only reliable cross-browser approach   |
| Split payment path: `.../split/[splitId]`         | Nested under split resource            | RESTful, matches BillSplit entity      |

---

## CODING RULES (ALWAYS FOLLOW)

1. API response shape: `{ success: boolean, data?: any, error?: string }`
2. Auth: `const { userId: clerkId } = await auth()` → find User → check Membership
3. **Always `await params`**: `const { id } = await params;` (Next.js 15 requirement)
4. Money: store as integers (paisa/cents). Display with `Intl.NumberFormat`
5. No `next()` in Mongoose pre-save hooks — use `async function()`
6. Optimistic UI for grocery/tasks — always revert on API failure
7. `LedgerEntry.managerNote` NEVER returned to member
8. Vault items ALWAYS decrypted server-side before returning
9. Route files: `route.js`. Page files: `page.jsx`
10. `fcmTokens` stripped in `User.toSafeObject()` — never sent to client
11. Alert styles use `.alert-pulse` class — never inline animation for reuse
12. `CACHE` object in overview page is module-level (survives React re-renders, resets on hard reload)

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
2. **File upload (Cloudinary)** — bill receipt photos, member document actual upload (currently URL paste only)
3. **Push notification wiring** — register service worker + FCM token in layout

### Nice-to-have Phase 2

4. **Task recurrence** — auto-create next task when recurring task marked done
5. **Ledger pagination** — cursor-based; slow for 100+ entries
6. **Electricity meter tracker UI** — model supports it, needs a UI section in bills page
7. **Socket.io chat** — replace 3s polling for real-time

### Phase 3

8. React Native mobile app (Expo)
9. bKash / Nagad / UPI payment collection via API
10. WhatsApp Business API reminders

---

## PRE-LAUNCH CHECKLIST

```
File fixes:
  [ ] RENAME src/proxy.js → src/middleware.js
  [ ] DELETE src/app/api/ledger/route.js
  [ ] DELETE src/app/api/memberships/[id]/documents/[docId]/verify/route.js
  [ ] DELETE src/lib/sw.js
  [ ] ADD public/sw.js
  [ ] ADD vercel.json (cron config)
  [ ] ADD .env.example

New files from this session:
  [ ] src/app/dashboard/layout.js                              (sidebar fix + alert theme)
  [ ] src/app/dashboard/[houseId]/page.jsx                     (caching + skeletons)
  [ ] src/app/dashboard/[houseId]/ledger/page.jsx              (inline mark-paid)
  [ ] src/app/dashboard/[houseId]/bills/page.jsx               (split payments UI)
  [ ] src/app/api/bills/[billId]/split/[splitId]/route.js      (PATCH + GET)
  [ ] src/app/api/houses/[id]/ledger/[entryId]/route.js        (PATCH)
  [ ] Append alert CSS to src/app/globals.css

Environment:
  [ ] MONGODB_URI set and Atlas cluster accessible
  [ ] CLERK_SECRET_KEY + CLERK_WEBHOOK_SECRET set
  [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY set
  [ ] VAULT_ENCRYPTION_KEY set (64-char hex)
  [ ] NEXT_PUBLIC_APP_URL set to production domain
  [ ] CRON_SECRET set
  [ ] RESEND_API_KEY set
  [ ] TWILIO_* set
  [ ] FIREBASE_SERVICE_ACCOUNT_JSON set

Clerk Dashboard:
  [ ] Webhook: https://yourdomain.com/api/webhooks/clerk
  [ ] Events: user.created, user.updated, user.deleted
  [ ] Phone number auth enabled

Testing:
  [ ] npm run build — zero errors
  [ ] Sign up → create house → invite member → accept flow
  [ ] Log rent → inline mark paid → member sees status change
  [ ] Create bill → split → mark each member paid → ledger updated
  [ ] Sidebar stays fixed on scroll
  [ ] Alert pulse visible on overdue items
  [ ] Overview page loads from cache on back-navigation
```

---

## SESSION LOG

| Date            | What was done                                                                                                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Early sessions  | Foundation: models, auth, house creation, dashboard shell                                                                                                                                                  |
| Mid sessions    | Ledger, Vault, Tasks, Members, Settings — all working                                                                                                                                                      |
| Bug fix session | Middleware rename, Mongoose hook fix, emoji removal, nav routing fix                                                                                                                                       |
| Session 4       | Grocery + Chat real implementations, architecture docs                                                                                                                                                     |
| Session 5       | Bills splitting API, Polls, Notifications, PDF export, Move-out, Rules, Notes, Meetings                                                                                                                    |
| Session 6       | Fixed sidebar (position:fixed), house overview caching + skeletons, red alert system, complete payment lifecycle (bill splits + rent mark-paid), new API routes for PATCH ledger entry + PATCH split by ID |

---

## LAST SESSION

**What was built/fixed:**

1. **Sidebar** — `position: fixed` with `margin-left: 220px` on main content. Mobile overlay unchanged.
2. **House overview caching** — module-level `CACHE` with 30s TTL. Instant render on navigation, silent background refresh.
3. **Overview skeletons** — `OverviewSkeleton` with pulse card grid matching actual layout. `CardSkeleton` for each section.
4. **Alert system** — `.alert-pulse`, `.alert-pulse-badge`, `.border-urgent`, `.row-overdue` CSS classes. Red pulsing dot on overdue items. Bell badge pulses red when urgent notifications exist. Alert banner on overview page.
5. **Bill split payment lifecycle** — `SplitPanel` shows per-member payment status + "Mark Paid" button. `MarkPaidModal` records amount + method. `PATCH /api/bills/[billId]/split/[splitId]` updates `BillSplit` + linked `LedgerEntry`. Member notified.
6. **Rent mark-paid** — inline `MarkPaidPanel` below each pending/partial ledger row. `PATCH /api/houses/[id]/ledger/[entryId]` updates entry, pre-save hook recalculates status, member notified if fully paid.

**Start next session with:** Stripe subscription enforcement (free plan limits).

we have to add proper skeleton loaders in every page.jsx.
