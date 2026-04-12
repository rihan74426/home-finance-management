# HOMY — MONETIZATION & BUSINESS MODEL

> Revenue strategy, pricing, and growth model.

---

## CORE PHILOSOPHY

**Don't extract. Earn.**

The free tier must be genuinely useful — not crippled. Users who experience real value will upgrade. Users who feel manipulated will leave and tell others.

Homy monetizes by solving bigger problems for more serious users, not by blocking basic functionality from casual ones.

**Subscription fatigue is real.** 41% of consumers experience it (Sunori, 2025). Our response:

- Annual plan at 2 months free (16% discount)
- Lifetime option if we reach product maturity
- Pro features feel like natural upgrades, not unlocks

---

## TIER STRUCTURE

### Free — "Starter House"

**Who it's for:** A flatmate group testing the product for the first time.
**Limits:** 1 house, 6 members, 5 vault items, 1 chat thread (General only), no PDF export, no SMS reminders.
**Goal:** Convert to Pro within 30 days as the house grows.

### Pro — "Homy+" (per house/month)

**Who it's for:** An active shared household that has outgrown the free tier.
**Unlocks:** Unlimited members, unlimited vault items, all chat threads, bill splitting, PDF exports, SMS reminders, polls, announcements.

| Market     | Monthly  | Annual (equiv/mo)       |
| ---------- | -------- | ----------------------- |
| Bangladesh | BDT 199  | BDT 166 (BDT 1,990/yr)  |
| Pakistan   | PKR 800  | PKR 667 (PKR 8,000/yr)  |
| India      | INR 149  | INR 124 (INR 1,490/yr)  |
| UK         | £3.99    | £3.32 (£39.99/yr)       |
| Australia  | AUD 5.99 | AUD 4.99 (AUD 59.99/yr) |
| US/EU      | USD 4.99 | USD 4.16 (USD 49.99/yr) |

### Manager Pro — (per manager/month)

**Who it's for:** A landlord or property manager running multiple properties.
**Unlocks:** Manage up to 10 houses, portfolio dashboard, bulk reminders, Manager Pro badge, branded PDF invoices, WhatsApp integration.

| Market     | Monthly   | Annual (equiv/mo) |
| ---------- | --------- | ----------------- |
| Bangladesh | BDT 499   | BDT 416           |
| Pakistan   | PKR 2,000 | PKR 1,667         |
| India      | INR 399   | INR 332           |
| UK         | £9.99     | £8.32             |
| Australia  | AUD 14.99 | AUD 12.49         |
| US/EU      | USD 11.99 | USD 9.99          |

**Student discount:** 50% off Pro with valid .edu email address.

---

## REVENUE STREAMS (RANKED BY NEAR-TERM POTENTIAL)

### 1. Pro Subscriptions (Primary)

**Timeline:** Phase 2 (Month 3–6)
**Implementation:** Stripe for international, local payment gateways for BD/PK/IN
**Revenue model:** Recurring monthly/annual per house
**Key metric:** Houses on Pro plan
**Target:** 100 paying houses by Month 12 = ~BDT 20,000/month

### 2. Manager Pro Subscriptions

**Timeline:** Phase 4 (Month 6–12)
**Implementation:** Same Stripe + local gateways
**Revenue model:** Recurring per manager account
**Key metric:** Manager Pro subscribers
**Target:** 20 Manager Pro users = ~BDT 10,000/month additional

### 3. Local Payment Integration (Transaction Fees)

**Timeline:** Phase 4
**Implementation:** bKash merchant API, Nagad API, JazzCash, UPI
**Revenue model:** 0.5–1% transaction fee when rent is collected in-app
**Why it works:** Manager collects rent through Homy → fee is invisible to payer
**Target:** 50 houses using in-app collection at avg BDT 8,000/month rent = ~BDT 2,000–4,000/month

### 4. Local Services Marketplace

**Timeline:** Phase 4–5
**Implementation:** Directory of local service providers (plumbers, electricians, AC technicians, cleaners)
**Revenue model:** 10–20% commission per booking
**Why it works:** Trust problem solved — providers are vetted and rated
**Launch:** Dhaka first, then Karachi, then Bangalore
**Target:** 10 bookings/month at avg BDT 1,500 service = BDT 1,500–3,000/month commission

### 5. Grocery & Shopping Affiliates

**Timeline:** Phase 3–4
**Implementation:** Affiliate links from grocery list to Chaldal, Meena Click (BD), Daraz
**Revenue model:** 1–5% affiliate commission per order
**Why it works:** User is already on the grocery list, one tap to order
**Target:** Modest — BDT 500–2,000/month supplementary

### 6. Enterprise / Co-living SaaS

**Timeline:** Year 2+
**Implementation:** White-label Homy for 50–500 room operators
**Revenue model:** Per-unit SaaS pricing (BDT 50–100/unit/month)
**Why it works:** The pain at scale is even worse; operators need this more than individuals
**Target:** 2–3 enterprise clients = BDT 50,000–200,000/month

---

## ANTI-DARK PATTERN COMMITMENTS

These are non-negotiable. Breaking them destroys trust and word-of-mouth.

1. **No fake urgency.** No countdown timers on pricing. No "only 3 spots left."
2. **Free tier is genuinely useful.** A house of 4–6 people can run on free forever if they want.
3. **No pop-up upsell ads.** Upgrades are suggested contextually (e.g., "You've reached 5 vault items — upgrade to Pro for unlimited").
4. **No dark patterns on cancellation.** One-click cancel. No "are you sure?" loops.
5. **No ads.** Ever. In Homy products. Data is never sold.
6. **Price in local currency.** No converting USD to BDT at market rate — that's predatory.

---

## UPGRADE TRIGGER DESIGN

When and how to prompt upgrades — contextual only, never nagging.

| Trigger                            | What to show                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| User reaches 5th vault item        | "You've used 5/5 free vault items. Upgrade for unlimited."                            |
| Manager tries to invite 7th member | "Free plan supports 6 members. Upgrade to add more."                                  |
| Member tries to create 2nd thread  | "Free plan includes 1 chat channel (General). Upgrade for more."                      |
| PDF export button on ledger        | "PDF export is a Pro feature. Upgrade to download."                                   |
| Manager has been active 2 weeks    | Soft prompt: "Running a good house? Homy Pro gives you reminders, exports, and more." |
| Bill splitting page                | If on free: show the feature behind a Pro badge, explain value                        |

---

## GROWTH MODEL

### Acquisition

Primary: **invite-driven virality**

- Manager creates house → invites 3–5 members
- Each member is a potential future manager (when they get their own flat)
- Network effect: every house using Homy is an ad for Homy to the members

Secondary: **community seeding**

- Facebook groups: "Dhaka Flat Share", "Bashundhara Residents", BUET/NSU/DU groups
- Pakistan: Twitter/X urban tech community, LUMS/IBA student networks
- India: LinkedIn for urban professionals, PG/hostel owner communities

Content:

- "How to manage a flathouse without fighting" — SEO blog
- "The rent conversation you dread" — emotional social content
- Short-form video: before/after Homy household

### Retention

**Stickiness levers (in order of power):**

1. Rent ledger — manager checks it every month regardless
2. Vault — WiFi password is there; members come back for it
3. Tasks — assigned tasks create daily engagement
4. Grocery list — most frequent touchpoint (multiple times/week)
5. Chat — replaces house WhatsApp group over time

**Habit formation:**

- Rent reminder → manager action → member sees paid status → habit loop formed
- Weekly digest email: "This week: 3 tasks done, rent due in 5 days"

### Expansion

- Each Pro house = potential Manager Pro upgrade when they get a second property
- Each member = potential new manager at their next flat
- Each country launch multiplies total addressable market

---

## UNIT ECONOMICS (TARGETS)

```
ARPU (Pro, Bangladesh):    BDT 199/month
ARPU (Pro, UK):            £3.99/month
Churn target:              < 5%/month (less than 1 house in 20 leaves each month)
CAC (organic):             ~BDT 0 (invite-driven)
CAC (paid):                < BDT 500 per paying house
Payback period (organic):  Month 1 (revenue from day 1 of Pro)
LTV (Pro, BD, 12mo avg):   BDT 199 × 12 = BDT 2,388

LTV:CAC ratio target:      > 3:1
```

---

## COMPETITIVE PRICING NOTES

- **Splitwise Pro:** USD 3.99/month — only bill splitting, no tasks/vault/chat
- **TenantCloud:** USD 15–50/month — landlord-only, too complex for flatmates
- **RentRedi:** USD 12/month — US-only effectively, no local payment methods
- **Platuni:** ~USD 3/month — closest competitor but no South Asia presence

**Our position:** Same or lower price than Splitwise, 10x more features for the household use case, built for markets they ignore.

---

_Revenue is a result of value delivered. Build the value first._
