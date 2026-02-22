# Perpetual License SaaS React Support Design

**Date:** 2026-02-21
**Status:** Approved
**Scope:** `saas/packages/saas`, `loop/packages/common`, `loop/packages/identity`, `loop/packages/license-core`, `loop/packages/payments`, `licenseoperator` (backend gap)
**Out of scope:** Stripe product catalog setup, email template authoring, admin portal license management

---

## Problem

The backend now supports perpetual licenses (`license_type=perpetual`) with a `maintenance_expires_at` window that gates access to newer builds. The SaaS React site and license portal have not been updated to:

1. Present the new pricing model clearly to prospective customers
2. Let customers choose between subscription and perpetual at checkout
3. Show maintenance expiry in the license portal
4. Allow perpetual-manual holders to buy a one-off maintenance renewal

---

## Pricing Model — Three Customer Journeys

| Model | First payment | Maintenance | License expires |
|---|---|---|---|
| **Annual subscription** (existing) | Recurring yearly | Included — auto-renews | Yes, each year |
| **Perpetual + auto-maintenance** (new) | One-time | Stripe subscription auto-charges yearly | Never |
| **Perpetual + manual maintenance** (new) | One-time | Separate one-off purchase when desired | Never |

**Key principle:** All three models deliver a signed license artifact. The customer always goes to the SaaS portal to download or regenerate their license. Auto-maintenance subscription holders can also receive the artifact by email on renewal (backend NATS event already fires — no new frontend work required).

---

## Architecture Overview

Five areas of change, in dependency order:

```
1. PaymentTierDto extension         — loop/packages/common (shared type)
2. SaaS home page copy + toggle     — saas/packages/saas (marketing)
3. Checkout flow (TierCard toggle)  — loop/packages/identity (new purchase)
4. License portal                   — loop/packages/license-core (existing customers)
5. Backend: maintenance checkout    — licenseoperator (new webhook path)
```

**Unchanged:** Annual subscription checkout/portal flow, `TierSelectionStep` structure, `LicensesGroupContent` download flow core, `ActivateGroup` (receives same `PaymentTierDto` shape with variant's `lookupKey` baked in).

---

## Section 1: `PaymentTierDto` Extension

**File:** `loop/packages/common/src/common/types/subscriptions.ts`

```ts
export interface TierVariant {
    label: string          // "Annual subscription" | "Perpetual (auto)" | "Perpetual (manual)"
    billingModel: 'subscription' | 'perpetual_auto' | 'perpetual_manual'
    lookupKey: string      // Stripe price lookup key for this variant
    price: number
    billingCycle: string   // "year" | "one-time"
    description?: string   // e.g. "Includes 1 yr maintenance; auto-renews"
}

export interface PaymentTierDto {
    tierName: string
    maxMembers: number
    price: number
    billingCycle: string
    lookupKey: string
    tierDescription: string
    pricingTiers?: PricingTierDto[]
    variants?: TierVariant[]   // new: when present, TierCard renders billing toggle
}
```

When `variants` is absent the card behaves exactly as today — zero regression for existing single-model tiers.

---

## Section 2: SaaS Home Page — Copy Updates

**File:** `saas/packages/saas/src/browser/components/home/home-component.tsx`

No structural JSX changes. Only constant data updated:

| Location | Old | New |
|---|---|---|
| `licensingHighlights[1].title` | `"One-off annual licenses"` | `"Perpetual licenses"` |
| `licensingHighlights[1].description` | `"one-time annual purchases over subscriptions"` | `"own the software forever; run any build published before your maintenance window expires"` |
| `licensingSteps[0].description` | `"Pick a yearly subscription for renewals or a lifetime license for one-off deployments."` | `"Pick a yearly subscription or a perpetual license — with optional maintenance for access to new builds."` |
| Pricing section subtitle | `"Subscriptions for SaaS. One-off licenses for software."` | `"Subscriptions for SaaS. Perpetual licenses for software."` |
| Comparison row `💰 Pricing` core column | `$219 one-off annual` | `$219 perpetual (1 yr maintenance incl)` |

New `licensingHighlights[1]` description (full):

> Pay once and run the software forever on builds published during your maintenance window. Renew maintenance when you want access to newer builds — automatically or on your own schedule.

---

## Section 3: Checkout Flow — Billing Toggle

### 3a. `TierCard` changes

**File:** `loop/packages/identity/src/browser/components/groups/TierCard.tsx`

When `tier.variants` is non-empty, render a tab row above the price line. A selected variant overrides the card's displayed price, billing cycle, and description. When `onSelect(tier)` fires, it merges the selected variant's `lookupKey`, `price`, and `billingCycle` into the base `PaymentTierDto` before passing it up:

```
┌───────────────────────────────────────────┐
│ Authlance Core                            │
│ ┌─────────────┬───────────────────────┐   │  ← billing model tabs
│ │ Subscription│      Perpetual        │   │    (only when variants exist)
│ └─────────────┴───────────────────────┘   │
│ $199.00/year                              │
│ Identity, RBAC, billing...                │
│                              [Select]     │
└───────────────────────────────────────────┘
```

When "Perpetual" tab is active, a secondary row appears for the maintenance preference:

```
│ ┌──────────────────────┬────────────────┐ │
│ │   Auto-maintenance   │ Manual renewal │ │
│ └──────────────────────┴────────────────┘ │
│ $219.00 one-time  ·  1 yr maintenance incl│
```

**Key design principle:** The merged `PaymentTierDto` emitted by `onSelect` has the variant's `lookupKey` as the top-level value. This means `ActivateGroup` (which reads `paymentTier.lookupKey` at line 467) requires zero changes.

### 3b. Stripe product setup (informational)

Three Stripe prices per product:

| Price type | Billing | Metadata required |
|---|---|---|
| Annual subscription | Recurring yearly | _(none — existing path)_ |
| Perpetual + auto-maintenance | One-time | `license_type=perpetual` on price; checkout session includes a recurring maintenance subscription line item so `sess.Subscription` is set |
| Perpetual + manual | One-time | `license_type=perpetual` on price; no subscription line item so `sess.Subscription` is nil |

The backend webhook already branches correctly: perpetual + `sess.Subscription != nil` → links `stripe_maintenance_sub_id`; perpetual + `sess.Subscription == nil` → no sub linked (manual holder).

---

## Section 4: License Portal

### 4a. `LicenseSubscriptionState` extension

**File:** `loop/packages/license-core/src/browser/components/licenses/LicensesGroupContent.tsx`

```ts
interface LicenseSubscriptionState {
    status: 'loading' | 'ready' | 'error'
    canManage: boolean           // existing — Stripe subscription portal
    customerId?: string
    seats?: number
    licenseType?: string         // new: "subscription" | "perpetual_auto" | "perpetual_manual"
    maintenanceExpiresAt?: Date  // new: perpetual licenses only
    canBuyMaintenance: boolean   // new: true only for perpetual_manual
}
```

Populated from two new fields added to the `VerifyPayment` API response (see Section 5c).

### 4b. Table column changes

**"Expires" column** — for perpetual licenses (`licenseType` starts with `"perpetual"`), display a `"Perpetual"` badge instead of the year-9999 date string.

**New "Maintenance" column** — conditionally rendered: hidden entirely when the group has no perpetual licenses. When shown:
- Perpetual licenses: display `maintenanceExpiresAt` formatted date
- Subscription licenses in same group: display `—`

```
┌──────────┬──────┬───────────┬─────────────┬────────┐
│ License  │ Plan │ Expires   │ Maintenance │ Status │
├──────────┼──────┼───────────┼─────────────┼────────┤
│ lic-123  │ CORE │ Perpetual │ Feb 18 2027 │ ACTIVE │
│ lic-456  │ CORE │ Dec 2026  │      —      │ ACTIVE │
└──────────┴──────┴───────────┴─────────────┴────────┘
```

### 4c. Actions dropdown — "Buy maintenance renewal"

Added to the existing `DropdownMenuContent` alongside "Download license" and "Manage subscription". Visible only when `subscriptionState.canBuyMaintenance === true`:

```
⋮  Actions
   ↓  Download license
   💳 Manage subscription       ← existing (subscription + perpetual_auto)
   🔄 Buy maintenance renewal   ← new (perpetual_manual only)
```

Clicking navigates to:
`/subscription/buy-maintenance?group={groupName}&license={licenseId}`

### 4d. New `BuyMaintenance` page

**File:** `loop/packages/payments/src/browser/pages/BuyMaintenance/index.tsx`

Pattern mirrors `ManagePayment/index.tsx`:
1. Read `group` and `license` from query params
2. Call `POST /authlance/license/payments/api/v1/maintenance-checkout` with `{ licenseId, groupName }`
3. Redirect to returned Stripe Checkout URL
4. After Stripe returns → navigate to `/licenses/group` with a success toast

Registered in `loop/packages/payments/src/browser/front-end-payments-module.ts` as `BuyMaintenancePageContribution` at route `/subscription/buy-maintenance`.

---

## Section 5: Backend Gap — Maintenance Renewal One-off Checkout

### 5a. New API endpoint

**File:** `licenseoperator/internal/http/controller/payments_controller.go`

```
POST /authlance/license/payments/api/v1/maintenance-checkout
```

Request:
```go
type CreateMaintenanceCheckoutRequest struct {
    LicenseID string `json:"licenseId"`
    GroupName string `json:"groupName"`
}
```

Handler logic:
1. Validate caller identity owns the given `licenseId` under `groupName`
2. Confirm `license_type = "perpetual"` and `stripe_maintenance_sub_id` is empty (manual holders only — auto holders manage via Stripe portal)
3. Return `403` if conditions not met
4. Call Stripe to create a one-time Checkout session:
   - Price: maintenance `lookupKey` from service config
   - Metadata: `license_type=maintenance_renewal`, `original_license_id={licenseId}`
   - `success_url` → `/licenses/group?maintenance=renewed`
5. Return `{ url: string }`

### 5b. New webhook branch

**File:** `licenseoperator/internal/service/stripe/webhook.go`

At the top of `handleCheckoutCompleted`, before the existing perpetual branch:

```go
if strings.EqualFold(sess.Metadata["license_type"], "maintenance_renewal") {
    return m.handleMaintenanceRenewalCheckout(ctx, sess)
}
```

`handleMaintenanceRenewalCheckout`:
1. Read `original_license_id` from session metadata
2. Look up existing perpetual license via `FindByLicenseID`
3. Extend `maintenance_expires_at` by 1 year (same logic as `handleMaintenanceRenewal`)
4. Call `resignWithNewMaintenance` (already implemented)
5. Call `UpdateMaintenanceExpiry` (already implemented)
6. Publish NATS event for email notification (same event as subscription renewal)

No new repo methods required — fully reuses existing `resignWithNewMaintenance` and `UpdateMaintenanceExpiry`.

### 5c. `VerifyPayment` response extension

**File:** `licenseoperator/internal/http/controller/payments_controller.go` (service layer)

Two new fields on the existing `GET /verify-payment/{licenseId}` response:

```go
LicenseType          string     `json:"licenseType,omitempty"`
MaintenanceExpiresAt *time.Time `json:"maintenanceExpiresAt,omitempty"`
```

`licenseType` logic:
- `license_type = "perpetual"` AND `stripe_maintenance_sub_id` non-empty → `"perpetual_auto"`
- `license_type = "perpetual"` AND `stripe_maintenance_sub_id` empty → `"perpetual_manual"`
- Otherwise → `"subscription"`

Both values are already in the `LicenseRecord` fetched by the existing handler — no extra DB query.

---

## Files Changed Summary

### `loop/packages/common`
| File | Change |
|---|---|
| `src/common/types/subscriptions.ts` | Add `TierVariant` interface; add `variants?` to `PaymentTierDto` |

### `saas/packages/saas`
| File | Change |
|---|---|
| `src/browser/components/home/home-component.tsx` | Update copy constants only |

### `loop/packages/identity`
| File | Change |
|---|---|
| `src/browser/components/groups/TierCard.tsx` | Add billing model tab toggle; merge variant into emitted `PaymentTierDto` |

### `loop/packages/license-core`
| File | Change |
|---|---|
| `src/browser/components/licenses/LicensesGroupContent.tsx` | Extend `LicenseSubscriptionState`; update "Expires" column; add "Maintenance" column; add "Buy maintenance renewal" action |

### `loop/packages/payments`
| File | Change |
|---|---|
| `src/browser/pages/BuyMaintenance/index.tsx` | New page (mirrors `ManagePayment`) |
| `src/browser/front-end-payments-module.ts` | Register `BuyMaintenancePageContribution` |

### `licenseoperator`
| File | Change |
|---|---|
| `internal/http/controller/payments_controller.go` | Add `handleCreateMaintenanceCheckout` handler + route |
| `internal/service/stripe/webhook.go` | Add `maintenance_renewal` branch in `handleCheckoutCompleted`; add `handleMaintenanceRenewalCheckout` |
| `internal/service/payments/` (service layer) | `VerifyPayment` response gains `licenseType` + `maintenanceExpiresAt` |

---

## Backward Compatibility

- Tiers without `variants` behave exactly as today
- Annual subscription portal flow is completely unchanged
- `ActivateGroup` and `TierSelectionStep` receive the same `PaymentTierDto` shape — no changes required
- The "Maintenance" column is hidden for groups with no perpetual licenses
- The `VerifyPayment` response additions are additive (`omitempty`) — existing clients ignore them
