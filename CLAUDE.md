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
| `MoveOutChecklist.js` | default MoveOutChecklist   | `.defaultItems()` static               |
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
  GET  /api/houses/[id]/ledger/export                        PDF export

BILLS:
  GET  /api/houses/[id]/bills                                list
  POST /api/houses/[id]/bills                                create (manager)
  PATCH /api/bills/[billId]                                  update details (manager)
  DELETE /api/bills/[billId]                                 delete unsplit bill (manager)
  POST /api/bills/[billId]/split                             split (manager)
  GET  /api/bills/[billId]/split                             split details
  PATCH /api/bills/[billId]/splits/[splitId]                 mark share paid (manager)

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
/dashboard/[houseId]                 house overview (live stats)
/dashboard/[houseId]/ledger          rent ledger + PDF export
/dashboard/[houseId]/bills           bills + split
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

## BUGS FIXED (this session)

| #   | Bug                                                                                                    | Fix                                                       |
| --- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| 1   | `src/proxy.js` wrong filename                                                                          | Rename to `src/middleware.js`                             |
| 2   | `src/app/api/ledger/route.js` broken orphan — uses undefined `params.id`                               | **Delete this file**                                      |
| 3   | `rules/[ruleId]/alerts/route.js` had broken PATCH (wrong URL segment)                                  | Rewrite to POST-only; PATCH moved to `[alertId]/route.js` |
| 4   | `notes/page.jsx` calls `DELETE /api/notes/[noteId]` — no matching route                                | Created `/api/notes/[noteId]/route.js`                    |
| 5   | `src/lib/sw.js` — service workers must be at root URL                                                  | Moved to `public/sw.js`                                   |
| 6   | `memberships/.../documents/[docId]/verify/route.js` — dead code (UI calls without `/verify`)           | **Delete this file**; `[docId]/route.js` is correct       |
| 7   | `User` model missing `fcmTokens` field used by push/subscribe route                                    | Added `fcmTokens` array to User schema                    |
| 8   | `dashboard/layout.js` missing `/polls`, `/rules`, `/notes`, `/meetings`, `/moveout`, `/profile` in nav | Full rewrite of sidebar                                   |
| 9   | `meetings/page.jsx` calls `PATCH /api/meetings/[meetingId]` — route was at wrong base path             | Created standalone `/api/meetings/[meetingId]/route.js`   |

---

## DECISIONS (DON'T RE-DEBATE)

| Decision                                          | What                                    | Why                                    |
| ------------------------------------------------- | --------------------------------------- | -------------------------------------- |
| Polling not Socket.io                             | Chat + grocery use polling              | No Express server yet; upgrade Phase 3 |
| Mongoose v7+ async hooks                          | No `next()` in pre-save                 | v7 API change                          |
| `src/middleware.js`                               | Exact path required by Next.js          | Convention                             |
| Integers for money                                | All amounts in smallest unit (paisa)    | No float rounding bugs                 |
| AES-256-GCM vault                                 | Server-side encryption                  | Simple and secure                      |
| Soft delete                                       | `deletedAt` field, not actual deletion  | Preserve history                       |
| `HouseRule.js` exports `{ HouseRule, RuleAlert }` | Named exports                           | Both used together                     |
| `Bills.js` exports `{ Bill, BillSplit }`          | Named exports                           | Both used together                     |
| `Polls.js` model name is `Poll`                   | Singular model name despite plural file | Mongoose convention                    |

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

---

## PHASE 2 REMAINING TASKS (priority order)

### Must-have before revenue

1. **Stripe subscriptions** — enforce free plan limits (1 house, 6 members)
2. **File upload (Cloudinary)** — bill receipt photos, member document actual upload
3. **Push notification wiring** — register service worker + FCM token in layout

### Nice-to-have Phase 2

4. **Task recurrence** — auto-create next task when recurring task marked done
5. **Ledger pagination** — cursor-based, slow for 100+ entries
6. **Electricity meter tracker UI** — model supports it, needs UI section in bills page
7. **Socket.io chat** — replace 3s polling for real-time

### Phase 3

8. React Native mobile app (Expo)
9. bKash / Nagad / UPI payment collection via API
10. WhatsApp Business API reminders

---

## PRE-LAUNCH CHECKLIST

```
Environment:
  [ ] MONGODB_URI set and Atlas cluster accessible
  [ ] CLERK_SECRET_KEY + CLERK_WEBHOOK_SECRET set
  [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY set
  [ ] VAULT_ENCRYPTION_KEY set (64-char hex)
  [ ] NEXT_PUBLIC_APP_URL set to production domain
  [ ] CRON_SECRET set (for rent reminders)
  [ ] RESEND_API_KEY set (email)
  [ ] TWILIO_* set (SMS)
  [ ] FIREBASE_SERVICE_ACCOUNT_JSON set (push)

Clerk Dashboard:
  [ ] Webhook endpoint registered: https://yourdomain.com/api/webhooks/clerk
  [ ] Webhook events enabled: user.created, user.updated, user.deleted
  [ ] Allowed redirect URLs include production domain
  [ ] Phone number auth enabled (for BD/PK users)

MongoDB Atlas:
  [ ] IP allowlist includes Vercel (or 0.0.0.0/0 for serverless)
  [ ] Indexes created (auto from schema on first connect)

Vercel:
  [ ] vercel.json with cron config deployed
  [ ] All env vars set in Vercel dashboard
  [ ] Production domain verified

File operations:
  [ ] RENAME src/proxy.js → src/middleware.js
  [ ] DELETE src/app/api/ledger/route.js
  [ ] DELETE src/app/api/memberships/[id]/documents/[docId]/verify/route.js
  [ ] DELETE src/lib/sw.js
  [ ] ADD public/sw.js
  [ ] ADD vercel.json
  [ ] ADD .env.example (for team reference)

Testing:
  [ ] npm run build — zero errors
  [ ] Sign up → create house → invite member → accept invite flow
  [ ] Log rent payment → PDF export
  [ ] Add vault item → reveal → copy
  [ ] Create task → mark done
  [ ] Send chat message
  [ ] Bill create → split → member sees ledger entry
```

---

## LAST SESSION

**Date:** Current session

**What was fixed:**

- Full audit of all 100+ source files against all page fetch calls
- Identified and fixed 9 confirmed bugs (listed above)
- Created all missing API routes
- Updated User model with fcmTokens
- Fixed dashboard nav to include all pages
- Created vercel.json, .env.example, public/sw.js
- Output complete FIXES_README.md

**Start next session with:** Stripe subscription enforcement (free plan limits).
