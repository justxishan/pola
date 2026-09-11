# Pola Architecture & Codebase Security Audit Report

**Audit Date**: September 11, 2026  
**Auditor Role**: Senior Software Architect, Refactoring Specialist & DevOps Lead  
**Scope**: Full Monorepo (`shared`, `server`, `client`)  
**Status**: Production-Hardened & Validated  

---

## 1. Executive Summary

A comprehensive architectural and security audit was conducted across the Pola monorepo. The audit identified and resolved critical vulnerabilities in privilege assignment, financial top-up integrity, produce order allocation, dispute authorization, and missing database indexes. A native TypeScript unit test suite (30 automated tests across 10 suites) was introduced using Node's test runner, and zero compilation errors or TypeScript regressions remain across the codebase.

---

## 2. Problem Inventory & Remediation Matrix

### 🔴 CRITICAL Severity

| Issue ID | Vulnerability / Bug | Affected Files | Status | Remediation Summary |
|---|---|---|---|---|
| **SEC-01** | **Mass Assignment Privilege Escalation** | `server/src/controllers/auth.controller.ts`<br>`server/src/validators/auth.validator.ts` | **FIXED** | Removed `kycStatus` from `UpdateProfileSchema`. Enforced strict whitelist in `updateProfile` controller to prevent arbitrary overwriting of `role`, `kycStatus`, `password`, or `email`. |
| **FIN-01** | **Unverified Wallet Top-Up & Replay Attack** | `server/src/controllers/wallet.controller.ts`<br>`server/src/models/LedgerEntry.model.ts` | **FIXED** | Added `externalReferenceId` unique sparse index to `LedgerEntry`. Verified PayPal captured USD amount against expected LKR conversion. Prevented duplicate top-up redemptions. |
| **LOG-01** | **Silent Mock Product Fallback in Checkout** | `server/src/controllers/order.controller.ts` | **FIXED** | Removed silent fallback that created dummy produce crates or silently swapped items when products were missing or inactive. Replaced with descriptive `AppError` 400. |

---

### 🟠 HIGH Severity

| Issue ID | Vulnerability / Bug | Affected Files | Status | Remediation Summary |
|---|---|---|---|---|
| **FIN-02** | **Wallet Deduction Without Ledger & Post-Hoc Check** | `server/src/controllers/order.controller.ts` | **FIXED** | Pre-validated wallet balance before decrementing inventory stock or creating orders. Created `ORDER_PAYMENT` ledger record for every wallet checkout. |
| **FIN-03** | **Orphaned Farmer Escrow on Order Cancellation** | `server/src/controllers/order.controller.ts`<br>`server/src/services/escrow.service.ts` | **FIXED** | Routed cancellation refunds through `EscrowService.refundOrderToCustomerWallet`, correctly clearing farmers' `pendingEscrowBalanceLkr`. |
| **SEC-02** | **IDOR in Dispute Creation & Lookup** | `server/src/controllers/dispute.controller.ts` | **FIXED** | Enforced `assertOrderStakeholder` in `createDispute` and `getDisputeById`, restricting dispute operations strictly to parties involved in the order or administrators. |

---

### 🟡 MEDIUM Severity

| Issue ID | Vulnerability / Bug | Affected Files | Status | Remediation Summary |
|---|---|---|---|---|
| **DB-01** | **Unindexed Multikey Farmer Order Queries** | `server/src/models/Order.model.ts` | **FIXED** | Added compound multikey indexes: `{ 'items.farmerId': 1, status: 1, createdAt: -1 }`, `{ 'items.productId': 1 }`, `{ leg1DriverId: 1, status: 1 }`, and `{ linkedVillageHubId: 1, status: 1 }`. |
| **SEC-03** | **Handover OTP Leakage Across Portals** | `server/src/utils/orderAuth.util.ts`<br>`server/src/models/User.model.ts` | **FIXED** | Verified `sanitizeOrderForRole` hides `handoverOtp` from farmers and drivers prior to doorstep collection. Sanitized `password` and `passwordHash` on `User.toJSON`. Added `avatarUrl` virtual alias. |
| **API-01** | **Frontend Error Interceptor Message Masking** | `client/src/services/api.ts` | **FIXED** | Updated Axios response interceptor to check `error.response?.data?.error || error.response?.data?.message || error.message`, ensuring server validation errors are displayed. |

---

### 🟢 LOW Severity / Operational Debt

| Issue ID | Description | Remediation |
|---|---|---|
| **TST-01** | Complete absence of automated tests in monorepo | Implemented `server/src/test/` suite running Node native test runner via `tsx --test`. Added `"test"` scripts to workspace and root `package.json`. |
| **ENV-01** | Missing production CI/CD script configuration | Added unified `"test"` command to root `package.json` for CI/CD pipelines (`npm test`). |

---

## 3. Automated Test Suite

Native unit test execution via `npm test` (`tsx --test src/test/*.test.ts`):
- **30 Tests Passed, 0 Failed, 0 Skipped** (1.4s duration)
  - `src/test/orderTransitions.test.ts`: 9 tests (State machine rules, role authorization, terminal state transitions).
  - `src/test/securityAuth.test.ts`: 11 tests (Zod schema protection, IDOR stakeholder boundaries, OTP sanitization).
  - `src/test/escrowLedger.test.ts`: 10 tests (Produce unit pricing [kg, 100g, 100ml, units], platform/collector splits, logistics pricing, PayPal FX conversion tolerance).

---

## 4. Operational Considerations & Recommendations

1. **Database Index Migration**: In existing production MongoDB instances, run `Order.syncIndexes()` or deploy during maintenance window to allow background index builds for `items.farmerId`.
2. **PayPal Webhooks**: For high-volume production deployments, supplement client-side `confirmTopUp` with automated PayPal IPN/Webhook listeners.
3. **Log Aggregation**: Ensure Winston log levels in `server/src/utils/logger.util.ts` are forwarded to Datadog or Google Cloud Logging.
