# Pola (පොළ) — System & Functional Specification

**A B2B/B2C Agricultural Marketplace for Sri Lanka**

> **Scope note:** This document describes *what the system must do* — roles, data, rules, flows, and reports — not how it should look. There is no UI layout, wireframe, or code in this file, so it can be handed to an AI coding assistant (or a human dev) as a functional brief while you drive the actual implementation conversation-by-conversation ("vibe coding"). Every section is written to be buildable directly on the MERN stack you specified.

---

## 1. Concept Summary & Real-World Grounding

Pola digitizes a supply chain that already exists physically in Sri Lanka: farmers → village-level collection → a wholesale/distribution point → end buyers. Rather than inventing this from scratch, the design below borrows deliberately from models that are already proven, in Sri Lanka and elsewhere:

| Real-world reference | What it proves | What Pola borrows |
|---|---|---|
| **Dambulla Dedicated Economic Centre (DDEC)** and Sri Lanka's wider network of "Dedicated Economic Centers" (Meegoda, Veyangoda, Keppetipola, Thambuttegama, Norochcholai, etc.) | Sri Lanka already runs a two-tier wholesale system: "producing-area" centers near farms and "consuming-area" centers near cities. DDEC alone draws stock from roughly 15 of the 25 districts. | The exact structure of your **Village Hub → Distribution Center** flow. Pola's distribution centers should function as *digitized, farmer-traceable* versions of these DECs, not a new invention. |
| **DeHaat (India)** | Built a network of local "micro-entrepreneurs" who onboard and transact on behalf of farmers who can't use the app themselves — a phygital (physical + digital) trust layer. | This is functionally identical to your **Village Collector** role. Treat the Collector as Pola's phygital trust layer, not just a data-entry clerk. |
| **Ninjacart (India)** | Runs on predictive logistics and route optimization between farm-side collection points and retail-side demand. | The reasoning behind the **radius-based order visibility** for delivery partners on the distribution-center-to-customer leg. |
| **Twiga Foods (Kenya)** | Started "asset-heavy" (owned trucks and farms), then pivoted to an "asset-light/hybrid" model — its own core team plus third-party distributors and vehicle owners. | Justifies your **individual vs. company delivery partner** split — don't force Pola to own a fleet; let it orchestrate a mixed one, exactly as Twiga does now. |
| **Amazon / AliExpress / Alibaba** | Proven customer-facing marketplace patterns: seller storefronts, ratings, order tracking, messaging. | The **Customer Portal** browsing/ordering/tracking experience. |
| **Agrithmics (Dialog-backed, Sri Lanka)** | Solved a very real local problem: smallholder tea farmers were waiting **30–40 days** to get paid through traditional channels; digitizing procurement cut that to near-instant. | This is a strong argument for adding a **farmer wallet with a fast, defined payout cycle** to Pola (flagged as a missing piece in §17) — it's the single feature most likely to make farmers trust the app. |
| **ApeGamen (Sri Lanka, farm-to-consumer)** | Already prices delivery by *village proximity* and markets itself on "no middlemen." | Validates that your village-hub-radius thinking is aligned with what's already working locally — Pola's differentiator over it is the **B2B side, the distribution-center tier, and formal quality inspection**, which ApeGamen doesn't have. |
| **Asvanu.lk / Faggro (Sri Lanka)** | Simple free-listing farmer marketplaces, some with "pre-booking before harvest." | Confirms demand exists for farmer-side listing tools; the crop **pre-booking concept** is worth adding for your B2B buyers (see §17). |

**Bottom line:** your instinct — village hub, distribution center, split delivery roles, collector-managed accounts — is not a guess. It mirrors what already works in comparable markets. The gaps worth closing are mostly around **money movement speed, quality/weight reconciliation, and two-way trust (ratings)** — all detailed below.

---

## 2. System Overview — The Four Portals

| Portal | Primary users | Core purpose |
|---|---|---|
| **Farmer Portal** | Independent farmers, industrial/large farms, Village Collectors (on behalf of small farmers) | List farms and produce, manage stock, track sales, get paid |
| **Customer Portal** | B2C individuals, B2B buyers (supermarkets, hotels, restaurants, retailers) | Browse, order, track, pay, rate, communicate |
| **Delivery Portal** | Individual delivery partners, delivery companies (fleet owners) | Fulfill the two-leg delivery model, manage vehicles, get paid |
| **Admin Portal** | Platform staff (tiered admins) | Verify users, oversee orders/disputes, configure the platform, report |

All four portals share one backend and one MongoDB Atlas cluster, with role-based access separating what each portal's users can see and do.

---

## 3. Geography & Logistics Network

### 3.1 Administrative reference data (needed for every address form)

Sri Lanka has **9 provinces** and **25 districts**, and a district belongs to exactly one province — so a District dropdown can auto-fill/lock its Province. Use this as static, seeded reference data (not something admins edit):

| Province | Districts |
|---|---|
| Western | Colombo, Gampaha, Kalutara |
| Central | Kandy, Matale, Nuwara Eliya |
| Southern | Galle, Matara, Hambantota |
| Northern | Jaffna, Kilinochchi, Mannar, Vavuniya, Mullaitivu |
| Eastern | Trincomalee, Batticaloa, Ampara |
| North Western | Kurunegala, Puttalam |
| North Central | Anuradhapura, Polonnaruwa |
| Uva | Badulla, Monaragala |
| Sabaragamuwa | Ratnapura, Kegalle |

Below district, Sri Lanka has ~331 DS (Divisional Secretariat) Divisions and ~14,000 GN (Grama Niladhari) Divisions. That's too granular to make mandatory for an MVP — see §11 for the recommended address structure (Province + District as mandatory dropdowns, everything below that as free text).

### 3.2 The Village Hub

- One hub serves a cluster of nearby villages, not necessarily one hub per village.
- Each hub has a **recurring collection schedule** (e.g., "every Tuesday and Friday, 6–9 AM") set by Admin or the assigned Village Collector.
- On a collection day, farmers (or their Collector) bring produce to the hub, where the assigned Delivery Partner (Leg 1, see §7.4) and/or Collector record: **actual weight, item count, and a quality grade** — this is the first point where "what the farmer listed" and "what actually showed up" get reconciled (see §17 for why this matters).
- A hub record should track: hub name/code, serving villages (list), assigned Village Collector(s), assigned Leg-1 delivery partner, linked distribution center, collection schedule, GPS location.

### 3.3 Distribution Centers — recommended locations and why

You asked for 3–4 locations, one being the main hub. Rather than picking arbitrary cities, here are four grounded in Sri Lanka's real wholesale-produce geography and road network:

| Center | Role | Why this location |
|---|---|---|
| **Dambulla** (Central Province) | **Main Hub** | This is where Sri Lanka's actual largest wholesale produce market already sits — the Dambulla Dedicated Economic Centre draws roughly 88% of its weekly stock from six districts (Nuwara Eliya, Anuradhapura, Matale, Kurunegala, Kandy, Colombo) and independent efficiency research on Sri Lanka's Dedicated Economic Centers ranks Dambulla highest. It sits at the crossroads of the A6 (Ambepussa–Trincomalee) and A9 (Kandy–Jaffna) highways, and the under-construction Central Expressway (E04) is planned to terminate here — meaning Dambulla's road connectivity will only improve. Geographically it's near the island's center, minimizing average distance to every other proposed center. |
| **Meegoda / Peliyagoda area** (Colombo/Gampaha, Western Province) | **Western consumer hub** | This mirrors the real "consuming-area" Dedicated Economic Centers (Meegoda, Peliyagoda, Welisara, Narahenpita all already exist for this purpose). It's the closest center to your densest concentration of B2B buyers — supermarket chains, hotels, and the largest B2C population — and sits near the Outer Circular Highway (E02), the Southern Expressway (E01) terminus at Kottawa, and the Colombo–Katunayake Expressway (E03), giving fast last-mile reach across the whole Western Province. |
| **Matara** (Southern Province) | **Southern hub** | The Southern Expressway (E01) now runs all the way from Kottawa to Mattala, so a Matara center is fully expressway-connected to both Colombo and the far south. This hub is specifically valuable for your **hotel B2B segment** — the Galle–Matara–Tangalle–Hambantota coastal belt is Sri Lanka's densest tourist-hotel corridor, and it can pull inland produce from the Ratnapura/Embilipitiya agricultural belt as a feeder. |
| **Anuradhapura** (North Central Province) | **Northern hub** | North Central is one of Sri Lanka's grain and produce baskets (it already supplies Dambulla directly) and sits on the A9, the main road toward Jaffna and the Northern Province. Placing a center here — rather than skipping the north entirely — gives Pola national coverage and access to a still-underserved market, instead of only optimizing for the already-crowded south-west. |

**Distribution center responsibilities:** receive goods arriving from village hubs, re-inspect (a second quality/weight check), sort and re-bundle by customer order, and hand off to Leg-2 delivery partners. Each center record should store: name/code, address (see §11), coverage radius or list of hubs it serves, capacity notes (e.g., cold storage available), and operating hours.

---

## 4. The Core Order & Listing Lifecycle

Define this once and reuse it everywhere — every portal's dashboard, tracking screen, and report should reference these exact states.

**Product listing states:** Draft → Pending Verification *(new/unverified farmer only)* → Active → Out of Stock → Inactive/Delisted

**Order states:**
1. Placed (customer checked out)
2. Payment Confirmed
3. Awaiting Hub Collection
4. Collected at Hub *(weight & quality confirmed against listing)*
5. In Transit to Distribution Center
6. Received & Sorted at Distribution Center
7. Assigned for Last-Mile Delivery
8. Out for Delivery
9. Delivered
10. Completed *(customer has confirmed/rated, payout released to farmer & delivery partner)*

**Exception branches**, reachable from most of the states above: Cancelled (before collection), Rejected at Quality Check (partial or full), Disputed, Refunded, Returned.

---

## 5. Farmer Portal

### 5.1 Account types

- **Independent Farmer** — self-managed account. Recommended for tech-comfortable farmers or industrial/commercial farms.
- **Collector-Managed Farmer** — a sub-profile created and operated by a Village Collector on the farmer's behalf. The farmer is still a distinct record (own NIC, own payout account) but doesn't log in themselves; the Collector acts as their agent.
- **Village Collector** — a special account type. A Collector can *also* be a farmer in their own right (their own farm + managed farmers under one login).

### 5.2 Farmer profile fields

Full name · NIC (old or new format, see §11) · date of birth · gender · phone (SL mobile format) · email · profile photo · one or more addresses (home, and separately, farm addresses under §5.3) · bank account details for payout (bank name, branch, account number, account holder name) · preferred language (English/Sinhala/Tamil) · verification status · linked Village Collector (if collector-managed) · linked managed farmers (if a Collector).

### 5.3 Farm management (a farmer can register multiple farms)

Per farm: farm name/label · address (Province, District, and free-text detail per §11) · extent (in acres or perches) · ownership type (owned/leased) · primary crop types grown · irrigation type (rain-fed/irrigated) · organic certification status (yes/no, with document upload if yes) · GPS pin.

### 5.4 Product / crop listings

Per listing: product name · category (vegetable, fruit, dairy, grain, spice, other) · variety · unit of sale (kg, g, litre, dozen, bundle — standardized list, see §17) · price per unit · available quantity · harvest/availability date · self-declared quality grade (to be reconciled at hub inspection) · one or more photos · organic flag · minimum order quantity (relevant for B2B buyers) · perishability flag (routes it toward cold-chain-capable vehicles in §7.3) · linked farm.

### 5.5 Village Collector–specific functions

Add and manage farmers under them (a lighter-weight onboarding designed for low-tech users, filled in by the Collector) · list/edit products on behalf of managed farmers · view their own commission earned per transaction · view their hub's collection schedule · record an aggregated hub drop-off covering multiple farmers' produce in one submission.

### 5.6 Farmer navigation needs

Dashboard/home · My Products · My Farms · Orders/Sales · Earnings & Payouts · Managed Farmers *(Collector accounts only)* · Messages · Profile/Settings (includes language and dark/light mode) · Help/Support.

### 5.7 Farmer reports

| Report | Format(s) | Frequency | Key fields |
|---|---|---|---|
| Income Report | PDF, Excel | Monthly & Annual | Itemized sales by crop, quantity sold, gross revenue, platform commission deducted, collector commission deducted (if applicable), net payout, per period |
| Hub Collection Report | PDF | Per collection day | Quantity delivered vs. quantity accepted vs. rejected (with reasons), weight discrepancy vs. what was listed |
| Collector Commission Report | Excel | Monthly | Per managed farmer, transactions, commission earned, total |

---

## 6. Customer Portal

### 6.1 Account types

- **B2C** — individual household buyer.
- **B2B** — registered business (supermarket, hotel, restaurant, retailer). Needs extra fields: business name, business registration number, business type, and the ability to hold a billing address separate from one or more delivery addresses (a hotel chain may need several drop points).

### 6.2 Customer profile fields

Name · phone · email · one or more labeled addresses · saved payment methods · preferred language.

### 6.3 Marketplace / browsing

Category browse and search · filters (price, distribution-center coverage area, organic, farmer rating, availability) · farmer storefront/profile view (bio, location, rating, other listings) · product detail view (photos, price, unit, farmer info, reviews).

### 6.4 Cart & checkout

A single cart/order can bundle products from **multiple farmers**, as long as they route through the same distribution center's coverage area · quantity adjustment respecting stock and minimum-order-quantity rules · delivery address selection · delivery slot/window selection · payment method selection · order summary showing item cost, delivery fee, and platform commission transparently.

### 6.5 Order tracking

A visible status timeline following the lifecycle in §4 · live ETA/map for the last-mile leg once a delivery partner is assigned · that delivery partner's contact details surfaced only once assigned (privacy-preserving).

### 6.6 Post-purchase actions

Rate & review — kept as **two separate ratings**: one for the farmer/product, one for the delivery partner · message the farmer (in-app chat) · message or call the delivery partner (in-app chat + click-to-call) · email support / request an invoice · reorder · initiate a dispute or return.

### 6.7 Customer reports

| Report | Format(s) | Frequency | Key fields |
|---|---|---|---|
| Order Detail / Invoice | PDF | Per order | Line items, quantities, unit prices, delivery fee, total, farmer(s), order status history |
| Monthly Purchase Summary | Excel | Monthly | Useful for B2B bookkeeping — totals by category, by farmer, by delivery |
| Spending by Category | PDF or Excel | On demand | Breakdown by product category over a selected period |

---

## 7. Delivery Portal

### 7.1 Account types

- **Individual Delivery Partner** — owns and drives their own vehicle.
- **Delivery Company** — a fleet owner managing multiple vehicles and, potentially, drivers who aren't the account owner.

### 7.2 Delivery partner profile fields

**Individual:** name · NIC · date of birth · phone · email · address · driving license number & expiry · profile photo · bank details for per-trip payout.
**Company:** business name · business registration number · contact person · business address · bank details for monthly settlement · list of drivers (if separate from the account owner).

### 7.3 Vehicle management (one or many vehicles per account)

Vehicle type (three-wheeler, mini-truck, lorry — small/medium/large, refrigerated truck, van, motorcycle for small parcels) · vehicle registration number (Sri Lankan format: 3 letters + 4 digits, e.g. *CAB-1234*; older/some commercial plates carry a leading 2-letter province code such as *WP*, which validation should accept but not require) · registration document upload · revenue license expiry · insurance policy number & expiry · load capacity · cold-storage capability (yes/no — matched against the perishability flag from §5.4) · assigned driver (company accounts) · status (active/in maintenance/inactive).

### 7.4 The two-leg delivery model

- **Leg 1 — Village Hub → Distribution Center.** A specific delivery partner is *assigned* to a given hub (a standing assignment, not a one-off bid), aligned to that hub's recurring collection schedule. Fields needed per trip: hub, scheduled date, expected load estimate, actual collected weight/items confirmed at the hub, condition notes.
- **Leg 2 — Distribution Center → Customer.** Open to *any* nearby delivery partner. Once an order reaches "Received & Sorted at Distribution Center," it becomes visible to delivery partners within a configurable radius. A partner can inspect the order (items, weight, distance, payout amount) and accept it. One partner can do both legs if they choose.

### 7.5 Radius / assignment mechanism (described functionally)

Each delivery partner sets a home-base location and a service radius. The system matches newly available Leg-2 orders against partners whose radius covers the pickup (distribution center) or drop-off (customer) point, and surfaces those orders in that partner's "Available Orders" queue. It's first-accept-wins, with a short claim window; if unclaimed after a configurable timeout, the system should broaden the radius automatically or flag it for Admin manual assignment.

### 7.6 Payment models

- **Individual partners:** paid **per completed trip** — a flat component plus a distance/weight-based component, released once delivery is confirmed.
- **Delivery companies:** paid via a **monthly aggregated settlement** across every completed trip run by their fleet, with a downloadable statement.

### 7.7 Delivery navigation needs

Dashboard · Available Orders (Leg 2) / Hub Schedule (Leg 1) · My Vehicles · Earnings/Settlements · Trip History · Messages · Profile/Settings.

### 7.8 Delivery reports

| Report | Format(s) | Frequency | Key fields |
|---|---|---|---|
| Trip/Earnings Statement | PDF, Excel | Per trip (individuals) / Monthly (companies) | Trips completed, distance, payout per trip, total |
| Vehicle Utilization Report | Excel | Monthly | Company only — trips per vehicle, idle time |

---

## 8. Admin Portal

### 8.1 Hierarchy

A single **Super Admin** is seeded at setup and can create or deactivate other admins; no admin can self-register. Consider (as an addition beyond what you described) splitting admin permissions into tiers — e.g., Super Admin, Operations Admin (verification + order oversight), Finance Admin (payouts, commission config), Support Admin (tickets/disputes) — so one compromised or careless admin account can't touch everything.

### 8.2 Verification queues

New Farmer/Collector verification (NIC document) · Delivery Partner verification (license, vehicle registration, insurance) · B2B Customer verification (business registration document).

### 8.3 Order & dispute oversight

Live monitoring of orders across every state in §4 · manual reassignment for stuck orders (e.g., no Leg-2 partner accepted in time) · refund processing · a dispute workflow that compares hub-inspection records against customer complaints (e.g., customer says quality was poor — admin checks the quality grade logged at hub inspection) · adjudicating quality-rejections.

### 8.4 Support

A support ticket inbox fed by all four portals · FAQ/help content management.

### 8.5 Platform configuration

Platform commission percentage · suggested/default Village Collector commission percentage · delivery payout formula (flat + variable components) · add/edit distribution centers · add/edit village hubs (including assigning a Collector and setting the collection schedule) · suspend/ban user accounts · a content-moderation queue for flagged listing photos or descriptions.

### 8.6 Admin reports

| Report | Format(s) | Frequency | Key fields |
|---|---|---|---|
| Platform Revenue Report | Excel | Monthly | Gross Merchandise Value, commission earned, breakdown by center |
| Delivery Partner Detail Report | PDF | On demand | Verification status, completed trips, ratings, active vehicles |
| Farmer Performance Report | Excel | Monthly | Volume sold, revenue, rejection rate at hub |
| Customer Segment Report | Excel | Monthly | B2B vs. B2C order volume and value |
| Village Hub Throughput Report | PDF | Monthly | Volume collected per hub, farmer participation |
| Dispute/Refund Log | Excel | On demand | All disputes, resolution, refund amounts |

---

## 9. Cross-Portal Flow Narratives

1. **A farmer/collector lists a crop →** it appears in the Customer Portal marketplace once its status is "Active" (i.e., the farmer/collector's own verification is complete — a brand-new unverified farmer's very first listings should stay "Pending Verification" and invisible to customers until Admin clears the farmer, protecting buyers from unverified sellers).
2. **A customer places an order →** payment is confirmed, the order status becomes "Awaiting Hub Collection," and it becomes visible on the relevant farmer's (or collector's) Orders screen and on the assigned Leg-1 delivery partner's Hub Schedule.
3. **The Leg-1 partner collects at the hub →** they log actual weight/quality; this updates the order (and, in aggregate, the farmer's Hub Collection Report) and advances the order to "In Transit to Distribution Center."
4. **The distribution center receives and sorts →** order status becomes "Assigned for Last-Mile Delivery," and it becomes visible in the "Available Orders" queue of every Leg-2 delivery partner within radius.
5. **A Leg-2 partner accepts and delivers →** the order moves through "Out for Delivery" to "Delivered," the customer's tracking view updates live, and the customer can then rate/message.
6. **On "Completed" →** payout logic triggers: the farmer's wallet is credited (minus platform and, if applicable, collector commission), and the delivery partner's per-trip earning is logged (or added to the company's monthly settlement).
7. **An admin verifies a new Delivery Partner →** only after that, do they start appearing as eligible for Leg-1 hub assignment or Leg-2 order visibility — nothing they do is visible to Farmer/Customer portals until cleared.

---

## 10. Authentication & Onboarding

### 10.1 Sign-up

Farmer, Customer, and Delivery portals all support: **Google Sign-In** (via a Google Cloud OAuth Client ID) or **email + OTP** (a time-limited numeric code emailed to the user — no SMS OTP, by design, to stay within free tooling). Admin accounts have **no public sign-up screen at all**; they only exist because another admin created them.

### 10.2 Card-style onboarding (skippable, per portal)

After first login, present a short sequence of step-cards; every card can be skipped and completed later.

- **Farmer:** Personal details → NIC → Address → Add a Farm → Add a first Product.
- **Customer:** Personal details → Address → Business details (B2B only).
- **Delivery:** Personal/Company details → License/Business registration → Add a Vehicle.

### 10.3 Progress & gating

Show a persistent profile-completeness indicator (checklist or percentage) until it hits 100%. Gate a small number of *actions* — not the whole account — behind the relevant step: a farmer can't list a product until at least one farm exists; a delivery partner can't appear in Leg-2 order queues until at least one verified vehicle exists.

### 10.4 Usernames

Auto-suggest a username from the person's name plus a short unique suffix; check uniqueness in real time; let them edit it once during onboarding.

---

## 11. Data & Validation Rules

| Field | Rule |
|---|---|
| Email | Standard format validation; enforce uniqueness; verify via OTP or via Google account |
| Mobile number (Sri Lanka) | Accept local 10-digit form (`07X XXXXXXX`) or international (`+94 7X XXXXXXX`); valid second digits are 0,1,2,4,5,6,7,8; normalize and store in `+94XXXXXXXXX` form regardless of how it was entered |
| NIC | Accept **old format** (9 digits + letter `V` or `X`) or **new format** (12 digits); validate structurally — plausible year and day-of-year — rather than the undocumented check digit, since the Department for Registration of Persons hasn't published that algorithm |
| Vehicle registration number | 3 letters + hyphen + 4 digits (e.g. `CAB-1234`); optionally preceded by a 2-letter province code on older/commercial plates (e.g. `WP CAB-1234`); strip spaces/hyphens before storing, display normalized |
| Address — Province | Mandatory dropdown, the 9 fixed values in §3.1 |
| Address — District | Mandatory dropdown, filtered to the districts belonging to the selected Province (or select District first and auto-lock Province, since the mapping is one-to-one) |
| Address — Street/House No. | Mandatory free text |
| Address — City/Town | Mandatory free text |
| Address — Postal Code | Optional, 5 numeric digits |
| Address — GPS | Optional, auto-captured from device location where available (used for delivery radius matching) |
| Username | 4–20 characters, letters/numbers/underscore, unique |
| Product price & quantity | Positive numeric only; unit is mandatory and drawn from a fixed list (kg, g, litre, ml, dozen, bundle); minimum order quantity can't exceed available quantity |
| Image uploads | Reasonable max file size (e.g. 5MB) and format allowlist (jpg/png/webp); cap the number of photos per listing |

---

## 12. Reports & Documents — Consolidated Reference

| # | Report | Portal | Format(s) |
|---|---|---|---|
| 1 | Farmer Income Report (Monthly/Annual) | Farmer | PDF, Excel |
| 2 | Hub Collection Report | Farmer | PDF |
| 3 | Collector Commission Report | Farmer (Collector) | Excel |
| 4 | Order Detail / Invoice | Customer | PDF |
| 5 | Monthly Purchase Summary | Customer | Excel |
| 6 | Spending by Category | Customer | PDF, Excel |
| 7 | Trip/Earnings Statement | Delivery | PDF, Excel |
| 8 | Vehicle Utilization Report | Delivery (Company) | Excel |
| 9 | Platform Revenue Report | Admin | Excel |
| 10 | Delivery Partner Detail Report | Admin | PDF |
| 11 | Farmer Performance Report | Admin | Excel |
| 12 | Customer Segment Report | Admin | Excel |
| 13 | Village Hub Throughput Report | Admin | PDF |
| 14 | Dispute/Refund Log | Admin | Excel |

---

## 13. Accessibility & UX Behaviors

- **Dark mode / light mode** on every portal, persisted per user, defaulting to the device/system preference.
- **Three languages** — English, Sinhala (සිංහල), Tamil (தமிழ்) — full interface translation with proper Unicode font support (e.g., Noto Sans Sinhala/Tamil), switchable at any time and remembered per user. User-generated content (a farmer's product name, say) stays in whatever language it was typed in; only the interface itself is translated.
- **Low-bandwidth tolerance:** compress images client-side before upload; keep card-based onboarding forms able to save a draft locally and submit once connectivity returns — important since Village Collectors and farmers are often on limited rural mobile data.
- **Low-literacy-friendly design:** favor icon-plus-short-label patterns over dense text, especially in the Farmer Portal's Collector-facing screens.
- **Accessible contrast and screen-reader labeling** (WCAG AA as a baseline) across all four portals.

---

## 14. Notifications & Communication

- **Email is the primary channel** (a deliberate substitute for SMS, matching your free-tooling constraint): OTP codes, order confirmations, every order-status change, payout notifications, verification results, admin announcements.
- **In-app notification center** mirrors the same events for anyone actively in the app.
- **In-app chat:** customer ↔ farmer, and customer ↔ delivery partner.
- **Click-to-call:** a phone number is only exposed once an order links two parties together (e.g., delivery partner assigned) — protects privacy the rest of the time.
- Note for later: a paid SMS/WhatsApp notification layer would meaningfully improve reach for farmers without smartphones, but that's outside a free-tool MVP — worth flagging as a "phase 2" idea rather than building now.

---

## 15. Tech Stack & Infrastructure

**Stack:** MongoDB, Express.js, React, Node.js — MongoDB Atlas as the hosted database.

- **MongoDB Atlas free tier (M0):** 512 MB storage, shared RAM/CPU, no time limit — genuinely free forever, which fits a diploma project well. The practical implication: **never store binary image/document data inside MongoDB** — store only the *URL* returned by your cloud storage provider (§15.2) and keep the 512 MB for actual transactional/catalog data.
- **Google Sign-In:** create a project in Google Cloud Console → configure the OAuth consent screen → create a Web-application OAuth Client ID → use it via Google Identity Services for "Continue with Google" across the Farmer, Customer, and Delivery portals.
- **Cloud image/document storage:** for farmer product photos and verification documents.
  - **Primary recommendation — Cloudinary's free tier.** One caveat worth knowing before you build around it: as of 2026 Cloudinary's free tier is a **unified 25-credits/month pool** (1 credit = 1 GB storage, OR 1 GB bandwidth, OR 1,000 transformations — drawn from the same pool, not three separate free allowances), capped at 3 users. That's still workable for a capstone-scale demo with a modest number of farmer images, but it's worth compressing images client-side (§13) to stretch it.
  - **Backups to know about if you outgrow that:** Firebase Storage's free tier, Cloudflare R2's free tier, and Backblaze B2's free allowance are the commonly cited alternatives if Cloudinary's credits get tight.
- **Transactional email:** since OTP and every status notification route through email rather than SMS, you'll need a free-tier transactional email API (this wasn't explicitly on your list, but it's a hard requirement once you commit to email-based OTP — flagged here so it doesn't get missed).

---

## 16. Payment Gateway

- **Recommended: PayHere Sandbox.** PayHere is Sri Lanka's own Central-Bank-approved gateway, natively supports LKR alongside USD/EUR/GBP/AUD, and — critically for a student project — its **sandbox account can be created without business registration documents**, with official test card numbers provided for simulating both successful and failed payments. Nothing in sandbox mode is ever actually charged.
- Keep in mind: PayHere's **live** account (needed only if this ever goes beyond a demo) does require business registration — a future-phase consideration, not a blocker now.
- Given many of your likely B2C buyers (and even some B2B ones) may prefer it, consider keeping a **Cash-on-Delivery / manual payment** option alongside the gateway for the MVP — it also means your demo doesn't depend entirely on the payment gateway being perfectly wired up.

---

## 17. What You Didn't Mention — Recommended Additions

These aren't in your brief, but each addresses a concrete gap the real-world research above surfaces:

- **Quality grading at the hub** (e.g., Grade A/B/C), logged at collection and potentially affecting the final price — without this, "quality is inspected" in your flow has nothing to actually record.
- **Weight/quantity reconciliation:** what a farmer *listed* vs. what was *actually collected* at the hub will not always match — build a small dispute/adjustment flow around this gap rather than assuming they're always equal.
- **Wastage/rejection tracking:** produce rejected at hub or distribution-center inspection needs a status and a reason code, both for farmer transparency and for admin reporting.
- **A commission & payout engine:** platform commission %, Village Collector commission %, and the delivery payout formula should all be admin-configurable values, not hardcoded — you'll want to tune them.
- **A farmer wallet with a defined, fast payout cycle.** This directly answers the real problem Agrithmics was built to solve in Sri Lanka's tea sector (a 30–40 day traditional payment delay) — a fast, transparent payout is likely to be *the* trust-building feature for farmers.
- **Bulk/B2B pricing tiers and minimum order quantities** — already partly covered above, but worth calling out as its own feature since B2B buyers (hotels, supermarkets) transact very differently from B2C.
- **Crop pre-booking / advance listing** before harvest, so B2B buyers can forward-order — a pattern already used by comparable Sri Lankan apps.
- **Two-way ratings:** you specified customers rating farmers; also let farmers/delivery partners rate customers (useful for flagging unreliable pickup/no-shows) and let customers separately rate the delivery experience from the product itself.
- **Seasonal awareness (Maha/Yala cultivation seasons):** useful context for admin reports and for setting farmer expectations around availability windows.
- **A defined KYC document set per role** — you mentioned NIC for farmers; delivery partners need license + vehicle registration + insurance; delivery companies need business registration; B2B customers need business registration.
- **Standardized units** (kg, g, litre, ml, dozen, bundle) enforced platform-wide, so listings from different farmers are actually comparable.
- **Search, filters, and a wishlist/favorites list** on the Customer Portal.
- **Tax/invoice generation** for B2B orders — even a simple structured invoice (no VAT logic required initially) matters a lot to hotel/supermarket accounting teams.
- **An admin audit trail** — who verified/rejected/refunded what, and when.
- **A support ticketing system** spanning all four portals, rather than support being handled ad hoc.
- **A content-moderation queue** for listing photos/descriptions, since anyone can eventually list.
- **A notification-preference center**, so users can choose what triggers an email vs. an in-app-only alert.

---

## 18. Summary Checklist

Use this as a build-order sanity check, not a schedule:

1. Auth (Google + email OTP), admin-seeded super admin
2. Core data models: User (role-based), Farm, Product, Order, VillageHub, DistributionCenter, Vehicle, Address
3. Farmer + Collector flows (listing, hub collection logging)
4. Customer browse/cart/checkout (PayHere sandbox + COD)
5. Two-leg delivery assignment logic
6. Order lifecycle state machine driving all four portals' tracking views
7. Wallet/payout + commission engine
8. Ratings, messaging, notifications
9. Reports (start with the highest-value ones: Farmer Income, Order Invoice, Admin Revenue)
10. Dark/light mode + 3-language i18n layered in throughout, not bolted on at the end
