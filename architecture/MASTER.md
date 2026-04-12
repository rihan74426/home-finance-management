# HOMY — MASTER ARCHITECTURE DOCUMENT

> Last updated: April 2026 | Status: Active Development | Phase: 1 → 2

---

## 1. WHAT HOMY IS (AND ISN'T)

Homy is not a bill-splitting app. It is not a task manager. It is not a chat app.

It is the **operating system for a shared home** — the single source of truth for every person who lives under one roof together. Think of it the way Slack is for teams: before Slack, teams used email + spreadsheets + phone calls. After Slack, those still exist but the team's _coordination layer_ lives in one place. Homy is that coordination layer for households.

**The insight competitors miss:** Splitwise, Tricount, and every bill-splitter treats shared living as a _financial problem_. But the actual problem is _relationship friction_. When someone doesn't pay rent, the issue isn't accounting — it's that their housemate has to become a debt collector. Homy's job is to remove that friction entirely, before it becomes a conversation.

**What makes Homy structurally different from every competitor:**

| App             | What they solve     | What they miss                                         |
| --------------- | ------------------- | ------------------------------------------------------ |
| Splitwise       | Expense tracking    | No tasks, no vault, no chat, not mobile-first in BD/PK |
| Tricount        | Trip expense splits | No household persistence, no rent tracking             |
| TenantCloud     | Landlord management | No member-side experience, too complex for flatmates   |
| RentRedi        | Rent collection     | Landlord-only, expensive, US-centric                   |
| WhatsApp groups | Communication       | No structure, no memory, everything gets buried        |
| Google Sheets   | Tracking            | Manual, breaks down, not real-time                     |

**Homy's moat:** It covers the full stack of shared living (money + tasks + information + communication) in one place, built mobile-first for South/Southeast Asian markets where no quality option exists, priced at local purchasing power parity.

---

## 2. TARGET PERSONA MATRIX

### Primary Personas

**Persona A — The Reluctant Manager**

- 22–32 years old, urban Bangladesh/Pakistan/India
- Renting a flat with 2–4 others
- They became the "house manager" by default (first to sign the lease, most organized)
- Pain: collecting rent from flatmates is awkward; tracking who paid what is mental overhead
- They will pay for Homy if it makes the money conversation go away
- Acquisition: Facebook flat-share groups, university WhatsApp groups

**Persona B — The Professional Flatmate**

- 24–35, working professional in Dhaka, Karachi, Bangalore
- Joined an existing shared flat or co-living space
- Pain: feels anxious about money disputes; wants transparency without confrontation
- They will adopt Homy if their manager uses it (pull adoption)
- Acquisition: invite from manager

**Persona C — The Landlord/Building Manager**

- 35–60, owns 3–10 rental units
- Currently manages via WhatsApp + cash + memory
- Pain: tracking multiple tenants' payments, maintenance requests across units
- This is the Manager Pro tier — higher willingness to pay
- Acquisition: referral from tenants, property Facebook groups

**Persona D — The Family Home Manager**

- 30–50, managing household bills/tasks for a family
- Needs task assignment, grocery lists, shared documents
- Pain: coordination overhead; family members don't follow up
- Acquisition: organic search, word of mouth

### Secondary Personas

- Student dormitories / university housing
- Co-living operators (50+ rooms) — enterprise tier
- Expats in shared accommodation abroad

---

## 3. COMPETITIVE INTELLIGENCE

### What Splitwise Does Right (steal these)

- Debt simplification: net balances reduce number of transactions needed
- Group-level running balance visible to all
- "Settle up" flow is clean and clear
- 17M+ users proves the pain is real

### What Splitwise Does Wrong (exploit these)

- English-first, no Bangla/Urdu/Hindi
- No rent tracking (landlord/manager workflow completely absent)
- No tasks, no vault, no chat
- Free tier severely limited in 2024 (5 expenses/day)
- No local payment methods (bKash, Nagad, JazzCash)
- No house-level concept — it's person-to-person, not household-to-household

### What TenantCloud/RentRedi Do Right (steal these)

- Automated payment reminders
- Maintenance request tracking with photo upload
- Lease document storage
- Per-tenant ledger with full payment history

### What TenantCloud/RentRedi Do Wrong (exploit these)

- Designed for landlords, not for the tenants who actually live there
- UI is complex/business-grade — not for a 23-year-old flatmate
- No social/communication layer
- Expensive ($20–50/month) — wrong price point for emerging markets
- US/UK centric — no bKash, no UPI, no JazzCash

### Whitespace Homy Owns

1. **Tenant-side household management** — managers AND members both have a great experience
2. **South/Southeast Asia first** — language, payment methods, cultural context
3. **All-in-one at household level** — not just money, not just tasks, all of it
4. **Local payment method integration** — bKash, Nagad, JazzCash, UPI
5. **Mobile-first design** for users with mid-range Android phones and variable data

---

## 4. SYSTEM ARCHITECTURE

### 4.1 Tech Stack (Decided)

```
Layer              Technology              Reason
─────────────────────────────────────────────────────────────────
Web Framework      Next.js 14 App Router   SSR, API routes, Vercel
Language           JavaScript (ES2022+)    Speed, ecosystem
Auth               Clerk                   Phone + email, webhooks
Styling            Tailwind CSS + shadcn   Speed, consistency
State (client)     React Query + useState  Data fetching + local state
Database           MongoDB + Mongoose      Flexible schema, fast iteration
Cache              Redis                   Rate limiting, sessions, queues
Queue              Bull (Redis-backed)     Reminders, notifications, jobs
File Storage       Cloudinary/Uploadthing  Bill photos, avatars, documents
PDF Generation     @react-pdf/renderer     Ledger export, receipts
Push Notifications Firebase FCM            iOS + Android + Web
SMS                Twilio                  Invite links, rent reminders
Email              Resend                  Transactional email
Payments           Stripe + local gateways Subscriptions + bKash/UPI
Real-time Chat     Polling (3s) → Socket.io Phase 1 polling, Phase 3 upgrade
Mobile (Phase 3)   React Native + Expo     Shared API, faster dev
Monorepo           Turborepo               Web + mobile + shared packages
Hosting            Vercel (web) + Railway  Easy deploy, scales
Monitoring         Sentry                  Error tracking
Analytics          PostHog                 Privacy-friendly, self-hostable
```

### 4.2 Repository Structure

```
homy/
├── src/
│   ├── app/
│   │   ├── (marketing)/           # Landing page, pricing, blog
│   │   │   └── page.js
│   │   ├── (auth)/                # Clerk sign-in/sign-up pages
│   │   ├── dashboard/             # Protected app shell
│   │   │   ├── layout.js          # Sidebar + auth guard
│   │   │   ├── page.js            # House list
│   │   │   ├── create-house/
│   │   │   └── [houseId]/
│   │   │       ├── page.js        # House overview
│   │   │       ├── ledger/
│   │   │       ├── vault/
│   │   │       ├── tasks/
│   │   │       ├── grocery/
│   │   │       ├── chat/
│   │   │       ├── members/
│   │   │       └── settings/
│   │   ├── invite/
│   │   │   └── [token]/
│   │   └── api/
│   │       ├── webhooks/clerk/    # User sync
│   │       ├── houses/
│   │       │   ├── route.js       # GET list, POST create
│   │       │   └── [id]/
│   │       │       ├── route.js   # GET, PATCH house
│   │       │       ├── members/
│   │       │       ├── invites/
│   │       │       ├── ledger/
│   │       │       ├── bills/     # TODO Phase 2
│   │       │       ├── vault/
│   │       │       ├── tasks/
│   │       │       ├── grocery/
│   │       │       ├── threads/
│   │       │       └── polls/     # TODO Phase 2
│   │       ├── threads/
│   │       │   └── [threadId]/messages/
│   │       ├── tasks/[taskId]/    # PATCH, DELETE
│   │       ├── vault/[itemId]/    # PATCH, DELETE
│   │       ├── grocery/[itemId]/  # PATCH, DELETE
│   │       └── invites/[token]/   # GET lookup, POST accept
│   ├── models/                    # Mongoose schemas
│   │   ├── User.js
│   │   ├── House.js
│   │   ├── Membership.js
│   │   ├── Ledgerentry.js
│   │   ├── Bills.js
│   │   ├── VaultItem.js
│   │   ├── Task.js
│   │   ├── Grocery.js
│   │   ├── Thread.js              # Thread + Message
│   │   ├── Polls.js
│   │   ├── Invite.js
│   │   └── Notification.js       # TODO Phase 2
│   ├── lib/
│   │   ├── db/mongoose.js         # Connection pooling
│   │   ├── constants/index.js     # All enums + constants
│   │   ├── utils/
│   │   │   ├── currency.js        # Format, convert
│   │   │   ├── dates.js           # UTC helpers
│   │   │   └── permissions.js     # Role check helpers
│   │   └── services/              # TODO Phase 2
│   │       ├── notifications.js   # FCM + Twilio
│   │       ├── reminders.js       # Bull queue jobs
│   │       └── pdf.js             # Ledger PDF export
│   ├── components/
│   │   ├── ui/                    # shadcn base components
│   │   ├── shared/                # Cross-feature components
│   │   │   ├── Avatar.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── PlaceholderPage.jsx
│   │   │   └── Modal.jsx
│   │   ├── house/
│   │   ├── ledger/
│   │   ├── vault/
│   │   ├── tasks/
│   │   ├── chat/
│   │   └── grocery/
│   └── middleware.js              # Clerk auth protection
├── ARCHITECTURE/                  # This folder — system docs
│   ├── MASTER.md                  # This file
│   ├── DATA_MODEL.md              # Full schema reference
│   ├── API_REFERENCE.md           # All routes documented
│   └── DECISIONS.md               # Architecture decision log
├── CORE/                          # Product + business docs
│   ├── ROADMAP.md                 # Phase plan + milestones
│   ├── FEATURES.md                # Feature specs
│   ├── COMPETITIVE.md             # Market analysis
│   └── MONETIZATION.md            # Revenue model
├── CLAUDE.md                      # AI session memory (update each session)
└── README.md                      # Developer onboarding
```

### 4.3 Data Flow

```
User Action → Next.js API Route → Auth Check (Clerk) → DB Query (MongoDB)
     ↑                                                        ↓
     └────────────────── JSON Response ──────────────────────┘

Background Jobs (Bull Queue):
  Rent Due → Check dueDate → Send FCM + Twilio SMS → Log notification

Real-time Chat (Phase 1):
  Send message → POST /api/threads/[id]/messages → MongoDB insert
  Poll every 3s → GET ?after=lastMsgId → Return new messages only

Real-time Chat (Phase 3 upgrade):
  Socket.io room per houseId → emit to all connected members
```

### 4.4 Privacy Architecture

This is non-negotiable. The privacy model is enforced at the **API layer**, not the UI.

```
Role          Can See
─────────────────────────────────────────────────────────────────
Manager       Everything in their house
Member        Own ledger entries only (not other members' rent amounts)
Member        Own bill splits only
Member        Vault items with visibility = "all"
Member        All tasks, threads, grocery items (shared features)
Guest         Read-only: tasks, grocery, threads
Guest         Cannot see ledger, vault, member contact details

Privacy rules by model:
- LedgerEntry.managerNote   → stripped before sending to member
- Membership.rentAmount     → only visible to manager + that member
- VaultItem                 → filtered by visibility field
- User.phone/email          → only visible to manager + self
```

---

## 5. CURRENT BUILD STATUS

### ✅ COMPLETE

- Clerk webhook → User sync (user.created, user.updated, user.deleted)
- House creation (POST/GET /api/houses)
- House details + settings (GET/PATCH /api/houses/[id])
- Membership system (role-based access, isManager checks)
- Member invite system (token generation, email/phone, 7-day expiry, acceptance flow)
- Invite acceptance page (/invite/[token])
- Rent ledger (GET/POST /api/houses/[id]/ledger, PATCH entries)
- Vault (AES-256-GCM encrypted, GET/POST/PATCH/DELETE)
- Task board (GET/POST/PATCH/DELETE, with assignments)
- Grocery list (GET/POST/PATCH/DELETE, categories, bought toggle)
- House chat (threads + messages, polling, optimistic send)
- Dashboard layout (sidebar, per-house nav, correct routing)
- All page icons (no emojis)
- Middleware fixed (src/middleware.js, not src/proxy.js)
- LedgerEntry pre-save hook fixed (Mongoose v7+ async)

### 🔧 IN PROGRESS / NEEDS WORK

- Bill splitting (model exists, API not built)
- PDF export (not built)
- SMS reminders via Twilio (not built)
- Push notifications via FCM (not built)

### ❌ NOT STARTED (Phase 2+)

- Polls system
- Manager announcements
- House meetings / scheduling
- Notification center (in-app)
- Stripe subscription integration
- bKash / Nagad / JazzCash payment tracking
- Receipt photo upload (Cloudinary)
- Electricity meter readings
- Move-out checklist
- Package tracker
- React Native mobile app

---

## 6. API REFERENCE QUICK MAP

```
Auth: All routes protected by Clerk unless listed as PUBLIC

PUBLIC:
  GET  /api/invites/[token]           Look up invite details
  POST /api/webhooks/clerk            Clerk user sync

HOUSES:
  GET  /api/houses                    List user's houses
  POST /api/houses                    Create house
  GET  /api/houses/[id]               Get house details + role
  PATCH /api/houses/[id]              Update settings (manager only)

MEMBERS:
  GET  /api/houses/[id]/members       List members (role-filtered)

INVITES:
  POST /api/houses/[id]/invites       Create invite link (manager)
  GET  /api/houses/[id]/invites       List pending invites (manager)
  POST /api/invites/[token]           Accept invite (auth required)

LEDGER:
  GET  /api/houses/[id]/ledger        Get entries (manager=all, member=own)
  POST /api/houses/[id]/ledger        Log payment (manager only)

BILLS (TODO):
  GET  /api/houses/[id]/bills         List bills
  POST /api/houses/[id]/bills         Create bill
  POST /api/bills/[id]/split          Split bill among members

VAULT:
  GET  /api/houses/[id]/vault         List items (visibility filtered)
  POST /api/houses/[id]/vault         Add item
  PATCH /api/vault/[itemId]           Update item
  DELETE /api/vault/[itemId]          Delete item

TASKS:
  GET  /api/houses/[id]/tasks         List tasks
  POST /api/houses/[id]/tasks         Create task
  PATCH /api/tasks/[taskId]           Update (complete, reassign, edit)
  DELETE /api/tasks/[taskId]          Delete

GROCERY:
  GET  /api/houses/[id]/grocery       List items
  POST /api/houses/[id]/grocery       Add item
  PATCH /api/grocery/[itemId]         Mark bought / update
  DELETE /api/grocery/[itemId]        Delete

CHAT:
  GET  /api/houses/[id]/threads       List threads
  POST /api/houses/[id]/threads       Create thread
  GET  /api/threads/[id]/messages     Get messages (paginated + poll)
  POST /api/threads/[id]/messages     Send message

POLLS (TODO):
  POST /api/houses/[id]/polls         Create poll
  POST /api/polls/[id]/vote           Cast vote
```

---

## 7. ENVIRONMENT VARIABLES

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Database
MONGODB_URI=

# App URL (for invite links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Vault encryption (64-char hex = 32 bytes for AES-256)
VAULT_ENCRYPTION_KEY=

# File storage (pick one)
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
# OR
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Phase 2 — add when building these features
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
RESEND_API_KEY=
FIREBASE_SERVER_KEY=
REDIS_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## 8. NAMING CONVENTIONS

```
Files:          kebab-case for pages (create-house), PascalCase for components
API routes:     REST-ish, noun-based: /api/houses/[id]/tasks
Response shape: { success: boolean, data?: any, error?: string }
Money:          Always integers in smallest unit (paisa/paise/pence/cents)
Dates:          Always UTC in DB, format on client
IDs:            MongoDB ObjectId, always string in JSON
```

---

## 9. CODING STANDARDS FOR THIS PROJECT

- Every API route: auth check → DB connect → validate → query → respond
- Never trust frontend data — always validate server-side
- Privacy checks happen in API, not UI
- Use `lean()` on read queries for performance
- Use `findOneAndUpdate` with `$set` instead of `.save()` where possible (atomic)
- Optimistic UI updates on client, revert on API failure
- `Response.json()` for all API responses (Next.js 14 pattern)
- No `console.log` in production paths — use structured logging
- All monetary math in integers — no floating point

---

## 10. KNOWN TECHNICAL DEBT

1. **Chat polling** — 3s interval works but creates DB load at scale. Upgrade to Socket.io in Phase 3 when Express server is added.
2. **No request rate limiting** — needs Redis + Bull before launch. Anyone can spam the API.
3. **No image uploads yet** — bill photos, avatars wired to placeholder. Needs Cloudinary/Uploadthing.
4. **Grocery list not real-time** — members adding items won't appear for others until page refresh. Acceptable for Phase 1.
5. **No error boundaries** — client-side errors will crash pages silently.
6. **House page loads all houses via list** — should use dedicated GET /api/houses/[id] endpoint.
7. **No pagination on ledger** — will slow down for houses with 100+ entries.

---

_This document is the source of truth for system design. Update it when architecture changes._
