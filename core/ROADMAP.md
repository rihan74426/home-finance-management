# HOMY — PRODUCT ROADMAP

> Living document. Update at every phase gate.

---

## PHASE 0 — Foundation ✅ COMPLETE

**Goal:** Working authenticated shell with core data models.

- [x] Next.js 14 + Clerk + MongoDB connected
- [x] Webhook user sync
- [x] House creation flow
- [x] Membership + invite system
- [x] Dashboard layout with correct routing
- [x] All core Mongoose models defined

---

## PHASE 1 — MVP Core ✅ MOSTLY COMPLETE

**Goal:** A house manager can use Homy for real daily life.
**Target:** 50 beta houses in BD/PK via direct outreach.

### Features

- [x] Rent Ledger — log, view, status badges, manager notes
- [x] Vault — encrypted credentials, door codes, WiFi
- [x] Task Board — create, assign, complete, delete
- [x] Grocery List — add, mark bought, categories, filter
- [x] House Chat — threads, messages, polling, new channel
- [x] Member management — invite, roles, view members
- [x] House settings — currency, rent due day, rules, address

### Remaining Phase 1 tasks

- [ ] Bill splitting — POST /api/houses/[id]/bills + split logic
- [ ] Receipt photo upload — Cloudinary integration
- [ ] Error boundaries on all dashboard pages
- [ ] Rate limiting on API routes (Redis middleware)
- [ ] Loading skeletons (better than text "Loading...")
- [ ] Toast notifications (sonner already in package.json)
- [ ] PDF ledger export — @react-pdf/renderer

---

## PHASE 2 — Engagement + Revenue (Months 3–6)

**Goal:** First paying customers. 1,000 active houses.
**Metric:** 100 Pro subscriptions by end of Phase 2.

### 2A — Notifications & Reminders

- [ ] In-app notification center (bell icon, unread count)
- [ ] Notification model + API (CRUD, mark read)
- [ ] Rent due reminders — 3 days before, day of, day after
- [ ] Task overdue nudges — 24h after due date
- [ ] Bull queue + Redis for scheduled jobs
- [ ] Twilio SMS integration (BD: +880, PK: +92)
- [ ] Firebase FCM push notifications

### 2B — Social Features

- [ ] Polls — create, vote, results, deadline auto-close
- [ ] Manager announcements — pinned, must-read
- [ ] @mentions in chat — link to member profile
- [ ] Message read receipts
- [ ] Thread archiving

### 2C — Bills & Splitting

- [ ] Bill creation (electricity, water, internet, etc.)
- [ ] Bill photo upload (receipt image → Cloudinary)
- [ ] Equal split (auto-calculate per member)
- [ ] Custom split (manager sets each member's share)
- [ ] Bill split → auto-creates LedgerEntry per member
- [ ] Electricity meter readings (start/end, units calc)
- [ ] Bill status tracking (pending/partial/paid per member)

### 2D — Subscriptions

- [ ] Stripe integration (webhook handler)
- [ ] Free tier enforcement (1 house, 6 members, 5 vault items, 1 thread)
- [ ] Pro tier feature flags
- [ ] Upgrade prompts (contextual, not pop-ups)
- [ ] Manager Pro tier (manage 10 houses)
- [ ] Billing portal (Stripe customer portal)

### 2E — Quality & Polish

- [ ] PDF ledger export per member (legal-grade receipt)
- [ ] Mobile-optimized layouts (everything works at 375px)
- [ ] Keyboard navigation + accessibility basics
- [ ] Empty states with real illustrations (not just text)
- [ ] Skeleton loaders for all data-fetching pages
- [ ] Error boundaries with recovery actions

---

## PHASE 3 — Mobile + Scale (Months 5–8)

**Goal:** App Store + Play Store. 5,000 active houses.

### 3A — React Native App

- [ ] Expo SDK setup (managed workflow)
- [ ] Expo Router (file-based, mirrors Next.js)
- [ ] NativeWind (Tailwind for RN)
- [ ] Auth: Clerk React Native SDK
- [ ] Core screens: Dashboard, Ledger, Tasks, Grocery, Chat
- [ ] Push notifications: Expo Notifications + FCM
- [ ] Camera: scan bill receipts → upload to Cloudinary
- [ ] Biometric auth (Face ID / fingerprint)
- [ ] App Store (iOS) + Play Store (Android) submission

### 3B — Real-time Upgrade

- [ ] Express API server (move from Next.js API routes)
- [ ] Socket.io for chat (replace polling)
- [ ] Socket.io for grocery list (real-time item updates)
- [ ] Presence indicators (who's online in chat)

### 3C — PWA

- [ ] Service worker (offline grocery list)
- [ ] Web app manifest
- [ ] Install prompt
- [ ] Background sync for offline actions

---

## PHASE 4 — Monetization & Market (Months 6–12)

**Goal:** Revenue positive. 100 paying houses minimum.

### 4A — Local Payments

- [ ] bKash API integration (Bangladesh)
- [ ] Nagad API integration (Bangladesh)
- [ ] JazzCash / EasyPaisa (Pakistan)
- [ ] UPI integration (India)
- [ ] In-app rent collection (members pay directly, manager receives)
- [ ] Transaction fee model (0.5–1% per collection)

### 4B — Manager Pro

- [ ] Manage up to 10 houses under one account
- [ ] House portfolio dashboard (all houses, all members, all pending)
- [ ] Bulk rent reminders across all houses
- [ ] Cross-house financial reporting
- [ ] PDF invoice templates with house branding
- [ ] WhatsApp Business API for automated reminders

### 4C — Local Services Marketplace

- [ ] Service provider directory (plumbers, electricians, cleaners)
- [ ] In-app service request → match to local provider
- [ ] Commission model: 10–20% per booking
- [ ] Review system for service providers
- [ ] Launch: Dhaka first, then Karachi

---

## PHASE 5 — India + Southeast Asia (Year 2)

- [ ] UPI payment integration
- [ ] Hindi UI localization (next-intl)
- [ ] Indian co-living market features (PG accommodation)
- [ ] Indonesia pilot (Bahasa Indonesia localization)
- [ ] Philippines pilot
- [ ] 10,000 active houses target

---

## PHASE 6 — Europe + Australia (Year 2–3)

- [ ] GDPR compliance layer (consent, deletion, portability)
- [ ] Euro / GBP / AUD currency support
- [ ] UK HMO features (House in Multiple Occupation regulations)
- [ ] Australia: bond tracking, lease renewal reminders
- [ ] Open Banking integration (Plaid UK)
- [ ] German / French localization
- [ ] 50,000 active houses target

---

## LONGER VISION (Years 3–5)

These are bets, not commitments. Revisit annually.

**Predictive maintenance**
Homy accumulates appliance + maintenance data. ML model learns failure patterns. "Your water heater is 5.5 years old and usage shows stress — schedule a checkup before it fails."

**Housing marketplace**
Outgoing tenants connect incoming ones through the house profile. The house already has history, rules, member reputation. Homy becomes the trusted rental intermediary. Revenue: listing fee or commission.

**Property management SaaS (white-label)**
For 50–500 unit operators. Same core engine, enterprise reporting, custom branding, bulk operations. Revenue: per-unit SaaS pricing.

**Homy Concierge**
A human-assisted service layer on top of the software. A dedicated coordinator handles rent reminders, maintenance booking, house admin. Async, chat-based, $15–30/month premium tier.

**Financial health layer**
Rental payment history as a credit signal. Help members build credit history. Household savings products. Partner with local microfinance institutions.

**Smart home integration**
Connect with smart locks (August, Yale), smart meters, IoT devices. "Front door was unlocked for 2 hours — confirm it was intentional?"

---

## NEXT IMMEDIATE TASKS (This Sprint)

Priority order for next development session:

1. **Bill splitting** — highest business value, model exists
   - POST /api/houses/[id]/bills
   - POST /api/bills/[id]/split
   - Bill split page in dashboard

2. **Toast notifications** — sonner is installed, wire it up across all mutations

3. **Error boundaries** — wrap all dashboard pages to prevent full crashes

4. **Rate limiting** — before any public launch

5. **PDF ledger export** — @react-pdf/renderer, per-member payment history

6. **Loading skeletons** — replace "Loading..." text across all pages

### Additions to next sprint (priority)

- Member document upload & manager verification (POST /memberships/:id/documents, verify endpoint).
  - UI: member dashboard upload flow; manager modal/list to review & verify.
  - Privacy: docs scoped to membership; manager access revoked on membership removal.
- Invite name flow: when an invite includes a name, use it as the default name for the created user (accept via POST /api/invites/[token]).
- Rules & rule-alerts: allow members to flag rule violations; new notification type RULE_BROKEN; API + manager view to adjudicate.

---

_Phases are targets, not deadlines. Ship when ready, not when scheduled._
