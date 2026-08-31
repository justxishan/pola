# Pola (පොළ) — Full Codebase Architecture & File Tree Specification

> **Companion to Part 1 (`pola-system-specification.md`), Part 2 (`pola-payments-wallet-quality-filters-spec.md`), and Part 3 (`pola-ui-ux-flow-specification.md`)**.  
> This document specifies the exact, complete file tree and directory structure for the Pola platform's full-stack MERN repository (React + Vite + Tailwind CSS + TypeScript frontend, Node.js + Express.js + Mongoose + TypeScript backend). Every file, folder, controller, route, model, component, hook, utility, and configuration file is cataloged with its architectural responsibility.

---

## Table of Contents
1. [Repository Architecture & Monorepo Structure](#1-repository-architecture--monorepo-structure)
2. [Root Project Directory & Configuration](#2-root-project-directory--configuration)
3. [Backend Server Architecture (`/server`)](#3-backend-server-architecture-server)
   - 3.1 [Core Server Entry & Config (`/server/src/config`)](#31-core-server-entry--config-serversrcconfig)
   - 3.2 [Database Models & Schemas (`/server/src/models`)](#32-database-models--schemas-serversrcmodels)
   - 3.3 [Controllers & Business Logic (`/server/src/controllers`)](#33-controllers--business-logic-serversrccontrollers)
   - 3.4 [API Routes (`/server/src/routes`)](#34-api-routes-serversrcroutes)
   - 3.5 [Middlewares (`/server/src/middleware`)](#35-middlewares-serversrcmiddleware)
   - 3.6 [Business Services & Engines (`/server/src/services`)](#36-business-services--engines-serversrcservices)
   - 3.7 [Request Validators (`/server/src/validators`)](#37-request-validators-serversrcvalidators)
   - 3.8 [Utilities & Helpers (`/server/src/utils`)](#38-utilities--helpers-serversrcutils)
   - 3.9 [Database Seeds & Migrations (`/server/src/seeds`)](#39-database-seeds--migrations-serversrcseeds)
4. [Frontend Client Architecture (`/client`)](#4-frontend-client-architecture-client)
   - 4.1 [Entry, Root & Routing (`/client/src`)](#41-entry-root--routing-clientsrc)
   - 4.2 [Portal Pages & Views (`/client/src/pages`)](#42-portal-pages--views-clientsrcpages)
   - 4.3 [Reusable UI Components (`/client/src/components`)](#43-reusable-ui-components-clientsrccomponents)
   - 4.4 [State Management & Contexts (`/client/src/context`)](#44-state-management--contexts-clientsrccontext)
   - 4.5 [Custom Hooks (`/client/src/hooks`)](#45-custom-hooks-clientsrchooks)
   - 4.6 [API Client & Service SDKs (`/client/src/api`)](#46-api-client--service-sdks-clientsrcapi)
   - 4.7 [TypeScript Types & Interfaces (`/client/src/types`)](#47-typescript-types--interfaces-clientsrctypes)
   - 4.8 [Internationalization & Locales (`/client/src/locales`)](#48-internationalization--locales-clientsrclocales)
   - 4.9 [Frontend Utilities & Formatters (`/client/src/utils`)](#49-frontend-utilities--formatters-clientsrcutils)
5. [Shared Package (`/shared`)](#5-shared-package-shared)
6. [Complete ASCII Codebase File Tree](#6-complete-ascii-codebase-file-tree)

---

## 1. Repository Architecture & Monorepo Structure

Pola uses a clean, modular **Turborepo / npm workspaces monorepo structure** separating the Node/Express backend, the React/Vite frontend, and a shared TypeScript library for common types, enums, constants, and Sri Lankan validation utilities:

```
pola/
├── client/          # Frontend Web Application (React 18, Vite, Tailwind CSS, TypeScript)
├── server/          # Backend REST API Server (Node.js, Express, MongoDB/Mongoose, TypeScript)
├── shared/          # Shared Types, Interfaces, Enums, and Validation Constants
├── package.json     # Workspace Root configuration
└── docker-compose.yml
```

---

## 2. Root Project Directory & Configuration

```
pola/
├── .github/
│   └── workflows/
│       ├── ci-backend.yml            # Automated linting, typecheck & unit tests for server
│       └── ci-frontend.yml           # Automated build check & linting for client
├── .husky/
│   └── pre-commit                    # Git pre-commit hook (lint-staged & typecheck)
├── .vscode/
│   ├── extensions.json               # Recommended extensions (Tailwind, ESLint, Prettier)
│   └── settings.json                 # Formatter and linter workspace settings
├── .env.example                      # Root environment variables template
├── .gitignore                        # Global git ignore rules (node_modules, dist, .env, etc.)
├── .prettierrc                       # Shared Prettier code formatting rules
├── .prettierignore
├── docker-compose.yml                # Docker compose for local development (Mongo + Redis optional)
├── package.json                      # Monorepo workspaces definition (`client`, `server`, `shared`)
├── tsconfig.base.json                # Shared TypeScript base compiler configuration
└── README.md                         # Project setup, local startup guide & architecture overview
```

---

## 3. Backend Server Architecture (`/server`)

The backend is built with **Node.js, Express, TypeScript, and Mongoose**, following a clean **Layered Architecture (Controller → Service → Model)** to keep business logic, escrow accounting, quality grading, and data persistence cleanly decoupled.

```
server/
├── .env.example                      # Server environment variable template
├── package.json                      # Server dependencies (express, mongoose, payhere, jsonwebtoken, etc.)
├── tsconfig.json                     # Server TypeScript configuration
└── src/
    ├── app.ts                        # Express application factory, middleware pipeline setup
    ├── server.ts                     # HTTP server entry point & graceful shutdown listener
    │
    ├── config/                       # Third-party services & environment configuration
    │   ├── db.config.ts              # MongoDB Atlas connection with auto-reconnect & pooling
    │   ├── env.config.ts             # Strongly-typed environment variable loader & validator
    │   ├── cloudinary.config.ts      # Cloudinary SDK client for secure image/document uploads
    │   ├── payhere.config.ts         # PayHere Sandbox gateway configuration & MD5 hash generator
    │   ├── mailer.config.ts          # Nodemailer / Transactional email client setup
    │   └── oauth.config.ts           # Google OAuth2 client verification setup
    │
    ├── models/                       # Mongoose Schemas & TypeScript Data Models
    │   ├── User.model.ts             # User profiles (Farmer, Collector, Customer, Delivery, Admin)
    │   ├── Farm.model.ts             # Registered farm records with GPS coordinates & extent
    │   ├── Product.model.ts          # Crop listings, B2B price tiers, MOQ, season & stock
    │   ├── Order.model.ts            # Orders, 10-stage lifecycle, item snapshots & addresses
    │   ├── VillageHub.model.ts       # Village Hubs, serving villages, recurring schedules
    │   ├── DistributionCenter.model.ts # 4 Regional DCs (Dambulla, Meegoda, Matara, Anuradhapura)
    │   ├── Vehicle.model.ts          # Delivery vehicles, registration, capacity, cold-chain
    │   ├── Wallet.model.ts           # User wallet (Available & Pending Escrow balance)
    │   ├── LedgerEntry.model.ts      # Append-only immutable financial transaction ledger
    │   ├── QualityInspection.model.ts# Hub/DC quality grading records (Grade A/B/C/Reject, photos)
    │   ├── Reconciliation.model.ts   # Weight/shortfall discrepancy cases & dispute resolutions
    │   ├── Dispute.model.ts          # Customer & farmer disputes with photo evidence
    │   ├── Rating.model.ts           # Two-way independent ratings (Produce & Delivery)
    │   ├── SupportTicket.model.ts    # Multi-portal support tickets & communication thread
    │   ├── ContentFlag.model.ts      # Content moderation queue for suspicious listings/photos
    │   ├── AuditLog.model.ts         # Immutable admin intervention audit trail
    │   ├── WastageLog.model.ts       # Spoilage & rejected produce tracking
    │   └── Notification.model.ts     # User in-app notifications and read receipts
    │
    ├── controllers/                  # Route Handlers & HTTP Request Coordinators
    │   ├── auth.controller.ts        # Google OAuth, Email OTP generation & verification, role selection
    │   ├── farmer.controller.ts      # Farmer profile, dashboard metrics, farm registry
    │   ├── product.controller.ts     # Product listing CRUD, stock updates, catalog filters
    │   ├── farm.controller.ts        # Farm creation, GPS update, organic certificate uploads
    │   ├── customer.controller.ts    # Customer profiles, B2B business document submission, favorites
    │   ├── order.controller.ts       # Multi-farmer cart checkout, order tracking, cancellation
    │   ├── cart.controller.ts        # Server-validated cart calculations, DC grouping, MOQ check
    │   ├── delivery.controller.ts    # Delivery partner radar (Leg 2), trip execution, OTP verification
    │   ├── hub.controller.ts         # Leg 1 collection runs, Hub intake grading sheet submission
    │   ├── vehicle.controller.ts     # Vehicle registration, document uploads, fleet driver assignment
    │   ├── wallet.controller.ts      # Wallet balance retrieval, LankaPay withdrawal request, ledger
    │   ├── dispute.controller.ts     # Dispute creation, evidence upload, admin adjudication
    │   ├── rating.controller.ts      # Submitting farmer/produce ratings and delivery ratings
    │   ├── ticket.controller.ts      # Support ticket creation, message replies, state updates
    │   ├── report.controller.ts      # Generating 15 system reports (PDF & Excel generation)
    │   ├── admin.controller.ts       # KYC queue approvals, stuck order force-dispatch, system config
    │   ├── webhook.controller.ts     # PayHere payment confirmation & refund IPN webhooks
    │   └── notification.controller.ts# In-app notifications retrieval, mark-as-read
    │
    ├── routes/                       # Express Route Definitions & Grouping
    │   ├── index.ts                  # Master router combining all sub-route modules (`/api/v1`)
    │   ├── auth.routes.ts            # `/api/v1/auth` (login, google, otp, select-role, refresh)
    │   ├── farmer.routes.ts          # `/api/v1/farmer` (dashboard, profile, stats)
    │   ├── farm.routes.ts            # `/api/v1/farms` (CRUD for farms, GPS locations)
    │   ├── product.routes.ts         # `/api/v1/products` (public marketplace catalog & farmer CRUD)
    │   ├── customer.routes.ts        # `/api/v1/customer` (profile, b2b verification, addresses)
    │   ├── order.routes.ts           # `/api/v1/orders` (checkout, tracking, lifecycle transitions)
    │   ├── cart.routes.ts            # `/api/v1/cart` (validate, calculate delivery fees)
    │   ├── delivery.routes.ts        # `/api/v1/delivery` (available Leg-2 orders, active HUD)
    │   ├── hub.routes.ts             # `/api/v1/hubs` (hub schedules, Leg-1 intake grading sheets)
    │   ├── vehicle.routes.ts         # `/api/v1/vehicles` (fleet & vehicle management)
    │   ├── wallet.routes.ts          # `/api/v1/wallet` (balances, transactions, withdrawal requests)
    │   ├── dispute.routes.ts         # `/api/v1/disputes` (file dispute, comparative evidence)
    │   ├── rating.routes.ts          # `/api/v1/ratings` (rate farmer, rate delivery partner)
    │   ├── ticket.routes.ts          # `/api/v1/tickets` (support ticket threads)
    │   ├── report.routes.ts          # `/api/v1/reports` (PDF/Excel report downloads)
    │   ├── admin.routes.ts           # `/api/v1/admin` (KYC, dispatch, audit, configuration)
    │   ├── webhook.routes.ts         # `/api/v1/webhooks` (PayHere IPN callback endpoint)
    │   └── notification.routes.ts    # `/api/v1/notifications` (in-app alerts)
    │
    ├── middleware/                   # Express Middlewares
    │   ├── auth.middleware.ts        # JWT token verification & session population
    │   ├── role.middleware.ts        # Role-Based Access Control (`requireRole('farmer' | 'admin' ...)`)
    │   ├── kyc.middleware.ts         # Action-gating middleware (`requireVerifiedKyc`)
    │   ├── validate.middleware.ts    # Zod/Joi request schema validation runner
    │   ├── upload.middleware.ts      # Multer memory storage configuration for file uploads
    │   ├── audit.middleware.ts       # Intercepts state changes and writes to `AuditLog`
    │   ├── rateLimiter.middleware.ts # IP-based rate limiting for auth and payment endpoints
    │   └── error.middleware.ts       # Global HTTP error handler & standardized JSON response
    │
    ├── services/                     # Business Logic Engines & Heavy Subsystems
    │   ├── escrow.service.ts         # Order escrow hold, release, and automated fee-splitting engine
    │   ├── payout.service.ts         # LankaPay manual withdrawal queue & batch processing
    │   ├── grading.service.ts        # Quality grade price multiplier & weight discrepancy adjustments
    │   ├── radius.service.ts         # Haversine distance calculator for Leg-2 delivery radar
    │   ├── qr.service.ts             # QR Code & Barcode manifest generator for Hub/DC crates
    │   ├── pdf.service.ts            # PDF generation (Invoices, Farmer Income, Delivery statements)
    │   ├── excel.service.ts          # Excel spreadsheet generation (B2B Purchase, Wastage, Reports)
    │   ├── mailer.service.ts         # Email templates (OTP codes, order updates, payout confirmations)
    │   ├── notification.service.ts   # In-app push notification dispatcher
    │   └── cloudinary.service.ts     # Image upload, compression & secure document signed URLs
    │
    ├── validators/                   # Schema Validation Rules (Zod / Joi)
    │   ├── auth.validator.ts         # Email format, 6-digit OTP, role selection schema
    │   ├── farmer.validator.ts       # NIC (Old/New), Sri Lankan mobile (`+947X`), name rules
    │   ├── farm.validator.ts         # Land extent, Province, District, GPS latitude/longitude
    │   ├── product.validator.ts      # Unit, base price, MOQ, B2B tier structures, season tag
    │   ├── order.validator.ts        # Cart item schema, delivery address, payment method choice
    │   ├── vehicle.validator.ts      # Sri Lankan plate (`CAB-1234`), capacity, revenue license dates
    │   ├── hubGrading.validator.ts   # Weight check, Grade A/B/C/Reject rules, photo requirement
    │   └── withdrawal.validator.ts   # Minimum amount (LKR 500), bank account schema
    │
    ├── utils/                        # Backend Utility Helpers & Constants
    │   ├── constants.ts              # System-wide static lists (Provinces, Districts, Units, Statuses)
    │   ├── hash.util.ts              # PayHere MD5 signature hash generator
    │   ├── nic.util.ts               # Sri Lankan NIC parser (extracts birth year & gender)
    │   ├── phone.util.ts             # Sri Lankan phone number normalizer (`+94XXXXXXXXX`)
    │   ├── plate.util.ts             # Sri Lankan vehicle registration normalizer & regex
    │   └── logger.util.ts            # Winston/Morgan structured JSON logger
    │
    └── seeds/                        # Initial Database Seeders
        ├── seed.ts                   # Master runner script for database initialization
        ├── provincesDistricts.seed.ts# 9 Provinces and 25 Districts reference dataset
        ├── distributionCenters.seed.ts# The 4 DCs (Dambulla, Meegoda, Matara, Anuradhapura)
        ├── villageHubs.seed.ts       # Seeded Village Hubs with sample collection schedules
        └── superAdmin.seed.ts        # Initial Super Admin user creation script
```

---

## 4. Frontend Client Architecture (`/client`)

The frontend is built with **React 18, Vite, Tailwind CSS, and TypeScript**, partitioned into dedicated portal views while sharing a universal UI component library, state hooks, and API client wrappers.

```
client/
├── index.html                        # Application entry HTML document with Unicode font imports
├── package.json                      # Client dependencies (react, lucide-react, tailwindcss, axios, etc.)
├── tsconfig.json                     # Client TypeScript configuration
├── vite.config.ts                    # Vite bundler configuration with path aliases (`@/`)
├── tailwind.config.js                # Custom design system tokens (colors, fonts, surfaces)
├── postcss.config.js
└── src/
    ├── main.tsx                      # React root rendering & provider wrapper
    ├── App.tsx                       # Master Application shell, route provider & layout switcher
    ├── index.css                     # Tailwind CSS directives, theme variables & global scrollbars
    │
    ├── routes/                       # Application Route Configurations & Guards
    │   ├── AppRoutes.tsx             # Master React Router v6 route tree definition
    │   ├── ProtectedRoute.tsx        # Auth state guard (redirects unauthenticated users to `/auth`)
    │   ├── RoleRoute.tsx             # Role guard (restricts access to farmer/customer/delivery/admin)
    │   └── KycRoute.tsx              # Action guard checking verified identity status
    │
    ├── pages/                        # Page-Level Views (Organized by Portal)
    │   ├── public/                   # Publicly Accessible Landing & Legal Pages
    │   │   ├── LandingPage.tsx       # Pola homepage, value proposition, role entry cards
    │   │   ├── AboutUsPage.tsx       # Platform mission & Sri Lankan agricultural network
    │   │   ├── TermsOfServicePage.tsx# Terms, conditions & platform rules
    │   │   └── PrivacyPolicyPage.tsx # Data privacy & security policy
    │   │
    │   ├── auth/                     # Authentication & Onboarding Screens
    │   │   ├── AuthPage.tsx          # Login & Signup with Google / Email toggle
    │   │   ├── VerifyOtpPage.tsx     # 6-Digit OTP verification screen
    │   │   ├── SelectRolePage.tsx    # Interactive Farmer / Customer / Delivery role selector
    │   │   ├── FarmerOnboardingPage.tsx # 5-Card skippable onboarding wizard for farmers
    │   │   ├── CustomerOnboardingPage.tsx # B2C / B2B customer onboarding wizard
    │   │   └── DeliveryOnboardingPage.tsx # Individual / Company driver onboarding wizard
    │   │
    │   ├── farmer/                   # Farmer Portal Screens
    │   │   ├── FarmerDashboardPage.tsx  # KPI overview, upcoming hub collection, price trends
    │   │   ├── MyFarmsPage.tsx          # Registered farms list & GPS map manager
    │   │   ├── MyProductsPage.tsx       # Crop listing catalog with status filters
    │   │   ├── AddProductPage.tsx       # 4-Step crop listing wizard with B2B tiers & MOQ
    │   │   ├── EditProductPage.tsx      # Modify crop listing, update stock levels
    │   │   ├── FarmerOrdersPage.tsx     # 6-Tab lifecycle order tracker & packing slips
    │   │   ├── HubDropoffsPage.tsx      # Village hub schedule & collection intake receipts
    │   │   ├── FarmerWalletPage.tsx     # Available/Pending balance, withdrawal modal, ledger
    │   │   ├── CollectorPortalPage.tsx  # Village Collector workspace (managed farmers directory)
    │   │   ├── FarmerMessagesPage.tsx   # In-app chat with buyers
    │   │   ├── FarmerReportsPage.tsx    # Monthly/Annual Income & Hub Collection report downloads
    │   │   └── FarmerSettingsPage.tsx   # Personal profile, NIC, bank account, notification matrix
    │   │
    │   ├── customer/                 # Customer Portal Screens
    │   │   ├── MarketplacePage.tsx      # Discovery home, category ribbon, Maha/Yala seasonal picks
    │   │   ├── ProductDetailPage.tsx    # PDP: High-res gallery, farmer info, B2B tier table, reviews
    │   │   ├── FarmerStorefrontPage.tsx # Public storefront of an individual farmer/producer
    │   │   ├── CartPage.tsx             # Multi-farmer smart cart with DC grouping & MOQ checks
    │   │   ├── CheckoutPage.tsx         # Delivery address picker, time slot, PayHere/Wallet/COD
    │   │   ├── OrderSuccessPage.tsx     # Order placed confirmation & receipt summary
    │   │   ├── CustomerOrdersPage.tsx   # Customer order history & active order status list
    │   │   ├── OrderTrackingPage.tsx    # 10-stage stepper, Hub grade receipt, live Leg-2 driver HUD
    │   │   ├── CustomerWalletPage.tsx   # Store credit balance, PayHere top-up, instant refunds
    │   │   ├── CustomerProfilePage.tsx  # Personal/B2B business details, saved addresses
    │   │   └── CustomerInvoicesPage.tsx # B2B structured tax & purchase invoice downloads
    │   │
    │   ├── delivery/                 # Delivery Portal Screens
    │   │   ├── DeliveryDashboardPage.tsx# Active run HUD, online status toggle, today's earnings
    │   │   ├── AvailableOrdersPage.tsx  # Leg 2 Last-mile order radar with radius slider
    │   │   ├── HubSchedulePage.tsx      # Leg 1 Scheduled route calendar & Hub intake grading sheet
    │   │   ├── ActiveTripPage.tsx       # Turn-by-turn navigation HUD, customer call, OTP POD
    │   │   ├── MyVehiclesPage.tsx       # Vehicle registry (3-wheelers, trucks, cold-chain)
    │   │   ├── DeliveryEarningsPage.tsx # Per-trip payouts ledger, withdrawal modal, settlements
    │   │   ├── TripHistoryPage.tsx      # Completed trip statements & route records
    │   │   └── DeliverySettingsPage.tsx # License, vehicle documents, home base location
    │   │
    │   ├── admin/                    # Admin Portal Screens
    │   │   ├── AdminDashboardPage.tsx   # Executive command center, GMV, real-time logistics map
    │   │   ├── KycVerificationPage.tsx  # Side-by-side KYC inspector (Farmers, Delivery, B2B)
    │   │   ├── OrderOversightPage.tsx   # Live order grid, stuck delivery force-reassignment
    │   │   ├── DisputeDeskPage.tsx      # Comparative desk (Hub photo vs Customer photo)
    │   │   ├── FinanceQueuePage.tsx     # LankaPay manual withdrawal queue & reference logger
    │   │   ├── LogisticsConfigPage.tsx  # Distribution Centers & Village Hubs network setup
    │   │   ├── ContentModerationPage.tsx# Flagged crop photos & description moderation
    │   │   ├── SupportInboxPage.tsx     # Multi-portal support ticketing desk
    │   │   ├── AuditLogsPage.tsx        # Searchable immutable audit logs
    │   │   ├── ReportsStudioPage.tsx    # 15 System Reports generator (PDF/Excel exports)
    │   │   └── PlatformSettingsPage.tsx # Commission rates, grade price multipliers, global rules
    │   │
    │   └── shared/                   # Shared Utility Pages
    │       ├── NotFoundPage.tsx         # 404 Page Not Found
    │       ├── UnauthorizedPage.tsx     # 403 Forbidden Access Page
    │       └── ServerErrorPage.tsx      # 500 Internal Server Error
    │
    ├── components/                   # Modular Reusable UI Components
    │   ├── layout/                   # Universal App Shells & Structural Navbars
    │   │   ├── MainNavbar.tsx        # Public & Customer top navigation bar
    │   │   ├── FarmerSidebar.tsx     # Desktop collapsible sidebar for Farmer Portal
    │   │   ├── DeliverySidebar.tsx   # Desktop collapsible sidebar for Delivery Portal
    │   │   ├── AdminSidebar.tsx      # Desktop collapsible sidebar for Admin Portal
    │   │   ├── MobileBottomNav.tsx   # Mobile fixed 5-button bottom navigation bar
    │   │   ├── UserMenuDropdown.tsx  # Profile avatar dropdown with role switcher & logout
    │   │   └── Footer.tsx            # Global footer with language & legal links
    │   │
    │   ├── common/                   # Universal Atomic & Molecular UI Controls
    │   │   ├── Button.tsx            # Primary, Secondary, Outline, Danger button variants
    │   │   ├── Input.tsx             # Text, number, password input with error states
    │   │   ├── Select.tsx            # Standardized accessible select dropdown
    │   │   ├── Textarea.tsx          # Multi-line text input with character count
    │   │   ├── Switch.tsx            # Accessible boolean toggle switch
    │   │   ├── Modal.tsx             # Modal dialog container with focus trapping
    │   │   ├── Drawer.tsx            # Slide-over side sheet component
    │   │   ├── Tabs.tsx              # Tab navigation container with animated active indicator
    │   │   ├── Card.tsx              # Standard surface card with elevation variants
    │   │   ├── Badge.tsx             # Status pills (Emerald, Sky, Amber, Crimson)
    │   │   ├── StatCard.tsx          # Metric dashboard card with trend indicator
    │   │   ├── DataTable.tsx         # Reusable table with sorting, pagination & search
    │   │   ├── EmptyState.tsx        # Friendly illustrated empty state container
    │   │   ├── LoadingSpinner.tsx    # Animated loading spinner & skeleton placeholders
    │   │   ├── ConfirmDialog.tsx     # Reusable confirmation prompt modal
    │   │   ├── LanguageSwitcher.tsx  # Dropdown / Pill selector (EN, සිංහල, தமிழ்)
    │   │   ├── ThemeToggle.tsx       # Dark/Light mode toggle switch button
    │   │   ├── AddressDrawer.tsx     # Slide-over address selector & new address creator
    │   │   ├── ChatDrawer.tsx        # Slide-over in-app messaging drawer
    │   │   ├── NotificationDrawer.tsx# Slide-over real-time notification list
    │   │   ├── GpsPinPicker.tsx      # Interactive Leaflet / Map coordinate pin selector
    │   │   └── ImageUploader.tsx     # Drag-and-drop image upload with WebP compression
    │   │
    │   ├── farmer/                   # Farmer Portal Dedicated Components
    │   │   ├── FarmCard.tsx          # Registered farm summary card with crop tags
    │   │   ├── AddFarmModal.tsx      # New farm creation modal with GPS & land extent
    │   │   ├── ProductCard.tsx       # Farmer catalog produce card with stock progress bar
    │   │   ├── B2BTierEditor.tsx     # Dynamic wholesale price tier input rows
    │   │   ├── OrderCard.tsx         # Farmer sales order card with packing slip trigger
    │   │   ├── HubScheduleCard.tsx   # Upcoming village hub drop-off schedule reminder
    │   │   ├── HubManifestModal.tsx  # Batch packing slip and QR code modal for hub intake
    │   │   ├── WithdrawModal.tsx     # LankaPay bank cash-out request modal
    │   │   ├── CollectorFarmerModal.tsx # Quick-onboard smallholder farmer modal
    │   │   └── CollectorBatchTable.tsx  # Multi-farmer bulk drop-off batch aggregator
    │   │
    │   ├── customer/                 # Customer Portal Dedicated Components
    │   │   ├── MarketplaceHero.tsx   # Promotional banner carousel
    │   │   ├── CategoryRibbon.tsx    # Horizontal scrollable category pill ribbon
    │   │   ├── FacetedFilters.tsx    # Sidebar/Drawer filter panel (Price, Grade, Organic, etc.)
    │   │   ├── MarketplaceCard.tsx   # Customer product card with rating & quick add-to-cart
    │   │   ├── B2BPriceTable.tsx     # Tiered discount quantity table on product details page
    │   │   ├── SmartCartGroup.tsx    # Cart group grouped by Distribution Center
    │   │   ├── CheckoutAddressPicker.tsx # Radio list of saved delivery addresses
    │   │   ├── CheckoutPaymentPicker.tsx # Payment choice (PayHere / Wallet / COD)
    │   │   ├── OrderTimelineStepper.tsx  # 10-Stage visual order progress bar
    │   │   ├── LiveDeliveryMap.tsx   # Map showing Leg-2 driver live location pin
    │   │   ├── TwoWayRatingModal.tsx # Two-step rating modal (Produce + Delivery)
    │   │   └── DisputeModal.tsx      # File dispute modal with mandatory photo upload
    │   │
    │   ├── delivery/                 # Delivery Portal Dedicated Components
    │   │   ├── ActiveTripHUD.tsx     # Floating HUD banner for in-progress delivery runs
    │   │   ├── OnlineStatusToggle.tsx# Prominent GO ONLINE / OFFLINE toggle switch
    │   │   ├── AvailableOrderCard.tsx# Leg-2 order opportunity card with countdown timer
    │   │   ├── RadiusSlider.tsx      # Search radius slider (5 km – 35 km)
    │   │   ├── HubIntakeSheet.tsx    # Interactive Hub collection grading & weight check table
    │   │   ├── ProofOfDeliveryModal.tsx # Handover modal with OTP verification or photo upload
    │   │   ├── AddVehicleModal.tsx   # Vehicle registration form with CR book upload
    │   │   └── VehicleCard.tsx       # Fleet vehicle status card with cold-chain badge
    │   │
    │   └── admin/                    # Admin Portal Dedicated Components
    │       ├── KpiSummaryGrid.tsx    # Top KPI cards (GMV, Platform Revenue, Active Orders)
    │       ├── OperationalHeatmap.tsx# Interactive Sri Lanka map with 4 DCs & Hub throughput
    │       ├── SideBySideInspector.tsx # Document inspection view (Data on Left, Image on Right)
    │       ├── StuckOrderModal.tsx   # Force-reassign Leg-2 driver modal
    │       ├── DisputeDesk.tsx       # Side-by-side Hub inspection photo vs Customer photo
    │       ├── LankaPayQueueTable.tsx# Manual bank withdrawal execution list with reference input
    │       ├── CommissionConfigForm.tsx # Platform & Collector commission percentage editor
    │       ├── GradeMultiplierForm.tsx  # Grade A/B/C/Reject price multiplier configurator
    │       ├── HubConfigModal.tsx    # Add/Edit Village Hub with recurring collection schedules
    │       └── ReportGenerator.tsx   # Custom date & DC filter panel with PDF/Excel download
    │
    ├── context/                      # React Context Global State Providers
    │   ├── AuthContext.tsx           # User auth state, JWT token storage, login/logout methods
    │   ├── CartContext.tsx           # Multi-farmer cart state, DC grouping, persistence in localStorage
    │   ├── ThemeContext.tsx          # Dark / Light theme provider with system preference detection
    │   ├── LanguageContext.tsx       # i18n language provider (English, Sinhala, Tamil)
    │   ├── SocketContext.tsx         # WebSocket connection for real-time notifications & order tracking
    │   └── NotificationContext.tsx   # Unread notifications count & toast banner triggers
    │
    ├── hooks/                        # Custom React Utility Hooks
    │   ├── useAuth.ts                # Easy access to AuthContext
    │   ├── useCart.ts                # Easy access to CartContext
    │   ├── useTheme.ts               # Access and toggle dark/light theme
    │   ├── useTranslation.ts         # Access translation dictionary & active language
    │   ├── useGeolocation.ts         # Browser GPS location hook for auto-pinning addresses
    │   ├── useOrders.ts              # Fetch, filter & poll order status transitions
    │   ├── useWallet.ts              # Fetch wallet balances, transaction ledger & request payouts
    │   ├── useDebounce.ts            # Debounce input for real-time search & autocomplete
    │   ├── useMediaQuery.ts          # Responsive breakpoint detection hook (`isMobile`, `isDesktop`)
    │   └── useSriLankanValidation.ts # Client-side validation for NIC, Phone (`+94`), Vehicle plates
    │
    ├── api/                          # Axios API Client SDKs
    │   ├── axiosClient.ts            # Axios instance with auth bearer interceptor & 401 refresh
    │   ├── auth.api.ts               # Login, Google OAuth, Send OTP, Verify OTP, Select Role
    │   ├── farmer.api.ts             # Dashboard stats, farms CRUD, hub drop-off receipts
    │   ├── product.api.ts            # Marketplace search, product details, crop CRUD
    │   ├── customer.api.ts           # Customer profile, saved addresses, B2B verification
    │   ├── order.api.ts              # Checkout, order tracking, lifecycle transitions, invoice PDF
    │   ├── cart.api.ts               # Validate cart stock, compute Leg 1 + Leg 2 delivery fees
    │   ├── delivery.api.ts           # Available Leg-2 orders, accept trip, submit POD, trip history
    │   ├── hub.api.ts                # Hub collection schedules, submit Leg-1 intake grading sheet
    │   ├── vehicle.api.ts            # Registered vehicles CRUD, fleet driver assignments
    │   ├── wallet.api.ts             # Balances, LankaPay withdrawal request, transaction history
    │   ├── dispute.api.ts            # File dispute, upload evidence, view resolution
    │   ├── rating.api.ts             # Submit produce rating, submit delivery partner rating
    │   ├── ticket.api.ts             # Support tickets CRUD and messaging
    │   ├── report.api.ts             # Trigger and stream 15 system PDF/Excel reports
    │   ├── admin.api.ts              # KYC approve/reject, force dispatch, finance queue, config
    │   └── notification.api.ts       # Get notifications, mark read
    │
    ├── types/                        # TypeScript Interfaces & Types
    │   ├── user.types.ts             # User, Role, KYC Status, Profile definitions
    │   ├── farm.types.ts             # Farm, Land Extent, Irrigation, GPS Coordinates
    │   ├── product.types.ts          # Product, B2B Tier, Unit, Season, Category
    │   ├── order.types.ts            # Order, OrderItem, 10-Stage Statuses, Payment Method
    │   ├── hub.types.ts              # Village Hub, DC, Collection Schedule, Grade Receipt
    │   ├── delivery.types.ts         # Vehicle, Active Trip, Leg 1/2 Types, POD Data
    │   ├── wallet.types.ts           # Wallet, Ledger Entry, Transaction Types, Withdrawal Request
    │   ├── dispute.types.ts          # Dispute, Rejection Reason, Adjudication Resolution
    │   ├── report.types.ts           # Report Query Parameters & Filter schemas
    │   └── api.types.ts              # Standardized API Response envelope (`ApiResponse<T>`)
    │
    ├── locales/                      # Full 3-Language Internationalization Dictionaries
    │   ├── en.json                   # English UI strings & labels
    │   ├── si.json                   # Sinhala (සිංහල) UI strings & labels
    │   └── ta.json                   # Tamil (தமிழ்) UI strings & labels
    │
    └── utils/                        # Client Helper Functions
        ├── currency.util.ts          # Format numbers to Sri Lankan Rupees (`LKR 148,500.00`)
        ├── date.util.ts              # Format dates and countdown timers (`Tuesday, 6:00 AM`)
        ├── distance.util.ts          # Format distance in kilometers (`7.2 km away`)
        ├── imageCompression.util.ts  # Client-side canvas image compressor (WebP ≤ 500KB)
        └── storage.util.ts           # Safe localStorage wrapper for auth tokens & cart state
```

---

## 5. Shared Package (`/shared`)

The `/shared` folder contains shared code compiled and imported by both the frontend and backend to guarantee strict type consistency and eliminate duplication of core constants:

```
shared/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts                      # Master export barrel
    │
    ├── constants/                    # Universal Sri Lankan & System Constants
    │   ├── provincesDistricts.ts     # 9 Provinces and 25 Districts mapping
    │   ├── banks.ts                  # List of Central Bank approved Sri Lankan commercial banks
    │   ├── units.ts                  # Standardized units: `kg`, `g`, `litre`, `ml`, `dozen`, `bundle`, `piece`
    │   ├── categories.ts             # Product categories & common vegetable/fruit varieties
    │   └── orderStates.ts            # Exact 10-stage order lifecycle state constants
    │
    ├── enums/                        # Shared TypeScript Enums
    │   ├── Role.enum.ts              # `FARMER`, `VILLAGE_COLLECTOR`, `CUSTOMER_B2C`, `CUSTOMER_B2B`, `DELIVERY_INDIVIDUAL`, `DELIVERY_COMPANY`, `ADMIN`
    │   ├── QualityGrade.enum.ts      # `GRADE_A`, `GRADE_B`, `GRADE_C`, `REJECTED`
    │   ├── OrderStatus.enum.ts       # 10 Order lifecycle states + exception states
    │   ├── PaymentStatus.enum.ts     # `PENDING`, `HELD_ESCROW`, `RELEASED_SPLIT`, `REFUNDED`
    │   ├── TransactionType.enum.ts   # `TOP_UP`, `ORDER_PAYMENT`, `SALE_PROCEEDS`, `WITHDRAWAL`, etc.
    │   └── VehicleType.enum.ts       # `THREE_WHEELER`, `MINI_TRUCK`, `LORRY`, `COLD_CHAIN_TRUCK`, etc.
    │
    ├── types/                        # Core Shared Data Contracts
    │   ├── common.types.ts           # Pagination, API envelopes, Address structures
    │   ├── kyc.types.ts              # KYC verification payloads & document types
    │   └── report.types.ts           # 15 Report metadata definitions & column headers
    │
    └── validators/                   # Isomorphic Validation Functions
        ├── nicValidator.ts           # Validates Old (9+V/X) and New (12 digits) Sri Lankan NIC
        ├── phoneValidator.ts         # Validates Sri Lankan mobile numbers (+94 7X XXXXXXX)
        └── plateValidator.ts         # Validates Sri Lankan vehicle registration formats (CAB-1234)
```

---

## 6. Complete ASCII Codebase File Tree

```
pola/
├── .github/
│   └── workflows/
│       ├── ci-backend.yml
│       └── ci-frontend.yml
├── .husky/
│   └── pre-commit
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── .env.example
├── .gitignore
├── .prettierrc
├── .prettierignore
├── docker-compose.yml
├── package.json
├── tsconfig.base.json
├── README.md
│
├── shared/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── constants/
│       │   ├── provincesDistricts.ts
│       │   ├── banks.ts
│       │   ├── units.ts
│       │   ├── categories.ts
│       │   └── orderStates.ts
│       ├── enums/
│       │   ├── Role.enum.ts
│       │   ├── QualityGrade.enum.ts
│       │   ├── OrderStatus.enum.ts
│       │   ├── PaymentStatus.enum.ts
│       │   ├── TransactionType.enum.ts
│       │   └── VehicleType.enum.ts
│       ├── types/
│       │   ├── common.types.ts
│       │   ├── kyc.types.ts
│       │   └── report.types.ts
│       └── validators/
│           ├── nicValidator.ts
│           ├── phoneValidator.ts
│           └── plateValidator.ts
│
├── server/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       │   ├── db.config.ts
│       │   ├── env.config.ts
│       │   ├── cloudinary.config.ts
│       │   ├── payhere.config.ts
│       │   ├── mailer.config.ts
│       │   └── oauth.config.ts
│       ├── models/
│       │   ├── User.model.ts
│       │   ├── Farm.model.ts
│       │   ├── Product.model.ts
│       │   ├── Order.model.ts
│       │   ├── VillageHub.model.ts
│       │   ├── DistributionCenter.model.ts
│       │   ├── Vehicle.model.ts
│       │   ├── Wallet.model.ts
│       │   ├── LedgerEntry.model.ts
│       │   ├── QualityInspection.model.ts
│       │   ├── Reconciliation.model.ts
│       │   ├── Dispute.model.ts
│       │   ├── Rating.model.ts
│       │   ├── SupportTicket.model.ts
│       │   ├── ContentFlag.model.ts
│       │   ├── AuditLog.model.ts
│       │   ├── WastageLog.model.ts
│       │   └── Notification.model.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── farmer.controller.ts
│       │   ├── product.controller.ts
│       │   ├── farm.controller.ts
│       │   ├── customer.controller.ts
│       │   ├── order.controller.ts
│       │   ├── cart.controller.ts
│       │   ├── delivery.controller.ts
│       │   ├── hub.controller.ts
│       │   ├── vehicle.controller.ts
│       │   ├── wallet.controller.ts
│       │   ├── dispute.controller.ts
│       │   ├── rating.controller.ts
│       │   ├── ticket.controller.ts
│       │   ├── report.controller.ts
│       │   ├── admin.controller.ts
│       │   ├── webhook.controller.ts
│       │   └── notification.controller.ts
│       ├── routes/
│       │   ├── index.ts
│       │   ├── auth.routes.ts
│       │   ├── farmer.routes.ts
│       │   ├── farm.routes.ts
│       │   ├── product.routes.ts
│       │   ├── customer.routes.ts
│       │   ├── order.routes.ts
│       │   ├── cart.routes.ts
│       │   ├── delivery.routes.ts
│       │   ├── hub.routes.ts
│       │   ├── vehicle.routes.ts
│       │   ├── wallet.routes.ts
│       │   ├── dispute.routes.ts
│       │   ├── rating.routes.ts
│       │   ├── ticket.routes.ts
│       │   ├── report.routes.ts
│       │   ├── admin.routes.ts
│       │   ├── webhook.routes.ts
│       │   └── notification.routes.ts
│       ├── middleware/
│       │   ├── auth.middleware.ts
│       │   ├── role.middleware.ts
│       │   ├── kyc.middleware.ts
│       │   ├── validate.middleware.ts
│       │   ├── upload.middleware.ts
│       │   ├── audit.middleware.ts
│       │   ├── rateLimiter.middleware.ts
│       │   └── error.middleware.ts
│       ├── services/
│       │   ├── escrow.service.ts
│       │   ├── payout.service.ts
│       │   ├── grading.service.ts
│       │   ├── radius.service.ts
│       │   ├── qr.service.ts
│       │   ├── pdf.service.ts
│       │   ├── excel.service.ts
│       │   ├── mailer.service.ts
│       │   ├── notification.service.ts
│       │   └── cloudinary.service.ts
│       ├── validators/
│       │   ├── auth.validator.ts
│       │   ├── farmer.validator.ts
│       │   ├── farm.validator.ts
│       │   ├── product.validator.ts
│       │   ├── order.validator.ts
│       │   ├── vehicle.validator.ts
│       │   ├── hubGrading.validator.ts
│       │   └── withdrawal.validator.ts
│       ├── utils/
│       │   ├── constants.ts
│       │   ├── hash.util.ts
│       │   ├── nic.util.ts
│       │   ├── phone.util.ts
│       │   ├── plate.util.ts
│       │   └── logger.util.ts
│       └── seeds/
│           ├── seed.ts
│           ├── provincesDistricts.seed.ts
│           ├── distributionCenters.seed.ts
│           ├── villageHubs.seed.ts
│           └── superAdmin.seed.ts
│
└── client/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── routes/
        │   ├── AppRoutes.tsx
        │   ├── ProtectedRoute.tsx
        │   ├── RoleRoute.tsx
        │   └── KycRoute.tsx
        ├── pages/
        │   ├── public/
        │   │   ├── LandingPage.tsx
        │   │   ├── AboutUsPage.tsx
        │   │   ├── TermsOfServicePage.tsx
        │   │   └── PrivacyPolicyPage.tsx
        │   ├── auth/
        │   │   ├── AuthPage.tsx
        │   │   ├── VerifyOtpPage.tsx
        │   │   ├── SelectRolePage.tsx
        │   │   ├── FarmerOnboardingPage.tsx
        │   │   ├── CustomerOnboardingPage.tsx
        │   │   └── DeliveryOnboardingPage.tsx
        │   ├── farmer/
        │   │   ├── FarmerDashboardPage.tsx
        │   │   ├── MyFarmsPage.tsx
        │   │   ├── MyProductsPage.tsx
        │   │   ├── AddProductPage.tsx
        │   │   ├── EditProductPage.tsx
        │   │   ├── FarmerOrdersPage.tsx
        │   │   ├── HubDropoffsPage.tsx
        │   │   ├── FarmerWalletPage.tsx
        │   │   ├── CollectorPortalPage.tsx
        │   │   ├── FarmerMessagesPage.tsx
        │   │   ├── FarmerReportsPage.tsx
        │   │   └── FarmerSettingsPage.tsx
        │   ├── customer/
        │   │   ├── MarketplacePage.tsx
        │   │   ├── ProductDetailPage.tsx
        │   │   ├── FarmerStorefrontPage.tsx
        │   │   ├── CartPage.tsx
        │   │   ├── CheckoutPage.tsx
        │   │   ├── OrderSuccessPage.tsx
        │   │   ├── CustomerOrdersPage.tsx
        │   │   ├── OrderTrackingPage.tsx
        │   │   ├── CustomerWalletPage.tsx
        │   │   ├── CustomerProfilePage.tsx
        │   │   └── CustomerInvoicesPage.tsx
        │   ├── delivery/
        │   │   ├── DeliveryDashboardPage.tsx
        │   │   ├── AvailableOrdersPage.tsx
        │   │   ├── HubSchedulePage.tsx
        │   │   ├── ActiveTripPage.tsx
        │   │   ├── MyVehiclesPage.tsx
        │   │   ├── DeliveryEarningsPage.tsx
        │   │   ├── TripHistoryPage.tsx
        │   │   └── DeliverySettingsPage.tsx
        │   ├── admin/
        │   │   ├── AdminDashboardPage.tsx
        │   │   ├── KycVerificationPage.tsx
        │   │   ├── OrderOversightPage.tsx
        │   │   ├── DisputeDeskPage.tsx
        │   │   ├── FinanceQueuePage.tsx
        │   │   ├── LogisticsConfigPage.tsx
        │   │   ├── ContentModerationPage.tsx
        │   │   ├── SupportInboxPage.tsx
        │   │   ├── AuditLogsPage.tsx
        │   │   ├── ReportsStudioPage.tsx
        │   │   └── PlatformSettingsPage.tsx
        │   └── shared/
        │       ├── NotFoundPage.tsx
        │       ├── UnauthorizedPage.tsx
        │       └── ServerErrorPage.tsx
        ├── components/
        │   ├── layout/
        │   │   ├── MainNavbar.tsx
        │   │   ├── FarmerSidebar.tsx
        │   │   ├── DeliverySidebar.tsx
        │   │   ├── AdminSidebar.tsx
        │   │   ├── MobileBottomNav.tsx
        │   │   ├── UserMenuDropdown.tsx
        │   │   └── Footer.tsx
        │   ├── common/
        │   │   ├── Button.tsx
        │   │   ├── Input.tsx
        │   │   ├── Select.tsx
        │   │   ├── Textarea.tsx
        │   │   ├── Switch.tsx
        │   │   ├── Modal.tsx
        │   │   ├── Drawer.tsx
        │   │   ├── Tabs.tsx
        │   │   ├── Card.tsx
        │   │   ├── Badge.tsx
        │   │   ├── StatCard.tsx
        │   │   ├── DataTable.tsx
        │   │   ├── EmptyState.tsx
        │   │   ├── LoadingSpinner.tsx
        │   │   ├── ConfirmDialog.tsx
        │   │   ├── LanguageSwitcher.tsx
        │   │   ├── ThemeToggle.tsx
        │   │   ├── AddressDrawer.tsx
        │   │   ├── ChatDrawer.tsx
        │   │   ├── NotificationDrawer.tsx
        │   │   ├── GpsPinPicker.tsx
        │   │   └── ImageUploader.tsx
        │   ├── farmer/
        │   │   ├── FarmCard.tsx
        │   │   ├── AddFarmModal.tsx
        │   │   ├── ProductCard.tsx
        │   │   ├── B2BTierEditor.tsx
        │   │   ├── OrderCard.tsx
        │   │   ├── HubScheduleCard.tsx
        │   │   ├── HubManifestModal.tsx
        │   │   ├── WithdrawModal.tsx
        │   │   ├── CollectorFarmerModal.tsx
        │   │   └── CollectorBatchTable.tsx
        │   ├── customer/
        │   │   ├── MarketplaceHero.tsx
        │   │   ├── CategoryRibbon.tsx
        │   │   ├── FacetedFilters.tsx
        │   │   ├── MarketplaceCard.tsx
        │   │   ├── B2BPriceTable.tsx
        │   │   ├── SmartCartGroup.tsx
        │   │   ├── CheckoutAddressPicker.tsx
        │   │   ├── CheckoutPaymentPicker.tsx
        │   │   ├── OrderTimelineStepper.tsx
        │   │   ├── LiveDeliveryMap.tsx
        │   │   ├── TwoWayRatingModal.tsx
        │   │   └── DisputeModal.tsx
        │   ├── delivery/
        │   │   ├── ActiveTripHUD.tsx
        │   │   ├── OnlineStatusToggle.tsx
        │   │   ├── AvailableOrderCard.tsx
        │   │   ├── RadiusSlider.tsx
        │   │   ├── HubIntakeSheet.tsx
        │   │   ├── ProofOfDeliveryModal.tsx
        │   │   ├── AddVehicleModal.tsx
        │   │   └── VehicleCard.tsx
        │   └── admin/
        │       ├── KpiSummaryGrid.tsx
        │       ├── OperationalHeatmap.tsx
        │       ├── SideBySideInspector.tsx
        │       ├── StuckOrderModal.tsx
        │       ├── DisputeDesk.tsx
        │       ├── LankaPayQueueTable.tsx
        │       ├── CommissionConfigForm.tsx
        │       ├── GradeMultiplierForm.tsx
        │       ├── HubConfigModal.tsx
        │       └── ReportGenerator.tsx
        ├── context/
        │   ├── AuthContext.tsx
        │   ├── CartContext.tsx
        │   ├── ThemeContext.tsx
        │   ├── LanguageContext.tsx
        │   ├── SocketContext.tsx
        │   └── NotificationContext.tsx
        ├── hooks/
        │   ├── useAuth.ts
        │   ├── useCart.ts
        │   ├── useTheme.ts
        │   ├── useTranslation.ts
        │   ├── useGeolocation.ts
        │   ├── useOrders.ts
        │   ├── useWallet.ts
        │   ├── useDebounce.ts
        │   ├── useMediaQuery.ts
        │   └── useSriLankanValidation.ts
        ├── api/
        │   ├── axiosClient.ts
        │   ├── auth.api.ts
        │   ├── farmer.api.ts
        │   ├── product.api.ts
        │   ├── customer.api.ts
        │   ├── order.api.ts
        │   ├── cart.api.ts
        │   ├── delivery.api.ts
        │   ├── hub.api.ts
        │   ├── vehicle.api.ts
        │   ├── wallet.api.ts
        │   ├── dispute.api.ts
        │   ├── rating.api.ts
        │   ├── ticket.api.ts
        │   ├── report.api.ts
        │   ├── admin.api.ts
        │   └── notification.api.ts
        ├── types/
        │   ├── user.types.ts
        │   ├── farm.types.ts
        │   ├── product.types.ts
        │   ├── order.types.ts
        │   ├── hub.types.ts
        │   ├── delivery.types.ts
        │   ├── wallet.types.ts
        │   ├── dispute.types.ts
        │   ├── report.types.ts
        │   └── api.types.ts
        ├── locales/
        │   ├── en.json
        │   ├── si.json
        │   └── ta.json
        └── utils/
            ├── currency.util.ts
            ├── date.util.ts
            ├── distance.util.ts
            ├── imageCompression.util.ts
            └── storage.util.ts
```
