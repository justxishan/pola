# Pola (පොළ) — UI Component Design Catalog & Elements Checklist

> **Purpose:** This document catalogs every UI component, element, variant, and interactive control needed across the Pola platform. Use this checklist as your shopping list to pick custom styles, CSS effects, animations, and Tailwind classes from **[uiverse.io](https://uiverse.io/)**, **shadcn/ui**, **Tailwind UI**, or any other design library.

---

## Design System Tokens Reference

Before picking elements, keep these unified Pola design principles in mind:
- **Primary Brand Color (Agriculture / Freshness):** Emerald / Leaf Green (`#10B981` / `#059669`)
- **Secondary / Trust Color (Logistics & Payments):** Sky Blue / Ocean Cyan (`#0EA5E9` / `#0284C7`)
- **Accent / Alert Color (Pending / Quality / Warning):** Warm Amber (`#F59E0B` / `#D97706`)
- **Danger / Rejection Color:** Crimson Red (`#EF4444` / `#DC2626`)
- **Surface Neutrals (Light):** Slate / Zinc (`#F8FAFC`, `#FFFFFF`, border `#E2E8F0`)
- **Surface Neutrals (Dark):** Dark Slate (`#0F172A`, `#1E293B`, border `#334155`)
- **Corner Radius:** Rounded-xl (`rounded-xl` or `12px` / `16px` for cards, `rounded-lg` or `8px` for inputs/buttons)

---

## 1. Buttons & Action Triggers

| # | Element Name | Variants Needed | Where It's Used in Pola | Key Design Notes for uiverse.io Search |
|---|---|---|---|---|
| 1.1 | **Primary Action Button** | Default, Hover, Active, Loading (Spinner), Disabled | `[Publish Listing]`, `[Proceed to Checkout]`, `[Place Order]`, `[Accept Delivery]` | High-emphasis green button with subtle glow or smooth elevation lift on hover. |
| 1.2 | **Secondary / Outline Button** | Bordered, Subtle Hover Fill | `[Save as Draft]`, `[Preview Listing]`, `[View Details]`, `[Filter Reset]` | Transparent bg with `1.5px` border, clean hover background fill. |
| 1.3 | **Danger / Destructive Button** | Solid Red, Ghost Red Border | `[Cancel Order]`, `[Delete Farm]`, `[Reject Produce]`, `[Ban Account]` | Red tone indicating irreversible or warning actions. |
| 1.4 | **Ghost / Text Button** | Underline on hover, Minimal | `[Skip for Now]`, `[Change Email]`, `[Resend OTP]`, `[Terms & Conditions]` | Clean text button with zero background noise. |
| 1.5 | **Icon Button (Action Buttons)** | Circular & Rounded Square | Wishlist Heart, Trash / Delete, Edit Pencil, Close `(X)`, Search magnifying glass | Compact 36px/40px touch targets with smooth hover background circular ripple. |
| 1.6 | **Floating Action Button (FAB)** | Mobile Floating Circle with `+` icon | Mobile Farmer Dashboard (`+ Add Product`), Mobile Delivery HUD | Floating rounded-full with high elevation shadow (`shadow-xl`). |
| 1.7 | **Social / OAuth Button** | Google OAuth branded button | `/auth` Login & Sign-up modal | Official Google icon with clean white or dark surface button. |
| 1.8 | **Segmented Button Group / Tabs** | Active pill slider animation | `[Log In]` \| `[Sign Up]`, `[Ready Stock]` \| `[Pre-Order]`, `[Daily]` \| `[Monthly]` | Sliding active background indicator between options. |
| 1.9 | **Online / Offline Toggle Button** | Big interactive toggle with glowing indicator dot | Delivery Partner Top Bar (`[● GO ONLINE]`) | Distinctive switch with green pulse ring when active. |

---

## 2. Form Inputs & Data Entry Controls

| # | Element Name | Variants Needed | Where It's Used in Pola | Key Design Notes for uiverse.io Search |
|---|---|---|---|---|
| 2.1 | **Text & Numeric Input** | Default, Focus Ring, Error (Red border + helper message), Success, Disabled | Product Name, Price in LKR, Extent, NIC number, Address | Floating label or clean top-label with subtle border and focus ring (`focus:ring-2 focus:ring-emerald-500`). |
| 2.2 | **OTP 6-Digit Code Input** | 6 individual square boxes with auto-focus and paste | `/auth/verify` email verification | 6 separate rounded square boxes with animated cursor/focus ring. |
| 2.3 | **Select Dropdown** | Standard Dropdown & Searchable Dropdown | Province (9), District (25), Standard Units (`kg`, `g`, etc.), Bank Name | Custom animated dropdown menu with smooth expand/collapse and search filter. |
| 2.4 | **Checkbox** | Checked, Unchecked, Indeterminate, Error | Multi-select filters (Categories, Irrigation sources, Terms agreement) | Custom animated checkmark SVG transition with emerald green fill. |
| 2.5 | **Radio Button** | Selected, Unselected | Role selection, Ownership (`Owned`/`Leased`), Grade selection (`Grade A`/`B`/`C`) | Custom dot-scale or glowing ring animation on selection. |
| 2.6 | **Toggle Switch** | On, Off, Disabled | Organic Certified toggle, B2B wholesale enable, Cold-storage vehicle toggle | Smooth sliding pill switch with color shift from gray to emerald. |
| 2.7 | **Quantity Stepper Input** | `[-]` `[ 1 ]` `[+]` with manual edit | Cart quantity, PDP unit selector, hub batch weight adjust | Compact pill with circular minus/plus buttons and center numeric field. |
| 2.8 | **Textarea** | Auto-expanding / Fixed with character counter | Farm description, Crop harvest notes, Support ticket message | Multi-line clean container with bottom-right character limit counter. |
| 2.9 | **Dual-Thumb Range Slider** | Interactive 2-point slider with tooltip | Price Range filter (`LKR 50 — LKR 1,500`), Delivery Radius slider (`5km — 35km`) | Dual handle slider with colored active track and floating value tags. |
| 2.10 | **File & Image Dropzone** | Empty Drag & Drop, Hovering, Uploading (Progress bar), Uploaded Thumbnail with Delete | NIC front/back, Product photos (up to 5), Vehicle CR book, Organic Certificate | Dashed border upload zone with cloud icon, file preview cards, and removal `(X)`. |

---

## 3. Cards & Content Surfaces

| # | Element Name | Variants Needed | Where It's Used in Pola | Key Design Notes for uiverse.io Search |
|---|---|---|---|---|
| 3.1 | **Metric / Stat KPI Card** | Simple, With Percentage Trend Badge, With Subtitle | Farmer Dashboard (Total Earnings, Active Crops), Admin Dashboard (GMV, Revenue) | Clean card with large bold typography, icon container, and micro trend indicator. |
| 3.2 | **E-Commerce Product Card** | Grid Card & Horizontal List Card | Customer Marketplace, Farmer Storefront | High-res image with zoom on hover, organic badge, price in LKR, farmer tag, add-to-cart button. |
| 3.3 | **Role Selection Onboarding Card** | 3 Big Interactive Cards with Icon & Radio | Universal Onboarding (`Farmer`, `Customer`, `Delivery`) | Large visual card with hover scale, subtle border glow when selected. |
| 3.4 | **Farm Overview Card** | Satellite/Photo Card with Chip Tags | Farmer `My Farms` screen | Card featuring farm name, district badge, land extent, and irrigation tag chips. |
| 3.5 | **Order Summary Card** | Header, Item Row, Status Pill, Action Buttons | Farmer Orders, Customer Order History, Delivery Assigned Trips | Structured card with clear division between line items, totals, and action buttons. |
| 3.6 | **Delivery Opportunity Card** | Radar Card with Countdown Timer | Delivery Portal Leg-2 Available Orders | Features pickup DC, delivery suburb, payout in bold green, and live countdown timer bar. |
| 3.7 | **Review & Rating Card** | Star Rating, Verified Badge, User Comment | Product Detail Page (PDP), Farmer Storefront | 5-star display with customer name, date, verified buyer badge, and helpfulness counter. |

---

## 4. Navigation & Layout Elements

| # | Element Name | Variants Needed | Where It's Used in Pola | Key Design Notes for uiverse.io Search |
|---|---|---|---|---|
| 4.1 | **Top Navigation Bar (Public & Customer)** | Sticky, Glassmorphism / Solid | Public Landing, Marketplace Header | Glassmorphism (`backdrop-blur-md`), search bar in center, location picker pill, cart icon with badge. |
| 4.2 | **Sidebar Navigation (Admin, Farmer, Delivery)** | Expanded (240px) & Collapsed Icon Rail (72px) | Farmer, Delivery, and Admin Portals | Modern sidebar with active item indicator pill, notification badge, and collapse trigger. |
| 4.3 | **Mobile Bottom Navigation Bar** | 5-Pill Icon Navigation with Active Glow | Mobile views for Farmer, Customer, Delivery | Fixed bottom bar with active indicator dot and smooth icon transition. |
| 4.4 | **Category Ribbon (Horizontal Scroll)** | Pill Chips with Icons | Customer Marketplace Discovery | Scrollable horizontal ribbon with vegetable, fruit, grain icons and smooth active pill state. |
| 4.5 | **Breadcrumb Trail** | Hierarchical links (`Home > Vegetables > Carrot`) | Product Detail Page, Admin Deep Views | Clean text trail with `/` or `>` separator and hover underline. |
| 4.6 | **User Profile Dropdown Menu** | Popover with avatar, role badge & links | Top Header Bar across all portals | Floating menu with user email, role switcher, theme toggle, and logout button. |

---

## 5. Status Indicators, Badges & Feedback

| # | Element Name | Variants Needed | Where It's Used in Pola | Key Design Notes for uiverse.io Search |
|---|---|---|---|---|
| 5.1 | **Status Badge / Pill** | Emerald (Active/Grade A), Sky (In-Transit), Amber (Pending/Grade C), Crimson (Rejected) | Order status, Listing status, KYC verification status, Quality grade | Rounded-full pill with small dot indicator and subtle background tint. |
| 5.2 | **Progress Bar & Stepper** | Horizontal 10-Stage Stepper & Simple Bar | Order Tracking timeline (10 stages), Stock level remaining bar | Multi-step progress line with completed checkmarks and pulsing active stage dot. |
| 5.3 | **Toast Notification Banner** | Success, Error, Info, Warning | Real-time action feedback ("Listing published!", "Order placed!") | Floating top-right or bottom-center card with progress bar countdown timer and auto-dismiss. |
| 5.4 | **Alert / Callout Box** | Warning (Amber), Info (Blue), Danger (Red) | Unverified KYC warning banner, Pre-order deposit notice | Clean colored container with left accent border and descriptive icon. |
| 5.5 | **Empty State Component** | Illustrated placeholder with Action Button | Empty Cart, No Products Listed, No Orders Found | Subtle vector/SVG illustration, friendly heading, explanatory text, and primary CTA button. |
| 5.6 | **Loading Skeleton Screens** | Card Skeleton, Table Row Skeleton, PDP Skeleton | Data fetching states | Shimmering wave animation over placeholder gray boxes. |

---

## 6. Modals, Drawers & Overlays

| # | Element Name | Variants Needed | Where It's Used in Pola | Key Design Notes for uiverse.io Search |
|---|---|---|---|---|
| 6.1 | **Modal Dialog (Standard)** | Small (Confirm), Medium (Forms), Large (Wizards) | Add Farm Modal, Withdraw to Bank Modal, Add Vehicle Modal | Centered backdrop blur dialog with smooth scale-in animation and sticky header/footer. |
| 6.2 | **Slide-Over Drawer (Right / Bottom)** | Right Sheet (Desktop), Bottom Sheet (Mobile) | Address Picker Drawer, Chat Drawer, Notification Drawer, Filter Drawer | Smooth slide-in drawer with swipe-to-dismiss gesture on mobile. |
| 6.3 | **Confirmation / Alert Dialog** | Danger Confirmation with double-check | "Delete Farm?", "Reject Hub Batch?", "Cancel Order?" | High-focus modal with warning icon, consequences explanation, and red confirm button. |
| 6.4 | **Two-Way Rating Modal** | 2-Step Star Rating with feedback chips | Post-purchase Customer Review (Farmer + Delivery) | Interactive star hover glow with interactive tag chips (*"Fresh"*, *"Punctual"*). |
| 6.5 | **Side-by-Side Inspector View** | Split Screen (50% Data Form, 50% Zoomable Image) | Admin KYC Verification, Dispute Adjudication Desk | Clean split screen with synchronized zoom/pan controls for documents and photo proof. |

---

## 7. Specialized Domain Components

| # | Element Name | Variants Needed | Where It's Used in Pola | Key Design Notes for uiverse.io Search |
|---|---|---|---|---|
| 7.1 | **Interactive GPS Map Pin Picker** | Map with draggable marker & "My Location" button | Farm Registry, Customer Delivery Address, Hub Location | Embedded Leaflet/Map container with centered target crosshair and lat/long display. |
| 7.2 | **QR Code & Barcode Manifest Card** | Scannable QR container with print button | Hub Drop-off Batch, DC Crate Labels | Clean high-contrast QR display with download and print stylesheet buttons. |
| 7.3 | **B2B Tiered Pricing Table** | Dynamic editable rows (Farmer) / Price table (PDP) | Add Product Wizard (Step 2), Product Detail Buy Box | Clean table displaying quantity brackets (`1-49kg`, `50-199kg`, `200+kg`) and % savings badges. |
| 7.4 | **Language Switcher Control** | Dropdown Menu & 3-Pill Toggle (`EN` \| `සිං` \| `தம`) | Top Navigation Bar & Footer | Clean pill toggle with active selection highlight. |
| 7.5 | **Theme Switcher Switch** | Sun / Moon animated icon toggle | Top Navigation Bar & User Settings | Smooth rotation/morph animation between sun and moon icons. |

---

## 8. Suggested Design Search Keywords for [uiverse.io](https://uiverse.io/)

When browsing **uiverse.io**, use these exact search queries to find top-rated community designs for each element:

- **Buttons:** `"glow button"`, `"gradient button"`, `"neumorphic button"`, `"loading button"`, `"animated button"`
- **Inputs:** `"floating label input"`, `"otp input"`, `"modern search bar"`, `"animated input"`
- **Toggles & Switches:** `"ios toggle switch"`, `"theme switch"`, `"animated checkbox"`, `"custom radio button"`
- **Cards:** `"ecommerce product card"`, `"glassmorphism card"`, `"profile card"`, `"hover card"`
- **Navigation:** `"sidebar menu"`, `"tab bar"`, `"mobile navigation bar"`, `"breadcrumbs"`
- **Feedback:** `"status badge"`, `"stepper progress"`, `"toast notification"`, `"loading spinner"`
- **Modals & Drawers:** `"modal popup"`, `"animated drawer"`, `"confirmation box"`
