# Pola (පොළ) — Part 2: Wallets, Payments, Quality Grading, Filters & Supporting Systems

> **Companion to Part 1** (`pola-system-specification.md`). Part 1 covers the four portals and the overall system; this document is the implementation-level deep-dive on money movement, quality control, and every filter set, plus the remaining items from Part 1 §17. Same rules apply: no UI layout, no code — data, states, and workflows only.

---

## 1. Payment & Escrow Architecture (the model everything else sits on)

A practical constraint shapes this whole section: **PayHere (and every other Sri Lankan gateway realistically available to a student project) settles into a single merchant bank account — yours, i.e. Pola's — not into many individual farmer/delivery sub-accounts.** There is no free "marketplace split-payment" API available at this scale. So Pola has to do the splitting itself, internally, as ledger entries. This is exactly how Ninjacart, DeHaat, and Twiga all started, too — the "platform-as-escrow" model, not real-time bank-to-bank splitting.

**The flow, end to end:**

1. A customer pays for an order — either straight through PayHere (card/bank/mobile wallet) or from their Pola wallet balance (§2).
2. That money lands in **Pola's own PayHere-linked bank account**. Inside the app, it's recorded as **Escrow Held** against that specific order — not yet anyone's money to withdraw.
3. As the order moves through the lifecycle (Part 1 §4), quality grading (§3 below) and reconciliation (§4 below) may adjust the final payable amount.
4. When the order reaches **Completed**, the escrow is released and split automatically: a farmer-wallet credit (sale amount, minus platform commission, minus Village Collector commission if applicable), a delivery-wallet credit (per the payout formula for whichever leg(s) that partner ran), and the remainder recorded as **platform revenue** (an internal ledger, not a user-facing wallet).
5. If an order is cancelled or refunded before completion, the held escrow reverses to the customer — to their **wallet balance** by default (instant), with reversal to the original card/bank as a slower fallback path PayHere itself supports.

**Order payment states:** `Pending` → `Authorized/Held (Escrow)` → `Released & Split` (normal completion) — with `Refunded` / `Partially Refunded` as branches reachable any time before release.

---

## 2. Wallet System — Farmer, Delivery, Customer

Every one of the three roles gets the same underlying wallet object; only how it's typically *used* differs.

| Role | Typical top-up use | Typical cash-out use |
|---|---|---|
| Customer | Top up once via card/bank/mobile-wallet through PayHere, then check out repeatedly from the wallet balance without re-entering payment details each time; refunds land here instantly | Rare — mainly withdrawing an unused balance back out if they stop using the app |
| Farmer | Rare — wallet is normally *credited* by completed sales, not funded by the farmer | Regular — this is their income; they'll want to cash out often, ideally in small fast batches rather than waiting on a single large transfer |
| Delivery Partner | Rare, same reasoning as Farmer | Regular — individuals per trip, companies as part of their monthly settlement |

### 2.1 What a wallet actually is

An in-app ledger balance, not a separate bank account or e-money license. It represents money Pola is already holding in its own settlement account on that user's behalf. This distinction matters for how you describe the system in your diploma writeup — you are *not* building a licensed digital wallet product (that requires Central Bank authorization); you're building an **internal balance/escrow ledger**, the same pattern Amazon Pay balance or a store-credit system uses.

### 2.2 Balance components

- **Available balance** — can be spent (customer) or withdrawn (farmer/delivery) right now.
- **Pending balance** — money tied to an order that hasn't reached `Completed` yet (e.g., a farmer's sale proceeds while the order is still `Out for Delivery`). Shown separately so farmers/delivery partners can see money "on the way" without mistaking it for cash-out-ready funds.

### 2.3 Top-up mechanism

Customer selects an amount → redirected to PayHere (or pays via a saved mobile wallet method PayHere already supports: Genie, Frimi, eZ Cash, mCash, or card/internet banking) → on successful webhook confirmation, `Available balance` increases by that amount and a `Top-Up` ledger entry is written. Top-up is optional at every checkout — a customer can always just pay the gateway directly per order instead if they don't want to hold a balance.

### 2.4 Withdrawal / cash-out mechanism

1. User requests a withdrawal: amount (≤ Available balance, ≥ an admin-configurable minimum, e.g. LKR 500) and destination — their **saved payout bank account** from onboarding (Part 1 §5.2/§7.2).
2. Request enters a **Withdrawal Queue** visible to Finance Admin (Part 1 §8.1).
3. Because there's no free automated payout rail at this scale, Finance Admin executes the actual transfer manually (online banking / LankaPay), then marks the request **Processed** with a bank reference number and timestamp. The system decrements `Available balance` only at this point — not at request time — so the ledger always matches real money actually moved.
4. Small withdrawals below a configurable threshold can be auto-approved into a **daily or weekly batch** so Finance Admin processes many at once rather than one at a time; larger amounts route for individual review.
5. **Flag honestly in your documentation:** at production scale beyond a diploma project, this step would be replaced by a licensed payment aggregator's mass-payout/disbursement API or a bank's bulk-transfer service — both require business registration and a commercial agreement, which is out of reach for a student build. Manual, admin-mediated withdrawal is the correct MVP design, not a shortcut to apologize for.
6. Mobile-money cash-out (eZ Cash/Genie/etc.) isn't used for withdrawals even though PayHere accepts them for top-ups — PayHere's mobile-wallet support is inbound-only, so bank transfer is the one realistic withdrawal rail.

### 2.5 Ledger / transaction types

| Type | Applies to | Effect on balance |
|---|---|---|
| Top-Up | Any, mainly Customer | + Available |
| Order Payment (from wallet) | Customer | − Available |
| Order Payment (direct gateway) | Customer | none — goes straight to escrow, wallet untouched |
| Sale Proceeds (order completed) | Farmer | + Available (moves from Pending once order hits `Completed`) |
| Collector Commission | Village Collector | + Available |
| Trip Payout | Delivery | + Available (Pending until trip/leg confirmed complete) |
| Refund to Wallet | Customer | + Available |
| Withdrawal | Any | − Available, only on admin-confirmed `Processed` |
| Admin Adjustment | Any | +/− Available, requires a logged reason and admin ID (feeds the audit trail, §14) |

### 2.6 Safeguards

- Balance can never go negative — enforced at the transaction-write level.
- Every entry is **append-only**; the balance shown is always a computed sum of the ledger, never a value edited in place. This is what makes the wallet auditable.
- Withdrawals require a verified payout bank account already on file.
- Optional but recommended: admin-configurable daily/monthly withdrawal caps per role as a basic safeguard against a compromised account being drained instantly.

---

## 3. Quality Grading Mechanism

### 3.1 Grade scale

**Grade A (Premium) · Grade B (Standard) · Grade C (Below Standard) · Rejected**

### 3.2 Where grading happens

Two checkpoints, not one:
- **Hub Collection** (primary) — logged by the Village Collector or the Leg-1 delivery partner at pickup.
- **Distribution Center Intake** (confirmatory) — re-checked by center staff on arrival. A center-level downgrade (e.g., transit damage) should be possible even if the hub grade was higher; an upgrade should not be, to avoid gaming the system.

### 3.3 What's recorded per grading event

Order/listing reference · grader identity and role · grade assigned · confirmed weight/count (feeds §4) · free-text criteria notes · at least one photo (**mandatory** for Grade C or Rejected, recommended for A/B) · timestamp.

### 3.4 Grading criteria

Kept deliberately generic here rather than prescribing crop-specific agricultural science — that's a call for your polytechnic's agriculture-department advisors, not something to hardcode from a spec document. The platform should ship with an **Admin-editable checklist per product category**, built around these general dimensions:

- Visual condition — colour, uniformity, visible damage/bruising percentage, foreign matter
- Freshness indicators — wilting, moisture; for dairy specifically, **temperature at pickup** should be logged given spoilage risk
- Size/weight consistency against the stated unit

### 3.5 Price impact

An Admin-configurable multiplier per grade, applied per line item so both the customer's final charge and the farmer's payout reflect the *confirmed* grade rather than the farmer's self-declared one. Suggested starting defaults (tune per category as real data comes in): A = 100% of listed price, B = 90%, C = 75%, Rejected = 0%.

### 3.6 Rejected-goods handling

Requires a reason code (spoiled, wrong item, under-weight beyond tolerance, pest damage, contamination) and a disposition (discard at hub/center, return to farmer where feasible, donate). Feeds directly into Wastage Tracking, §5.

### 3.7 Farmer dispute window

The farmer is notified immediately — grade, reason, and photo — and has an admin-configurable window (e.g. 24 hours) to contest it before payout finalizes. A contested grade routes to Admin adjudication (Part 1 §8.3), comparing the hub/center photo evidence against the farmer's claim.

---

## 4. Weight & Quantity Reconciliation

- At hub collection, actual weight/count is logged against the listing's stated quantity.
- **Small variance** (within an admin-configurable tolerance, e.g. 5%): auto-resolved — the order simply adjusts to the actual collected amount; the customer is charged and the farmer is paid for what actually shipped, no manual step needed.
- **Large shortfall** that would break a B2B minimum order quantity: triggers a customer-facing choice — accept the partial quantity, cancel the shortfall portion, or (if configured) accept a substitute — logged as a **Reconciliation Case**.
- **Farmer disputes the recorded weight itself:** opens a **Reconciliation Dispute**, routed to Admin, weighed (so to speak) against the hub's photo/weight record.

---

## 5. Wastage / Rejection Tracking

Every rejected or discarded unit gets its own record: linked order/listing, quantity, reason code (spoiled, damaged, wrong item, contamination, below-Grade-C, expired in transit), the stage it was caught at (hub / distribution center / post-delivery customer complaint), and disposition (discarded, returned to farmer, donated). This rolls up into a new **Wastage Report** (add to the Part 1 §12 report table, Admin Portal, Excel, monthly) — useful both for coaching individual farmers on recurring rejection reasons and for spotting which hub or center has an unusually high rejection rate.

---

## 6. Commission & Payout Engine

All of the following are **Admin-configurable and versioned** — changing a rate must never rewrite historical payouts, so every order stores the exact rate that applied to it at completion time, not a live lookup:

- Platform commission % (optionally variable by product category)
- Village Collector commission % (a sensible default, with a per-Collector override)
- Delivery Leg-1 payout formula (flat fee + a per-kg or per-km component)
- Delivery Leg-2 payout formula (flat fee + distance component, optionally weight-tiered)
- Grade-based price multipliers (§3.5)

The split calculation runs automatically the moment an order reaches `Completed`, reading the rate snapshot stored on that order.

---

## 7. B2B Pricing Tiers & Minimum Order Quantity

A listing can optionally define tiered pricing — e.g. 1–49 units at the listed price, 50–199 at a reduced per-unit rate, 200+ at a further reduced rate. Admin can cap how steep a discount tier is allowed to go, to protect farmer margins from being undercut by inexperienced sellers. MOQ is enforced at cart level wherever a listing specifies one; ordinary B2C buyers simply transact at the base tier and never see MOQ friction.

---

## 8. Crop Pre-Booking / Advance Listings

A distinct listing type, **Pre-Order**, created ahead of harvest: expected harvest/availability date, estimated quantity range, price, and an optional deposit percentage to reserve. B2B buyers place a Pre-Order like a normal order, but payment can split into deposit-now / balance-on-fulfillment (or full payment upfront, Admin-configurable per listing). As the harvest date nears, the farmer confirms actual quantity; any shortfall against the pre-booked amount follows the same Reconciliation flow as §4.

---

## 9. Two-Way Ratings

Independent rating pairs, each tied to one specific completed order (one rating per party per order — no repeat spam):

- Customer → Farmer/Product
- Customer → Delivery Partner
- Farmer/Collector → Customer (was the buyer's order reliable at the hub/handoff stage)
- Delivery → Customer (was someone available to receive at drop-off)
- Delivery → Farmer/Collector (was the hub pickup ready and accurate)

Each is 1–5 stars plus an optional comment. Aggregate scores feed the Customer Portal's farmer-rating filter (§18.1) and can optionally weight which delivery partners see an order first.

---

## 10. Seasonal Awareness (Maha / Yala)

Listings can carry an optional season tag — **Maha** (main season, roughly Sept/Oct–March) or **Yala** (roughly April/May–August) — set by the farmer or defaulted by product category via an Admin-maintained mapping. Used for a customer-facing "in season now" filter/badge (§18.1) and for Admin reports that segment volume and price by season rather than only by calendar month.

---

## 11. KYC Document Sets, Consolidated

| Role | Required documents |
|---|---|
| Independent Farmer | NIC (front/back) |
| Village Collector | NIC, plus a brief village-endorsement/reference field — they're acting as a trust proxy for others, so this matters more than for an ordinary farmer |
| Delivery — Individual | NIC, driving license, vehicle registration, insurance, revenue license |
| Delivery — Company | Business registration certificate, each vehicle's own registration/insurance/revenue license, authorized contact person's NIC |
| Customer — B2B | Business registration certificate |
| Customer — B2C | None beyond identity at sign-up — keep this frictionless |

---

## 12. Standardized Units

A fixed, farmer-selectable list — not free text — so listings are actually comparable across sellers: **kg, g, litre, ml, dozen, bundle, piece.**

---

## 13. Tax / Invoice Generation

Every completed order auto-generates a structured invoice: sequential invoice number, order/customer/farmer(s) details, line items at grade-adjusted pricing, delivery fee, a visible commission line (B2B accounting teams want this transparency), total, and payment method/reference. No VAT calculation logic is needed initially — Sri Lankan VAT registration thresholds and small-farmer exemptions are a business/legal decision for later, not something to hardcode now — but leave a placeholder tax field on the invoice structure so it can be switched on without redesigning the document later.

---

## 14. Admin Audit Trail

Every state-changing admin action — verifying or rejecting a user, processing a refund, adjudicating a dispute, adjusting a wallet (§2.5), changing a commission rate (§6) — writes an **immutable** log entry: admin ID, action, target entity, before/after values where relevant, timestamp, optional reason note. Read-only to admins; never editable, even by a Super Admin — corrections happen via a new offsetting entry, not by editing history.

---

## 15. Support Ticketing System

Raised from any portal: category (payment, order, account, delivery, other), an optional linked entity (order ID, listing ID, etc.), description, attachments. States: `Open` → `In Progress` → `Waiting on User` → `Resolved` → `Closed`. Routes first to Support Admin (Part 1 §8.1), escalating to Finance or Operations Admin depending on category.

---

## 16. Content Moderation Queue

New or edited listing photos/descriptions can be auto-flagged (missing photo, a suspicious duplicate image reused across many farmers, flagged keywords) or user-reported. In the Admin queue: approve, request changes (returned to the farmer with a note), or remove. A flagged-but-unreviewed listing should stay **visible but marked**, not auto-hidden, unless the flag is severe — an honest farmer shouldn't lose sales to a false positive while it's waiting in the queue.

---

## 17. Notification Preference Center

A per-user matrix of event type × channel (email / in-app) × on-off. Transactional events — payment, order status, verification result, payout processed — default ON on both channels and can't be fully silenced (a user can drop to in-app-only, never to nothing); promotional/announcement notifications default optional and can be switched off entirely.

---

## 18. Filters — Full Specification by Portal

This was called out as a must-have, so here is the complete set for each portal, not just the customer-facing one.

### 18.1 Customer Portal

**Marketplace browse/search filters:**

| Filter | Function |
|---|---|
| Category / sub-category | Narrow to vegetable, fruit, dairy, grain, spice, other, and their varieties |
| Price range | Min–max slider or input on price per unit |
| Unit | Restrict to listings sold in a specific unit (kg, litre, dozen, etc.) |
| Organic | Yes/no toggle |
| Quality grade | Show listings whose recent grading history sits at or above a chosen grade (new/ungraded listings shown separately, not hidden) |
| Farmer rating | Minimum star threshold, pulled from §9 |
| Delivery availability | Show only listings whose distribution center actually covers the customer's saved address |
| In stock only | Excludes zero-quantity listings |
| MOQ fits my need | For B2B — hide listings whose minimum order quantity exceeds what the buyer wants |
| In season now | Uses the §10 season tag |
| Pre-order available | Surfaces §8 advance listings separately from ready-to-ship stock |

**Sort options:** price low→high / high→low, newest listed, highest-rated farmer, delivery speed/distance, best match (default).

**Order history filters:** status (any Part 1 §4 state), date range, farmer, amount range.

### 18.2 Farmer Portal

| View | Filters |
|---|---|
| My Products | Status (Draft/Pending/Active/Out of Stock/Inactive), category, low-stock threshold, grade history |
| My Orders/Sales | Status, date range, buyer type (B2B/B2C), product, distribution center |
| Managed Farmers *(Collector accounts)* | Verification status, village/hub, activity level |
| Earnings | Date range, payout status (pending/withdrawn), transaction type (§2.5) |

### 18.3 Delivery Portal

| View | Filters |
|---|---|
| Available Orders (Leg 2) | Distance from home base, vehicle-type match, minimum payout amount, pickup distribution center, cold-chain required (matched against the partner's own vehicle capability), order weight/size |
| Hub Schedule (Leg 1) | Date range, hub |
| Trip History | Date range, leg type (1 or 2), status, earnings range |
| My Vehicles | Status, type |

### 18.4 Admin Portal

| View | Filters |
|---|---|
| Users | Role, verification status, province/district, active/suspended, join-date range |
| Orders | Status, date range, distribution center, has-dispute flag, payment method |
| Farmers | Verification status, independent vs. collector-managed, region |
| Delivery Partners | Individual vs. company, vehicle type, verification status, rating range |
| Disputes/Tickets | Status, category, date range, assigned admin |
| Reports (all 15, Part 1 §12 + Wastage Report §5 here) | Date range, region/distribution center, category — applied consistently across every report so admin reporting stays uniform |

---

## 19. Updated Build-Order Note

This slots into the Part 1 §18 checklist as follows: build the **Wallet + Escrow ledger** before wiring up Order payment status (everything downstream depends on it) · build **Quality Grading** as part of the hub-collection flow, not bolted on afterward · build each portal's **filters alongside its list views**, since retrofitting filters onto an already-built list screen is far more rework than designing the query support in from the start.
