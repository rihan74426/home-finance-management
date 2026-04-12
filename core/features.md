# HOMY — FEATURE SPECIFICATIONS

> Detailed spec for every feature. Use this to scope work before building.

---

## FEATURE 1: RENT LEDGER ✅ BUILT

**What it does:** Manager logs rent payments per member. Members see their own history.

**Data:** LedgerEntry — amountDue, amountPaid, status (paid/partial/pending/overdue), paymentMethod, periodStart/End, dueDate, memberNote, managerNote.

**Privacy:** managerNote stripped before sending to member. rentAmount only visible to manager + that member.

**Status auto-calculation (pre-save hook):**

- amountPaid >= amountDue → PAID
- amountPaid > 0 → PARTIAL
- dueDate < now and amountPaid = 0 → OVERDUE
- else → PENDING

**Manager views:** All entries for all members. Stats: total due, total collected, overdue count.

**Member views:** Own entries only. No managerNote. No other members' data.

**Export:** PDF per member — TODO Phase 1 remaining.

---

## FEATURE 2: THE VAULT ✅ BUILT

**What it does:** Stores sensitive household info (WiFi passwords, door codes, lease docs, contacts) encrypted at rest.

**Encryption:** AES-256-GCM. Key from `process.env.VAULT_ENCRYPTION_KEY` (64-char hex). IV stored alongside ciphertext. Never plaintext in DB.

**Types:** wifi, door_code, gate_code, lease, contact, document, appliance, other.

**Fields:** primaryValue (e.g. network name, code), secondaryValue (e.g. password), notes — all encrypted.

**Visibility:** `all` (every active member) or `manager_only` (only manager). Enforced at API level.

**UI:** Items grouped by type. Show/hide sensitive fields. One-click copy. Manager-only badge.

---

## FEATURE 3: TASK BOARD ✅ BUILT

**What it does:** Create household chores/tasks, assign to members, track completion.

**Fields:** title, description, category (cleaning/grocery/maintenance/payment/admin/other), priority (low/normal/urgent), assignedTo (membershipId), dueDate, status (todo/in_progress/done), recurrence (none/daily/weekly/monthly).

**Permissions:**

- Any member can complete/reopen tasks
- Creator or manager can edit/delete

**Recurrence (Phase 2):** When a recurring task is marked done, a Bull job creates the next occurrence automatically.

**Nudge system (Phase 2):** Overdue tasks send a push notification to assignee. Max once per 24h (lastNudgedAt guard).

**Virtual fields:** isOverdue (computed), canNudge (computed from lastNudgedAt).

---

## FEATURE 4: GROCERY LIST ✅ BUILT

**What it does:** Shared real-time shopping list. Any member can add/mark bought.

**Fields:** name, quantity (freeform string), category, note, isBought, boughtBy, boughtAt, isRecurring.

**Categories:** dairy, vegetables, fruits, meat, grains, beverages, snacks, cleaning, toiletries, other — color coded.

**UX patterns:**

- Optimistic bought toggle (instant UI, revert on failure)
- Items collapse into "bought" section toggle
- Filter by category pill
- Who bought what shown on bought items
- Inline add form (no modal) for speed

**Phase 2 additions:**

- isRecurring → auto-suggest weekly staples
- Smart suggestions based on history
- "Running low" quick-add

---

## FEATURE 5: HOUSE CHAT ✅ BUILT

**What it does:** Threaded conversations for the household.

**Thread types:** general (auto-created on house creation), rent, groceries, maintenance, custom.

**Free plan:** 1 thread (general only). Pro: unlimited threads.

**Message types:** text, image (Phase 2), file (Phase 2), system (e.g. "John joined the house").

**Real-time strategy:**

- Phase 1: 3s polling using `?after=lastMsgId` cursor pattern
- Phase 3: Socket.io with room per houseId

**UI patterns:**

- Messages grouped by sender (within 5 min window)
- Optimistic send (temp message → replace on success)
- Auto-scroll to bottom on new messages
- Thread last message preview in sidebar
- Shift+Enter for newline, Enter to send

**Phase 2 additions:**

- @mentions (parse @name, notify mentioned member)
- Image/file attachments
- Message read receipts
- Pinned messages
- Manager announcements (pinned, must-read flag)

---

## FEATURE 6: MEMBER INVITE SYSTEM ✅ BUILT

**What it does:** Manager invites new members by email or phone. Generates a 7-day secure token.

**Flow:**

1. Manager creates invite (email or phone, role, optional name)
2. Token generated (32 random bytes → hex)
3. inviteUrl returned: `NEXT_PUBLIC_APP_URL/invite/${token}`
4. Manager shares link manually (WhatsApp, SMS, email)
5. Recipient clicks → invite page shows house info
6. If not signed in → Clerk sign-in prompt
7. Accept → Membership created → redirect to house dashboard

**Token:** Stored in DB. TTL index auto-expires after 7 days.
**Cancellation:** Creating a new invite for same email/phone cancels the previous one.

**Phase 2:** Send invite automatically via SMS (Twilio) and email (Resend) instead of manual sharing.

---

## FEATURE 7: BILL SPLITTING — TODO PHASE 1 REMAINING

**What it does:** Manager creates a shared bill (electricity, water, internet, etc.). Splits the cost among members. Creates a LedgerEntry per member automatically.

### Data model (Bills.js — exists, not wired up)

```
Bill:
  houseId, createdBy
  type: electricity|water|gas|internet|maintenance|garbage|cable|other
  label: "Electricity — March 2025"
  totalAmount: integer (smallest currency unit)
  periodStart, periodEnd, dueDate
  splitType: equal|custom
  meterReadingStart, meterReadingEnd, unitsConsumed (electricity only)
  receiptUrl: Cloudinary URL
  isSplit: boolean (has split been run yet?)
  note

BillSplit:
  billId, houseId, membershipId
  shareAmount: integer
  ledgerEntryId: ObjectId (links to auto-created LedgerEntry)
  status: pending|partial|paid|overdue
```

### API routes needed

```
GET  /api/houses/[id]/bills         List bills for house
POST /api/houses/[id]/bills         Create bill (manager only)
GET  /api/bills/[id]                Get bill + split details
POST /api/bills/[id]/split          Run split (creates BillSplit + LedgerEntry per member)
PATCH /api/bills/[id]               Update bill (before split only)
DELETE /api/bills/[id]              Delete bill (before split only)
```

### Split logic (POST /api/bills/[id]/split)

```
Input: { splitType: "equal" | "custom", splits?: [{ membershipId, shareAmount }] }

Equal split:
  shareAmount = Math.floor(totalAmount / memberCount)
  remainder = totalAmount - (shareAmount * memberCount)
  add remainder to first member's share (manager)

Custom split:
  Validate sum(splits.shareAmount) === bill.totalAmount
  Each member gets their specified amount

For each split:
  Create BillSplit record
  Create LedgerEntry (type: "bill", label: bill.label, amountDue: shareAmount)
  Link BillSplit.ledgerEntryId = ledgerEntry._id

Set bill.isSplit = true
```

### Dashboard page needed

`/dashboard/[houseId]/bills`

- List of bills grouped by month
- Each bill: type icon, label, total amount, status (split/not split)
- Split button → opens modal with split type selection
- After split: show per-member amounts
- Upload receipt button → Cloudinary

---

## FEATURE 8: NOTIFICATIONS — TODO PHASE 2

**System design:**

```
Notification model:
  userId, houseId
  type: rent_due|rent_paid|task_assigned|task_overdue|bill_added|member_joined|...
  title, body
  link: URL to navigate to on click
  isRead: boolean
  createdAt

Delivery channels:
  1. In-app (notification center, bell icon in sidebar)
  2. FCM push (mobile + web)
  3. SMS via Twilio (rent reminders only, opt-in)
  4. Email via Resend (invite confirmations, weekly digest)
```

**Bull queue jobs:**

```
rent_due_check:       runs daily at 9am → find memberships with dueDate in 3 days
task_overdue_check:   runs daily at 10am → find tasks past dueDate, nudge assignee
bill_due_check:       runs daily at 9am → find bill splits due soon
```

**In-app notification center:**

- Bell icon in sidebar with unread count badge
- Dropdown on click: list of recent notifications
- Mark all read button
- Click notification → navigate to relevant page

---

## FEATURE 9: POLLS — TODO PHASE 2

**What it does:** Manager or member creates a quick poll inside a thread.
"Should we get a new AC?" → Yes / No / Maybe

**Data model (Polls.js — exists)**

```
Poll:
  houseId, threadId (optional), createdBy
  question
  options: [{ id, label }]
  votes: [{ userId, optionId, votedAt }]
  allowMultiple: boolean
  isAnonymous: boolean
  deadline: Date (auto-close)
  isClosed: boolean
```

**API routes:**

```
POST /api/houses/[id]/polls           Create poll
GET  /api/houses/[id]/polls           List polls
POST /api/polls/[id]/vote             Cast vote (validate: one vote per user if !allowMultiple)
POST /api/polls/[id]/close            Close poll early (manager/creator)
```

**Results:** tally() method on model returns per-option count + percentage.
**Anonymous:** hide userId from results if isAnonymous = true.

---

## FEATURE 10: MANAGER ANNOUNCEMENTS — TODO PHASE 2

**What it does:** Manager posts an important message that all members must read.
Example: "Rent increases to BDT 9,000 from next month."

**Behavior:**

- Pinned to top of General thread
- Each member gets a must-read notification
- Members see a banner until they mark it read
- Manager sees who has/hasn't read it

**Implementation:** Extend Thread model with `pinnedMessageId`. Extend Message model with `mustRead: boolean` and `readBy: [userId]`. Show unread announcement banner on dashboard.

---

## FEATURE 11: PDF LEDGER EXPORT — TODO PHASE 1 REMAINING

**What it does:** Generate a PDF of a member's payment history for legal/rental records.

**Library:** @react-pdf/renderer (already in package.json)

**Route:** `GET /api/houses/[id]/ledger/export?memberId=[membershipId]`

**PDF contents:**

- House name, address
- Member name, room label, move-in date
- Table: Period | Label | Amount Due | Amount Paid | Status | Method | Date
- Total paid, total outstanding
- Generated date footer
- Homy branding

**Access:** Manager can export any member. Member can export their own.

---

## FEATURE X: MEMBER DOCUMENTS & VERIFICATION (NEW)

Purpose:

- Allow members to upload identity and tenancy documents for verification.
- Manager verifies uploaded docs; verification flagged on the membership.

Data:

- Stored on Membership.uploadedDocuments: label, fileUrl, fileName, uploadedAt, verified, verifiedBy, verifiedAt.

Permissions:

- Member can upload their own documents.
- Managers of the house can view and verify documents while membership is active.
- When a member leaves (membership inactive), manager access is removed.

API (planned):

- POST /api/houses/[id]/memberships/[membershipId]/documents
- POST /api/houses/[id]/memberships/[membershipId]/documents/[docId]/verify

UX:

- Member dashboard: upload area with allowed file types and guidance.
- Manager members list: "Documents" action to review & verify.
- Notifications: DOCUMENT_UPLOADED -> manager; DOCUMENT_VERIFIED -> member.

---

_Feature specs live here. Before building any feature, read its spec. Before writing the spec, check if a model exists._
