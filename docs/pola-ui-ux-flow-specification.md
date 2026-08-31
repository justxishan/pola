# Pola (පොළ) — UI/UX Screen-by-Screen System Flow & Interaction Specification

> **Companion to Part 1 (`pola-system-specification.md`) and Part 2 (`pola-payments-wallet-quality-filters-spec.md`)**.  
> This specification documents every screen, tab, modal, drawer, form field, button, validation rule, and UI flow across all four portals (**Farmer**, **Customer**, **Delivery**, and **Admin**). It translates the platform architecture, escrow workflows, and data models into clean, uncluttered, production-grade User Experiences (UX).

---

## Table of Contents
1. [UX Design System & Layout Principles](#1-ux-design-system--layout-principles)
2. [Universal Authentication & Role Selection Flow](#2-universal-authentication--role-selection-flow)
3. [Farmer Portal — Screen-by-Screen Flow](#3-farmer-portal--screen-by-screen-flow)
   - 3.1 [Farmer Onboarding Wizard (Skippable Step Cards)](#31-farmer-onboarding-wizard-skippable-step-cards)
   - 3.2 [Farmer Shell & Navigation Structure](#32-farmer-shell--navigation-structure)
   - 3.3 [Farmer Dashboard](#33-farmer-dashboard)
   - 3.4 [My Farms Management & GPS Boundary Setup](#34-my-farms-management--gps-boundary-setup)
   - 3.5 [Produce & Listing Catalog (Add/Edit Wizard with B2B Tiers)](#35-produce--listing-catalog-addedit-wizard-with-b2b-tiers)
   - 3.6 [Orders & Sales Lifecycle Tracker](#36-orders--sales-lifecycle-tracker)
   - 3.7 [Hub Collection & Drop-off Management](#37-hub-collection--drop-off-management)
   - 3.8 [Farmer Wallet, Escrow & Earnings Dashboard](#38-farmer-wallet-escrow--earnings-dashboard)
   - 3.9 [Village Collector Special Sub-Workspace](#39-village-collector-special-sub-workspace)
   - 3.10 [Farmer Profile, Farm Documents & Settings](#310-farmer-profile-farm-documents--settings)
4. [Customer Portal — Screen-by-Screen Flow](#4-customer-portal--screen-by-screen-flow)
   - 4.1 [Customer Onboarding (B2C Household vs B2B Commercial)](#41-customer-onboarding-b2c-household-vs-b2b-commercial)
   - 4.2 [Customer Shell & Marketplace Header](#42-customer-shell--marketplace-header)
   - 4.3 [Marketplace Discovery & Category Browsing](#43-marketplace-discovery--category-browsing)
   - 4.4 [Advanced Filter & Search System (Faceted Navigation)](#44-advanced-filter--search-system-faceted-navigation)
   - 4.5 [Product Detail Page (PDP) & Farmer Storefront](#45-product-detail-page-pdp--farmer-storefront)
   - 4.6 [Multi-Farmer Smart Cart & Delivery Hub Bundler](#46-multi-farmer-smart-cart--delivery-hub-bundler)
   - 4.7 [Checkout Flow (PayHere, Pola Wallet, COD & Pre-Orders)](#47-checkout-flow-payhere-pola-wallet-cod--pre-orders)
   - 4.8 [Order Tracking & Real-Time Delivery Timeline](#48-order-tracking--real-time-delivery-timeline)
   - 4.9 [Post-Purchase Actions (Two-Way Ratings, Disputes, Invoicing)](#49-post-purchase-actions-two-way-ratings-disputes-invoicing)
   - 4.10 [Customer Wallet & Instant Refund Center](#410-customer-wallet--instant-refund-center)
   - 4.11 [Customer Account & B2B Entity Manager](#411-customer-account--b2b-entity-manager)
5. [Delivery Portal — Screen-by-Screen Flow](#5-delivery-portal--screen-by-screen-flow)
   - 5.1 [Delivery Partner Onboarding (Individual vs Fleet Company)](#51-delivery-partner-onboarding-individual-vs-fleet-company)
   - 5.2 [Delivery Shell & Active Status Toggle](#52-delivery-shell--active-status-toggle)
   - 5.3 [Delivery Dashboard & Active Run HUD](#53-delivery-dashboard--active-run-hud)
   - 5.4 [Leg 2: Last-Mile Available Orders Radar (Radius Matching)](#54-leg-2-last-mile-available-orders-radar-radius-matching)
   - 5.5 [Leg 1: Hub Collection Schedule & Grading Intake Sheet](#55-leg-1-hub-collection-schedule--grading-intake-sheet)
   - 5.6 [Active Delivery Execution (Navigation, Customer Contact & Proof of Delivery)](#56-active-delivery-execution-navigation-customer-contact--proof-of-delivery)
   - 5.7 [Vehicle & Fleet Management](#57-vehicle--fleet-management)
   - 5.8 [Delivery Earnings, Trip Statements & Settlements](#58-delivery-earnings-trip-statements--settlements)
6. [Admin Portal — Screen-by-Screen Flow](#6-admin-portal--screen-by-screen-flow)
   - 6.1 [Role-Based Admin Shell & Access Partitioning](#61-role-based-admin-shell--access-partitioning)
   - 6.2 [Executive Command Center & Real-Time Operational Heatmap](#62-executive-command-center--real-time-operational-heatmap)
   - 6.3 [KYC & Verification Queue Desk (Side-by-Side Inspector)](#63-kyc--verification-queue-desk-side-by-side-inspector)
   - 6.4 [Order Intervention & Stuck Delivery Dispatch Board](#64-order-intervention--stuck-delivery-dispatch-board)
   - 6.5 [Dispute Adjudication Desk (Hub Photo vs Customer Complaint)](#65-dispute-adjudication-desk-hub-photo-vs-customer-complaint)
   - 6.6 [Finance Desk: Manual Withdrawal Queue & Commission Config](#66-finance-desk-manual-withdrawal-queue--commission-config)
   - 6.7 [Logistics Hub & Distribution Center Network Configurator](#67-logistics-hub--distribution-center-network-configurator)
   - 6.8 [Content Moderation Queue](#68-content-moderation-queue)
   - 6.9 [Support Ticketing Inbox](#69-support-ticketing-inbox)
   - 6.10 [Immutable Audit Trail Viewer](#610-immutable-audit-trail-viewer)
   - 6.11 [Reports & Analytics Studio (15 Reports Generator)](#611-reports--analytics-studio-15-reports-generator)
7. [Universal Reusable UI Elements & Modals](#7-universal-reusable-ui-elements--modals)
8. [Summary Screen Mapping by Portal](#8-summary-screen-mapping-by-portal)

---

## 1. UX Design System & Layout Principles

### 1.1 Visual Hierarchy & Information Density (Anti-Clutter Rules)
- **Progressive Disclosure:** Complex multi-field forms (such as Farm setup, Crop Listing, Vehicle Registration, and B2B Business Onboarding) are divided into structured wizard steps, collapsible cards, or slide-over drawers. Secondary details (e.g., GPS coordinates, organic certificate numbers, B2B tiered discounts) are revealed via toggle switches or sub-drawers only when enabled.
- **Card-Based Visual Scaffolding:** Screens use clear cards with distinct elevation levels (`surface-1`, `surface-2`), subtle borders (`1px solid #E2E8F0` light / `#334155` dark), and 16px/24px padding to separate data blocks without heavy visual noise.
- **Status Pills & Color Semantics:**
  - `Active` / `Completed` / `Verified` / `Grade A`: Emerald Green (`#10B981` text / `#ECFDF5` bg)
  - `In Transit` / `Out for Delivery` / `Grade B`: Sky Blue / Cyan (`#0EA5E9` text / `#F0F9FF` bg)
  - `Pending` / `Awaiting Collection` / `In Review` / `Grade C`: Golden Amber (`#F59E0B` text / `#FEF3C7` bg)
  - `Rejected` / `Cancelled` / `Disputed` / `Out of Stock`: Crimson Red (`#EF4444` text / `#FEF2F2` bg)
- **Contextual Action Bars (Sticky Footers on Mobile):** Long forms feature a sticky bottom bar with clear primary ("Save & Continue", "Publish Listing") and secondary ("Save as Draft", "Skip for Now") actions, ensuring primary CTAs are always within thumb reach on mobile devices.

### 1.2 Responsive Layout Architecture
- **Mobile (< 768px):** Fixed top App Bar (Logo, Language Pill, Notification Bell, Avatar) + Fixed Bottom Navigation Bar (4-5 key destinations) + Full-screen sheets for complex forms.
- **Desktop (≥ 1024px):** Persistent Left Sidebar (240px wide, collapsible to 72px icon-rail) + Top Bar (Global Search, Breadcrumbs, System Status, Quick Actions, User Profile) + Wide multi-column content area (Grid 12-col).

---

## 2. Universal Authentication & Role Selection Flow

```
[Landing Screen]
       │
       ▼
[Auth Modal / Screen] ──► [Continue with Google] ───┐
       │                                            ▼
       └──────────────► [Email + OTP Verification] ──► [Account Discovery]
                                                            │
                     ┌──────────────────────────────────────┴──────────────────────────────────────┐
                     ▼                                                                             ▼
             [Existing User]                                                               [New User Registration]
                     │                                                                             │
                     ▼                                                                             ▼
           [Redirect to Portal]                                                             [Role Selection Screen]
                                                                                                   │
                                                     ┌──────────────────────┬──────────────────────┴──────────────────────┐
                                                     ▼                      ▼                                             ▼
                                              [Farmer Portal]       [Customer Portal]                             [Delivery Portal]
                                                     │                      │                                             │
                                                     ▼                      ▼                                             ▼
                                            [Select Farmer Type]   [Select Customer Type]                        [Select Partner Type]
                                            • Independent Farmer   • B2C Household                               • Individual Driver
                                            • Village Collector    • B2B Business                                • Fleet / Company
```

### 2.1 Screen: Universal Sign-Up / Login (`/auth`)
- **Header:** Pola Logo with bilingual tagline (*"Direct from Farm to Table / ගොවිබිමෙන් ඔබගේ දොරකඩට"*), Language Selector Dropdown (English, සිංහල, தமிழ்), Theme Switcher (Sun/Moon icon).
- **Hero Card:** Clean minimal container with tab toggle: `[Log In]` | `[Create Account]`.
- **Elements:**
  1. **"Continue with Google" Button:** Prominent, official Google branding. Direct OAuth2 popup handler.
  2. **Divider:** *"or continue with email"* with subtle horizontal lines.
  3. **Email Address Input:** Text input, placeholder `"name@example.com"`, real-time format validation.
  4. **Primary CTA Button:** `[Send 6-Digit Code]`.
  5. **Footer Notice:** Terms of Service and Privacy Policy links; safe data assurance.

### 2.2 Screen: OTP Verification Drawer/Modal (`/auth/verify`)
- **Elements:**
  1. **Illustration / Icon:** Mailbox verification icon.
  2. **Headline & Subtitle:** *"Check your inbox"* • *"We sent a 6-digit verification code to `user@example.com`"*.
  3. **Edit Email Action:** Inline text link `[Change Email]` to return to previous step.
  4. **6-Digit Input Box:** Auto-focusing numeric input with single-cell styling and automatic paste support.
  5. **Countdown Timer & Resend Link:** *"Resend code in 00:45"* (becomes active text button after timeout).
  6. **Primary CTA Button:** `[Verify & Proceed]` (auto-submits once 6th digit is entered).

### 2.3 Screen: Role Selection Screen (`/auth/select-role`)
*Shown only on initial registration before profile setup.*
- **Headline:** *"Welcome to Pola! How will you use the platform?"*
- **Sub-headline:** *"Select your primary role. You can manage connected accounts later."*
- **Interactive Role Cards (3 Large Visual Cards with Hover/Active States):**
  1. **Farmer Card:**
     - Icon: Sprout / Tractor.
     - Title: *"Farmer / Producer"*
     - Description: *"Sell fresh crops, fruits, vegetables, grains, or spices directly to consumers and bulk buyers across Sri Lanka."*
     - Radio Selector / Direct `[Join as Farmer]` CTA.
  2. **Customer Card:**
     - Icon: Shopping Basket / Storefront.
     - Title: *"Customer / Buyer"*
     - Description: *"Buy farm-fresh produce directly from verified local growers for your home, restaurant, hotel, or supermarket."*
     - Radio Selector / Direct `[Join as Customer]` CTA.
  3. **Delivery Partner Card:**
     - Icon: Delivery Lorry / Three-Wheeler.
     - Title: *"Delivery Partner"*
     - Description: *"Earn by transporting produce from village hubs to distribution centers or completing last-mile deliveries to buyers."*
     - Radio Selector / Direct `[Join as Delivery Partner]` CTA.

---

## 3. Farmer Portal — Screen-by-Screen Flow

### 3.1 Farmer Onboarding Wizard (Skippable Step Cards)
*Appears immediately after selecting the Farmer role. Users can finish any card or click `[Skip for Now]` to land on the dashboard in an unverified state with a persistent setup checklist banner.*

```
[Role Selected: Farmer]
          │
          ▼
[Step 1: Farmer Sub-Type] ──► Independent Farmer vs Village Collector
          │
          ▼
[Step 2: Basic Profile]   ──► Full Name, Mobile (+94), Preferred Language, Username
          │
          ▼
[Step 3: Identity / NIC]  ──► NIC Number (Old/New), NIC Front & Back Uploads (Skippable)
          │
          ▼
[Step 4: Register Farm]   ──► Farm Name, Province, District, Extent, Crops, GPS Pin (Skippable)
          │
          ▼
[Step 5: Payout Bank]     ──► Bank Name, Branch, Account Number, Holder Name (Skippable)
          │
          ▼
[Farmer Dashboard]        ──► Profile Completeness Tracker (e.g., 60% complete)
```

#### Step 1 Card: Farmer Sub-Type Selection (`/farmer/onboarding/type`)
- **Option A: Independent Farmer (Default):** *"I manage my own farm(s) and want to sell my produce directly."*
- **Option B: Village Collector:** *"I represent a cluster of local farmers in my village, manage their listings, and coordinate hub drop-offs."*
  - *Context Callout:* Village Collectors receive an additional reference field and an endorsement statement upload.

#### Step 2 Card: Personal Profile Setup (`/farmer/onboarding/profile`)
- **Full Name Input:** Text, placeholder `"e.g. K.M. Bandara"`.
- **Display Username Input:** Auto-generated suggestion (e.g. `bandara_farm_94`) with real-time uniqueness check; editable.
- **Mobile Number Input:** Country code locked to `+94`, input field for 9 digits (`7X XXXXXXX`), validates SL telco prefix (0,1,2,4,5,6,7,8).
- **Profile Photo (Optional):** Circular drag-and-drop / camera capture tap target.
- **Preferred Language Selector:** Radio pills: `[English]` | `[සිංහල]` | `[தமிழ்]`.
- **Buttons:** `[Continue]` | `[Skip for Later]`.

#### Step 3 Card: National Identity Verification / KYC (`/farmer/onboarding/kyc`)
- **Banner:** *"Identity verification unlocks instant payouts and activates public marketplace visibility for your listings."*
- **NIC Number Input:** Validates Old Format (9 digits + `V`/`X`) or New Format (12 digits).
- **Document Upload Zones (2 Cards with Camera Trigger on Mobile):**
  - Card 1: `[Upload NIC Front Side]` (JPG, PNG, WebP ≤ 5MB).
  - Card 2: `[Upload NIC Back Side]` (JPG, PNG, WebP ≤ 5MB).
- **Collector Special Field (If Village Collector chosen):**
  - Village Name / Grama Niladhari Division.
  - Endorsement / Village Reference Contact Name & Phone.
- **Buttons:** `[Submit for Verification]` | `[Skip Identity Verification]`.

#### Step 4 Card: Register Your First Farm (`/farmer/onboarding/farm`)
- **Farm Name / Label:** Text input `"e.g. Green Valley Farm - Nuwara Eliya"`.
- **Province Dropdown:** Mandatory selection (9 Provinces).
- **District Dropdown:** Auto-filtered by selected Province (25 Districts).
- **City / Town & Street Address:** Free text input.
- **Farm Extent:** Numeric input + Unit Dropdown (`Acres` | `Perches` | `Hectares`).
- **Land Ownership Type:** Radio selector: `[Owned]` | `[Leased]` | `[State Permit]`.
- **Water & Irrigation Source:** Multi-select chips: `[Rain-fed]` `[Canal/Mahaweli]` `[Deep Well]` `[River/Stream]` `[Drip System]`.
- **Primary Crops Grown:** Multi-select searchable tags: `[Carrots]` `[Leeks]` `[Tomatoes]` `[Tea]` `[Paddy]` `[Cinnamon]` `[Other]`.
- **Organic Certification Toggle:** Switch `[Yes/No]`. If Yes, opens file upload for Organic Certificate.
- **Interactive GPS Pin Selector:**
  - Map view centered on selected District with `[Use My Current Location]` button.
  - Draggable map marker that writes latitude & longitude values.
- **Buttons:** `[Save & Add Farm]` | `[I will add a farm later]`.

#### Step 5 Card: Payout Bank Account (`/farmer/onboarding/bank`)
- **Bank Name Dropdown:** Pre-populated with Central Bank approved Sri Lankan banks (Bank of Ceylon, People's Bank, Commercial Bank, HNB, Sampath, Seylan, etc.).
- **Branch Name / Code Input:** Searchable text dropdown.
- **Account Number Input:** Numeric text input with re-entry confirmation.
- **Account Holder Name Input:** Text input with reminder: *"Must match the legal name on your NIC"*.
- **Passbook / Bank Statement Top Slip Upload (Optional):** For quick admin verification.
- **Buttons:** `[Save Payout Details]` | `[Complete Setup Later]`.

---

### 3.2 Farmer Shell & Navigation Structure
- **Top Header Bar:**
  - Left: Hamburger Menu (Mobile) / Collapsible Sidebar toggle (Desktop), Pola Farmer Badge.
  - Center: Farm Switcher Dropdown (e.g. `[Green Valley Farm ▾]` — allows switching between registered farms).
  - Right: Language Toggle (`EN`|`සිං`|`தம`), Theme Toggle (Dark/Light), Notifications Bell (with unread counter dot), Profile Avatar with status badge (`Verified` / `Pending KYC`).
- **Desktop Sidebar Navigation (Left 240px):**
  - `Dashboard` (Icon: Home/Grid)
  - `My Products` (Icon: Package/Carrot)
  - `My Farms` (Icon: MapPin/Trees)
  - `Orders & Sales` (Icon: ShoppingBag)
  - `Hub Drop-offs` (Icon: Truck/Warehouse)
  - `Wallet & Payouts` (Icon: Wallet/Coins)
  - `Managed Farmers` *(Visible only to Village Collector accounts)* (Icon: Users)
  - `Messages` (Icon: Chat)
  - `Reports` (Icon: FileText)
  - `Settings & Profile` (Icon: Settings)
- **Mobile Bottom Navigation Bar (5 Items):**
  - `Home` | `Products` | `Orders` | `Wallet` | `More (Farms, Hubs, Settings)`

---

### 3.3 Farmer Dashboard (`/farmer/dashboard`)
- **Top Banner (Conditional):** If KYC is unverified, displays an Amber Alert Banner: *"Your profile is 60% complete. Complete identity verification to activate your listings."* with a direct `[Verify Now]` action button.
- **Section 1: Quick Metric Cards (4 Cards Grid):**
  1. **Total Sales Balance:** Display in LKR (e.g. `LKR 148,500.00`) with small subtitle: *"Available: LKR 112,000 | Pending: LKR 36,500"*.
  2. **Active Listings:** Count (e.g. `12 Products`) with status pill `10 In Stock • 2 Low Stock`.
  3. **Incoming Hub Orders:** Count (e.g. `4 Orders to Drop Off`) with next collection countdown (`Tuesday, 6:00 AM`).
  4. **Overall Farmer Rating:** Star rating (e.g. `★ 4.8 / 5.0`) based on verified buyer ratings.
- **Section 2: Primary Quick Action Bar:**
  - `[+ Add New Crop / Product]` (Primary Green Button).
  - `[Log Hub Drop-off]` (Secondary White/Outline Button).
  - `[Request Payout]` (Secondary Button).
  - `[+ Add Managed Farmer]` *(Collectors only)*.
- **Section 3: Actionable Schedule Card ("Next Hub Collection"):**
  - Shows assigned Village Hub name (e.g., *"Keppetipola Village Hub #2"*), scheduled collection window (*"Tomorrow, 06:30 AM – 09:30 AM"*), assigned Leg-1 transport partner, and list of pending order line-items to be packaged.
- **Section 4: Recent Orders Mini-Table:**
  - Columns: `Order ID`, `Crop / Variety`, `Quantity`, `Buyer Type (B2B/B2C)`, `Status Pill`, `Action Link`.
- **Section 5: Fast Insights & Price Trends Widget:**
  - Shows current average wholesale benchmark prices at the Dambulla/Meegoda DEC for the farmer's registered crops.

---

### 3.4 My Farms Management & GPS Boundary Setup (`/farmer/farms`)
- **Header:** Title *"My Registered Farms"*, Total Land Extent summary pill, Primary Action `[+ Add New Farm]`.
- **Farm Grid View (Cards):** Each card represents one registered farm:
  - Farm Photo / Satellite Thumbnail.
  - Farm Name, Province & District badge.
  - Land Extent (e.g. `2.5 Acres`) & Ownership Status (`Owned`).
  - Active Crop Tags (`Carrots`, `Potatoes`).
  - Organic Badge (`Certified Organic` with view certificate link).
  - Quick Actions Menu: `[Edit Details]` | `[View Listings on this Farm]` | `[Update GPS Pin]` | `[Deactivate]`.
- **Modal / Page: Add/Edit Farm:**
  - Re-uses the comprehensive fields from Onboarding Step 4 with full GPS interactive map coordinate picker, irrigation source checkboxes, and soil/farming method tags.

---

### 3.5 Produce & Listing Catalog (`/farmer/products`)
- **Header & Filters Bar:**
  - Search Input: Placeholder *"Search produce by name, variety..."*
  - Category Filter Dropdown: `All Categories` | `Vegetables` | `Fruits` | `Dairy` | `Grains` | `Spices` | `Other`.
  - Status Filter Tabs: `All (14)` | `Active (10)` | `Pending Verification (2)` | `Out of Stock (2)` | `Drafts (0)`.
  - Primary CTA: `[+ Add New Produce Listing]`.
- **Listing Table / Card Grid View:**
  - Thumbnail image, Product Title & Variety (e.g., *"Nuwara Eliya Carrot - Kuroda"*).
  - Linked Farm Name.
  - Listed Price per Unit (e.g., `LKR 280 / kg`).
  - Available Stock Level with progress bar (e.g., `450 kg remaining`).
  - Quality Grade History badge (e.g., `Grade A: 92%`).
  - B2B Bulk Tier Badge (e.g., `3 Tiers Available`).
  - Toggle Switch: `Active / Inactive` (Instant stock pause).
  - Actions Dropdown: `[Edit Listing]` | `[Duplicate]` | `[Update Stock]` | `[Delete]`.

```
Add Product Wizard Flow:
[Basic Info & Variety] ──► [Pricing, Units & B2B Tiers] ──► [Stock, Harvest & Storage] ──► [Photos & Publish]
```

#### Modal / Sub-Page: Add / Edit Product Wizard (`/farmer/products/new`)
- **Step 1: Crop Details:**
  - Product Name Input: e.g. `"Carrot"`.
  - Variety Input: e.g. `"Kuroda / New Kuroda"`.
  - Category Dropdown: `Vegetables` | `Fruits` | `Grains` | `Dairy` | `Spices` | `Other`.
  - Linked Farm Dropdown: Select from farmer's active registered farms.
  - Cultivation Season Tag: Radio `[Maha Season]` | `[Yala Season]` | `[Year-round]`.
  - Organic Cultivation Toggle: Switch `[Yes/No]`.
  - Description Textarea: Free-text details regarding harvesting methods, fertilizer used, etc.
- **Step 2: Units, Pricing & B2B Tiered Discounts:**
  - Standardized Unit of Sale: Mandatory Dropdown (`kg` | `g` | `litre` | `ml` | `dozen` | `bundle` | `piece`).
  - Base Retail Price per Unit: Numeric input in LKR (e.g. `LKR 300.00`).
  - Minimum Order Quantity (MOQ): Numeric input (Default `1`).
  - Enable B2B Wholesale Tiered Pricing: Switch `[Yes/No]`. When enabled, dynamically adds tier rows:
    - *Tier 1:* `1` to `49` kg = `LKR 300.00 / kg` (Base).
    - *Tier 2:* `50` to `199` kg = `LKR 260.00 / kg` (Input).
    - *Tier 3:* `200+` kg = `LKR 230.00 / kg` (Input).
    - `[+ Add Another Tier]` button.
- **Step 3: Stock, Harvest Dates & Logistics Attributes:**
  - Available Stock Quantity: Numeric input (e.g. `500`).
  - Harvest / Availability Date: Date picker (allows immediate stock or Pre-Booking forward dates).
  - Is this an Advance Crop Pre-Booking? Switch `[Yes/No]` (If yes, specifies expected harvest window).
  - Perishability / Cold Chain Required: Switch `[Yes/No]` (Routes order to refrigerated transport).
  - Self-Declared Quality Grade: Radio `[Grade A (Premium)]` | `[Grade B (Standard)]`.
- **Step 4: Media Uploads:**
  - Multi-image dropzone (Supports up to 5 images, client-side auto-compressed to WebP ≤ 500KB).
  - Primary cover photo selector.
- **Footer Actions:** `[Save as Draft]` | `[Preview Listing]` | `[Publish Listing]`.

---

### 3.6 Orders & Sales Lifecycle Tracker (`/farmer/orders`)
- **Lifecycle Tab Bar:**  
  `All Orders` | `Awaiting Hub Drop-off` | `Collected at Hub` | `In Transit / At DC` | `Completed` | `Disputed / Cancelled`.
- **Order Card Component:**
  - **Header:** Order ID (`#POL-84920`), Date & Time placed, Buyer Tag (`B2C Household` or `B2B: Hotel/Supermarket`).
  - **Line Items:** Product thumbnail, Title, Quantity ordered, Total price, Linked Farm.
  - **Hub Drop-off Target:** Deadline date/time and designated Village Hub.
  - **Status Pill:** Visual color-coded status.
  - **Action Buttons:** `[Print Packing Slip / QR Tag]` | `[View Order Details]` | `[Report Problem]`.
- **Drawer: Order Details View:**
  - Complete customer drop-off region (protects customer direct phone until necessary).
  - Breakdown of Sale Value: Gross total, Platform fee deduction, Collector fee deduction, Net payable amount.
  - Real-time order progress stepper.

---

### 3.7 Hub Collection & Drop-off Management (`/farmer/hubs`)
- **Active Hub Info Card:**
  - Assigned Village Hub Name, GPS Pin link.
  - Operating Hours & Recurring Schedule (e.g. *"Every Tuesday & Friday: 06:00 AM – 09:00 AM"*).
  - Assigned Collector / Leg-1 Delivery Partner Contact details.
- **Section: "Prepare for Today's Drop-off":**
  - Itemized batch summary of all orders ready for collection.
  - Total aggregated weight by crop (e.g. `Carrot: 120 kg`, `Leeks: 45 kg`).
  - `[Generate Batch Manifest / QR Code]` button for scanning at the hub.
- **Section: "Hub Collection Receipts & Quality Reports":**
  - List of past drop-offs with inspection results:
    - Date, Received Weight vs Listed Weight, Assigned Grade (`Grade A` / `Grade B` / `Grade C` / `Rejected`).
    - Discrepancy Notes & Inspection Photos taken by Hub Grader.
    - `[Contest Grade / File Dispute]` action button (active for 24 hours post-intake).

---

### 3.8 Farmer Wallet, Escrow & Earnings Dashboard (`/farmer/wallet`)
- **Balance Overview (3 Large Cards):**
  1. **Available Balance (Ready for Cash-out):** `LKR 84,200.00` with primary CTA `[Withdraw to Bank]`.
  2. **Pending Escrow Balance (In-Transit / Awaiting Completion):** `LKR 32,400.00` (Tooltip: *"Released when orders reach Completed status"*).
  3. **Total Lifetime Earnings:** `LKR 1,240,000.00`.
- **Payout Bank Account Card:**
  - Shows linked bank: Bank Name, Branch, Masked Account Number (`**** 4819`), Account Holder Name.
  - `[Edit Bank Account]` action (requires re-verification).
- **Modal: Request Withdrawal (`/farmer/wallet/withdraw`):**
  - Available Balance display.
  - Amount Input: Placeholder `LKR`, validates `≥ LKR 500.00` and `≤ Available Balance`.
  - Quick Amount Chips: `[LKR 5,000]` `[LKR 10,000]` `[LKR 25,000]` `[All Available]`.
  - Destination: Displays registered bank account.
  - Processing Notice: *"Withdrawals are processed manually via LankaPay online banking within 24 hours."*
  - Action: `[Confirm Withdrawal Request]`.
- **Section: Ledger & Transaction History Table:**
  - Filters: Date Range Picker, Transaction Type (`All`, `Sale Credit`, `Withdrawal`, `Commission Deduction`, `Admin Adjustment`).
  - Columns: `Date/Time`, `Transaction Type`, `Reference / Order ID`, `Gross Amount`, `Deductions`, `Net Amount (LKR)`, `Status (Completed / Pending)`.
  - `[Export Statement (PDF / Excel)]` button.

---

### 3.9 Village Collector Special Sub-Workspace (`/farmer/collector`)
*Only active when account type is Village Collector.*
- **Top Navigation Sub-Tabs:** `Managed Farmers Directory` | `Bulk Hub Batching` | `Commission Ledger`.
- **Tab 1: Managed Farmers Directory:**
  - Table / Card list of smallholder farmers onboarded by this Collector.
  - Search by farmer name, NIC, or village.
  - `[+ Quick Onboard Small Farmer]` Modal:
    - Lightweight form: Full Name, NIC, Mobile (if available), Village / GN Division, Bank Details (or cash voucher payout preference), Land Extent, Main Crops.
- **Tab 2: Proxy Listing & Crop Management:**
  - Allows Collector to create and edit crop listings on behalf of any farmer in their managed directory.
- **Tab 3: Aggregated Hub Drop-off Submission:**
  - Multi-farmer batch builder: Selects produce batches from multiple farmers and generates a unified multi-farmer manifest for Leg-1 transport pickup.
- **Tab 4: Collector Commission Tracker:**
  - Detailed breakdown of commission earned (e.g. 3-5%) per completed order across all managed farmers.

---

### 3.10 Farmer Profile, Farm Documents & Settings (`/farmer/settings`)
- **Sub-Tabs:** `Personal Profile` | `Security & Auth` | `Notification Center` | `App Preferences`.
- **Personal Profile:** Edit Name, NIC view (locked once verified), Mobile Number, Home Address (Province/District dropdowns), Profile Picture.
- **Notification Preferences (Matrix):**
  - Rows: `New Order Received`, `Hub Collection Reminder`, `Quality Inspection Grade Assigned`, `Payout Processed`, `Customer Direct Message`.
  - Columns: `In-App Alert (Toggle)` | `Email (Toggle)`.

---

## 4. Customer Portal — Screen-by-Screen Flow

### 4.1 Customer Onboarding (B2C Household vs B2B Commercial)
*After signup/login, user is prompted to set up their purchasing profile.*

```
[Role Selected: Customer]
            │
            ▼
[Account Type Selection] ──► B2C Individual vs B2B Commercial Business
            │
            ▼
[Step 1: Profile & Contact]  ──► Full Name / Contact Person, Mobile Number
            │
            ▼
[Step 2: Delivery Address]   ──► Province, District, City, Street, GPS Pin Drop
            │
            ▼
[Step 3: B2B Verification]   ──► Business Reg No (BRN), VAT/SVAT (Optional), Document Upload (B2B Only)
            │
            ▼
[Marketplace Home]
```

- **Type Selector:**
  - **B2C Individual:** *"For personal home grocery shopping directly from farmers."*
  - **B2B Commercial:** *"For supermarkets, hotels, restaurants, caterers, and wholesale distributors requiring bulk quantities, VAT invoices, and multi-drop delivery."*
- **B2B Extra Form Card:**
  - Registered Business Name Input.
  - Business Registration Number (BRN) Input.
  - Business Type Dropdown: `Hotel / Resort` | `Restaurant / Cafe` | `Supermarket / Retail Store` | `Food Processor` | `Other`.
  - Business Registration Certificate Upload (PDF/JPG).
  - Billing Address & Tax ID (Optional).

---

### 4.2 Customer Shell & Marketplace Header
- **Top Bar (Sticky):**
  - Left: Pola Logo, Delivery Location Pill (e.g., `📍 Deliver to: Colombo 03 - Kollupitiya ▾` — opens Address Drawer).
  - Center: Global Search Bar with category prefix dropdown and instant autocomplete.
  - Right: Language Toggle (`EN`|`සිං`|`தம`), Theme Toggle, Wishlist Icon (with count), Pola Wallet Balance Pill (`LKR 4,250`), Cart Icon with count & mini-cart popover, Profile Dropdown.
- **Secondary Category Navigation Ribbon:**
  - Horizontal scrollable pill buttons with icons: `🥬 All Vegetables` | `🍎 Fruits` | `🌾 Rice & Grains` | `🥛 Fresh Dairy` | `🌶 Spices` | `🌱 Organic Certified` | `⚡ Pre-Harvest Deals`.

---

### 4.3 Marketplace Discovery & Category Browsing (`/marketplace`)
- **Hero Section:**
  - Dynamic carousel featuring: seasonal promotions (*"Maha Harvest Special: Fresh Nuwara Eliya Veggies"*), B2B wholesale bulk banners, and direct farm spotlights.
- **Section 1: "In Season Now (Maha/Yala Picks)":**
  - Carousel of produce currently tagged as peak season with freshness guarantees.
- **Section 2: "Nearby Farms & Fast Delivery":**
  - Produce sourced from Distribution Centers directly covering the customer's district.
- **Section 3: Product Card Component (Standard Grid):**
  - Photo with hover zoom, Organic Badge & Quality Grade Tag (`Grade A`).
  - Product Name & Variety (`Nuwara Eliya Carrots`).
  - Farmer Name & Verified Badge with link to Farmer Storefront (`K.M. Bandara • Dambulla Hub`).
  - Unit Price in LKR (`LKR 280 / kg`).
  - B2B Bulk Tier Tag (if applicable: *"Bulk discount from 50kg"*).
  - Quantity Selector (`-` `1` `+`) + `[Add to Cart]` Button.
  - Heart / Wishlist icon button.

---

### 4.4 Advanced Filter & Search System (Faceted Navigation)
*Available as a Left Sidebar on Desktop and a Slide-over Drawer on Mobile.*

| Filter Group | Control Type | Values / Behavior |
|---|---|---|
| **Category & Variety** | Multi-level Accordion Tree | Select by Category (Vegetable, Fruit, etc.) and drill down to varieties. |
| **Price Range** | Dual-thumb Range Slider + Inputs | Min LKR — Max LKR per unit. |
| **Unit Type** | Checkbox Group | `kg`, `g`, `litre`, `dozen`, `bundle`, `piece`. |
| **Organic Only** | Toggle Switch | Filters for items with verified organic certification document. |
| **Quality Grade** | Multi-select Checkboxes | `Grade A (Premium)` • `Grade B (Standard)`. |
| **Farmer Rating** | Star Radio Group | `★ 4.5 & above`, `★ 4.0 & above`, `★ 3.5 & above`. |
| **Delivery Hub Coverage** | Auto-detected Dropdown | Shows produce routed through the DC servicing the user's address. |
| **Cultivation Season** | Checkbox Group | `Maha Season`, `Yala Season`, `Year-Round`. |
| **Purchase Type** | Radio Pills | `Ready to Ship Stock` vs `Pre-Harvest Advance Booking`. |
| **Sort By** | Dropdown Selector | `Best Match`, `Price: Low to High`, `Price: High to Low`, `Farmer Rating`, `Fastest Delivery`. |

---

### 4.5 Product Detail Page (PDP) & Farmer Storefront (`/product/:id`)
- **Breadcrumbs:** `Home > Vegetables > Root Vegetables > Nuwara Eliya Carrot`.
- **Left Column (Media Gallery):** Large high-res product image viewer with thumbnail carousel and zoom inspector.
- **Right Column (Product Information & Buy Box):**
  - Product Title & Botanical/Common Variety name.
  - Quality Grade Badge (`Grade A Verified`), Organic Badge, Harvest Date tag.
  - Farmer Info Card: Farmer Profile Picture, Name, Farm Location (District), Farmer Rating (`★ 4.9 (128 reviews)`), `[View Farmer Profile / Storefront]` link, `[Chat with Farmer]` button.
  - Pricing Display:
    - Base Retail: `LKR 280.00 / kg`.
    - B2B Bulk Discount Table (if enabled):
      - *1 – 49 kg:* `LKR 280 / kg`
      - *50 – 199 kg:* `LKR 250 / kg` (Save 10%)
      - *200+ kg:* `LKR 220 / kg` (Save 21%)
  - Stock Availability: Progress bar showing available stock (e.g. `In Stock: 420 kg available`).
  - Unit Quantity Stepper: Input box with `[+]` and `[-]` buttons + Unit indicator (`kg`).
  - Total Calculated Price (Live update).
  - Primary CTAs: `[Add to Cart]` (Secondary) | `[Buy Now]` (Primary Green).
- **Tabbed Bottom Section:**
  - `Tab 1: Farm & Cultivation Details:` Farm name, GPS location summary, irrigation method, soil and harvest notes.
  - `Tab 2: Quality Inspection Criteria:` Breakdown of grading benchmarks used at the Hub.
  - `Tab 3: Verified Customer Reviews:` Customer reviews with separate ratings for produce freshness and delivery speed.

---

### 4.6 Multi-Farmer Smart Cart & Delivery Hub Bundler (`/cart`)
- **Smart Grouping Architecture:** Cart items are automatically grouped by their routing **Distribution Center** (e.g. *Dambulla Hub* or *Meegoda Hub*).
- **Cart Line Items:**
  - Product thumbnail, Name, Linked Farmer, Unit Price, Applied B2B Tier discount badge.
  - Quantity Editor (with real-time MOQ enforcement).
  - Item Subtotal, Delete button.
- **Order Summary Sidebar (Sticky):**
  - Produce Subtotal: `LKR 12,400.00`.
  - Delivery Fee (Leg 1 Hub + Leg 2 Last-Mile): `LKR 850.00` (Calculated based on weight & distance).
  - Platform Service Fee: Transparent line item.
  - Estimated Total: `LKR 13,250.00`.
  - Primary CTA: `[Proceed to Checkout]`.

---

### 4.7 Checkout Flow (`/checkout`)

```
[Cart] ──► [Step 1: Delivery Address] ──► [Step 2: Delivery Slot] ──► [Step 3: Payment Method] ──► [Order Confirmation]
```

- **Step 1: Delivery Address Selection:**
  - Saved Address cards with radio selector + `[+ Add New Delivery Address]` modal.
  - Special Instructions field (e.g. *"Near the landmark supermarket, call upon arrival"*).
- **Step 2: Delivery Slot & Schedule:**
  - Standard Delivery window selector (Morning: 8 AM - 12 PM / Evening: 2 PM - 6 PM).
- **Step 3: Payment Method Selector:**
  - **Option 1: Pola In-App Wallet:** Displays current balance (`Available: LKR 4,250`). If balance is insufficient, shows remaining balance to top up or pay via gateway.
  - **Option 2: PayHere Online Payment Gateway:** Visa, Mastercard, AMEX, Genie, Frimi, eZ Cash, mCash, Internet Banking.
  - **Option 3: Cash on Delivery (COD):** Available for verified B2C and approved B2B accounts.
  - **Option 4: Advance Deposit Payment (For Pre-Orders):** Pay 30% deposit now via PayHere, balance upon harvest delivery.
- **Action:** `[Place Order & Pay LKR 13,250.00]`.

---

### 4.8 Order Tracking & Real-Time Delivery Timeline (`/customer/orders/:id`)
- **Live 10-Stage Lifecycle Stepper:**
  - Visual progress bar advancing through:
    1. *Order Placed* → 2. *Payment Confirmed* → 3. *Awaiting Hub Collection* → 4. *Collected & Graded at Hub* → 5. *In Transit to DC* → 6. *Sorted at DC* → 7. *Assigned to Delivery Partner* → 8. *Out for Delivery* → 9. *Delivered* → 10. *Completed*.
- **Hub Quality Inspection Snapshot:**
  - Displays the actual weight confirmed and quality grade (`Grade A`) logged at the village collection point.
- **Active Delivery Tracking HUD (When Out for Delivery):**
  - Map view with live location pin of the assigned Leg-2 delivery partner.
  - Delivery Partner Card: Driver Name, Photo, Vehicle Type (`Three-Wheeler` / `Mini-Truck`), Vehicle Registration Number (`CAB-1234`), Driver Rating (`★ 4.9`).
  - Privacy-preserving Communication: `[In-App Chat]` | `[Click to Call]` (Masked phone route).

---

### 4.9 Post-Purchase Actions (Two-Way Ratings, Disputes, Invoicing)
- **Two-Way Independent Rating Modal:**
  - *Rating 1: Rate the Produce & Farmer:* 1 to 5 Stars + Freshness & Quality feedback tags + Photo upload + Comment box.
  - *Rating 2: Rate the Delivery Experience:* 1 to 5 Stars + Punctuality & Care in Handling tags + Comment box.
- **Dispute & Refund Initiation Modal (`/customer/orders/:id/dispute`):**
  - Reason Dropdown: `Damaged Produce` | `Incorrect Weight / Shortfall` | `Below Expected Quality` | `Missing Items` | `Late Delivery`.
  - Evidence Upload: Mandatory photo/video upload.
  - Desired Resolution: `Refund to Pola Wallet (Instant)` | `Replacement Delivery` | `Return to Original Card/Bank`.
- **Structured Tax / Purchase Invoice:**
  - One-click `[Download PDF Invoice]` formatted for B2B accounting with sequential invoice numbers, tax placeholders, line items, and delivery breakdowns.

---

### 4.10 Customer Wallet & Instant Refund Center (`/customer/wallet`)
- **Wallet Balance Card:** Displays Available Store Credit / Refund balance.
- **Top-Up Modal:** Enter amount → Pay via PayHere → Instant wallet credit for 1-click checkout.
- **Transaction History:** Record of order payments, top-ups, and instant dispute refunds.

---

## 5. Delivery Portal — Screen-by-Screen Flow

### 5.1 Delivery Partner Onboarding (Individual vs Fleet Company)

```
[Role Selected: Delivery Partner]
                │
                ▼
[Account Type Selection] ──► Individual Driver vs Delivery Fleet Company
                │
                ▼
[Step 1: Partner Details]   ──► Name/Company, NIC, Mobile, Home/Office Base
                │
                ▼
[Step 2: Driving License]   ──► License Number, Expiry Date, Photo Upload (Individual)
                │
                ▼
[Step 3: Vehicle Manager]   ──► Vehicle Type, Reg No (CAB-1234), Revenue License, Insurance, Cold-Chain Toggle
                │
                ▼
[Step 4: Payout Details]    ──► Bank Account for Trip Payouts / Monthly Fleet Settlements
                │
                ▼
[Delivery Dashboard (Pending Admin Verification)]
```

#### Step 1 & 2: Partner Profile & License
- Full Name / Company Name.
- NIC / Driving License Number & Expiry Date.
- Driving License Front & Back Photo Uploads.
- Home Base / Operating Hub Location (Used for radius matching).

#### Step 3: Add Primary Vehicle (`/delivery/onboarding/vehicle`)
- **Vehicle Category:** Dropdown (`Three-Wheeler` | `Motorcycle (Small parcels)` | `Mini-Truck (Dimо Batta / Bolero)` | `Small Lorry (10-14ft)` | `Large Lorry (16-20ft)` | `Refrigerated Cold-Chain Truck` | `Van`).
- **Vehicle Registration Number:** Text input formatted to Sri Lankan standard (`CAB-1234` or `WP CAB-1234`).
- **Vehicle Load Capacity:** Numeric input in Kilograms (`kg`).
- **Cold Storage / Insulated Body Available:** Toggle Switch `[Yes/No]`.
- **Document Uploads:**
  - Vehicle Registration Book (CR / "Potha") Photo.
  - Valid Revenue License Photo & Expiry Date.
  - Vehicle Insurance Certificate Photo & Expiry Date.
- **Buttons:** `[Save Vehicle & Submit for Verification]`.

---

### 5.2 Delivery Shell & Active Status Toggle
- **Top Bar:**
  - Left: Pola Delivery Logo, Active Vehicle Switcher (e.g. `[Mini-Truck CAB-1234 ▾]`).
  - Center: **Online / Offline Availability Toggle Switch** (`[● GO ONLINE]` / `[○ OFFLINE]`).
  - Right: Language Toggle, Theme Toggle, Notification Bell, Earnings Pill (`Today: LKR 4,850`), Profile Avatar.
- **Desktop / Mobile Navigation:**
  - `Dashboard / HUD` (Icon: Compass)
  - `Available Orders (Leg 2)` (Icon: Radar/List)
  - `Hub Schedule (Leg 1)` (Icon: Calendar/Warehouse)
  - `My Vehicles & Drivers` (Icon: Truck)
  - `Earnings & Payouts` (Icon: DollarSign)
  - `Trip History` (Icon: Clock)
  - `Profile & Settings` (Icon: User)

---

### 5.3 Delivery Dashboard & Active Run HUD (`/delivery/dashboard`)
- **Active Trip Banner (If on an active run):** Prominent card with destination map, customer contact, and `[Open In-App Navigation]` CTA.
- **Quick Metrics (4 Cards):**
  1. *Today's Completed Trips:* Count (e.g. `6 Trips`).
  2. *Today's Earnings:* Value in LKR (e.g. `LKR 6,400.00`).
  3. *Available Orders in Radius:* Live count (e.g. `3 Orders Nearby`).
  4. *Partner Rating:* Score (e.g. `★ 4.92 / 5.0`).
- **Service Radius Slider:** Adjust search radius from home base (e.g. `5 km` to `35 km`).

---

### 5.4 Leg 2: Last-Mile Available Orders Radar (`/delivery/orders/available`)
*Displays orders sorted at the Distribution Center ready for customer delivery.*
- **Order Opportunity Card:**
  - **Pickup Location:** Distribution Center Name (e.g. `Meegoda Distribution Center`).
  - **Delivery Drop-off:** Customer Suburb & District (e.g. `Nugegoda, Colombo` • `7.2 km away`).
  - **Load Details:** Total weight (e.g. `35 kg`), Package count (`2 Crates`), Cold-chain requirement tag.
  - **Payout Amount:** Bold Green Text (e.g. `LKR 1,250.00`).
  - **Timer Countdown:** Time before order is broadcast to a wider radius (e.g. `01:45 remaining`).
  - **Action Button:** `[ACCEPT ORDER & START TRIP]` (First-accept-wins).

---

### 5.5 Leg 1: Hub Collection Schedule & Grading Intake Sheet (`/delivery/hub-schedule`)
*For delivery partners assigned to scheduled Village Hub → Distribution Center transport runs.*
- **Scheduled Run Card:**
  - Route: `Keppetipola Village Hub ──► Dambulla Distribution Center`.
  - Date & Pickup Window: `Every Tuesday, 06:00 AM – 09:00 AM`.
  - Expected Batch Load: Estimated `850 kg` across `6 Farmers`.
- **Interactive Hub Intake Sheet (Used at the Hub on Collection Day):**
  - Line-by-line farmer drop-off checklist:
    - Farmer Name & Crop.
    - Listed Weight vs **Actual Confirmed Scale Weight** (Numeric input).
    - **Assigned Quality Grade:** Selector (`Grade A` | `Grade B` | `Grade C` | `Rejected`).
    - **Photo Evidence Capture:** Camera button (Mandatory for Grade C or Rejected produce).
    - Rejection Reason Code Dropdown (If rejected: `Pest Damage`, `Rot/Spoilage`, `Undersized`, `Wrong Variety`).
  - Action: `[Sign & Lock Hub Manifest]` (Advances all collected orders to *In Transit to DC*).

---

### 5.6 Active Delivery Execution HUD (`/delivery/active-trip`)
- **Step 1: Pickup at Distribution Center / Hub:**
  - Package checklist with QR barcode scanner to verify all crate tags before loading.
  - `[Confirm Loading & Start Journey]` button.
- **Step 2: En Route to Customer:**
  - Live Map route with `[Navigate via Google Maps / Waze]` button.
  - Customer Information Card: Customer First Name, Masked Phone `[Call Customer]`, `[In-App Message]`.
- **Step 3: Arrival & Proof of Delivery (POD):**
  - Arrived at destination button.
  - Customer Handover Options:
    - Option A: **Customer 4-Digit Delivery OTP** input (Customer provides code shown on their tracking app).
    - Option B: **Proof of Delivery Photo Upload** (Photo of packages received at customer doorstep).
  - Collect Cash on Delivery Amount (if COD order: prominent cash collection confirmation checkbox).
  - Action: `[Complete Delivery & Collect Payout]`.

---

### 5.7 Vehicle & Fleet Management (`/delivery/vehicles`)
- **Registered Vehicles Table:**
  - Vehicle Type icon, Registration Plate (`CAB-1234`), Capacity, Cold Storage badge, Revenue License status, Assigned Driver (for fleet accounts).
  - `[+ Add Another Vehicle]` Modal.
- **Fleet Driver Directory (Company Accounts Only):**
  - Manage sub-drivers, assign specific drivers to specific vehicles, view individual driver trip ratings.

---

### 5.8 Delivery Earnings, Trip Statements & Settlements (`/delivery/earnings`)
- **Individual Partner View:**
  - Available Cash-out Balance (Per-trip payouts accumulated).
  - `[Request Withdrawal to Bank]` modal (re-uses standard withdrawal flow).
  - Itemized trip log with trip distance, base fee, weight bonus, and net payout.
- **Delivery Company Settlement View:**
  - Monthly aggregated billing summary.
  - Downloadable Monthly Settlement Statement (PDF/Excel) with fleet-wide breakdown.

---

## 6. Admin Portal — Screen-by-Screen Flow

### 6.1 Role-Based Admin Shell & Access Partitioning
- **Admin Tier Segmentation:**
  - **Super Admin:** Unrestricted access to all modules, system configuration, admin user creation.
  - **Operations Admin:** Access to User Verification, Order Oversight, Hub/DC Logistics, Content Moderation.
  - **Finance Admin:** Access to Manual Withdrawal Queue, Escrow Ledger, Commission Rates, Invoicing.
  - **Support Admin:** Access to Dispute Adjudication, Support Tickets, User Inquiries.
- **Admin Sidebar Navigation:**
  - `Command Center` (Overview KPIs & Real-Time Alerts)
  - `KYC Verification Queues` (Farmers, Delivery, B2B Customers)
  - `Order Oversight & Dispatch` (Live status grid, stuck orders)
  - `Disputes & Quality Adjudication` (Photo evidence comparative desk)
  - `Finance & Withdrawal Queue` (LankaPay bank execution queue)
  - `Logistics & Network Config` (Hubs, DCs, Schedules)
  - `Content Moderation` (Flagged images & listings)
  - `Support Ticketing Desk` (Inbound tickets)
  - `Audit Trail & Security Logs` (Immutable system ledger)
  - `Reports & Analytics Studio` (15 Exportable reports)
  - `Platform Settings` (Commission rates, grade multipliers, global toggles)

---

### 6.2 Executive Command Center & Real-Time Operational Heatmap (`/admin/dashboard`)
- **Top KPI Cards:**
  1. *Gross Merchandise Value (GMV):* Monthly total in LKR with % growth.
  2. *Platform Revenue:* Net commission earned.
  3. *Active In-Transit Orders:* Real-time count of orders moving through Leg 1 and Leg 2.
  4. *Pending KYC Queue:* Count of unverified users awaiting document check.
  5. *Open Disputes & Rejections:* Critical count requiring immediate staff review.
- **Real-Time Logistics Map (Interactive Map of Sri Lanka):**
  - Displays pins for the 4 Distribution Centers (Dambulla, Meegoda, Matara, Anuradhapura) and active Village Hubs with throughput metrics.

---

### 6.3 KYC & Verification Queue Desk (`/admin/verifications`)
- **Queue Sub-Tabs:** `Farmers & Collectors (8)` | `Delivery Partners & Vehicles (5)` | `B2B Businesses (3)`.
- **Side-by-Side Verification Inspector (Modal / Dedicated View):**
  - **Left Panel (Submitted Data):** Legal Name, NIC / BRN Number, Date of Birth, Address, Phone, Bank Account Details.
  - **Right Panel (Document Viewer):** High-resolution zoomable viewer for NIC Front/Back, Driving License, Vehicle CR Book, or Business Registration certificate.
  - **Verification Action Box:**
    - `[✓ Approve & Verify Account]` (Triggers automated approval email & unlocks full access).
    - `[Request Document Re-upload]` (Allows typing a specific rejection reason sent to user).
    - `[✗ Reject & Ban Account]`.

---

### 6.4 Order Intervention & Stuck Delivery Dispatch Board (`/admin/orders`)
- **Filter Bar:** Filter by Status (all 10 states), Distribution Center, Hub, Has Dispute flag, Date Range.
- **Stuck Order Alerts:** Highlights orders in *"Received at DC"* that have remained unclaimed by Leg-2 delivery partners beyond the timeout threshold.
- **Manual Intervention Actions:**
  - `[Force Reassign Leg-2 Delivery Partner]` (Search and assign an active partner manually).
  - `[Cancel Order & Issue Escrow Refund]`.
  - `[Adjust Order Line Item Quantity]`.

---

### 6.5 Dispute Adjudication Desk (`/admin/disputes`)
- **Comparative Evidence Inspector:**
  - **Left Side:** Hub Collection Intake Record (Assigned Quality Grade, Weight, Grader Notes, Photos taken at Hub).
  - **Right Side:** Customer Complaint (Customer-uploaded photos of damaged/spoiled produce, complaint description).
- **Adjudication Decision Controls:**
  - *Option A: Full Refund to Customer (Deducted from Farmer Escrow if farmer fault).*
  - *Option B: Delivery Damage Compensation (Platform / Delivery Partner liability).*
  - *Option C: Reject Customer Dispute (Hub evidence proves Grade A condition upon dispatch).*
  - *Option D: Partial Goodwill Credit to Customer Pola Wallet.*
  - Action: `[Execute Resolution & Close Dispute]` (Automatically creates immutable audit and wallet adjustment records).

---

### 6.6 Finance Desk: Manual Withdrawal Queue & Commission Config (`/admin/finance`)
- **Tab 1: Withdrawal Execution Queue:**
  - List of all pending cash-out requests from Farmers, Delivery Partners, and Customers.
  - Columns: `Request ID`, `User Name & Role`, `Amount (LKR)`, `Bank Name`, `Branch`, `Account No`, `Account Holder`, `Date Requested`.
  - Action Workflow:
    1. Admin performs manual bank transfer via corporate online banking (LankaPay).
    2. Admin enters the bank's **LankaPay Transaction Reference Number** into the input field.
    3. Admin clicks `[Mark as Processed]`.
    4. System immediately decrements user's pending balance, records the transaction, and dispatches a payout confirmation email.
- **Tab 2: Platform Commission & Grade Multiplier Configurator:**
  - Base Platform Commission % (e.g. `8.5%`).
  - Default Village Collector Commission % (e.g. `3.0%`).
  - Grade Pricing Multipliers:
    - *Grade A:* `100%` of listed price.
    - *Grade B:* `90%` of listed price.
    - *Grade C:* `75%` of listed price.
    - *Rejected:* `0%` (routes to Wastage log).
  - Delivery Leg 1 & Leg 2 Payout Formulas (Flat fee + per-km + per-kg multipliers).
  - Action: `[Save & Version Configuration]` (Never affects already completed past orders).

---

### 6.7 Logistics Hub & Distribution Center Network Configurator (`/admin/logistics`)
- **Distribution Center Manager:**
  - Add/Edit the 4 main DCs (Dambulla, Meegoda, Matara, Anuradhapura).
  - Set DC Manager contact, GPS coordinates, operating hours, cold-storage capacity.
- **Village Hub Manager:**
  - Add/Edit Village Hubs.
  - Assign serving villages, linked Distribution Center, assigned Village Collector(s), and assigned Leg-1 transport partners.
  - Set recurring collection schedule (Days of week & time windows).

---

### 6.8 Content Moderation Queue (`/admin/moderation`)
- List of newly uploaded crop listing photos and descriptions flagged by automated duplicate image detection or keyword triggers.
- Actions: `[Approve Listing]` | `[Request Image Change]` | `[Remove Listing & Notify Farmer]`.

---

### 6.9 Support Ticketing Inbox (`/admin/support`)
- Unified customer and partner support ticketing desk.
- States: `Open` → `In Progress` → `Waiting on User` → `Resolved` → `Closed`.
- In-app ticket response composer with canned templates and ticket reassignment controls.

---

### 6.10 Immutable Audit Trail Viewer (`/admin/audit-logs`)
- Read-only, append-only log of every state-changing administrative action.
- Columns: `Timestamp`, `Admin Name & ID`, `Action Performed`, `Target Entity (User / Order / Payout)`, `Before State`, `After State`, `IP Address / Reason Note`.

---

### 6.11 Reports & Analytics Studio (`/admin/reports`)
- Centralized reporting engine to generate and export all **15 System Reports** with custom Date Range, Distribution Center, and Product Category filters:
  1. *Farmer Income Reports* (Monthly / Annual) [PDF, Excel]
  2. *Hub Collection & Intake Reports* [PDF]
  3. *Village Collector Commission Reports* [Excel]
  4. *Customer Order Detail & Tax Invoices* [PDF]
  5. *Monthly B2B Purchase Summaries* [Excel]
  6. *Spending by Category Reports* [PDF, Excel]
  7. *Delivery Trip / Earnings Statements* [PDF, Excel]
  8. *Fleet Vehicle Utilization Reports* [Excel]
  9. *Platform Revenue & GMV Report* [Excel]
  10. *Delivery Partner Performance & Verification Report* [PDF]
  11. *Farmer Performance & Hub Rejection Report* [Excel]
  12. *Customer Segmentation (B2B vs B2C) Report* [Excel]
  13. *Village Hub Throughput & Volume Report* [PDF]
  14. *Dispute, Refund & Quality Rejection Log* [Excel]
  15. *Wastage & Spoilage Tracking Report* [Excel]

---

## 7. Universal Reusable UI Elements & Modals

### 7.1 Address Picker Drawer (`<AddressDrawer />`)
- Slide-over drawer accessible from header or checkout.
- Shows list of saved addresses with labels (`Home`, `Farm 1`, `Restaurant Kitchen`, `Warehouse`).
- Form fields for adding new address:
  - Label Input (`Home`, `Work`, etc.).
  - Province Dropdown (9 Provinces) & District Dropdown (25 Districts).
  - Street Address & City text inputs.
  - Postal Code (5 numeric digits).
  - Map Pin Drop component (`<GpsPinPicker />`).
  - Set as Default Address checkbox.

### 7.2 In-App Chat Drawer (`<ChatDrawer />`)
- Clean messaging interface connecting Customer ↔ Farmer or Customer ↔ Delivery Partner.
- Displays linked Order ID header with active order status badge.
- Message history bubble list with timestamp and delivery ticks.
- Text input box with image attachment button and quick phrase chips (*"Where are you currently?", "Order is ready for pickup"*).

### 7.3 Notification Center Drawer (`<NotificationDrawer />`)
- Right slide-over drawer showing real-time event cards.
- Filter tabs: `All` | `Orders` | `Payouts` | `System`.
- Mark all as read button and direct link to Notification Settings.

### 7.4 Image Upload & Cropper Component (`<ImageUploader />`)
- Drag-and-drop zone with camera trigger on mobile devices.
- Client-side automatic image compression (converts to WebP, limits max dimension to 1600px, quality 0.8 to keep files < 500KB).
- Visual thumbnail preview with delete and crop adjust buttons.

---

## 8. Summary Screen Mapping by Portal

| Portal | Screen / Tab Route | Core Function & Primary Elements |
|---|---|---|
| **Farmer** | `/farmer/dashboard` | KPI metrics, next hub collection schedule, price trend benchmarks, quick action buttons. |
| **Farmer** | `/farmer/farms` | Farm grid, land extent, ownership, irrigation sources, interactive GPS boundary picker. |
| **Farmer** | `/farmer/products` | Crop catalog, add/edit listing wizard, B2B bulk tiers, MOQ, organic certificates, stock levels. |
| **Farmer** | `/farmer/orders` | Order lifecycle tracker (Awaiting Drop-off, In Transit, Completed), packing slip printing. |
| **Farmer** | `/farmer/hubs` | Hub collection schedule, drop-off batch QR generator, grading inspection receipts & dispute action. |
| **Farmer** | `/farmer/wallet` | Available vs Pending escrow balance, withdrawal request modal to bank account, transaction log. |
| **Farmer** | `/farmer/collector` | Managed farmers directory, proxy crop listing, multi-farmer aggregated batching, commission tracker. |
| **Customer** | `/marketplace` | Hero banners, category ribbon, product grid, farmer info, B2B badges, quick add to cart. |
| **Customer** | `/product/:id` | High-res gallery, farmer profile link, B2B price tier table, harvest dates, unit selector, reviews. |
| **Customer** | `/cart` | Multi-farmer smart DC grouping, MOQ validation, live delivery fee calculation, checkout CTA. |
| **Customer** | `/checkout` | Delivery address picker, delivery slot selector, payment choice (PayHere / Pola Wallet / COD). |
| **Customer** | `/customer/orders/:id` | 10-stage lifecycle progress bar, hub quality grade receipt, live Leg-2 driver tracking, ratings. |
| **Customer** | `/customer/wallet` | Store credit balance, PayHere top-up modal, instant refund ledger. |
| **Delivery** | `/delivery/dashboard` | Active trip HUD, online/offline status switch, radius slider, today's completed trips & earnings. |
| **Delivery** | `/delivery/orders/available` | Leg-2 last-mile order radar, pickup DC, drop-off suburb, distance, weight, payout amount, 1-click claim. |
| **Delivery** | `/delivery/hub-schedule` | Leg-1 scheduled route calendar, hub intake grading sheet (weight, Grade A/B/C/Reject, photo proof). |
| **Delivery** | `/delivery/active-trip` | Turn-by-turn navigation trigger, customer call/chat, proof of delivery (OTP / photo) confirmation. |
| **Delivery** | `/delivery/vehicles` | Vehicle registry (3-wheelers, mini-trucks, lorries, cold-chain), CR book & revenue license manager. |
| **Delivery** | `/delivery/earnings` | Per-trip payout ledger, withdrawal request modal, monthly fleet settlement statements. |
| **Admin** | `/admin/dashboard` | Real-time GMV, revenue, active order heatmap, critical queues (pending KYC, open disputes). |
| **Admin** | `/admin/verifications` | Side-by-side KYC inspector (NIC, driving license, CR book, BRN) with 1-click approve/reject. |
| **Admin** | `/admin/orders` | Live order oversight grid, stuck delivery dispatch intervention, manual driver force-assignment. |
| **Admin** | `/admin/disputes` | Comparative desk (Hub inspection photo vs customer complaint photo), refund calculator. |
| **Admin** | `/admin/finance` | Manual withdrawal execution queue with LankaPay reference logging, commission & grade rate config. |
| **Admin** | `/admin/logistics` | Distribution Center and Village Hub network configurator, schedule calendars, collector assignments. |
| **Admin** | `/admin/reports` | 15 exportable PDF/Excel reports generator with flexible date, DC, and category filters. |
