# POLA FARMER PORTAL — GROUNDED FIX LIST (v3)
Every item below was checked against the actual repo (`repomix-output.xml`), not guessed from the screenshots. Where v2 guessed wrong about *why* something breaks, that's called out — because the real bug is usually a one-line fix, not a rebuild. No full files here, just: **file → what's wrong → exact change to make.** Written to be handed straight to an AI coding agent (Claude Code / Cursor) one section at a time.

---
## 0. THE THREE 404s — NOT MISSING ENDPOINTS, WRONG PATHS + WRONG FIELD NAMES

The backend already has working endpoints. The frontend is calling the wrong URLs and reading the wrong response keys. Nothing needs to be "added" — three call sites need to be corrected to match what already exists.

**Dashboard KPIs**
- Frontend: `client/src/pages/farmer/FarmerDashboard.tsx` → `fetchDashboardData()` calls `api.get('/farmer/dashboard/kpis')` and reads `res.data.kpis` (expects `activeProductsCount, totalOrdersCount, pendingOrdersCount, totalSalesVolumeKg, grossRevenueLkr`).
- Backend: `server/src/routes/farmer.routes.ts` only registers `GET /farmer/dashboard` → `FarmerController.getDashboardStats` (`server/src/controllers/farmer.controller.ts`), which returns `res.data` directly (no `kpis` wrapper) shaped as `{ activeProducts, registeredFarms, pendingHubCollections, wallet: { availableBalance, pendingEscrowBalance, totalEarned }, recentOrders }`.
- **Fix:** change the frontend call to `api.get('/farmer/dashboard')` and read `res.data.activeProducts`, `res.data.registeredFarms`, `res.data.pendingHubCollections`, `res.data.wallet.availableBalance`, `res.data.recentOrders` — update the 4 KPI cards' field mapping to match these exact names instead of inventing a `kpis` sub-object. Do not touch the controller; the shape it returns is fine.

**Wallet summary**
- Frontend: `client/src/services/wallet.service.ts` → `getMyWallet()` calls `api.get('/wallet/me')`.
- Backend: `server/src/routes/wallet.routes.ts` registers `GET /wallet/my-wallet` → `WalletController.getMyWallet`, returning `{ data: { wallet } }` where `wallet` has fields `availableBalanceLkr, pendingEscrowBalanceLkr, totalEarnedLkr, totalWithdrawnLkr, payoutBankAccount` (see `server/src/models/Wallet.model.ts`).
- **Fix:** in `wallet.service.ts`, change `/wallet/me` → `/wallet/my-wallet`. Then in `client/src/pages/shared/WalletPage.tsx`, `wallet.availableBalance` is read but the real field is `availableBalanceLkr` (camelCase mismatch, not just a missing endpoint) — rename every `wallet.availableBalance` / `wallet.escrowHoldBalance` / `wallet.lifetimePayouts` reference to `wallet.availableBalanceLkr` / `wallet.pendingEscrowBalanceLkr` / `wallet.totalEarnedLkr`.

**Wallet ledger**
- Frontend: `wallet.service.ts` → `getLedgerEntries()` calls `api.get('/wallet/ledger?...')`; `WalletPage.tsx` reads `ledgerRes.data.entries`.
- Backend: registered route is `GET /wallet/transactions` → `WalletController.getTransactions`, returning `{ data: { transactions, meta: { total, page, limit, totalPages } } }`.
- **Fix:** change `/wallet/ledger` → `/wallet/transactions` in `wallet.service.ts`, and in `WalletPage.tsx` change `ledgerRes.data.entries` → `ledgerRes.data.transactions`. Also wire up `ledgerRes.data.meta` for pagination controls (currently discarded).

**Bonus bug found while checking this — top-up path mismatch:** `wallet.service.ts` calls `api.post('/wallet/topup', ...)` and `/wallet/topup/confirm` (no hyphen), but `wallet.routes.ts` registers `/wallet/top-up` and `/wallet/top-up/confirm` (with hyphen). Fix the hyphen in `wallet.service.ts` or this silently 404s exactly like the other three.

**Duplicate schema index — wrong file.** It's not in `Order.model.ts` (which is fine — only one `OrderSchema.index({ createdAt: -1, status: 1 })`, no conflict). The actual duplicate is in `server/src/models/Conversation.model.ts`: line ~30 has `orderId: { ..., index: true }` on the field definition AND line ~45 has a separate `ConversationSchema.index({ orderId: 1 })`. **Fix:** delete `index: true` from the field definition (line ~30), keep the explicit `ConversationSchema.index({ orderId: 1 })` call.

---
## 1 & 2. NAVIGATION — THE "HUB DROP-OFFS DISAPPEARS" BUG IS A REAL, FOUND BUG

v2 guessed this was a filtering/route-clobbering bug. It isn't. **Root cause: every farmer page defines its own hardcoded, copy-pasted `navItems` array instead of importing one shared array — and two of those copies are missing the Hub Drop-offs entry.**

Proof the shared source already exists and is simply unused: `client/src/lib/navItems.tsx` exports `getFarmerNavItems()` with all 6 correct items (dashboard, farms, products, orders, **hubs**, wallet) and a comment saying *"Single source of truth keeping paths and icons aligned across the application."* `grep -rl "lib/navItems" client/src` returns **zero** results — it is imported nowhere.

Instead, each of these files defines its own inline `const navItems = [...]`:
- `FarmerDashboard.tsx` (has hubs) ✅
- `HubDropoffPage.tsx` (has hubs) ✅
- `MyFarmsPage.tsx` (has hubs) ✅
- `MyProductsPage.tsx` (has hubs) ✅
- `FarmerOrdersPage.tsx` (has hubs) ✅
- `EditProductPage.tsx` (has hubs) ✅
- **`AddFarmPage.tsx` — no `hubs` entry, jumps straight to `wallet`** ❌
- **`AddProductPage.tsx` — no `hubs` entry, jumps straight to `wallet`** ❌
- **`WalletPage.tsx` (`client/src/pages/shared/WalletPage.tsx`) — no `hubs` entry at all** ❌

So the moment a farmer navigates to Earnings & Wallet (`WalletPage.tsx`) or either "new" page, the sidebar/navbar re-renders from that page's own incomplete array and Hub Drop-offs vanishes — exactly the reported bug, and exactly why it looked route-dependent.

**Exact fix (do this instead of a full navbar rebuild):**
1. Delete the locally-defined `navItems` array from all 9 files above.
2. In each, `import { getFarmerNavItems } from '@/lib/navItems';` and call `const navItems = getFarmerNavItems(t);` (pass the page's `t` translation object — `getFarmerNavItems` already accepts it and falls back to English labels).
3. Delete the now-unused lucide icon imports (`LayoutDashboard`, `Sprout`, `Package`, `Wallet`, `ShoppingBag`, `MapPin`/`Scale`) from each of those 9 files if nothing else in the file uses them.
4. This alone fixes the disappearing-tab bug with no new component needed. `MobileBottomNav.tsx` already exists as a separate organism for small screens — pass `getFarmerNavItems(t)` mapped into its `MobileNavItem[]` shape as the `mobileNavItems` prop on `DashboardLayout` (currently `mobileNavItems` is never passed from any farmer page — check and add it).

**Left-sidebar-vs-top-navbar note:** the actual current layout (`client/src/components/templates/DashboardLayout.tsx`) is already a hybrid: a collapsible left `Sidebar` (desktop, `hidden md:flex`) *plus* a top header bar with language/theme/bell/profile — it is not the "sidebar only" layout the screenshots implied. If the product decision is still "top navbar only, no left sidebar at all" per the original ask, that's a real `DashboardLayout.tsx` rewrite (remove the `<Sidebar>` component entirely, move `items.map(...)` from inside `Sidebar` into the `<header>` as horizontal tabs, keep `MobileBottomNav` for small screens). Do this only after step 1–4 above, since the array-consolidation fix is required either way and is the higher-value fix.

---
## 3. PROFILE AVATAR DROPDOWN — `client/src/components/organisms/ProfileDropdown.tsx`

Confirmed duplication exactly as reported. Current dropdown items: Dashboard (`getPortalLink()`), My Orders (customer-only, conditionally hidden for farmers — correct), **Earnings & Wallet** (`navigate('/wallet')`), **NIC & KYC Verification** (`navigate('/auth/kyc')`), 4 Portals Directory (`navigate('/portals')`), Sign Out.

- **Remove:** the "Dashboard" button and the "Earnings & Wallet" button — both duplicate top-nav tabs already covered by section 1/2's `getFarmerNavItems()`.
- **Remove or repurpose:** "NIC & KYC Verification" button — either delete it (it'll live inside Edit Profile per section 4) or keep only as a stand-alone shortcut if you decide not to fold KYC into Edit Profile.
- **Add:** an "Edit Profile" button navigating to `/farmer/profile/edit` (new route — see section 4, this route doesn't exist yet, `find client/src/pages -iname "*profile*"` returns nothing).
- **Add:** a "Settings" button navigating to `/farmer/settings` or similar (doesn't exist yet either — no settings page found anywhere in `client/src/pages`).
- **Add:** a "Help & Support" button navigating to `/farmer/support` (route doesn't exist yet — see section 13, though the *backend* ticket system is fully built already).
- **Fix Sign Out:** `handleSignOut` in this file calls `logout(); onClose(); toast.success(...); navigate('/')` with zero confirmation. `client/src/components/molecules/ConfirmDialog.tsx` already exists as a reusable component but a repo-wide search (`grep -rl "ConfirmDialog" client/src`) shows it is imported nowhere — it was built and never wired up. Wrap `handleSignOut` in this existing `ConfirmDialog` (see section 9 for the full list of places it needs wiring).
- Keep "4 Portals Directory" as-is — already correctly scoped as a portal switcher, not a nav duplicate.

---
## 4. EDIT PROFILE SCREEN — DOES NOT EXIST, BUILD IT

Confirmed: no `/farmer/profile/edit` route in `client/src/router.tsx`, no profile page file anywhere under `client/src/pages`. This needs to be built from scratch.

**Backend groundwork needed first** — check `server/src/models/User.model.ts` and `server/src/controllers/` for a `PATCH /auth/me` or `PATCH /farmer/profile` style endpoint before building the UI; if none exists, add one that accepts partial updates per section (don't force one giant payload — the model already has `bankDetails`, `kycStatus`, `addresses` as separate sub-objects, so a partial-update controller is a natural fit). Reuse `themePreference` field addition from section 14 here too (same model, same PR).

**Frontend:** new page `client/src/pages/farmer/EditProfilePage.tsx`, route `/farmer/profile/edit` registered in `router.tsx` next to the other `/farmer/*` routes, wrapped in the same `ProtectedRoute allowedRoles={FARMER_ROLES}` pattern used by every other farmer route.

Fields — build as independently-submitting cards (there is no existing multi-card form pattern in this codebase to copy; `EditFarmModal.tsx` and `KycUploadPage.tsx` are both single-submit forms, so this is new UX for this app, not a refactor):
- Account: profile picture (reuse `FileDropzone.tsx`, already used in `KycUploadPage.tsx` and `AddProductPage.tsx`), username, full name, email, change-password (current+new+confirm).
- Personal details: DOB, gender, phone (reuse the phone normalization already implemented in `shared/src/validators/phoneValidator.ts` — don't rewrite it).
- Address: reuse the exact Province→District cascading dropdown pattern already built in `AddFarmPage.tsx` (it consumes `shared/src/constants/provincesDistricts.ts`) — copy that dropdown pair, don't reinvent it.
- Payout details: `bankDetails` fields already exist on `User.model.ts` (`bankName, branchName, accountNumber, accountHolderName` per `Wallet.model.ts`'s `payoutBankAccount` shape — confirm which model actually owns this, `User` or `Wallet`, before wiring, since both currently declare bank fields independently and may drift).
- Danger zone: Deactivate account — wire through `ConfirmDialog` (section 9).

---
## 5. FARM MANAGEMENT — `client/src/pages/farmer/MyFarmsPage.tsx`, `AddFarmPage.tsx`, `server/src/models/Farm.model.ts`

**Duplicate button — confirmed and precisely located.** In `MyFarmsPage.tsx`, the header "Register New Farm Plot" button is rendered unconditionally (outside the `isLoading ? ... : farms.length === 0 ? ... : ...` block). The empty-state "Register First Farm Plot" button only renders inside the `farms.length === 0` branch. Result: when a farmer has zero farms, **both buttons are on screen at once** — this is the exact reported bug, not a hypothetical. **Fix:** wrap the header button in `{farms.length > 0 && (...)}`, or delete it and keep only the centered empty-state CTA plus a persistent `+ Add Farm` action once farms exist (currently there is no non-empty-state CTA if you delete the header button — add a small "+ Add Farm" card/tile inside the grid instead, so there's still exactly one obvious entry point in both states).

**GPS is mandatory, not optional — confirmed in three places, needs fixing in three places:**
1. `server/src/validators/farm.validator.ts` — `latitude` and `longitude` are `z.coerce.number().min().max()` with no `.optional()`. Add `.optional()` to both, and update `server/src/controllers/farm.controller.ts` to handle `gps` being absent (currently `Farm.model.ts`'s schema has `gps.latitude`/`gps.longitude` as `required: true` too — change to `required: false` and give it a default center-of-Sri-Lanka fallback, or make `gps` itself optional on the schema).
2. `AddFarmPage.tsx` initializes `latitude`/`longitude` state to a hardcoded Sri Lanka center point (`7.8731, 80.6517`) and renders them as manually editable number inputs the farmer must fill in — there's already a `navigator.geolocation.getCurrentPosition` call wired to a button, so the auto-capture mechanism exists. **Fix:** don't render the lat/long number inputs at all by default; show only the "Use my current location" button with a small "detected: 7.xx, 80.xx" confirmation once clicked, and make submission work with `gps` entirely absent if the farmer skips it.
3. Once (1) and (2) are done, `radius.service.ts` (`server/src/services/radius.service.ts`) — check it for any code that assumes `farm.gps` always exists before doing hub-matching, since it'll now sometimes be undefined.

**Add farm verification status — genuinely missing from the schema, not just the UI.** `Farm.model.ts` has no `verificationStatus` field at all (confirmed by reading the full interface — it has `isActive` but nothing about admin verification). **Fix:**
- Add `verificationStatus: { type: String, enum: Object.values(VerificationStatus), default: VerificationStatus.PENDING }` to `FarmSchema` (reuse the `VerificationStatus` enum already imported and used for `kycStatus` on `User.model.ts` — don't invent a new enum).
- Surface it as a `Badge` on `FarmCard.tsx` (component already renders an `isActive` state pill — add a second badge next to it for verification status, same pattern).
- Add a gate in `product.controller.ts`'s create-product handler: reject with 400 if the selected farm's `verificationStatus !== VERIFIED` (there is currently no such check — any farm, verified or not, can have products published against it).

**"Crops" button on farm card — confirmed unfiltered.** `MyFarmsPage.tsx` line ~139: `onViewListings={() => navigate('/farmer/products')}` — no query param. **Fix:** `navigate(\`/farmer/products?farmId=${farm._id}\`)`, then in `MyProductsPage.tsx` read `useSearchParams()` and filter the fetched products list by `farmId` when present (check `ProductService.getMyProducts` / `product.controller.ts`'s list endpoint for whether it already accepts a `farmId` query param server-side — `ProductQuerySchema` in `product.validator.ts` currently does NOT include `farmId` as an accepted query field, only `category`, `district`, `isOrganic`, etc. — add it there and thread it into the Mongo filter in `product.controller.ts`, filtering client-side alone would still fetch the whole catalog).

---
## 6. CROP LISTINGS — `client/src/pages/farmer/AddProductPage.tsx`, `MyProductsPage.tsx`

**Sinhala/English split — worse than described, it's a dead field, not just a UX issue.** `AddProductPage.tsx` has state `title` and `titleSi`, and renders two separate inputs labeled "Produce Name (English)" / "Produce Name (Sinhala)". In `handleSubmit`, only `formData.append('productName', title.trim())` is sent — **`titleSi` is captured from the farmer and silently discarded, never submitted.** The backend `Product.model.ts` and `product.validator.ts` only ever had a single `productName` field; there was never anywhere for the Sinhala value to go. **Fix:** delete the `titleSi` state, the second input, and its label entirely. Keep the single `title`/`productName` field as free text (already correctly implemented on the backend, no backend change needed here).

**Unit dropdown — already correctly built, no fix needed.** `UnitOfSale` enum in `shared/src/constants/units.ts` is a proper fixed set (kg, g, l, ml, dozen, bundle, piece, bag_25kg, bag_50kg) with display labels, already enforced via `z.nativeEnum(UnitOfSale)` in `product.validator.ts` and rendered as a `<select>` in `AddProductPage.tsx`. v2's "fix unit handling" note doesn't apply — confirm this during testing and move on.

**Missing MOQ-vs-availableQuantity validation — confirmed absent.** `product.validator.ts`'s `CreateProductSchema` validates `minOrderQuantity` and `availableQuantity` independently with no cross-check. **Fix:** add a `.refine((data) => data.minOrderQuantity <= data.availableQuantity, { message: 'Minimum order quantity cannot exceed available quantity', path: ['minOrderQuantity'] })` to the schema object.

**Listing status badge — schema supports it, UI doesn't show it.** `Product.model.ts`'s `status` field already has the enum `'draft' | 'active' | 'out_of_stock' | 'delisted'` — it's missing a `'pending_verification'` value (add it to the enum), and defaults straight to `'active'` on creation with no verification gate at all (`status: { ..., default: 'active' }`). **Fix:** change the default to `'pending_verification'`, only flip to `'active'` once the linked farm's new `verificationStatus` (section 5) is `VERIFIED` — do this check in `product.controller.ts`'s create/update handlers. Then in `MyProductsPage.tsx`, render this status as a `Badge` on each product card (component already imports `Badge` for other purposes — just add the status pill using the existing pattern from `StatusPill.tsx`).

**Duplicate button — same shape as section 5's bug, confirm before fixing.** `MyProductsPage.tsx` has both "List New Crop Harvest" (line ~120, header) and "Publish First Harvest Lot" (line ~144, empty state). Verify the header button is similarly unconditional; if so, apply the identical fix as section 5.

---
## 7. HUB DROP-OFFS — `client/src/pages/farmer/HubDropoffPage.tsx`

**Confirmed 100% static.** The whole file imports only `React, { useState }` — no `useEffect`, no `api` import, no `*.service` import. The `pastReceipts` array (`REC-9012`, `REC-8840`, hardcoded weights and grades) is a literal constant in the component. This isn't a rendering bug, it's a page that was never wired to data.

**The backend data model to power it already exists and is well-built** — don't design a new one:
- `server/src/models/QualityInspection.model.ts` already has every field the receipt UI needs: `orderId, productId, farmerId, hubId, selfDeclaredGrade, assignedGrade, priceMultiplier, listedQuantity, confirmedQuantity, weightVariancePercent, rejectionReason, criteriaNotes, createdAt`.
- `server/src/models/VillageHub.model.ts` holds the hub's own identity/schedule/linked-DC data.

**What's actually missing is the read endpoint and the farmer→hub assignment field:**
1. `server/src/routes/hub.routes.ts` currently only exposes `GET /hubs`, `GET /hubs/:id`, and `POST /hubs/intake-grading` (collector/admin only). There is no endpoint for a farmer to fetch their own inspection history. **Add** `GET /hubs/my-receipts` (or `GET /farmer/hub-receipts`) → new controller method querying `QualityInspection.find({ farmerId: req.user.userId }).populate('hubId').sort({ createdAt: -1 })`.
2. `server/src/models/User.model.ts` has no field linking a farmer to their assigned `VillageHub`. **Add** `assignedHubId: { type: Schema.Types.ObjectId, ref: 'VillageHub' }` to the schema, and a way to set it (admin action or auto-assign-by-district on farm creation via `radius.service.ts`, which already exists for exactly this kind of proximity matching).
3. **Then in `HubDropoffPage.tsx`:** replace the hardcoded `pastReceipts` array with a `useEffect` fetching from the new endpoint; replace the static "Leg-1 Transport Route: Hub → Dambulla DC" text with the populated hub's linked `DistributionCenter` name (`DistributionCenter.model.ts` already exists and is already referenced elsewhere, e.g. `Order.model.ts`'s `assignedDcId`); derive the "Prepare for Tomorrow's Drop-off Batch" card from `Order.find({ 'items.farmerId': farmerId, status: OrderStatus.AWAITING_HUB_COLLECTION })` (this exact status enum value already exists in `shared/src/enums/OrderStatus.enum.ts`, already used in `farmer.controller.ts`'s dashboard query — reuse it here, don't invent a new query).
4. If there are zero such orders, render the existing `EmptyState.tsx` molecule (already used elsewhere in the app, e.g. `MyFarmsPage.tsx`'s empty state) instead of the current always-populated mock.

---
## 8. FARMER VERIFICATION (KYC) — `client/src/pages/auth/KycUploadPage.tsx`

**Good news: NIC validation is already correct, no fix needed.** `shared/src/validators/nicValidator.ts`'s `validateSriLankanNic()` already handles both the old 9-digit+V/X format and the new 12-digit format, with structural (not checksum) validation of birth year and day-of-year. `KycUploadPage.tsx` already uses a single free-text field with the right placeholder (`"e.g. 199423402123 or 942340212V"`). v2's suggestion to "confirm both formats are accepted" — confirmed, they are. No change needed here.

**Organic cert doc — already correctly placed on the Farm record, not here.** `AddFarmPage.tsx` already has its own `isOrganicCertified` toggle and `organicCertificate` file upload, separate from KYC. No conflation exists. No change needed.

**What actually needs fixing:** `kycStatus` on `User.model.ts` (a `VerificationStatus` enum) is already the single field consumed by both the avatar badge (`ProfileDropdown.tsx`'s `isVerified = user.kycStatus === 'verified'`) and the dashboard banner (`KycAlertBanner.tsx`) — so there IS already one source of truth at the data layer, contrary to v2's assumption of three disagreeing sources. Check `KycAlertBanner.tsx` and `ProfileDropdown.tsx` side by side for wording drift only (e.g. one might say "Verification Pending" and the other "Complete Your KYC") and align the copy — this is a text-consistency pass, not a data-model fix.

---
## 9. CONFIRMATION DIALOGS — COMPONENT EXISTS, NOTHING USES IT

`client/src/components/molecules/ConfirmDialog.tsx` is fully built and exported from `client/src/components/molecules/index.ts`. A repo-wide search shows it is imported by **zero** page or component files. Every destructive action currently fires immediately:
- `ProfileDropdown.tsx`'s `handleSignOut` — direct `logout()` call, no dialog.
- `MyFarmsPage.tsx`'s `handleToggleActive` (wired to `FarmCard.tsx`'s `onToggleActive` / the "Deactivate" button) — direct API call, no dialog.
- `MyProductsPage.tsx`'s `handleDelete` — calls `ProductService.deleteProduct(id)` directly from the button's `onClick`, no dialog, no `window.confirm`, nothing.

**Fix, mechanically identical for each:** import `ConfirmDialog` from `@/components/molecules`, add an `isConfirmOpen` boolean + a `pendingAction` state to each of the 3+ files above, change each destructive button's `onClick` to open the dialog instead of calling the handler directly, and only invoke the real handler from the dialog's `onConfirm`. Reuse the exact same pattern across Sign Out, Deactivate Farm, Delete Listing, Cancel Order (`FarmerOrdersPage.tsx` — check for a cancel action there too, not yet audited), and once built, Deactivate Account / Change Payout Bank Account in the new Edit Profile screen (section 4).

---
## 10. EARNINGS & WALLET — LEDGER MODEL ALREADY REAL, ONLY THE WIRING IS BROKEN

Correction to v2: the "Immutable Ledger Audit" being empty is **not** because the data model is fake. `server/src/models/LedgerEntry.model.ts` is already a complete, real double-entry ledger schema: `transactionType` (from `shared/src/enums/TransactionType.enum.ts`), `amountLkr`, `previousBalanceLkr`, `newBalanceLkr`, `referenceOrderId`, `withdrawalStatus`, `bankReferenceNumber`, indexed by `{ userId: 1, createdAt: -1 }`. `wallet.controller.ts`'s `getTransactions` already populates and paginates it correctly. **The only reason it looks empty is the section-0 endpoint/field-name bugs (`/wallet/ledger` → 404, `data.entries` → should be `data.transactions`).** Fix section 0 first; re-check whether this section is even still broken afterward before building anything new.

**What's genuinely missing, once section 0 is fixed:**
- A 4th summary card, "Pending Payout Requests" — count + LKR sum of `LedgerEntry.find({ userId, withdrawalStatus: 'pending' })` (the `WithdrawalStatus` enum and `withdrawalStatus` field already exist on the model — this is a new aggregate query in `wallet.controller.ts`, not a new field).
- Payout history sub-list on `WalletPage.tsx` — same `LedgerEntry` collection filtered to `transactionType: 'payout'`, already fetchable via the existing `getTransactions` endpoint with `?type=payout`.
- `payoutBankAccount` masking — `Wallet.model.ts` stores `accountNumber` in plaintext; add a `toJSON` transform on `WalletSchema` (or a controller-level mask) that returns only the last 4 digits, since `WalletPage.tsx` currently has nowhere safe to display it from.

---
## 11. DASHBOARD REFACTOR — `client/src/pages/farmer/FarmerDashboard.tsx`

- The heading literally renders `"Producer Command & Harvest Analytics"` (hardcoded JSX string, not even an i18n key) — replace with `{t.dashboard}` or a plain "Dashboard" string.
- "Producer Launchpad Checklist" (~line 196) — also hardcoded text with, per v2, a generic 33%-complete bar. Replace with real gating logic: check `user.kycStatus`, whether `Farm.countDocuments({ farmerId, isActive: true }) > 0` (already returned as `registeredFarms` by the fixed dashboard endpoint from section 0), and whether `wallet.payoutBankAccount` is set — each becomes one checklist row that's either done or links straight to the screen that completes it (KYC page, Add Farm page, Edit Profile → Payout).
- KPI cards: once section 0's endpoint fix lands, wire the 4 existing `StatCard` components to `res.data.activeProducts`, `res.data.registeredFarms` or an orders-count field, `res.data.pendingHubCollections`, and revenue from `res.data.wallet.totalEarned` — remove any hardcoded `0` fallbacks that mask a broken fetch as "no activity yet."
- `KycAlertBanner.tsx` + `ProfileDropdown`'s verification badge — see section 8, this is a wording-consistency fix, both already read `user.kycStatus`.
- Recent Orders / Upcoming Hub Collection / Recent Notifications sections — `res.data.recentOrders` is already returned by the dashboard endpoint (5 most recent, per `farmer.controller.ts`) and currently unused by the frontend; wire it in before building anything new. Upcoming Hub Collection can reuse the same `AWAITING_HUB_COLLECTION` query described in section 7.

---
## 12. NOTIFICATIONS — MOSTLY ALREADY WORKING, VERIFY BEFORE REBUILDING

Correction to v2: `client/src/components/organisms/NotificationDrawer.tsx` already has a `handleNotificationClick` that calls `NotificationService.markAsRead(...)` and then `navigate(resolvedPath)` — i.e., clicking a notification already navigates somewhere, it doesn't just mark-as-read-in-place as v2 assumed. **What to actually verify:** check `client/src/lib/routeResolver.ts` (referenced by the drawer) for whether `resolvedPath` correctly points at a real detail view for every notification type the backend can emit (`server/src/services/notification.service.ts` / `Notification.model.ts` for the type enum) — if some types resolve to a dead route or `/`, fix the mapping in `routeResolver.ts` rather than rebuilding the drawer.

What's actually missing: a full `/farmer/messages` tab with two sub-views (Notifications history + Chat) as described in v2 — this route does not exist in `router.tsx`. Backend support for this already exists in full (see section 13) — it's purely a frontend routing gap.

---
## 13. HELP & SUPPORT + MESSAGES — BACKEND FULLY BUILT, ZERO FRONTEND ROUTES

Correction to v2, which described this as "missing entirely" — the backend is not missing, only the farmer-facing pages are:
- `server/src/routes/chat.routes.ts` already exposes `GET /chat/conversations`, `GET /chat/conversations/order/:orderId`, `POST .../messages`, `PATCH .../read`, backed by `server/src/controllers/chat.controller.ts`, `server/src/models/Conversation.model.ts` + `Message.model.ts`, and a live `socket.service.ts` for real-time delivery.
- `client/src/services/chat.service.ts` and `client/src/components/organisms/ChatDrawer.tsx` already exist as a working chat UI component — check where `ChatDrawer.tsx` is currently mounted (likely only in the marketplace/customer flow) and confirm it isn't already reachable from the farmer portal before building a second implementation.
- `server/src/routes/ticket.routes.ts` already exposes `POST /tickets`, `GET /tickets/my-tickets`, `GET /tickets/:id`, `POST /tickets/:id/reply`, backed by `SupportTicket.model.ts` and `ticket.controller.ts`.

**What's missing is purely two frontend routes:**
1. `/farmer/messages` — new page reusing `ChatDrawer.tsx`'s conversation-list + thread UI and `chat.service.ts`'s existing methods, plus a tab toggle to the Notifications view from `NotificationDrawer.tsx`'s existing list-rendering logic (don't duplicate that logic — extract it into a shared component if needed).
2. `/farmer/support` — new page: a form calling `POST /tickets` (`ticket.service.ts` doesn't exist yet — add one, thin wrapper around `api.post('/tickets', ...)`), a list calling `GET /tickets/my-tickets`, and a static FAQ block above it.

---
## 14. LIGHT/DARK MODE — LOCALSTORAGE-ONLY, CONFIRMED

`client/src/store/themeStore.ts` reads/writes `localStorage.getItem/setItem('pola_theme', ...)` exclusively — no API call anywhere in the file, and `server/src/models/User.model.ts` has no `themePreference` field at all (confirmed by grep). This matches v2's description exactly.

**Fix:**
1. Add `themePreference: { type: String, enum: ['light', 'dark', 'system'], default: 'system' }` to `UserSchema` in `User.model.ts` — same PR as section 4's Edit Profile / Settings screen if that's being done together.
2. Add it to whichever partial-update endpoint you build for Edit Profile/Settings (or a small dedicated `PATCH /auth/theme` if you want it decoupled from the rest of profile editing).
3. In `themeStore.ts`, on login (check `authStore.ts` for the login success handler), sync `isDark` from `user.themePreference` instead of only `localStorage`, and on `toggleTheme()`, fire the same PATCH call in addition to the existing `localStorage.setItem`.

**Contrast audit** — this is a design pass, not something greppable; go component-by-component checking for hardcoded `text-white`/`bg-slate-950`-style classes with no `dark:` variant pairing that would break on light mode, same as v2 described. No shortcut here.

---
## 15. REPORTS — PARTIALLY BUILT, MORE THAN V2 ASSUMED

**Corrections to v2:**
- `shared/src/types/report.types.ts`'s `ReportType` enum **already declares** `FARMER_INCOME`, `HUB_COLLECTION`, and `COLLECTOR_COMMISSION` (plus several other portal's report types) — the types were designed for all three farmer reports up front.
- `server/src/services/excel.service.ts` already generates real `.xlsx` (not renamed CSV) — confirmed by its use in `report.controller.ts`.
- `server/src/services/pdf.service.ts` already uses `pdfkit` and already generates a full branded invoice PDF for orders (`generateInvoicePdf`) — this is the house pattern to copy for the other two PDF reports, not puppeteer as v2 suggested. Don't add a new PDF dependency.
- **But `server/src/controllers/report.controller.ts`'s `generateReport` method only actually implements 2 of the 12 `ReportType` enum branches** (`WASTAGE_SUMMARY` and `FARMER_INCOME`) — `HUB_COLLECTION` and `COLLECTOR_COMMISSION` fall through to a generic `throw new AppError('Unsupported report type requested', 400)`. It also **ignores the `format` query param entirely** — every branch hardcodes an Excel response, so `format=pdf` currently does nothing.
- **There is zero frontend usage anywhere** (`grep -rl "reports/export"` across `client/src` returns nothing) — no Reports tab, no download buttons exist yet at all, confirming v2's frontend assessment was correct even though the backend assessment wasn't.
- The existing `FARMER_INCOME` branch also has no date-range filtering (`startDate`/`endDate` are read for `WASTAGE_SUMMARY` but not applied to the `FARMER_INCOME` query, which is currently all-time) — needed for the "Monthly & Annual" requirement.

**Fix, in order:**
1. In `report.controller.ts`, apply `startDate`/`endDate` filtering to the existing `FARMER_INCOME` branch (copy the pattern already used two branches above it for `WASTAGE_SUMMARY`).
2. Add `format` branching: when `format === 'pdf'`, call a new `PdfService.generateIncomeReportPdf(rows, summary)` method (new method on the existing `pdf.service.ts`, copy the header/footer/table-drawing style from `generateInvoicePdf` rather than starting from scratch) instead of the current always-Excel path.
3. Implement the `HUB_COLLECTION` branch: query `QualityInspection.find({ farmerId, hubId, createdAt: { range } })` (same model as section 7 — build the query once, reuse it for both the live Hub Drop-offs screen and this report, per the original spec's intent). Header block should reuse the same `REC-XXXX` receipt numbering already visible in the mock data in `HubDropoffPage.tsx` — check whether that receipt ID is actually generated/stored anywhere yet (`QualityInspection.model.ts` currently has no visible receipt-number field — add one, e.g. `receiptNumber: { type: String, unique: true }`, auto-generated on inspection creation).
4. Implement the `COLLECTOR_COMMISSION` branch, gated by `req.user.role === Role.COLLECTOR` (the `Role` enum already exists and is already used for this exact gating pattern in `farmer.routes.ts`'s `/managed-farmers` endpoints) — query `User.findById(collectorId).populate('managedFarmers')` (already used in `FarmerController.getManagedFarmers`) joined against each managed farmer's completed orders.
5. Build the frontend: a `client/src/services/report.service.ts` (doesn't exist — thin wrapper around `api.get('/reports/export', { params, responseType: 'blob' })`), and a Reports section inside `WalletPage.tsx` (or a new tab) with a period picker and PDF/Excel buttons per report, gated so Collector Commission only renders when `user.role === 'collector'`.

---
## 16. NAMING — EXACT STRINGS FOUND, MOSTLY A ONE-FILE FIX

Most of these aren't scattered — they trace back to a single i18n key:

- `client/src/lib/i18n/translations.ts` line ~201 (`en`), ~326 (`si`), ~451 (`ta`) — `farmerOpsCenter: 'Farmer Operations Center'` (and Sinhala/Tamil equivalents) is used as `portalTitle` by **every** farmer page (`FarmerDashboard.tsx`, `MyFarmsPage.tsx`, `MyProductsPage.tsx`, `EditProductPage.tsx`, `FarmerOrdersPage.tsx`, `HubDropoffPage.tsx` all pass `portalTitle={t.farmerOpsCenter}`). **Fix once, in the translation file, all three languages:** change to `'Farmer Portal'` (or `'Dashboard'`) — this single edit propagates everywhere instantly, no per-page changes needed.
- `"Producer Command & Harvest Analytics"` — hardcoded JSX in `FarmerDashboard.tsx`'s hero heading (not an i18n key at all currently). Replace with plain text or promote it to a translation key first.
- `"Registered Agricultural Parcels & Land Holdings"` — hardcoded JSX in `MyFarmsPage.tsx`'s heading. Replace with `"My Farms"`.
- `"Crop Inventory & Harvest Catalog"` — hardcoded JSX in `MyProductsPage.tsx`'s heading. Replace with `"Crop Listings"`.
- `"Financial Operations Desk"` — `WalletPage.tsx` line ~289, passed directly as `portalTitle="Financial Operations Desk"` (a string literal, not even reading from `t`). Replace with `"Earnings & Wallet"`.
- `"Escrow Wallet &"` — `WalletPage.tsx` line ~125, part of a subheading. Keep as a subtitle line under the h1 per v2's original recommendation, not as the page's main heading (it currently isn't the h1, so this one may already be fine — verify placement, not necessarily a change).
- `"Producer Launchpad Checklist"` — `FarmerDashboard.tsx` line ~196, covered already in section 11's gating-logic fix; rename the label to `"Complete Your Profile"` in the same edit.

---
## 17. SUGGESTED BUILD ORDER (revised against what's actually broken vs. actually fine)

1. **Section 0** — fix the 4 URL/field-name mismatches (`/wallet/me`→`/wallet/my-wallet`, `/wallet/ledger`→`/wallet/transactions`, `/farmer/dashboard/kpis`→`/farmer/dashboard`, `/wallet/topup`→`/wallet/top-up`) + the `Conversation.model.ts` duplicate index. This is a ~30-minute fix that unblocks testing everything else, since the dashboard and wallet are currently silently broken for every farmer.
2. **Sections 1–2** — swap all 9 pages' local `navItems` arrays for the already-built `getFarmerNavItems()` from `lib/navItems.tsx`. Fixes the disappearing-tab bug immediately; decide separately whether to also do the full sidebar-to-top-navbar visual rewrite.
3. **Section 9** — wire the already-built `ConfirmDialog` into Sign Out / Deactivate Farm / Delete Listing. Small, high-value, no new components needed.
4. **Sections 5–6** — farm/product field fixes: make GPS optional (validator + schema + `AddFarmPage.tsx`), remove the dead `titleSi` field, fix the duplicate register/publish buttons, add `verificationStatus` to `Farm.model.ts`, wire the "Crops" button's `farmId` filter (needs a validator change too).
5. **Section 7** — add the farmer-facing hub-receipts endpoint and `assignedHubId` field, then rewire `HubDropoffPage.tsx` off real data. `QualityInspection.model.ts` already has everything the UI needs; this is endpoint-plus-rewire, not a data-model design task.
6. **Section 10** — re-verify once section 0 is fixed; the ledger model and controller are already real, this section may need far less work than it looks like it does right now.
7. **Section 11** — dashboard heading/copy cleanup + real gating logic for the onboarding checklist, using data already returned by the fixed dashboard endpoint.
8. **Sections 3–4** — trim `ProfileDropdown.tsx`, then build the net-new Edit Profile / Settings pages (these need a new partial-update backend endpoint — bundle with section 14's `themePreference` field).
9. **Section 13** — build the two missing frontend routes/pages on top of the chat and ticket backends, which are already fully built.
10. **Section 14** — add `themePreference` to `User.model.ts`, sync `themeStore.ts` to it, then do the manual light/dark contrast audit.
11. **Section 12** — verify `routeResolver.ts`'s notification-type-to-path mapping is complete; this may need little or no work.
12. **Section 15** — extend `report.controller.ts` with the two missing report types + PDF branch (reusing `pdf.service.ts`'s existing pattern), then build the frontend Reports UI, which currently doesn't exist at all.
13. **Section 16** — the translation-key fix (`farmerOpsCenter`) plus 4 hardcoded-string replacements. Fast, can be done anytime, but do it last so it doesn't get overwritten by the page-level edits happening in steps 1–9.
POLA FARMER PORTAL — ISSUE LIST, FIXES & IMPLEMENTATION ROADMAP (v2)
Grounded in pola-system-specification.md (Part 1) and your screenshots.
No code included — this is a what-to-build/what-to-remove/how-to-wire-it guide.
Each section now includes a REAL-WORLD PARALLEL, the same way the spec itself
grounds Pola's design in Dambulla Economic Centre, DeHaat, Twiga Foods, etc.
(§1 of the spec) — the idea is that almost nothing here is a novel UX pattern;
it's all borrowed from systems that already work.

=================================================================================
0. TERMINAL ERRORS SEEN IN YOUR LOGS (fix first — these break the dashboard/wallet)
=================================================================================
Your server log shows repeated 404s:
  GET /api/v1/farmer/dashboard/kpis        -> 404
  GET /api/v1/wallet/me                    -> 404
  GET /api/v1/wallet/ledger?page=1&limit=20 -> 404

These aren't frontend bugs — the frontend is calling routes your backend never
registered. Before any UI refactor, add these three backend endpoints (or rename
the frontend calls to match whatever routes you actually built):

  GET  /api/v1/farmer/dashboard/kpis
       -> returns: totalRevenueGross, activeHarvestListings, pendingOrders,
          harvestDispatchedKg, verificationStatus, profileCompletionPercent

  GET  /api/v1/wallet/me
       -> returns: availableBalance, escrowHoldBalance, lifetimePayouts,
          linkedBankAccount (masked), lastPayoutDate, nextPayoutEligibleDate

  GET  /api/v1/wallet/ledger?page=&limit=
       -> returns paginated ledger entries (see section 10 below for the shape)

Also fix the Mongoose warning: "Duplicate schema index on {orderId:1}" — you
have both `index: true` on the field AND a separate `schema.index({orderId:1})`.
Remove one; keep it on the schema.index() call so you can name/tune it later.

REAL-WORLD PARALLEL: this is a supermarket checkout scanner beeping "item not
found" — the barcode (API route) the scanner is reading was simply never
entered into the store's inventory system (backend router). The scanner isn't
broken; the item was never registered.

=================================================================================
1. GLOBAL NAVIGATION — REMOVE LEFT SIDEBAR, MOVE EVERYTHING TO TOP NAVBAR
=================================================================================
Current: left sidebar (Dashboard, My Farms, Crop Listings, Farm Orders, Hub
Drop-offs, Earnings & Wallet, sign-out block, profile block at bottom) + a
separate top bar with language/theme/bell/profile icons.

Target: ONE top navbar only. No left sidebar at all.

Top navbar layout (left to right):
  [Pola logo]  [Dashboard] [My Farms] [Crop Listings] [Farm Orders]
  [Hub Drop-offs] [Earnings & Wallet]        <- primary nav tabs, horizontal
                                   [Language] [Theme] [Notifications bell]
                                   [Profile avatar — picture only, no name]

Rules:
- Every item currently in the left sidebar becomes a top nav tab. Nothing is
  lost, it's just relocated.
- The bottom-of-sidebar "sachinthahansajith44 / email / Sign Out" block is
  REMOVED entirely from the sidebar area — sign out and profile info move
  into the profile avatar dropdown (section 3).
- On narrow/mobile widths, collapse the tab row into a hamburger/overflow
  menu — don't bring the sidebar back, just reflow.
- This also incidentally fixes the "Hub Drop-offs disappears when Earnings &
  Wallet is clicked" bug (section 2) — see below.

REAL-WORLD PARALLEL: think of a bank's mobile app bottom bar — Accounts,
Transfers, Cards, More. All four tabs are always present and always tappable;
tapping "Cards" never makes "Transfers" vanish. That's the guarantee a single
flat top nav gives you that a sidebar with conditional rendering doesn't.

=================================================================================
2. BUG: "HUB DROP-OFFS DISAPPEARS WHEN EARNINGS & WALLET IS CLICKED"
=================================================================================
This is a rendering/state bug, not a data bug — likely one of:
  a) the sidebar nav array is being filtered/sliced based on which route is
     active (a leftover conditional meant for something else), or
  b) Hub Drop-offs and Earnings & Wallet are wired to the same route param
     and one is clobbering the other's mounted component.
Fix: give every farmer nav tab its own explicit route (e.g. /farmer/hubs,
/farmer/wallet) and render nav items from a single static array, not a
computed/filtered one. This becomes moot once you do the top-navbar rebuild
in section 1 — build it there and verify all 6 tabs stay visible regardless
of which one is active.

You separately said "Hub Drop-offs seems complete bullshit to me" — see
section 7 for what this screen is actually FOR per the spec and how to make
it a real, useful screen instead of decorative mock data.

REAL-WORLD PARALLEL: two shop fitting rooms sharing one door key — whoever
grabs it last locks the other one out. Give each nav item its own dedicated
route/key instead of two features fighting over the same shared switch.

=================================================================================
3. PROFILE AVATAR DROPDOWN (top navbar, right side)
=================================================================================
Reference pattern you pointed to (image 1 — a Perplexity-style account menu):
small, no repeated nav links, just identity + a short list of account-level
actions + theme toggle + legal links. Copy that shape, not the content.

Avatar shows: profile PICTURE only. No name next to it in the navbar — same
as how Gmail, Google Drive, and most enterprise SaaS tools show a circular
photo/initials avatar top-right and reveal the name only inside the dropdown.

Clicking the avatar opens a dropdown containing ONLY:
  - Name + email (small, for identity confirmation — not a link)
  - Verification badge (Pending Review / Verified / Rejected)
  - Edit Profile          -> opens Edit Profile screen (section 4)
  - Settings              -> language, notification preferences, theme
  - 4 Portals Directory   -> keep this one (it's in your current dropdown,
    image 2) — but treat it as a portal SWITCHER, not a nav duplicate: it's
    for a user who also has a Customer or Delivery account, or wants to sign
    up for one, to jump between Pola's four portals. That's a genuinely
    different job from "Dashboard"/"Earnings & Wallet" links, so it earns
    its place here.
  - Help & Support        -> section 13
  - Sign Out              -> requires confirmation (section 9)

Do NOT repeat Dashboard / Earnings & Wallet / My Farms / NIC & KYC
Verification here — those already live in the top navbar tabs (section 1) or
inside Edit Profile (section 4). Repeating them was the exact problem you
flagged in the current build (images 2 and 3).

REAL-WORLD PARALLEL: Google's account menu (top-right circle photo) vs.
Google's app switcher (the 3x3 grid of dots). Your avatar dropdown should
behave like the account menu — identity and account actions only — while
"4 Portals Directory" behaves like the app-launcher grid: switching between
whole applications, not a shortcut back to a page you're already one click
from in the main nav.

=================================================================================
4. EDIT PROFILE SCREEN (new — currently missing)
=================================================================================
Route: /farmer/profile/edit (opened only from the avatar dropdown, never
shown as a full dashboard-replacing page).

Fields, grouped as sections so it isn't one giant form — same idea as a
banking app's "Manage Profile" page, where Security, Personal Info, Address,
and Payout Method are separate cards you can each save independently:

  Account
    - Profile picture (upload/replace/remove)
    - Username (auto-suggested at signup, editable once — see spec §10.4;
      after the first edit, require a "change username" confirmation)
    - Full name
    - Recovery / login email (separate field from any secondary contact
      email if you add one later)
    - Change password (current password + new password + confirm — never
      pre-filled, never shown in plaintext)
    - Two-factor / OTP preference toggle (optional, future-friendly)

  Personal details (per spec §5.2)
    - Date of birth
    - Gender
    - Phone number (Sri Lankan format, normalized to +94XXXXXXXXX)
    - Preferred language (English / Sinhala / Tamil)

  Address
    - Home address: Province (dropdown) -> District (auto-filtered) ->
      Street/House No. (text) -> City/Town (text) -> Postal code (optional)

  Payout details
    - Bank name, branch, account number, account holder name
    - (Read-only display of masked account once verified — don't let a
      verified payout account be silently edited without re-verification,
      exactly like a bank won't let you swap a linked payout account by
      just retyping it — it triggers a re-verification step)

  Danger zone (bottom, visually separated)
    - Deactivate account (confirmation required, section 9)

Save behavior: partial-save per section (don't force one giant submit), each
section shows its own "Saved" confirmation. Password change requires
re-entering current password regardless of what else is being edited.

REAL-WORLD PARALLEL: a LinkedIn or banking-app "Edit Profile" modal — you
open one card (e.g. "Change password"), it saves on its own, you close it
and move to the next card. Nobody expects editing their phone number to also
resubmit their name and address.

=================================================================================
5. FARM MANAGEMENT — FIELD REFACTOR + DUPLICATE BUTTON + VERIFICATION
=================================================================================
Duplicate button bug (confirmed in images 12/13 — "Register New Farm Plot"
top-right AND "Register First Farm Plot" center, doing the same thing):
Keep exactly ONE primary entry point. Recommendation: remove the top-right
header button, keep the single centered "Register First Farm Plot" /
contextual "+ Add Farm" action so there's one obvious call-to-action per
screen state (empty state vs. has-farms state can each show it, but never two
at once on the same screen).

Field changes, per spec §5.3:
  KEEP:
    - Farm name/label
    - Address: Province (dropdown), District (auto-filtered dropdown),
      free-text street/area detail
    - Extent (numeric value + unit dropdown: Acres or Perches — don't hardcode
      "Acres" as the only option, Sri Lankan smallholders commonly measure
      small plots in Perches, the same way a Sri Lankan land deed would)
    - Ownership type: Owned / Leased
    - Primary crop types grown (multi-select, not free text — feeds catalog
      filters later)
    - Irrigation type: Rain-fed / Irrigated (well, canal, etc. as sub-options)
    - Organic certification: Yes/No toggle -> if Yes, require document upload

  FIX / DE-EMPHASIZE:
    - GPS pin: per spec this is listed as part of the farm record, but it
      should be OPTIONAL and auto-captured from device location (§11: "GPS —
      Optional, auto-captured from device location where available"). Don't
      make it a manual required field the farmer has to fill in — offer a
      one-tap "Use my current location" button, skippable. This directly
      answers your "GPS coordinates seem unnecessary" note: it's not
      unnecessary to the system (it feeds delivery-radius matching to the
      nearest Village Hub, §3.2), it's wrong as a mandatory MANUAL field.

  ADD (currently missing):
    - Farm verification status (Pending / Verified / Rejected) — visible on
      each farm card as a badge, same pattern as the account-level
      verification badge. A farm shouldn't be able to publish crop listings
      until its own verification clears, separate from the farmer's account
      verification (a verified farmer can still add a new, not-yet-verified
      farm plot).

"Crops" button on each farm card (images 7/8):
Currently does nothing meaningful. Per your report, it should navigate to
Crop Listings FILTERED to that specific farm (?farmId=X), not the unfiltered
full catalog. This also gives you a natural place to show "3 active
listings from this farm" as a count on the card itself.

REAL-WORLD PARALLEL: this is exactly how a property listing works on a
real-estate portal — a title deed (your farm record) has a fixed extent, an
ownership type, and a location, and it has to be verified against the actual
land registry before it can be listed for sale/rent. The GPS pin is like a
ride-hailing app auto-detecting your pickup point instead of forcing you to
drop a manual map pin every single time — auto-capture with a manual override,
not a mandatory data-entry chore.

=================================================================================
6. CROP LISTINGS — FIELD REFACTOR + DUPLICATE BUTTON + UNITS
=================================================================================
Duplicate button bug (confirmed in image 12: "List New Crop Harvest" top-right
AND "Publish First Harvest Lot" center): same fix as section 5 — one entry
point, not two.

Field changes, per spec §5.4:
  REMOVE:
    - Separate Sinhala-name / English-name fields for the product name.
      Per spec §13: "User-generated content stays in whatever language it
      was typed in; only the interface itself is translated." A farmer's
      product name is user-generated content — it should be ONE free-text
      name field, in whatever language the farmer types it. Don't force a
      bilingual pair; that's translating the wrong thing (the way a seller
      on Amazon.com types their product title once, in whichever language
      they sell in — Amazon doesn't ask for a second title in a second
      language just because the storefront itself supports multiple locales).

  FIX (measurement/unit handling):
    - Unit of sale MUST be a fixed dropdown, not free text: kg, g, litre, ml,
      dozen, bundle (spec §11 and §17 — "standardized units enforced
      platform-wide, so listings from different farmers are actually
      comparable"). If your current build lets unit be typed freely or mixes
      it into the same field as price, split it: [Price] [per] [Unit ▾].
    - Price per unit: positive numeric only, currency fixed to LKR.
    - Available quantity: positive numeric, same unit as above.
    - Minimum order quantity (for B2B buyers): positive numeric, validated
      so it can never exceed available quantity.

  KEEP:
    - Category: Vegetable / Fruit / Dairy / Grain / Spice / Other (fixed list)
    - Variety (free text — e.g. "Kuroda" carrot, "Bonanza" leek, matching
      your own Hub Drop-offs screenshot's naming, image 9)
    - Harvest/availability date
    - Self-declared quality grade (A/B/C) — flag clearly in the UI that this
      is farmer-declared and WILL be reconciled against the hub inspector's
      actual grade at collection (§4, §17) — don't let it read as final.
    - Photos (multiple, with client-side compression before upload per §13;
      cap file size ~5MB, allowlist jpg/png/webp)
    - Organic flag (only selectable if the linked farm has organic
      certification on file — otherwise disable with a tooltip explaining why)
    - Perishability flag (routes to cold-chain delivery matching, §5.4)
    - Linked farm (required — this is what makes the farm-card "Crops"
      button in section 5 actually work)

  ADD (currently missing):
    - Listing status visible on each card: Draft / Pending Verification /
      Active / Out of Stock / Inactive-Delisted (§4). A brand-new unverified
      farmer's first listings should show clearly as "Pending Verification —
      not yet visible to buyers," so the farmer isn't confused about why
      nothing is selling.

REAL-WORLD PARALLEL: a fixed unit dropdown is exactly what happens at a real
wholesale market's weighbridge — everyone's produce gets weighed in the same
standard unit (kg) so a buyer can actually compare two farmers' prices
side-by-side. A self-declared grade next to a hub-verified grade is like an
eBay seller's own "Like New" condition claim versus what the item actually
turns out to be on inspection — both get shown, but they're clearly two
different, separately-sourced claims.

=================================================================================
7. HUB DROP-OFFS — MAKE IT REAL (not decorative)
=================================================================================
You called this "complete bullshit" — here's what it's supposed to represent
per spec §3.2/§3.3/§9, and how to make the screen actually earn its place.

REAL-WORLD PARALLEL FIRST, because it explains the whole screen: this is
literally modeled on the Dambulla Dedicated Economic Centre — the real
wholesale market this spec is built around (spec §1). A truck arrives, goods
get weighed on a certified scale, an inspector assigns a grade, and a receipt
is issued. Your own screenshot already has the right shape for this (receipt
"REC-9012", "Grade A (100%)") — the fix is making sure that shape is filled
with real data end to end, not a static mock.

What it's FOR: this is the screen where a farmer sees their assigned Village
Collection Hub, its recurring schedule, and — critically — the reconciliation
between what they listed and what was actually collected (weight, quality
grade, rejections).

Fixes:
  - "Prepare for Tomorrow's Drop-off Batch" numbers must be DERIVED from
    actual orders in "Awaiting Hub Collection" status linked to this farmer,
    not a hardcoded card. If there are zero such orders, show an honest empty
    state ("No drop-off scheduled — nothing awaiting collection right now"),
    same pattern as your other empty states (images 10, 12, 13).
  - "Hub Quality Inspection Receipts" list should pull from real
    Collected-at-Hub events (§4 state 4), each receipt showing: date, crop,
    quantity listed vs. quantity accepted vs. rejected (with reason code),
    grade assigned. This is literally the "Hub Collection Report" data from
    spec §5.7 — build the ledger once and reuse it for both this screen and
    the downloadable report (section 15 below).
  - "Leg-1 Transport Route: Hub → Dambulla DC" (image 9) should be pulled
    from that specific hub's actual linked Distribution Center record (§3.2:
    "linked distribution center"), not hardcoded — a farmer assigned to a
    different hub should see their real onward route, e.g. a southern hub
    might route to Matara, not always "Dambulla DC" regardless of assignment.
  - "Generate Batch Manifest QR" is a legitimate feature per the Collector
    workflow (§5.5) but should only be enabled when there's an actual
    upcoming collection with confirmed orders — disable/hide it on empty
    state rather than showing it as always-clickable decoration.
  - Hub identity (name, address, schedule) should come from the VillageHub
    record the farmer is actually assigned to (§3.2), not static text.

=================================================================================
8. FARMER VERIFICATION (NIC & KYC) — FIELD REFACTOR
=================================================================================
Per spec §17 KYC requirement and §11 validation rules:
  - NIC number: accept BOTH old format (9 digits + V/X) and new format
    (12 digits) — validate structurally (plausible year + day-of-year), not
    a checksum (the algorithm isn't public). Your current single free-text
    field with a placeholder example is fine structurally — just confirm the
    validation logic accepts both formats, not just one.
  - NIC front image, NIC back image, face selfie with NIC (image 5) — keep
    all three, each with the same upload constraints as product photos
    (5MB cap, jpg/png/pdf allowlist for docs).
  - Add (currently not visible in your KYC screen): organic-certification
    document upload should live on the FARM record (section 5), not here —
    don't conflate identity KYC with farm-certification KYC, they verify
    different things and may clear at different times.
  - Verification status should be a single source of truth consumed by:
    the avatar badge (section 3), the dashboard notification (section 11),
    and any gating logic (can't publish a listing until cleared, §10.3).

REAL-WORLD PARALLEL: this is standard bank-account-opening or Uber-driver
KYC — ID front, ID back, a selfie matched against the ID. Nothing about your
current 3-step flow is wrong; it just needs to feed one shared status instead
of three screens quietly disagreeing about whether you're verified yet.

=================================================================================
9. CONFIRMATION REQUIRED ON ALL DESTRUCTIVE / SESSION-ENDING ACTIONS
=================================================================================
Add a confirmation dialog (not a native browser confirm() — a proper modal
matching the app's design) before executing any of:
  - Sign Out
  - Deactivate account
  - Deactivate a farm (your farm card already has a "Deactivate" button —
    confirm this triggers a dialog; if not, add one)
  - Delete/Delist a crop listing
  - Cancel an order (farmer-initiated cancellation before hub collection, §4)
  - Remove/replace a verification document already uploaded
  - Change payout bank account details once verified

Each confirmation dialog should state the consequence in plain language
("You'll need to sign in again to continue managing your farms" / "This will
remove the listing from the marketplace immediately"), not just "Are you
sure?".

REAL-WORLD PARALLEL: a bank app never lets you fire off a fund transfer or
close an account with a single tap — it always re-confirms, often re-asking
for your PIN. Sign-out and delisting a product aren't as high-stakes as
moving money, but the pattern (state the consequence, then confirm) is the
same instinct, scaled down.

=================================================================================
10. EARNINGS & WALLET — REALISTIC ENTERPRISE FIELD REFACTOR
=================================================================================
Current screen (image 6) is close structurally but the ledger is empty/fake
and fields are generic. Rebuild around a real ledger model.

REAL-WORLD PARALLEL: think of this whole screen as a bank passbook combined
with a mobile-money wallet (the kind eZ Cash or PayPal balance already
work like) — a running balance, an escrow hold like a real-estate deposit
sitting with an agent until the deal closes, and a payout history that reads
like a bank statement line-by-line, not a single lump total.

Top summary cards (keep the three you have, they're correct per spec's
wallet concept in §17):
  - Available Balance — LKR, ready to withdraw
  - Escrow Hold Balance — LKR, held until delivery OTP/confirmation verified
  - Total Lifetime Payouts — LKR, cumulative

Add a 4th card:
  - Pending Payout Requests — count + LKR amount currently being processed

Ledger table (the "Immutable Ledger Audit" section — currently always empty):
Each row should be a real transaction with these fields:
  - Date/time
  - Transaction type: Sale Credit / Platform Commission / Collector
    Commission / Escrow Release / Payout / Adjustment / Refund Deduction
  - Reference (linked Order ID, clickable to that order)
  - Gross amount / Commission deducted / Net amount
  - Running balance after this entry
  - Status: Pending / Cleared / Reversed

Bank payout section (currently just a "Request Bank Payout" button):
  - Show linked bank account (masked account number, bank name)
  - Show next eligible payout date if there's a payout cycle/schedule
  - Payout history sub-list: date requested, amount, status (Processing /
    Completed / Failed), completion date

This is what makes "Immutable Ledger Audit" true instead of decorative —
right now it's an empty state with a heading and nothing to actually audit.

=================================================================================
11. DASHBOARD REFACTOR
=================================================================================
Remove:
  - "Producer Launchpad Checklist" as currently framed (generic 33%-complete
    gamification card) — replace with the spec-defined onboarding gate
    (§10.3): a real profile-completeness indicator tied to actual gating
    rules (can't list a product without a farm, can't get paid without a
    verified bank account, etc.), not a decorative progress bar.

Consolidate:
  - The orange "Identity Verification Incomplete" banner (image 4) and the
    verification badge in the profile dropdown (image 2/3) currently show
    overlapping/inconsistent info. Make ONE verification-status component
    that shows: current status, what's missing (NIC docs / bank details /
    farm registration), and a single "Complete Verification" CTA. Show it
    once, prominently, not duplicated across the header, a banner, and a
    dropdown with slightly different wording each time.

KPI cards — keep the four you have (Total Revenue, Active Harvest Listings,
Pending Orders, Harvest Dispatched) but wire them to the real
/farmer/dashboard/kpis endpoint (section 0) instead of showing static LKR 0 /
0 regardless of actual state.

Add realistic, spec-aligned dashboard sections instead of generic filler:
  - Recent Orders (last 5, with status per §4 lifecycle)
  - Upcoming Hub Collection (next scheduled drop-off date/time, pulled from
    the same data as section 7)
  - Recent Notifications (last 3, each opens full detail per section 12)
  - Quick actions: List New Crop, Register New Farm — only these two, not a
    third duplicate entry point already covered elsewhere.

REAL-WORLD PARALLEL: this should feel like a seller dashboard on Amazon
Seller Central or Shopify Admin — real revenue numbers, real recent orders,
real to-dos — not a landing page with placeholder stats. The onboarding
checklist specifically should work like Stripe's dashboard "Finish setting
up your account" checklist: each item unlocks a real capability when
completed (accepting payments, in Stripe's case; listing a crop, here), not
just a percentage that goes up for its own sake.

=================================================================================
12. NOTIFICATIONS SYSTEM — LINK TO FULL MESSAGES/NOTIFICATIONS TAB
=================================================================================
Per spec §14: "In-app notification center mirrors the same events for anyone
actively in the app." Currently the bell icon presumably shows a dropdown
preview with no full view. Fix:
  - Bell icon dropdown = short preview list (last 5, unread count badge).
  - Clicking any individual notification in that preview navigates to a full
    Notifications/Messages tab (/farmer/messages) and opens that specific
    notification's full detail there — not just marking it read in place.
  - The full Messages tab should have two sub-views: Notifications (system
    events — order status changes, verification results, payout
    confirmations) and Chat (in-app messaging with customers, per §14).
    See section 13 for the chat build-out.

REAL-WORLD PARALLEL: exactly how a banking app's notification works —
tapping "Your transfer of LKR X was received" opens the actual transaction
record, it doesn't just dismiss a toast. Same expectation applies to "Your
NIC verification was approved" or "Order #1042 was collected at hub."

=================================================================================
13. HELP & SUPPORT + MESSAGES — CURRENTLY MISSING ENTIRELY
=================================================================================
Messages tab (route: /farmer/messages):
  - Per §6.6/§14, customers can message farmers in-app. Build a standard
    two-pane chat: conversation list (left) + active thread (right), each
    conversation tied to an Order ID for context — the same shape as
    Amazon's "Buyer-Seller Messaging" or WhatsApp Business's chat list.
  - Click-to-call: only expose the other party's phone number once an order
    formally links them (§14) — don't show raw contact info before that.
  - Notifications sub-view lives in this same tab per section 12.

Help & Support tab (route: /farmer/support):
  - Per §17, this should be a real support-ticketing flow, not a static FAQ
    page: "Raise a ticket" (subject, category dropdown — Payout Issue / Order
    Issue / Verification Issue / Technical Issue / Other, description,
    optional screenshot upload), a list of the farmer's own past tickets with
    status (Open / In Progress / Resolved), and a searchable FAQ section
    above the ticket form — the same shape as a telecom or bank's complaint
    portal (raise a ticket, get a reference number, track its status).
  - This connects to the Admin Portal's support queue (out of scope for the
    Farmer Portal build itself, but design the ticket data model now so
    Admin can consume it later without a schema rewrite).

=================================================================================
14. LIGHT/DARK MODE — FIX CONTRAST + PERSIST TO DATABASE
=================================================================================
Bug: light mode has inconsistent/broken contrast (some elements clearly
styled only for dark mode and never re-checked in light mode). Fix by
defining a proper design-token pair (background, surface, border, text-
primary, text-secondary, accent) for BOTH themes and auditing every screen
against both — don't leave any component with hardcoded dark-only colors.

Persistence: per spec §13, dark/light mode should be "persisted per user,"
which in your current build likely means localStorage only (resets across
devices). Fix: store the preference on the User document in MongoDB
(themePreference: "light" | "dark" | "system") and sync on login.

REAL-WORLD PARALLEL: this is how Netflix or YouTube remembers your dark-mode
setting against your ACCOUNT, not your browser — sign in on a new phone and
it's already dark mode, because the preference travels with you, not with
the device.

=================================================================================
15. REPORTS — TEMPLATES + HOW TO IMPLEMENT (per spec §5.7 and §12)
=================================================================================
Build these three farmer-facing reports first (spec explicitly lists them for
the Farmer Portal). Think of these three as, respectively, a payslip, a
weighbridge goods-received note, and a sales-agent commission statement —
each is a familiar real-world document, just digitized.

--- REPORT 1: Income Report (PDF + Excel, Monthly & Annual) ---
REAL-WORLD PARALLEL: a payslip — itemized earnings, deductions, net pay.
Template fields (one row per completed sale in the period):
  Date | Order ID | Crop/Product | Quantity Sold | Unit | Gross Revenue (LKR)
  | Platform Commission Deducted | Collector Commission Deducted (if any)
  | Net Payout (LKR)
Footer/summary block: Total Gross Revenue, Total Commission Deducted, Total
Net Payout, period covered (e.g. "1–31 August 2026" or "Annual 2026").
Implementation:
  - Backend endpoint: GET /api/v1/reports/income?period=monthly&month=8&year=2026
    (and a `period=annual&year=2026` variant).
  - Query: aggregate Order/Wallet-Ledger entries where farmerId = current
    user AND status = Completed AND date within range, grouped by product.
  - PDF generation: use a library like pdfkit or puppeteer (render an HTML
    template to PDF) on the backend; return as a downloadable file stream.
  - Excel generation: use exceljs on the backend to build a real .xlsx (not
    a CSV renamed) so it opens cleanly with proper column widths/headers.
  - Frontend: a "Reports" section (could live inside Earnings & Wallet, or
    as its own tab) with a period picker (month/year or "Annual") and two
    download buttons (PDF, Excel) that hit the endpoint and trigger a
    browser download.

--- REPORT 2: Hub Collection Report (PDF, per collection day) ---
REAL-WORLD PARALLEL: a weighbridge goods-received note (GRN) at a wholesale
market — what arrived, what was accepted, what was rejected and why, signed
off by an inspector. Your own "REC-9012" receipt format (image 9) is already
the right building block for this.
Template fields (one row per crop dropped off that day):
  Crop | Quantity Listed | Quantity Accepted | Quantity Rejected | Rejection
  Reason (if any) | Weight Discrepancy vs. Listed | Quality Grade Assigned
Header block: Hub name/code, collection date, farmer name, receipt reference
(reuse the same REC-XXXX numbering already visible in your Hub Drop-offs
screen so the on-screen receipt and the downloadable PDF are obviously the
same document).
Implementation:
  - Backend endpoint: GET /api/v1/reports/hub-collection?date=2026-09-02
  - Source data: the same Collected-at-Hub event records that power the
    Hub Drop-offs screen's "Quality Inspection Receipts" list (section 7) —
    build this data model ONCE and drive both the live screen and this PDF
    from it, don't maintain two separate sources of truth.
  - PDF generation: same approach as Report 1.
  - Frontend: a "Download Receipt" action next to each past collection entry
    on the Hub Drop-offs screen itself, plus a bulk "Download all this
    month" option in Reports.
  - Note for consistency: the spec's Admin Portal has its own "Village Hub
    Throughput Report" (aggregated across all farmers at a hub) — your
    farmer-facing version is the single-farmer slice of that same underlying
    collection-event data, not a separate report to design from scratch.

--- REPORT 3: Collector Commission Report (Excel, Monthly) ---
REAL-WORLD PARALLEL: a sales-agent or real-estate-agent commission
statement — one row per client/deal, rate applied, amount earned.
Only relevant if this farmer account is also a Village Collector (§5.1/§5.5).
Template fields (one row per managed farmer):
  Managed Farmer Name | NIC | Transactions in Period | Total Sales Volume
  (LKR) | Commission Rate Applied | Commission Earned (LKR)
Footer: Total Commission Earned across all managed farmers for the period.
Implementation:
  - Backend endpoint: GET /api/v1/reports/collector-commission?month=&year=
  - Only expose this endpoint/tab at all if req.user.accountType includes
    "Collector" — hide the whole Reports sub-section for pure Independent
    Farmer accounts rather than showing an empty/irrelevant report.
  - Excel generation via exceljs as above.

General implementation notes for all three:
  - Store generated reports nowhere permanently (regenerate on demand from
    live data) unless you later want a "report history" feature — for MVP,
    generate-and-stream-download is enough and avoids stale-file management.
  - Rate-limit report generation per user (a farmer requesting the same
    report 50 times a minute is a signal worth throttling, not a real need).
  - All three reports should visually share one header/footer template
    (Pola logo, farmer name, generation timestamp) so they read as one
    coherent report family instead of three unrelated documents.

=================================================================================
16. NAMING CONVENTIONS — APPLY CONSISTENTLY ACROSS THE WHOLE PORTAL
=================================================================================
Replace decorative/marketing headers with plain functional names, per the
pattern started in section 11:
  "Farmer Operations Center"      -> "Farmer Portal" or just "Dashboard"
  "Producer Command & Harvest
   Analytics"                     -> "Dashboard"
  "Registered Agricultural
   Parcels & Land Holdings"       -> "My Farms"
  "Crop Inventory & Harvest
   Catalog"                       -> "Crop Listings"
  "Financial Operations Desk"     -> "Earnings & Wallet"
  "Escrow Wallet & LankaPay Desk" -> keep as a subtitle line under "Earnings
                                      & Wallet" if you want to keep the
                                      LankaPay branding, not as the h1 itself
  "Producer Launchpad Checklist"  -> "Complete Your Profile" (tied to real
                                      gating logic per section 11)

Keep terminology consistent with the spec's own vocabulary throughout (Farm,
Crop Listing, Order, Hub, Collector, Wallet, Payout) rather than inventing
new synonyms per screen.

REAL-WORLD PARALLEL: a bank's app never renames "Transfer Money" to "Capital
Mobility Command Center" — plain, boring, functional labels are a deliberate
enterprise-software convention, not a lack of creativity. Save the flavor
text for a subtitle line, not the button itself.

=================================================================================
17. SUGGESTED BUILD ORDER FOR THIS PASS
=================================================================================
REAL-WORLD PARALLEL: this is a house renovation, not a paint job — fix the
plumbing and wiring (backend endpoints, data models) before repainting walls
(UI polish), or every coat of paint has to be redone once the pipes get
opened up later.

1. Fix the three missing backend endpoints (section 0) — nothing above can be
   verified as working until the data layer is real.
2. Rebuild navigation: remove sidebar, build top navbar + avatar dropdown
   (sections 1, 3) — this alone fixes the Hub Drop-offs disappearing bug.
3. Field refactors: Farms, Crop Listings, KYC (sections 5, 6, 8) — remove
   duplicate buttons and Sinhala/English name split, fix units, add
   verification badges.
4. Wire the "Crops" button on farm cards to filtered Crop Listings (section 5).
5. Rebuild Hub Drop-offs and Earnings & Wallet off real data models (sections
   7, 10) — these two share the same underlying ledger/collection-event data.
6. Dashboard refactor (section 11) — now that real data exists everywhere
   else, the dashboard KPIs and verification banner can consume it honestly.
7. Add confirmation dialogs on all destructive actions (section 9).
8. Build Edit Profile, Help & Support, Messages tabs (sections 4, 13).
9. Fix theme persistence + contrast audit (section 14).
10. Build the three reports (section 15) last — they depend on every data
    model above already being real and populated.
