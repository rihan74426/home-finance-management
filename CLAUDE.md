# next-steps

1. Clerk Webhook → User sync — The User model exists but nothing creates users in MongoDB yet. Without this, every feature breaks. Set up /api/webhooks/clerk to sync user.created, user.updated, user.deleted events.
2. House creation flow — The core of everything. API route POST /api/houses + the creation UI. This also creates the first Membership record (creator as manager) and the default "General" thread.
3. Dashboard layout + shell — /dashboard route with sidebar nav (Ledger, Vault, Tasks, Grocery, Chat, Members, Settings). Placeholder pages are fine — just the authenticated shell.
4. Member invite system — POST /api/houses/:id/invites + the /invite/[token] acceptance page. Without this, a house has one person forever.
5. Rent Ledger — The highest-value feature for your target market. Manager logs payments, member sees their history, PDF export. This is the reason people in BD/PK will actually adopt Homy.
6. Vault — Second highest stickiness feature. WiFi password saved once = user never leaves.
7. Task board — Third pillar of daily utility.

# CLAUDE.md — Homy Project Intelligence

> This file is the living memory of the Homy project. It tracks decisions, progress, current state, and what comes next. Update this file at every session. Claude reads this file first on every new conversation.

---

## Project Identity

- **Product name:** Homy
- **Tagline:** "Your home, finally organized."
- **Type:** Household management SaaS — web + mobile
- **Target users:** People sharing a home (flatmates, tenants, families, co-living)
- **Primary markets (launch order):** Bangladesh → Pakistan → India → Southeast Asia → UK/Australia → US/EU
- **Current stage:** Planning + Architecture complete. Starting build.

---

## Origin

This project started as **EquiFlow** — a high-end household finance dashboard (Quiet Luxury design, GSAP animations, dark theme). EquiFlow was a beautiful marketing website with **zero actual product functionality**.

The pivot decision: broaden from "finance only" to a full **household operating system**. Renamed to Homy. Migrated from Vite + React to Next.js. The EquiFlow codebase (components, animations, config structure) is reference material for design patterns but is being replaced entirely.

---

## Tech Stack (Decided)

| Layer              | Choice                       | Reason                                    |
| ------------------ | ---------------------------- | ----------------------------------------- |
| Web framework      | Next.js 14 (App Router)      | SSR, SEO, API routes, Vercel deployment   |
| Language           | JavaScript                   | Type safety across monorepo               |
| Auth               | Clerk                        | Phone + email, webhooks, fast setup       |
| Styling            | Tailwind CSS + shadcn/ui     | Speed, consistency                        |
| State              | Zustand + TanStack Query     | Simple global state + data fetching       |
| Realtime           | Socket.io                    | Chat, live updates                        |
| Backend            | Node.js + Express            | Familiar, fast, good ecosystem            |
| Database           | MongoDB + Mongoose           | Flexible schema, good for rapid iteration |
| Cache              | Redis                        | Sessions, rate limiting, queue            |
| Queue              | Bull                         | Reminders, notification scheduling        |
| Files              | Cloudinary or Uploadthing    | Bill photos, documents, avatars           |
| PDF                | @react-pdf/renderer          | Rent ledger exports                       |
| Push notifications | Firebase FCM                 | iOS + Android + Web                       |
| SMS                | Twilio                       | Invite links, rent reminders              |
| Email              | Resend                       | Clean API, good DX                        |
| Payments           | Stripe + local gateways      | Subscription billing                      |
| Hosting            | Vercel (web) + Railway (API) | Easy deployment                           |
| Mobile (Phase 2)   | React Native + Expo          | Shared API, faster development            |
| Monorepo           | Turborepo                    | Multi-app management                      |

---

## Repository Structure (Planned)

```
homy/
├── apps/
│   ├── web/           # Next.js 14 — main web app
│   └── mobile/        # React Native Expo — Phase 2
├── packages/
│   ├── api/           # Express Node.js backend
│   └── shared/        # Shared types, constants, utils
├── CLAUDE.md          # This file
├── README.md          # Product documentation
└── package.json       # Turborepo monorepo root
```

---

## Feature Priority Matrix

### Must have (Phase 1 — MVP)

- [x] Product plan written
- [x] README.md complete
- [x] CLAUDE.md created
- [ ] Next.js project initialized
- [ ] Clerk auth configured
- [ ] MongoDB connection + base models
- [ ] House creation flow
- [ ] Member invite (email + SMS)
- [ ] Rent ledger (log, view, PDF export)
- [ ] Vault (WiFi, codes, contacts)
- [ ] Task board (create, assign, complete)
- [ ] Grocery list (shared, real-time)
- [ ] Basic chat (1 general thread)
- [ ] Push notifications (rent due, task assigned)
- [ ] Landing page (Homy branded)

### Should have (Phase 2)

- [ ] Bill splitting (electricity, water, internet)
- [ ] Electricity meter reading tracker
- [ ] Threaded chat
- [ ] Polls
- [ ] Manager announcements
- [ ] Meeting scheduler
- [ ] Task gamification (streaks, nudges)
- [ ] SMS reminders via Twilio
- [ ] Pro subscription via Stripe
- [ ] PWA (offline + installable)

### Nice to have (Phase 3+)

- [ ] React Native mobile app
- [ ] Bill photo scanning (OCR)
- [ ] Task roulette
- [ ] Guest access (temporary)
- [ ] Package/mail tracker
- [ ] Move-out checklist
- [ ] Maintenance booking
- [ ] Local service referral marketplace
- [ ] WhatsApp Business API integration
- [ ] bKash/Nagad API for in-app rent collection

---

## Data Model Status

**Status: Designed at concept level. Full schema design is next step.**

### Collections to build:

```
users              — Clerk-synced profiles
houses             — House entity
memberships        — User ↔ House relationship + role + rent config
ledger_entries     — Rent + payment records
bills              — Shared bills (electricity, water, etc.)
bill_splits        — Per-member bill allocation
vault_items        — Encrypted credentials + documents
tasks              — Task board
task_assignments   — Who is assigned what
grocery_items      — Shared shopping list
threads            — Chat thread definitions
messages           — Chat messages
polls              — Poll questions
poll_votes         — Individual votes
announcements      — Manager posts
meetings           — Scheduled meetings
notifications      — Notification log + read status
```

### Key relationships:

- A **User** can be a member of multiple **Houses**
- A **House** has one **Manager** and multiple **Members**
- Each **Membership** records: role, rent amount, move-in date, payment method
- **LedgerEntries** belong to a **Membership** (not just a user)
- **VaultItems** belong to a **House** with visibility scope (all/manager-only)
- **Tasks** belong to a **House**, optionally assigned to a **Membership**
- **Messages** belong to a **Thread**, which belongs to a **House**

---

## API Routes Plan (Express)

```
POST   /api/houses                    Create house
GET    /api/houses/:id                Get house details
PATCH  /api/houses/:id                Update house settings
DELETE /api/houses/:id                Delete house (manager only)

POST   /api/houses/:id/invites        Send invite (email/SMS)
GET    /api/houses/:id/members        List members
PATCH  /api/houses/:id/members/:uid   Update member role/rent
DELETE /api/houses/:id/members/:uid   Remove member

GET    /api/houses/:id/ledger         Full ledger
POST   /api/houses/:id/ledger         Log payment
PATCH  /api/ledger/:entryId           Update entry (add note, confirm)
GET    /api/houses/:id/ledger/export  PDF export

GET    /api/houses/:id/bills          List bills
POST   /api/houses/:id/bills          Create bill
POST   /api/bills/:id/splits          Split bill among members

GET    /api/houses/:id/vault          List vault items (scoped by role)
POST   /api/houses/:id/vault          Create vault item
PATCH  /api/vault/:itemId             Update vault item
DELETE /api/vault/:itemId             Delete vault item

GET    /api/houses/:id/tasks          List tasks
POST   /api/houses/:id/tasks          Create task
PATCH  /api/tasks/:taskId             Update task (complete, reassign)
DELETE /api/tasks/:taskId             Delete task

GET    /api/houses/:id/grocery        Grocery list
POST   /api/houses/:id/grocery        Add item
PATCH  /api/grocery/:itemId           Mark bought / update
DELETE /api/grocery/:itemId           Remove item

GET    /api/houses/:id/threads        List threads
POST   /api/houses/:id/threads        Create thread
GET    /api/threads/:threadId/messages  Get messages (paginated)
POST   /api/threads/:threadId/messages  Send message

POST   /api/houses/:id/polls          Create poll
POST   /api/polls/:pollId/vote        Vote

GET    /api/users/me                  Current user profile
PATCH  /api/users/me                  Update profile
```

---

## Environment Variables Needed

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Database
MONGODB_URI=
REDIS_URL=

# File storage
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Notifications
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
RESEND_API_KEY=
FIREBASE_SERVER_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
API_URL=
JWT_SECRET=
```

---

## Design Principles

1. **Mobile-first always** — most users in BD/PK/IN are on mobile
2. **Low data usage** — many users have limited data plans; optimize payload size
3. **Works on slow connections** — optimistic UI, offline-capable grocery list
4. **Culturally neutral defaults** — avoid US-centric language (e.g., "apartment" not "unit", support for extended family households)
5. **Multilingual ready** — all user-facing strings in i18n from day 1 (`next-intl`)
6. **Privacy by design** — manager cannot see explicitly private items; data scoped strictly
7. **No dark patterns** — free tier is genuinely useful; no aggressive upsell
8. **Warm, clear UI** — not sterile/corporate, not chaotic/colorful; calm and organized

---

## Psychological Dependency Model (Ethical)

The goal is genuine utility habit, not addiction. Users stay because Homy actually helps.

**Hooks that create habit (positive):**

- Rent reminders that actually work → manager never has to chase
- Task streaks → members feel good completing
- Weekly digest → "Your house completed 12 tasks this week"
- Vault as memory → "Where's the WiFi? Homy."
- Grocery list → becomes the kitchen's running list naturally

**Things we avoid:**

- Streak anxiety (missing a day shouldn't feel punishing)
- Social pressure (no public shaming of late payers)
- FOMO-driven notifications
- Fake urgency

---

## Localization Plan

| Locale | Language        | Status     | Target date |
| ------ | --------------- | ---------- | ----------- |
| en-US  | English         | Default    | Launch      |
| bn-BD  | Bengali         | Priority 1 | Month 3     |
| ur-PK  | Urdu            | Priority 2 | Month 4     |
| hi-IN  | Hindi           | Priority 3 | Month 6     |
| id-ID  | Indonesian      | Priority 4 | Year 2      |
| en-GB  | British English | Priority 5 | Year 2      |
| de-DE  | German          | Long term  | Year 3      |

---

## Monetization Status

- [ ] Stripe setup (Pro subscription)
- [ ] Free tier limits implemented
- [ ] Pro tier feature flags
- [ ] Local payment gateway research (bKash API, JazzCash)
- [ ] Service referral marketplace — concept only

**Revenue targets:**

- Month 6: First 10 paying houses
- Month 12: 100 paying houses (~BDT 20,000/month)
- Year 2: 1,000 paying houses (~BDT 200,000/month)
- Year 3: 5,000 paying houses — begin profitability

---

## Marketing Assets Needed

- [ ] Homy logo (SVG, multiple variants)
- [ ] Landing page (Next.js, Homy branded)
- [ ] App screenshots / mockups
- [ ] Demo video (2 min walkthrough)
- [ ] Facebook banner (Bengali)
- [ ] Play Store listing assets
- [ ] App Store listing assets

---

## Key Decisions Log

| Date    | Decision                   | Reason                                                      |
| ------- | -------------------------- | ----------------------------------------------------------- |
| Current | Named product "Homy"       | Friendly, universal, memorable, works in multiple languages |
| Current | Next.js over Vite          | SSR, SEO, unified web platform                              |
| Current | Clerk for auth             | Phone auth is essential for BD/PK, Clerk supports it        |
| Current | MongoDB over PostgreSQL    | Flexible schema for rapid iteration, easier for team        |
| Current | Monorepo (Turborepo)       | Web + API + mobile sharing types                            |
| Current | BD + PK first market       | Underserved market, lower competition, familiar pain point  |
| Current | Free tier genuinely useful | Anti-dark-pattern principle                                 |
| Current | PWA before native app      | Faster to market, no App Store delay                        |

---

## Current Session Status

**Last updated:** Initial planning session  
**What was completed this session:**

- Full product feature blueprint written
- Tech stack decided
- Architecture designed
- README.md created
- CLAUDE.md created
- Migration plan from EquiFlow to Homy documented

**Next session should start with:**

1. Initialize the Turborepo monorepo
2. Set up Next.js 14 with JavaScript + Tailwind + shadcn/ui
3. Configure Clerk authentication
4. Set up MongoDB Atlas connection + base Mongoose models
5. Build the House creation flow

---

## Open Questions

- [ ] Should rent tracking support split-rent (each member has different amount) from day 1? → **YES** (different rooms have different rents in South Asian context)
- [ ] WhatsApp Business API: complex to set up, but BD/PK users live on WhatsApp. Defer to Phase 2? → **YES, defer**
- [ ] Should chat be built with Socket.io or a managed service (Pusher, Ably)? → **Socket.io** for cost control at early stage
- [ ] Encryption for vault: server-side AES-256 or client-side? → **Server-side AES-256** to start (simpler, still much better than plaintext)
- [ ] Should grocery list work offline? → **YES** (service worker, sync when online)
- [ ] Task gamification: points/badges or just streaks? → **Streaks only to start** (points system is scope creep at MVP)

---

## Notes for Claude

- When writing code, always use JavaScript
- API responses should follow: `{ success: boolean, data?: any, error?: string }`
- All monetary amounts stored in smallest currency unit (paisa/paise/pence) as integers
- Dates stored as UTC, displayed in user's local timezone
- Never store plain text passwords or sensitive data — vault items use AES-256 encryption
- Member privacy is non-negotiable: private vault items and personal spending data cannot be accessed by other members regardless of role
- Write mobile-first CSS — most users are on phones
- All user-facing strings should use i18n keys from day 1 (`t('key')`)
- Keep API responses slim — no over-fetching, especially for mobile
- Use optimistic updates for grocery list and task completion (feels snappy on slow connections)

---

_"A house is just a building. A home is where people figure out how to live together."_
