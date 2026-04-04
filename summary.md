# Homy — Complete Project Summary

## What is Homy?

Homy is a **household operating system** — a single app where everyone in a shared home manages rent, bills, tasks, groceries, important info, and house chat. Built for people who share a living space: flatmates, tenants, families, co-living residents.

The core insight: **managing a shared home creates daily friction** — the awkward rent reminder, the WiFi password nobody can find, the cleaning argument, the electricity bill nobody tracked. Homy removes all of it quietly, so people can just live.

---

## Where We Came From

The project started as **EquiFlow** — a beautiful marketing website for a household finance app with zero actual product functionality. The pivot: broaden from finance-only to a full household management platform. Renamed to **Homy**. Tech migrated from Vite + React to Next.js 14.

---

## The Full Feature Set

### 🏠 House & Members

- Create a house, invite members by phone or email
- Roles: Manager, Member, Guest
- Manager assigns roles, sets rent amounts, manages everything

### 💰 Rent & Ledger

- Log rent payments per member (cash, bKash, UPI, bank transfer)
- Partial payments with notes ("Paid 500, rest by 15th")
- Auto-reminders 3 days before rent due
- Full payment history + PDF export for legal records

### ⚡ Bills & Utilities

- Track electricity, water, internet, maintenance fees
- Upload bill photos
- Split bills per member (equal or custom)
- Electricity meter reading tracker

### 🔐 The Vault

- WiFi credentials, door codes, gate codes
- Lease documents, landlord contacts
- Emergency contacts (plumber, electrician)
- Appliance manuals, maintenance history
- AES-256 encrypted, manager controls visibility

### ✅ Tasks & Chores

- Create tasks, assign to members, set due dates
- Recurring tasks (weekly cleaning, monthly maintenance)
- Nudge system for overdue tasks
- Task streaks and completion tracking
- Task Roulette for random chore assignment

### 🛒 Grocery List

- Shared real-time list
- Any member can add/mark bought
- "Running low" quick-add
- Recurring items auto-suggestion

### 💬 Household Chat

- Threaded conversations (General, Rent, Kitchen, Maintenance...)
- Polls: "Should we get a new AC?"
- Manager announcements (pinned, must-read)
- @mentions, image attachments

### 📅 Meetings & Scheduling

- Schedule house meetings with agenda + RSVP
- Maintenance scheduling with member notifications
- Meeting notes

### 👤 Member Profiles

- Room/unit assignment, move-in date
- Payment status, rent amount
- Task completion score
- Contact preferences

### ➕ More Features

- Package/mail tracker
- Parking spot management
- Guest registration
- House rules board
- Noise log (for disputes)
- Move-out checklist
- Document storage

---

## Tech Stack

| Layer            | Technology                                      |
| ---------------- | ----------------------------------------------- |
| Web              | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Auth             | Clerk (phone + email)                           |
| Backend          | Node.js + Express                               |
| Database         | MongoDB + Mongoose                              |
| Realtime         | Socket.io                                       |
| Cache            | Redis                                           |
| Queue            | Bull (reminders)                                |
| Notifications    | FCM + Twilio                                    |
| Email            | Resend                                          |
| Files            | Uploadthing/Cloudinary                          |
| PDF              | @react-pdf/renderer                             |
| Payments         | Stripe + local gateways                         |
| Mobile (Phase 2) | React Native + Expo                             |
| Monorepo         | Turborepo                                       |

---

## Migration From EquiFlow to Homy

1. New Turborepo monorepo (`apps/web`, `apps/mobile`, `packages/api`, `packages/shared`)
2. Next.js 14 App Router replaces Vite + React
3. Clerk replaces any planned auth system
4. MongoDB replaces nothing (no DB existed)
5. EquiFlow design assets (components, animations) referenced for style inspiration only

---

## Market & Launch Strategy

**Launch order:** Bangladesh → Pakistan → India → SEA → UK/Australia → US/EU

**Why Asia first:**

- High smartphone penetration, mobile-first users
- Rent disputes and bill sharing are daily pain points
- Underserved by existing English-first apps
- Strong WhatsApp/Facebook usage = viral potential
- Lower competition than Western markets

**BD launch channels:** Facebook groups (flat share, student, residents), university partnerships (BUET, NSU, DU), local tech bloggers, Prothom Alo/Daily Star

---

## Pricing (Multi-Currency)

| Market     | Free | Pro (House/month) | Manager Pro |
| ---------- | ---- | ----------------- | ----------- |
| Bangladesh | Free | BDT 199           | BDT 499     |
| Pakistan   | Free | PKR 800           | PKR 2,000   |
| India      | Free | INR 149           | INR 399     |
| UK         | Free | £3.99             | £9.99       |
| Australia  | Free | AUD 5.99          | AUD 14.99   |

Free tier: 1 house, 6 members, basic features (genuinely useful, not crippled)

---

## Revenue Streams

1. **Pro subscription** — unlimited members, PDF exports, reminders, full chat
2. **Manager Pro** — manage 10 houses, full landlord toolkit
3. **Local service referrals** — plumbers, electricians, cleaners via in-app marketplace (10–20% commission)
4. **Digital payment integration** — bKash/Nagad/UPI transaction fees (0.5–1%)
5. **Grocery affiliates** — Chaldal, Daraz, local grocery apps
6. **Enterprise/co-living SaaS** — white-label for 50+ room operators (long term)

---

## 4–5 Year Roadmap

**Phase 1 (Months 1–3):** MVP — House + Members, Rent Ledger, Vault, Tasks, Grocery, Basic Chat, Landing Page. Beta: 50 houses in BD/PK.

**Phase 2 (Months 3–6):** Engagement — Bill splitting, Threaded chat, Polls, Reminders, Pro subscription. Target: 1,000 active houses.

**Phase 3 (Months 5–8):** Mobile — React Native Expo app. App Store + Play Store launch.

**Phase 4 (Months 6–12):** Revenue — Manager Pro, WhatsApp reminders, bKash integration, local service referrals. Target: 100 paying houses.

**Phase 5 (Year 2):** India + SEA — UPI integration, Hindi localization, Indonesia/Philippines pilots. Target: 10,000 active houses.

**Phase 6 (Year 2–3):** Europe + Australia — GDPR compliance, Open Banking, UK HMO features, AUD/GBP/EUR pricing.

---

## Longer Vision (5–10 Years)

- **Predictive maintenance:** AI suggests appliance replacement before failure
- **Housing marketplace:** Outgoing tenants connect with incoming ones via house profile
- **Property management SaaS:** White-label for 50–500 unit operators
- **Homy Concierge:** Human-assisted house admin service (premium tier)
- **Smart home integration:** Smart locks, smart meters, IoT devices
- **Financial health layer:** Rental history as credit signal, household savings products

---

## Next Immediate Steps

1. **Initialize the monorepo** — Turborepo with web + api + shared packages
2. **Set up Next.js 14** — TypeScript, Tailwind, shadcn/ui, Clerk
3. **Connect MongoDB** — Atlas cluster, base Mongoose models
4. **Build House creation flow** — Create house → set name → invite first member
5. **Build Rent Ledger** — The highest-value feature for target market
6. **Deploy landing page** — Homy branded, collect waitlist emails

---

## Files in This Project

| File         | Purpose                                                             |
| ------------ | ------------------------------------------------------------------- |
| `README.md`  | Complete product documentation, features, architecture, roadmap     |
| `CLAUDE.md`  | Progress tracker, decisions log, current todos, Claude instructions |
| `SUMMARY.md` | This file — condensed overview                                      |

---

_Start building. The rent is due._
