# 🏠 Homy — The Household Operating System

> *"Your home, finally organized."*

Homy is a unified household management platform for people who share a living space — flatmates, families, rental tenants, co-living residents. It handles everything from rent tracking to chore assignment, shared bills to household chat, WiFi passwords to grocery lists. Built for Asia first, designed for the world.

---

## Table of Contents

1. [The Vision](#the-vision)
2. [The Problem We Solve](#the-problem-we-solve)
3. [Product Feature Blueprint](#product-feature-blueprint)
4. [Tech Stack](#tech-stack)
5. [Migration Plan (EquiFlow → Homy)](#migration-plan)
6. [Architecture Overview](#architecture-overview)
7. [Data Model Summary](#data-model-summary)
8. [Monetization Strategy](#monetization-strategy)
9. [Go-To-Market: Asia First](#go-to-market-asia-first)
10. [4–5 Year Roadmap](#roadmap)
11. [Longer Vision (5–10 Years)](#longer-vision)
12. [Marketing Policy](#marketing-policy)
13. [Pricing Strategy](#pricing-strategy)
14. [Mobile App Plan](#mobile-app-plan)

---

## The Vision

Homy is not a budgeting app. It is not a chat app. It is not a task manager.

It is the **operating system for a shared home** — a single place where everyone who lives together can coordinate, share, pay, remember, and connect. The way WhatsApp became the default for family communication, Homy becomes the default for household management.

The emotional promise: **less friction, more harmony.** When people share space without clear systems, resentment builds. Homy removes the friction — who owes what, who forgot the task, who has the WiFi password — quietly, in the background, so people can just live.

---

## The Problem We Solve

### What people actually say (from Reddit, Facebook groups, Twitter/X):

> *"My flatmate keeps 'forgetting' to pay their share of electricity."* — r/AskUK

> *"We have the WiFi password written on a sticky note that's been on the fridge for 2 years."* — Facebook flatmate group, Dhaka

> *"I hate being the one who always has to ask about rent. It makes me feel like a debt collector."* — r/badroommates

> *"Our house WhatsApp group has 4,000 messages. Nobody can find the lease agreement."* — Twitter/X, Mumbai

> *"My landlord sends WhatsApp voice notes at midnight about water bills."* — Reddit, Karachi

**The core pain points:**
- Money awkwardness between people who live together
- Critical information scattered across WhatsApp, Notes apps, paper
- No shared accountability for household tasks
- Landlords/managers with no proper tools — just informal messaging
- Tenants with no record of what they paid and when

### Why existing tools fail:
| Tool | Fails because |
|------|---------------|
| WhatsApp | No structure, everything gets buried |
| Splitwise | Roommate math, not household harmony |
| Google Sheets | Too much effort, breaks down |
| Notion | Too complex for non-technical users |
| Excel | Not mobile-first, no real-time collaboration |

**Homy fills the gap**: structured enough to be useful, simple enough that your least tech-savvy flatmate will actually use it.

---

## Product Feature Blueprint

### Core Concept: The House

Everything in Homy is organized around a **House**. One house, multiple members, one manager (Head of House). Members join by invite. The house has rooms, a ledger, a vault, a board, and a chat.

---

### A. House Setup & Access

**House Creation:**
- Create a house with a name, address, and type (flat, villa, family home, co-living)
- Manager role is assigned to creator
- Invite members via phone number (SMS), email, or shareable link
- Optional: set house avatar/photo

**Member Roles:**
- `Manager` — full access, can assign tasks, log rent, manage vault
- `Member` — standard access, personal ledger view, shared features
- `Guest` — read-only temporary access (useful for maintenance visits)

**Onboarding Flow:**
1. Sign up with phone or email (Clerk auth)
2. Create a house OR accept an invite
3. Brief setup: who pays rent? what's the billing cycle?
4. Done — dashboard appears

---

### B. Rent & Ledger Engine

The most critical feature for South Asian and developing markets.

**Manager Dashboard:**
- Log rent paid by each member (amount, date, method: cash/bKash/Nagad/UPI/bank)
- Mark as partial, pending, or fully paid
- Add private notes (e.g., "Said he'll pay the rest by the 15th")
- See at a glance: who's paid, who hasn't, total collected vs. expected

**Auto-Reminders:**
- Push notification + in-app message 3 days before rent due
- Day-of reminder if unpaid
- Manager gets notified when a member marks themselves as paid (pending manager confirmation)

**Rent History:**
- Full ledger per member
- PDF export for each member's payment history (legal/rental record use)
- Manager can export full house ledger as PDF

**Bill Tracking (Beyond Rent):**
- Electricity, gas, water, internet, building maintenance fee
- Split equally or custom per member
- Track who paid what portion
- Attach photo of bill (for receipts and disputes)
- Payment status: pending / partial / paid

**Electricity Meter Tracking:**
- Log meter readings (start + end of month)
- Auto-calculate units used and estimated cost
- Works even without a smart meter

---

### C. The Vault — Shared Household Information

Secure, organized, shared reference storage. Replaces the sticky note on the fridge.

**Vault Items:**
- WiFi credentials (name + password, tap to copy)
- Door lock codes / key safe combinations
- Intercom or gate codes
- Lease agreement (PDF upload)
- Landlord contact details
- Emergency contacts (plumber, electrician, security)
- Maintenance history (log of repairs done)
- Appliance manuals and warranty info

**Access Control:**
- Manager decides which vault items are shared with all vs. manager-only
- E.g., landlord's personal number = manager-only; WiFi = all members

---

### D. Tasks & Chores

**Task Board:**
- Create tasks with title, description, due date
- Assign to a specific member or leave unassigned (anyone can pick up)
- Priority levels: low / normal / urgent
- Recurrence: daily, weekly, monthly (e.g., "Take out bins — every Monday")
- Categories: cleaning, grocery, maintenance, payment, admin

**Task Gamification (Nudge System):**
- Overdue tasks send a friendly "nudge" to the assigned member
- House-level streak counter: "Your house has completed 7 tasks in a row!"
- Weekly digest: who completed the most tasks this week
- No public shaming — private nudges only, positive reinforcement publicly

**Task Roulette:**
- Manager can spin the roulette to randomly assign unassigned chores
- Useful for: cleaning schedule, cooking rotation, grocery run

---

### E. Grocery & Shopping Lists

**Shared List:**
- Any member can add items
- One-tap to mark as bought
- Categorized: dairy, vegetables, household supplies, etc.
- Running out? Tap "Running low" on an existing item — adds to next list
- Recurring items: auto-add weekly staples

**Smart Suggestions:**
- Based on previous lists, suggest items not added this week
- "You usually add eggs on Sundays — add them?"

---

### F. Household Chat

**Thread-Based Chat (not one big group):**
- Default threads: General, Rent & Bills, Groceries, Maintenance
- Create custom threads: "Rooftop Party Planning", "AC Problem"
- Attach images, documents
- @mention specific members
- Pin important messages

**Polls:**
- Create quick polls inside any thread
- "Should we get a new kettle?" → Yes / No
- "Who cooks Friday?" → Name selection
- Results visible to all, deadline optional

**Announcements:**
- Manager can post pinned announcements
- All members notified immediately
- Cannot be dismissed until read

---

### G. Meetings & Scheduling

**House Meetings:**
- Schedule a meeting (date, time, agenda)
- All members notified
- RSVP: attending / not attending / maybe
- Meeting notes can be posted after

**Maintenance Scheduling:**
- Log when maintenance is booked (electrician, plumber, cleaner)
- Notify all members ("Plumber coming Tuesday 10am–12pm")
- History of past maintenance visits

---

### H. Personal Profile & Member Cards

**Each member has:**
- Profile photo, name, room/unit number (optional)
- Move-in date
- Rent amount assigned
- Payment status (current month)
- Task completion score
- Contact: phone, preferred payment method

**Member visibility settings:**
- Members can hide their phone number from other members (manager always sees)

---

### I. Notifications (Smart, Not Spammy)

| Trigger | Who gets notified |
|---------|------------------|
| Rent due in 3 days | Member |
| Rent marked as paid | Manager |
| New task assigned | Assigned member |
| Task overdue 24h | Assigned member (nudge) |
| New poll posted | All members |
| New announcement | All members |
| Bill split updated | All affected members |
| New vault item | All members |
| Meeting scheduled | All members |
| Maintenance scheduled | All members |

**Notification controls:**
- Each member can mute specific threads or notification types
- Quiet hours setting (no pings after 10pm unless urgent)

---

### J. Additional Features (Discovered from Real Household Problems)

- **Parking spot management** — who uses which spot, visitor parking log
- **Guest registration** — "I have a guest staying for 3 nights" (relevant for security deposits and co-living rules)
- **Package / mail tracker** — "Package arrived for John, left at front door"
- **Noise log** — Document noise complaints (useful in managed properties)
- **Move-out checklist** — Standard checklist when a member leaves (return keys, settle dues, take reading)
- **House rules board** — Manager can post house rules (visible to all members)
- **Document storage** — ID copies, contracts, any shared documents
- **Mood check-in** (optional) — "How's the vibe this week?" Anonymous house temperature gauge

---

## Tech Stack

### Web Application
```
Framework:        Next.js 14+ (App Router)
Language:         TypeScript
Styling:          Tailwind CSS + shadcn/ui
Auth:             Clerk
State:            Zustand + React Query (TanStack Query)
Realtime:         Socket.io (chat, live updates)
File Upload:      Uploadthing or Cloudinary
PDF Generation:   Puppeteer or @react-pdf/renderer
```

### Backend / API
```
Runtime:          Node.js
Framework:        Express.js
Language:         TypeScript
Database:         MongoDB (Mongoose ODM)
Cache:            Redis (sessions, rate limiting)
Queue:            Bull (reminders, notifications)
Auth:             Clerk SDK (webhook sync)
Push Notif:       Firebase Cloud Messaging (FCM)
SMS:              Twilio (invites, reminders)
Email:            Resend or SendGrid
Storage:          AWS S3 or Cloudflare R2
```

### Mobile Apps (Phase 2)
```
Framework:        React Native (Expo)
Shared logic:     Shared API layer (same backend)
Navigation:       Expo Router
Push:             Expo Notifications + FCM
```

### Infrastructure
```
Hosting (Web):    Vercel (Next.js) + Railway/Render (API)
Database:         MongoDB Atlas
CI/CD:            GitHub Actions
Monitoring:       Sentry
Analytics:        PostHog (privacy-friendly)
```

---

## Migration Plan

### From: Current EquiFlow (Vite + React) → Homy (Next.js 14)

**Why Next.js over continuing with Vite + React:**
- Server-side rendering = better SEO for landing pages
- API routes = simpler architecture for small team
- App Router = better file-based routing
- Better image optimization
- Easier deployment on Vercel
- One framework for web app + marketing site

**Migration Steps:**

#### Step 1 — New Repository Setup (Week 1)
```bash
npx create-next-app@latest homy --typescript --tailwind --app
```
- Set up folder structure (see Architecture section)
- Install shadcn/ui components
- Configure Clerk auth
- Set up MongoDB connection

#### Step 2 — Move Marketing Content (Week 1)
- Port the landing page sections from current React components to Next.js pages
- Hero, About, Features, Pricing, FAQ, Contact
- Update config.ts with Homy branding
- Replace EquiFlow content with Homy content

#### Step 3 — Auth System (Week 2)
- Clerk setup: email + phone sign-up
- Webhook: sync Clerk user to MongoDB
- Protected routes middleware
- User profile page

#### Step 4 — House & Member System (Week 3–4)
- Create House flow
- Invite system (email + SMS)
- Member management
- Role system

#### Step 5 — Core Features (Month 2–3)
- Rent & Ledger
- Vault
- Tasks
- Grocery List

#### Step 6 — Social Features (Month 3–4)
- Chat with Socket.io
- Polls
- Announcements

#### Step 7 — Mobile (Month 5–8)
- Expo React Native app
- Shared API
- Push notifications

---

## Architecture Overview

```
homy/
├── apps/
│   ├── web/                    # Next.js 14 web app
│   │   ├── app/
│   │   │   ├── (marketing)/   # Landing, pricing, blog
│   │   │   ├── (auth)/        # Sign-in, sign-up (Clerk)
│   │   │   └── (dashboard)/   # Protected app routes
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx   # House overview
│   │   │       ├── ledger/
│   │   │       ├── vault/
│   │   │       ├── tasks/
│   │   │       ├── grocery/
│   │   │       ├── chat/
│   │   │       ├── members/
│   │   │       └── settings/
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui base components
│   │   │   ├── house/         # House-specific components
│   │   │   ├── ledger/
│   │   │   ├── vault/
│   │   │   ├── tasks/
│   │   │   └── chat/
│   │   └── lib/
│   │       ├── api.ts         # API client
│   │       ├── hooks/         # React hooks
│   │       └── utils.ts
│   │
│   └── mobile/                # React Native (Expo) — Phase 2
│       ├── app/               # Expo Router
│       ├── components/
│       └── lib/
│
├── packages/
│   ├── api/                   # Express + Node.js API
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── houses.ts
│   │   │   │   ├── members.ts
│   │   │   │   ├── ledger.ts
│   │   │   │   ├── vault.ts
│   │   │   │   ├── tasks.ts
│   │   │   │   ├── chat.ts
│   │   │   │   ├── grocery.ts
│   │   │   │   └── notifications.ts
│   │   │   ├── models/        # Mongoose schemas
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   ├── jobs/          # Bull queue workers
│   │   │   └── socket/        # Socket.io handlers
│   │   └── package.json
│   │
│   └── shared/                # Shared types & utils
│       ├── types/
│       └── constants/
│
└── package.json               # Turborepo monorepo root
```

---

## Data Model Summary

*(Full schema design is the next phase — this is the high-level map)*

**Collections:**
- `users` — Clerk-synced user profiles
- `houses` — House entity + settings
- `memberships` — User ↔ House relationship + role + rent amount
- `ledger_entries` — Rent and bill payment records
- `bills` — Electricity, water, internet bills + splits
- `vault_items` — Encrypted credentials and documents
- `tasks` — Task board entries + assignments
- `grocery_items` — Shared list items
- `messages` — Chat messages (with thread reference)
- `threads` — Chat thread definitions
- `polls` — Poll questions + options + votes
- `announcements` — Pinned manager posts
- `meetings` — Scheduled house meetings
- `notifications` — Notification log

---

## Monetization Strategy

### Philosophy: Extract value without the user feeling extracted

The goal is to make the free tier so genuinely useful that users develop a habit, then offer premium features that feel like natural upgrades rather than paywalls.

### Tier Structure

**Free — "Starter House"**
- 1 house, up to 6 members
- Rent tracking (basic)
- Task board
- Grocery list
- Vault (5 items)
- Chat (1 general thread)
- No PDF exports

**Pro — "Homy+" (BDT 199/PKR 800/INR 149 per house/month)**
- Unlimited members
- Full ledger + PDF exports
- Unlimited vault items + file attachments
- All chat threads
- Bill splitting
- Reminders (SMS + push)
- Polls + announcements
- Priority support

**Manager Pro — (BDT 499/PKR 2000/INR 399 per manager/month)**
- Manage up to 10 houses (landlord/property manager use case)
- Full rent ledger with PDF per tenant
- WhatsApp reminder integration
- Advanced reporting
- Branded invoice PDFs

### Additional Revenue Streams

**1. Local Service Referrals (High potential for BD/PK/IN)**
- "Need a plumber? We know one in your area."
- Partner with local electricians, plumbers, AC technicians, cleaners
- Commission model: 10–20% of service booking value
- No upfront cost to service providers — pay per lead
- Works like a local marketplace inside the app

**2. Digital Payment Integration**
- bKash/Nagad partner (Bangladesh)
- JazzCash/EasyPaisa partner (Pakistan)
- UPI integration (India)
- Collect rent digitally through the app → earn transaction fee (0.5–1%)

**3. Grocery Affiliate**
- Shajgoj, Chaldal, Meena Click (BD), Daraz — affiliate links on grocery list
- "Add to cart on Chaldal" from the shared list
- Affiliate commission on orders

**4. Premium Integrations**
- WhatsApp Business API for automated rent reminders
- PDF generator for legal-grade receipts
- Advanced analytics for property managers

**5. Co-Living / Property Manager SaaS (Long term)**
- White-label for co-living operators (50+ rooms)
- Enterprise pricing
- Custom branding

### Anti-pressure Principles
- No dark patterns (no fake urgency, no countdown timers on pricing)
- Free tier is genuinely useful — not crippled
- Upgrades suggested contextually, not with pop-ups
- Annual plan discount: 2 months free
- Students: 50% discount with .edu email

---

## Go-To-Market: Asia First

### Phase 1: Bangladesh & Pakistan (Months 1–6)

**Why BD + PK first:**
- High smartphone penetration
- Active Facebook & WhatsApp usage (familiar with mobile-first apps)
- Strong rental market in Dhaka, Chittagong, Karachi, Lahore
- Underserved by existing apps (Splitwise is English-first, YNAB unknown)
- Rent disputes and bill sharing are a daily pain
- Strong diaspora networks that will spread word internationally

**BD Launch Strategy:**
- Facebook groups: "Dhaka Flat Share", "Bashundhara Residents", university groups
- University dormitory partnerships (BUET, DU, NSU, BRAC)
- Local tech blogs and YouTubers
- Prothom Alo / Daily Star feature article
- WhatsApp broadcast lists for flatmate communities

**PK Launch Strategy:**
- Twitter/X (heavily used by urban Pakistan)
- University channels (LUMS, IBA, NED)
- Locally relevant payment: JazzCash/EasyPaisa integration from day 1

**India Launch:**
- Follows BD + PK (Month 6–12)
- LinkedIn for urban professionals (Bangalore, Mumbai, Delhi)
- PG/hostel owner communities
- Integration with UPI from day 1

### Content Strategy
- "How to manage a flathouse without fighting" — blog
- "The rent conversation you dread" — emotional content
- "WhatsApp vs Homy for managing your house" — comparison content
- Short-form videos: problem scenarios (flatmate forgot rent → Homy solves it)
- User-generated content: "Show us your messy rent spreadsheet, we'll fix it"

---

## Roadmap

### Phase 1 — Foundation (Months 1–3)
**Goal: Functional product, first 100 houses**

- [ ] Next.js + Clerk + MongoDB setup
- [ ] House creation and member invites
- [ ] Rent ledger (log, track, PDF export)
- [ ] Vault (WiFi, codes, contacts)
- [ ] Task board
- [ ] Basic grocery list
- [ ] Simple chat (general thread only)
- [ ] Push notifications
- [ ] Landing page (Homy branding)
- [ ] Deploy: Vercel + Railway
- [ ] Beta launch: 50 houses in BD/PK via direct outreach

### Phase 2 — Engagement (Months 3–6)
**Goal: 1,000 active houses, first revenue**

- [ ] Bill splitting and electricity tracker
- [ ] Threaded chat + polls
- [ ] Announcements
- [ ] Meeting scheduler
- [ ] Task gamification (streaks, nudges)
- [ ] SMS reminders via Twilio
- [ ] bKash/Nagad/JazzCash payment tracking
- [ ] Pro subscription (Stripe + local payment)
- [ ] Mobile-optimized PWA

### Phase 3 — Mobile (Months 5–8)
**Goal: App Store + Play Store launch**

- [ ] React Native (Expo) app
- [ ] Push notifications (FCN)
- [ ] Offline-first grocery list
- [ ] Biometric auth
- [ ] Camera: scan and attach bills
- [ ] App Store (iOS) + Play Store (Android) launch

### Phase 4 — Monetization (Months 6–12)
**Goal: Revenue positive**

- [ ] Manager Pro tier
- [ ] WhatsApp Business API reminders
- [ ] Local service referral marketplace (BD)
- [ ] PDF invoice templates (branded)
- [ ] Payment collection via bKash API
- [ ] 100 paying houses

### Phase 5 — India & Southeast Asia (Year 2)
**Goal: 10,000 active houses**

- [ ] UPI integration
- [ ] Hindi UI localization
- [ ] Indian co-living market features
- [ ] Indonesia market research
- [ ] Philippines pilot

### Phase 6 — Europe & Australia (Year 2–3)
**Goal: Western market entry**

- [ ] GDPR compliance
- [ ] Euro/GBP/AUD currency support
- [ ] UK market: HMO (House in Multiple Occupation) specific features
- [ ] Australia: bond tracking, lease renewal reminders
- [ ] German/French localization
- [ ] Open Banking integration (Plaid UK)

---

## Longer Vision (5–10 Years)

### The Home Intelligence Layer

As Homy accumulates household data (what people buy, how they pay, what breaks, who they live with), it becomes the intelligence layer of domestic life.

**Predictive maintenance:** "Your water heater logs show usage spikes — it typically fails after 6 years. Yours is 5.5 years old. Want a pre-emptive checkup?"

**Community-level insights:** "In your area, electricity bills went up 18% this month. Here's how your house compares."

**Housing marketplace:** Connect outgoing tenants with incoming ones. The house profile is already built. Homy becomes a trusted rental intermediary.

**Property management SaaS:** A white-label platform for property managers who manage 50–500 units. The same engine, scaled up with commercial reporting.

**Homy Concierge (Premium tier):** A real human who handles your rent reminders, handles maintenance booking, and manages your house admin for you. A service layer on top of the software.

**Smart home integration:** Integrate with smart locks (August, Yale), smart meters (if available), and IoT devices. "Your front door was unlocked for 2 hours — was that intentional?"

**Financial health layer:** Like a lightweight credit union for household members. Help members save for deposits, build rental history as a credit signal.

---

## Marketing Policy

### Brand Voice
- Warm, practical, gently funny
- Never preachy about money
- Speaks to the person who has to "deal with the house stuff"
- Multilingual: English primary, Bengali/Urdu/Hindi versions planned

### Key Messages
1. "Stop being the group chat admin. Be the house manager."
2. "Rent paid? Tracked. WiFi password? Saved. Chores done? Finally."
3. "One app. Everything your house needs."
4. "No awkward money conversations. Homy handles it."

### Channels (Priority Order)
1. WhatsApp word-of-mouth (BD/PK)
2. Facebook groups (South Asian urban communities)
3. University campus outreach
4. App review sites (Product Hunt, G2, Capterra)
5. SEO blog content
6. Instagram/TikTok short videos
7. Twitter/X for Pakistan urban market
8. LinkedIn for property manager vertical

---

## Pricing Strategy

### Pricing Philosophy
Price in **local currency at local purchasing power**. A product priced at USD 8/month is accessible in the US but a barrier in Bangladesh.

| Market | Free | Pro (House) | Manager Pro |
|--------|------|-------------|-------------|
| Bangladesh | Free | BDT 199/mo | BDT 499/mo |
| Pakistan | Free | PKR 800/mo | PKR 2,000/mo |
| India | Free | INR 149/mo | INR 399/mo |
| UK | Free | £3.99/mo | £9.99/mo |
| Australia | Free | AUD 5.99/mo | AUD 14.99/mo |
| US/EU | Free | USD 4.99/mo | USD 11.99/mo |

**Annual discount:** 2 months free (16% off)
**Student plan:** 50% off with valid .edu email

---

## Mobile App Plan

### Strategy: Web-first, Mobile-second

1. Launch as a mobile-optimized **Progressive Web App (PWA)** first
   - Add to home screen
   - Offline support via service workers
   - Push notifications
   - No App Store approval needed — faster iteration

2. Build **React Native (Expo)** app in parallel (Month 5–8)
   - Shared API with web
   - Shared component patterns where possible
   - Platform-specific features: camera for bill scanning, biometrics, haptics

3. App Store launch
   - iOS: App Store (USD 99/year developer account)
   - Android: Play Store (USD 25 one-time fee)
   - Both simultaneous

### React Native Tech Choices
- **Expo SDK 51+** — managed workflow for faster development
- **Expo Router** — file-based navigation (mirrors Next.js App Router)
- **NativeWind** — Tailwind for React Native
- **Expo Notifications** — push notifications via FCM/APNs
- **Expo Camera** — bill scanning
- **Expo SecureStore** — storing auth tokens securely
- **React Query** — same data fetching layer as web

---

## Quick Start (Developer Setup)

```bash
# Clone the repository
git clone https://github.com/yourusername/homy
cd homy

# Install dependencies (monorepo)
npm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp packages/api/.env.example packages/api/.env

# Required env vars:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
# CLERK_SECRET_KEY=
# MONGODB_URI=
# REDIS_URL=
# UPLOADTHING_SECRET=
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# RESEND_API_KEY=

# Start development
npm run dev          # Starts web + API concurrently
npm run dev:web      # Next.js only
npm run dev:api      # Express API only
```

---

## Contributing

This is currently in active early development. The next milestone is **Phase 1 MVP** — a functional house management app with rent tracking, vault, tasks, and basic chat.

See `CLAUDE.md` for full progress tracking and current todos.

---

*Built for the people who send "did anyone pay the electricity bill?" into the void of a WhatsApp group and wait.*
