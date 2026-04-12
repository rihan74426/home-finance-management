# CLAUDE.md — HOMY SESSION MEMORY

> Read this file first at the start of every session.
> Update the "Last Session" section before ending every session.

---

## PROJECT IDENTITY

- **Product:** Homy — "Your home, finally organized"
- **Type:** Household management SaaS (web + mobile)
- **Stack:** Next.js 14 App Router, JavaScript, MongoDB/Mongoose, Clerk auth, Tailwind CSS
- **Target:** Shared households — flatmates, families, co-living — South/Southeast Asia first
- **Stage:** Phase 1 MVP, nearing Phase 2

---

## WHAT IS BUILT (AS OF APRIL 2026)

### API Routes — ALL WORKING

```
POST /api/webhooks/clerk            ✅ User sync (created/updated/deleted)
GET  /api/houses                    ✅ List user's houses (with clerkClient fallback)
POST /api/houses                    ✅ Create house + membership + General thread
GET  /api/houses/[id]               ✅ Get house details + role
PATCH /api/houses/[id]              ✅ Update settings (manager only)
GET  /api/houses/[id]/members       ✅ Role-filtered member list
POST /api/houses/[id]/invites       ✅ Create invite link
GET  /api/houses/[id]/invites       ✅ List pending invites
GET  /api/invites/[token]           ✅ Public — look up invite
POST /api/invites/[token]           ✅ Accept invite
GET  /api/houses/[id]/ledger        ✅ Entries (manager=all, member=own)
POST /api/houses/[id]/ledger        ✅ Log payment (manager only)
GET  /api/houses/[id]/vault         ✅ Vault items (visibility filtered + decrypted)
POST /api/houses/[id]/vault         ✅ Add vault item (encrypted)
PATCH /api/vault/[itemId]           ✅ Update vault item
DELETE /api/vault/[itemId]          ✅ Delete vault item
GET  /api/houses/[id]/tasks         ✅ List tasks
POST /api/houses/[id]/tasks         ✅ Create task
PATCH /api/tasks/[taskId]           ✅ Update task (complete, edit, reassign)
DELETE /api/tasks/[taskId]          ✅ Delete task
GET  /api/houses/[id]/grocery       ✅ List grocery items
POST /api/houses/[id]/grocery       ✅ Add grocery item
PATCH /api/grocery/[itemId]         ✅ Mark bought / update
DELETE /api/grocery/[itemId]        ✅ Delete grocery item
GET  /api/houses/[id]/threads       ✅ List chat threads
POST /api/houses/[id]/threads       ✅ Create thread
GET  /api/threads/[id]/messages     ✅ Get messages (paginated + polling)
POST /api/threads/[id]/messages     ✅ Send message
```

### Dashboard Pages — ALL WORKING

```
/dashboard                          ✅ House list + empty state
/dashboard/create-house             ✅ Create house form
/dashboard/[houseId]                ✅ House overview with quick links
/dashboard/[houseId]/ledger         ✅ Rent ledger (manager + member views)
/dashboard/[houseId]/vault          ✅ Encrypted vault
/dashboard/[houseId]/tasks          ✅ Task board
/dashboard/[houseId]/grocery        ✅ Grocery list
/dashboard/[houseId]/chat           ✅ Chat with threads + polling
/dashboard/[houseId]/members        ✅ Member list + invite modal
/dashboard/[houseId]/settings       ✅ House settings (manager only)
/invite/[token]                     ✅ Invite acceptance page
```

### Models — ALL DEFINED

```
User, House, Membership, LedgerEntry, Bills, BillSplit,
VaultItem, Task, GroceryItem, Thread (+ Message), Poll, Invite
```

---

## KNOWN BUGS / ISSUES

1. **House overview page** uses GET /api/houses list to find the house by ID.
   Should use GET /api/houses/[id] directly. Low priority but worth fixing.

2. **Grocery list** is not real-time. Members don't see each other's additions
   without page refresh. Acceptable Phase 1 — no fix needed yet.

3. **No rate limiting** — API routes have no throttling. Must add before
   any public launch. Use Redis + a simple middleware.

4. **No toast notifications** — `sonner` is installed but not wired up.
   All mutations succeed silently. Users don't get feedback.

5. **No loading skeletons** — pages show text "Loading..." which looks bad.

6. **No error boundaries** — client crashes show blank pages.

7. **Chat polling** creates DB load at scale. Upgrade to Socket.io in Phase 3.

8. **Member verification flow:** Members should upload identity/rental documents on their dashboard. Documents are stored on Membership and must be verified by the house manager. Verified docs stay usable for workflows while the membership exists; manager access is revoked when membership is removed. APIs and UI for upload/verify are planned next sprint.

---

## DECISIONS MADE (DON'T RE-DEBATE THESE)

| Decision                                | What                                     | Why                                       |
| --------------------------------------- | ---------------------------------------- | ----------------------------------------- |
| Polling not Socket.io                   | Chat uses 3s polling                     | No Express server yet; upgrade in Phase 3 |
| Mongoose v7+ async hooks                | No `next()` in pre-save                  | v7 changed the API                        |
| middleware.js not proxy.js              | File must be at src/middleware.js        | Next.js convention                        |
| Integers for money                      | All amounts in paisa/paise/pence         | No floating point rounding bugs           |
| AES-256-GCM for vault                   | Server-side encryption                   | Simple, secure, no client complexity      |
| Clerk for auth                          | Phone + email support                    | Essential for BD/PK users                 |
| clerkClient fallback in GET /api/houses | Auto-create user if webhook hasn't fired | Race condition on first login             |

---

## CODING RULES (ALWAYS FOLLOW)

1. **API response shape:** `{ success: boolean, data?: any, error?: string }`
2. **Auth pattern:** `const { userId: clerkId } = await auth()` → find User → check Membership
3. **Money:** Store as integers (paisa). Display with `Intl.NumberFormat`.
4. **No emojis** in UI — use lucide-react icons only
5. **No `next()` in Mongoose hooks** — use `async function()` pattern
6. **Optimistic UI** for grocery toggles, task completion — revert on failure
7. **Privacy:** LedgerEntry.managerNote never sent to member. Rent amounts only visible to manager + that member.
8. **File names:** API routes always `route.js`. Pages always `page.jsx` or `page.js`.
9. **Image imports:** Always use `next/image` Image component with correct src.
10. **Logo usage:** favicon.png = small mark (sidebar, nav). pageIcon.png = full logo (hero, invite page, OG).

---

## NEXT TASKS (PRIORITY ORDER)

### Immediate (next session)

1. **Bill splitting** — highest user value
   - `POST /api/houses/[id]/bills` — create bill (type, amount, period, receipt URL)
   - `POST /api/bills/[id]/split` — split among members (equal or custom)
   - Auto-creates LedgerEntry per member on split
   - `/dashboard/[houseId]/bills` page — list bills, split button, status
2. **Toast notifications** — wire up sonner
   - Success on: create house, log payment, add vault item, create task, invite sent
   - Error on: any failed mutation
   - Use `toast.success()` and `toast.error()` from sonner

3. **Loading skeletons** — replace all "Loading..." strings
   - Simple pulse skeleton component
   - Use in: ledger, vault, tasks, grocery, chat, members

### This sprint

4. **Error boundaries** — wrap [houseId] layout
5. **Rate limiting** — Redis middleware on API routes
6. **PDF export** — ledger per member

### Next sprint

7. **Notification system** — in-app bell + Bull queue reminders
8. **Receipt photo upload** — Cloudinary for bills
9. **Polls** — quick yes/no questions in threads
10. **Stripe subscription** — free/pro enforcement

---

## LAST SESSION SUMMARY

**What was built:**

- Grocery list — full CRUD implementation with categories, bought toggle, optimistic updates
- Chat — thread list + messages with 3s polling, optimistic send, message grouping
- Bill splitting (APIs for grocery and threads confirmed working)
- Architecture documentation (this file, MASTER.md, ROADMAP.md)

**Files created/modified:**

- src/app/api/houses/[id]/grocery/route.js
- src/app/api/grocery/[itemId]/route.js
- src/app/api/houses/[id]/threads/route.js
- src/app/api/threads/[threadId]/messages/route.js
- src/app/dashboard/[houseId]/grocery/page.jsx
- src/app/dashboard/[houseId]/chat/page.jsx
- ARCHITECTURE/MASTER.md
- CORE/ROADMAP.md
- CLAUDE.md (this file)

**Start next session with:** Bill splitting feature.

---

## SESSION LOG

| Date            | What was done                                                        |
| --------------- | -------------------------------------------------------------------- |
| Early sessions  | Foundation: models, auth, house creation, dashboard shell            |
| Mid sessions    | Ledger, Vault, Tasks, Members, Settings — all working                |
| Bug fix session | Middleware rename, Mongoose hook fix, emoji removal, nav routing fix |
| Latest session  | Grocery + Chat real implementations, architecture docs               |
