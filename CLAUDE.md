# CLAUDE.md — HOMY SESSION MEMORY

> Read this file first at the start of every session.
> Update the "Last Session" section before ending every session.

---

## PROJECT IDENTITY

- **Product:** Homy — "Your home, finally organized"
- **Type:** Household management SaaS (web + mobile)
- **Stack:** Next.js 14 App Router, JavaScript, MongoDB/Mongoose, Clerk auth, Tailwind CSS
- **Target:** Shared households — flatmates, families, co-living — South/Southeast Asia first
- **Stage:** Phase 1 complete → Phase 2

---

## WHAT IS BUILT (AS OF LATEST SESSION)

### API Routes — ALL WORKING

```
POST /api/webhooks/clerk            ✅ User sync
GET  /api/houses                    ✅ List user's houses
POST /api/houses                    ✅ Create house + membership + General thread
GET  /api/houses/[id]               ✅ Get house details + role
PATCH /api/houses/[id]              ✅ Update settings (manager only)
GET  /api/houses/[id]/members       ✅ Role-filtered member list
POST /api/houses/[id]/invites       ✅ Create invite link
GET  /api/houses/[id]/invites       ✅ List pending invites
GET  /api/invites/[token]           ✅ Public — look up invite
POST /api/invites/[token]           ✅ Accept invite + notify manager
GET  /api/houses/[id]/ledger        ✅ Entries (manager=all, member=own)
POST /api/houses/[id]/ledger        ✅ Log payment + notify member
GET  /api/houses/[id]/ledger/export ✅ PDF export (per member or full)
GET  /api/houses/[id]/vault         ✅ Vault items (filtered + decrypted)
POST /api/houses/[id]/vault         ✅ Add vault item (AES-256 encrypted)
PATCH /api/vault/[itemId]           ✅ Update vault item
DELETE /api/vault/[itemId]          ✅ Delete vault item
GET  /api/houses/[id]/tasks         ✅ List tasks
POST /api/houses/[id]/tasks         ✅ Create task + notify assignee
PATCH /api/tasks/[taskId]           ✅ Update task (complete, edit, reassign)
DELETE /api/tasks/[taskId]          ✅ Delete task (creator or manager)
GET  /api/houses/[id]/grocery       ✅ List grocery items
POST /api/houses/[id]/grocery       ✅ Add grocery item
PATCH /api/grocery/[itemId]         ✅ Mark bought / update
DELETE /api/grocery/[itemId]        ✅ Delete grocery item
GET  /api/houses/[id]/threads       ✅ List chat threads
POST /api/houses/[id]/threads       ✅ Create thread
GET  /api/threads/[id]/messages     ✅ Get messages (paginated + polling)
POST /api/threads/[id]/messages     ✅ Send message
GET  /api/houses/[id]/bills         ✅ List bills
POST /api/houses/[id]/bills         ✅ Create bill (manager only)
POST /api/bills/[billId]/split      ✅ Split bill (equal or custom)
GET  /api/bills/[billId]/split      ✅ Get split details
GET  /api/houses/[id]/polls         ✅ List polls with results + myVote
POST /api/houses/[id]/polls         ✅ Create poll
POST /api/polls/[pollId]/vote       ✅ Cast / toggle vote
GET  /api/notifications             ✅ List notifications + unreadCount
PATCH /api/notifications            ✅ Mark read (all or specific ids)
GET  /api/memberships/[id]/documents      ✅ List member documents
POST /api/memberships/[id]/documents      ✅ Upload document (member only)
POST /api/memberships/[id]/documents/[docId]   ✅ Toggle verify (manager only)
DELETE /api/memberships/[id]/documents/[docId] ✅ Delete document
```

### Dashboard Pages — ALL WORKING

```
/dashboard                          ✅ House list + empty state
/dashboard/create-house             ✅ Create house form
/dashboard/[houseId]                ✅ House overview with live stats
/dashboard/[houseId]/ledger         ✅ Rent ledger + PDF export
/dashboard/[houseId]/vault          ✅ Encrypted vault (grouped, reveal/copy)
/dashboard/[houseId]/tasks          ✅ Task board (filter, complete, delete)
/dashboard/[houseId]/grocery        ✅ Grocery list (categories, bought toggle)
/dashboard/[houseId]/chat           ✅ Chat (threads, polls, 3s polling)
/dashboard/[houseId]/members        ✅ Member list + invite modal + docs panel
/dashboard/[houseId]/bills          ✅ Bills + split modal
/dashboard/[houseId]/settings       ✅ House settings (manager only)
/invite/[token]                     ✅ Invite acceptance page
```

### Models — ALL DEFINED

```
User, House, Membership, LedgerEntry, Bill, BillSplit,
VaultItem, Task, GroceryItem, Thread (+Message), Poll,
Invite, Notification, MemberDocument
```

---

## KNOWN BUGS — ALL FIXED

1. ~~`src/proxy.js` should be `src/middleware.js`~~ → **FIXED**
2. ~~Vault page rendered ledger entries~~ → **FIXED** (proper vault UI)
3. ~~`grocery/[itemId]` used wrong houseId param~~ → **FIXED**
4. ~~`tasks/[taskId]` had GET/POST instead of PATCH/DELETE~~ → **FIXED**
5. ~~`memberships/.../verify/route.js` at wrong path~~ → **FIXED** (now at `[docId]/route.js`)
6. ~~Toaster only in dashboard layout~~ → **FIXED** (in root layout)
7. ~~No notification triggers~~ → **FIXED** (rent, task assign, invite accept)

---

## DECISIONS MADE (DON'T RE-DEBATE THESE)

| Decision                                         | What                             | Why                             |
| ------------------------------------------------ | -------------------------------- | ------------------------------- |
| Polling not Socket.io                            | Chat uses 3s polling             | No Express server yet; Phase 3  |
| Mongoose v7+ async hooks                         | No `next()` in pre-save          | v7 changed the API              |
| `src/middleware.js`                              | Must be at this exact path       | Next.js convention              |
| Integers for money                               | All amounts in paisa/paise/pence | No floating point rounding bugs |
| AES-256-GCM for vault                            | Server-side encryption           | Simple, secure                  |
| Clerk for auth                                   | Phone + email support            | Essential for BD/PK             |
| `[docId]/route.js` not `[docId]/verify/route.js` | POST=verify, DELETE=delete       | Cleaner REST                    |

---

## CODING RULES (ALWAYS FOLLOW)

1. **API response shape:** `{ success: boolean, data?: any, error?: string }`
2. **Auth pattern:** `const { userId: clerkId } = await auth()` → find User → check Membership
3. **Money:** Store as integers (paisa). Display with `Intl.NumberFormat`.
4. **No emojis** in UI — use lucide-react icons only
5. **No `next()` in Mongoose hooks** — use `async function()` pattern
6. **Optimistic UI** for grocery toggles, task completion — revert on failure
7. **Privacy:** `LedgerEntry.managerNote` never sent to member. Rent amounts only visible to manager + that member.
8. **File names:** API routes always `route.js`. Pages always `page.jsx`.
9. **Image imports:** Always use `next/image` with correct src.

---

## PHASE 2 TASKS (START HERE NEXT SESSION)

### High priority

1. **Stripe subscription** — free/pro enforcement (1 house, 6 members limit on free)
2. **Receipt photo upload** — Cloudinary integration for bills
3. **SMS reminders via Twilio** — rent due 3 days before
4. **bKash/Nagad payment method tracking** — already in constants, needs UI polish
5. **Move-out checklist** — when manager removes a member

### Medium priority

6. **Task recurrence** — when a recurring task is marked done, auto-create next occurrence
7. **Electricity meter reading tracker** — already in Bill model, needs dedicated UI
8. **Manager announcements** — pinned must-read messages in threads
9. **House meetings / scheduling** — RSVP + agenda

### Lower priority

10. **Pagination on ledger** — slow for 100+ entries
11. **Socket.io for chat** — replace 3s polling
12. **Push notifications (FCM)** — mobile-ready

---

## LAST SESSION SUMMARY

**What was built / fixed:**

1. `src/middleware.js` — created at correct path (was at `src/proxy.js`)
2. `src/app/layout.js` — added global `<Toaster />` to root layout
3. `src/models/Notification.js` — Mongoose model
4. `src/lib/notifications.js` — `createNotification()` helper
5. `src/app/api/notifications/route.js` — GET list + PATCH mark-read
6. `src/app/dashboard/layout.js` — notification bell with unread badge + panel
7. `src/app/dashboard/[houseId]/vault/page.jsx` — real vault UI (was copy of ledger)
8. `src/app/api/houses/[id]/ledger/route.js` — added `createNotification` triggers
9. `src/app/api/houses/[id]/tasks/route.js` — added `createNotification` on assignment
10. `src/app/api/invites/[token]/route.js` — added `createNotification` on accept
11. `src/app/api/grocery/[itemId]/route.js` — fixed param bug (was using `id` not `itemId`)
12. `src/app/api/tasks/[taskId]/route.js` — rewrote: proper PATCH + DELETE (was GET + POST)
13. `src/app/api/memberships/[membershipId]/documents/[docId]/route.js` — POST (verify) + DELETE at correct path

**Phase 1 is now complete.**

---

## SESSION LOG

| Date            | What was done                                                                        |
| --------------- | ------------------------------------------------------------------------------------ |
| Early sessions  | Foundation: models, auth, house creation, dashboard shell                            |
| Mid sessions    | Ledger, Vault API, Tasks, Members, Settings                                          |
| Bug fix session | Middleware rename, Mongoose hook fix, nav routing fix                                |
| Session N       | Grocery + Chat, Bills + Split, Polls, architecture docs                              |
| Session N+1     | Notifications model+API+bell UI, vault page fix, 5 route bug fixes, Phase 1 complete |
