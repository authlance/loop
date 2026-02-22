# Perpetual License SaaS React Support — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Surface the three-model perpetual/subscription pricing choice in the SaaS site checkout and license portal, plus close the backend gap for one-off maintenance renewal.

**Architecture:** Extend `PaymentTierDto` with a `variants` field that lets `TierCard` render a billing-model toggle without touching downstream checkout code. The portal reads new `licenseType`/`maintenanceExpiresAt` fields added to the existing verify-payment API response. A new `/maintenance-checkout` endpoint and matching webhook branch handle one-off maintenance purchases.

**Tech Stack:** TypeScript/React (loop packages, saas package), Go 1.24 (licenseoperator), Stripe webhooks, swaggo/swag for OpenAPI codegen

**Design doc:** `loop/docs/plans/2026-02-21-perpetual-license-saas-design.md`

---

## Reading Order

Before making any change, read these files to understand the existing patterns:

- `loop/packages/common/src/common/types/subscriptions.ts` — `PaymentTierDto` shape
- `loop/packages/identity/src/browser/components/groups/TierCard.tsx` — card component to extend
- `loop/packages/identity/src/browser/components/groups/group.tsx` lines 556–660 — how selected tier flows to checkout
- `loop/packages/license-core/src/browser/components/licenses/LicensesGroupContent.tsx` lines 45–290 — table + actions
- `loop/packages/payments/src/browser/pages/ManagePayment/index.tsx` — template for BuyMaintenance page
- `loop/packages/payments/src/browser/front-end-payments-module.ts` — route registration pattern
- `licenseoperator/pkg/payments/types.go` lines 254–295 — `PaymentVerificationResponse` and `LicenseVerificationSummary`
- `licenseoperator/internal/http/controller/payments_controller.go` — controller patterns
- `licenseoperator/internal/service/stripe/webhook.go` lines 140–360 — `handleCheckoutCompleted`
- `licenseoperator/internal/service/stripe/webhook.go` lines 500–540 — `handleMaintenanceRenewal` (already implemented; reuse its logic)

---

## Task 1: Extend `PaymentTierDto` with billing model variants

**Files:**
- Modify: `loop/packages/common/src/common/types/subscriptions.ts`

### Step 1: Add `TierVariant` interface and extend `PaymentTierDto`

Open `loop/packages/common/src/common/types/subscriptions.ts`. It currently contains:

```ts
export interface PricingTierDto { ... }
export interface PaymentTierDto { ... }
```

Add `TierVariant` above `PaymentTierDto` and add the `variants` field:

```ts
export interface TierVariant {
    label: string
    billingModel: 'subscription' | 'perpetual_auto' | 'perpetual_manual'
    lookupKey: string
    price: number
    billingCycle: string
    description?: string
}

export interface PaymentTierDto {
    tierName: string
    maxMembers: number
    price: number
    billingCycle: string
    lookupKey: string
    tierDescription: string
    pricingTiers?: PricingTierDto[]
    variants?: TierVariant[]   // when present, TierCard renders a billing toggle
}
```

### Step 2: Verify compilation

```bash
cd loop/packages/common
yarn build
```

Expected: build succeeds with no TypeScript errors.

### Step 3: Commit

```bash
git add loop/packages/common/src/common/types/subscriptions.ts
git commit -m "feat(common): add TierVariant and variants field to PaymentTierDto"
```

---

## Task 2: Update SaaS home page copy

**Files:**
- Modify: `saas/packages/saas/src/browser/components/home/home-component.tsx`

### Step 1: Update `licensingHighlights`

Find the `licensingHighlights` constant (around line 102). Replace the second entry:

```ts
// Replace:
{
    icon: FileText,
    title: 'One-off annual licenses',
    description:
        'Secure a signed artifact with a single payment when you prefer predictable, one-time annual purchases over subscriptions.',
},

// With:
{
    icon: FileText,
    title: 'Perpetual licenses',
    description:
        'Pay once and run the software forever on builds published during your maintenance window. Renew maintenance when you want access to newer builds — automatically or on your own schedule.',
},
```

### Step 2: Update `licensingSteps`

Find `licensingSteps` (around line 123). Replace the first step description:

```ts
// Replace:
{ title: 'Choose your plan', description: 'Pick a yearly subscription for renewals or a lifetime license for one-off deployments.' },

// With:
{ title: 'Choose your plan', description: 'Pick a yearly subscription or a perpetual license — with optional maintenance for access to new builds.' },
```

### Step 3: Update pricing section subtitle

Find the `<p>` element with text `"Subscriptions for SaaS. One-off licenses for software."` (around line 664) and change it to:

```tsx
<p className="text-base text-muted-foreground">Subscriptions for SaaS. Perpetual licenses for software.</p>
```

### Step 4: Update pricing comparison row

Find the `comparisonRows` array entry for `'💰 Pricing (indicative)'` (around line 256). In the `core` column, replace `$219 one-off annual` with `$219 perpetual (1 yr maintenance incl)`:

```tsx
core: (
    <div className="space-y-1">
        <span>$199 / yr subscription</span>
        <span>$219 perpetual (1 yr maintenance incl)</span>
    </div>
),
```

### Step 5: Verify compilation

```bash
cd saas
yarn build
```

Expected: no TypeScript errors.

### Step 6: Commit

```bash
git add saas/packages/saas/src/browser/components/home/home-component.tsx
git commit -m "feat(saas): update home page copy for perpetual license model"
```

---

## Task 3: Add billing model toggle to `TierCard`

**Files:**
- Modify: `loop/packages/identity/src/browser/components/groups/TierCard.tsx`

### Step 1: Read the current file

Read `loop/packages/identity/src/browser/components/groups/TierCard.tsx` in full before editing.

### Step 2: Add imports and local state

At the top of the file, add `useState` to the React import and import `TierVariant` from the common types:

```ts
import React, { useState } from 'react'
import { PaymentTierDto, PricingTierDto, TierVariant } from '@authlance/common/lib/common/types/subscriptions'
```

### Step 3: Replace the component body

Replace the `TierCard` component with this implementation. The key behaviours:
- When `tier.variants` is undefined or empty, render exactly as before (zero change).
- When variants are present, render a primary tab row (Subscription | Perpetual).
- When "Perpetual" is the primary selection, render a secondary tab row (Auto | Manual).
- `onSelect` emits a merged `PaymentTierDto` with the chosen variant's `lookupKey`, `price`, `billingCycle` baked in as top-level fields — downstream code never needs to know about variants.

```tsx
export const TierCard: React.FC<TierCardProps> = ({
    tier,
    selected = false,
    isCurrent = false,
    onSelect,
    disabled = false,
}) => {
    const hasVariants = Array.isArray(tier.variants) && tier.variants.length > 0

    const subscriptionVariants = hasVariants
        ? tier.variants!.filter(v => v.billingModel === 'subscription')
        : []
    const perpetualVariants = hasVariants
        ? tier.variants!.filter(v => v.billingModel === 'perpetual_auto' || v.billingModel === 'perpetual_manual')
        : []
    const hasPerpetual = perpetualVariants.length > 0

    const [primaryModel, setPrimaryModel] = useState<'subscription' | 'perpetual'>(
        hasPerpetual && subscriptionVariants.length === 0 ? 'perpetual' : 'subscription'
    )
    const [selectedPerpetualVariant, setSelectedPerpetualVariant] = useState<TierVariant | null>(
        perpetualVariants[0] ?? null
    )

    const activeVariant: TierVariant | null =
        !hasVariants ? null
        : primaryModel === 'subscription' ? (subscriptionVariants[0] ?? null)
        : selectedPerpetualVariant

    const displayPrice = activeVariant?.price ?? tier.price
    const displayCycle = activeVariant?.billingCycle ?? tier.billingCycle
    const displayDescription = activeVariant?.description ?? tier.tierDescription

    const formatPrice = (price: number, cycle: string) => `$${price.toFixed(2)}/${cycle}`

    const handleSelect = () => {
        if (disabled || isCurrent) return
        if (!activeVariant) {
            onSelect(tier)
            return
        }
        // Merge variant into base tier so downstream code reads lookupKey/price from top level
        onSelect({
            ...tier,
            lookupKey: activeVariant.lookupKey,
            price: activeVariant.price,
            billingCycle: activeVariant.billingCycle,
        })
    }

    return (
        <Card
            className={cn(
                'flex flex-col cursor-pointer transition-all',
                selected && 'ring-2 ring-primary',
                isCurrent && 'bg-muted',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={handleSelect}
        >
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{tier.tierName}</CardTitle>
                    {selected && <Check className="h-5 w-5 text-primary" />}
                </div>

                {/* Primary billing model toggle — only when both subscription and perpetual variants exist */}
                {hasVariants && subscriptionVariants.length > 0 && hasPerpetual && (
                    <div className="flex rounded-md border border-border overflow-hidden text-xs mt-1">
                        <button
                            type="button"
                            className={cn(
                                'flex-1 px-2 py-1 transition-colors',
                                primaryModel === 'subscription'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background text-muted-foreground hover:bg-muted'
                            )}
                            onClick={(e) => { e.stopPropagation(); setPrimaryModel('subscription') }}
                        >
                            Subscription
                        </button>
                        <button
                            type="button"
                            className={cn(
                                'flex-1 px-2 py-1 transition-colors',
                                primaryModel === 'perpetual'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background text-muted-foreground hover:bg-muted'
                            )}
                            onClick={(e) => { e.stopPropagation(); setPrimaryModel('perpetual') }}
                        >
                            Perpetual
                        </button>
                    </div>
                )}

                {/* Perpetual sub-toggle — auto vs manual — only when perpetual is selected and both variants exist */}
                {hasVariants && primaryModel === 'perpetual' && perpetualVariants.length > 1 && (
                    <div className="flex rounded-md border border-border overflow-hidden text-xs mt-1">
                        {perpetualVariants.map((v) => (
                            <button
                                key={v.billingModel}
                                type="button"
                                className={cn(
                                    'flex-1 px-2 py-1 transition-colors',
                                    selectedPerpetualVariant?.billingModel === v.billingModel
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-background text-muted-foreground hover:bg-muted'
                                )}
                                onClick={(e) => { e.stopPropagation(); setSelectedPerpetualVariant(v) }}
                            >
                                {v.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="text-2xl font-bold mt-2">
                    {formatPrice(displayPrice, displayCycle)}
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <CardDescription>{displayDescription}</CardDescription>
                {tier.maxMembers > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                        Up to {tier.maxMembers} members
                    </p>
                )}
                {tier.pricingTiers && tier.pricingTiers.length > 0 && (
                    <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pricing</p>
                        {tier.pricingTiers.map((pt, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {formatTierRange(pt, idx, tier.pricingTiers!)} members
                                </span>
                                <span>${pt.unitPrice.toFixed(2)}/each</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                {isCurrent ? (
                    <Button variant="outline" disabled className="w-full">Current Plan</Button>
                ) : (
                    <Button
                        variant={selected ? 'default' : 'outline'}
                        className="w-full"
                        onClick={(e) => { e.stopPropagation(); handleSelect() }}
                        disabled={disabled}
                    >
                        {selected ? 'Selected' : 'Select'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
```

### Step 4: Verify compilation

```bash
cd loop/packages/identity
yarn build
```

Expected: no TypeScript errors. Existing tier cards without `variants` are visually and behaviourally identical to before.

### Step 5: Visual verification

Temporarily add a `variants` array to any local tier fixture or Storybook story and confirm the toggle renders. Then remove the fixture change before committing.

### Step 6: Commit

```bash
git add loop/packages/identity/src/browser/components/groups/TierCard.tsx
git commit -m "feat(identity): add billing model toggle to TierCard"
```

---

## Task 4: Extend backend `LicenseVerificationSummary` and verify-payment handler

**Files:**
- Modify: `licenseoperator/pkg/payments/types.go`
- Modify: `licenseoperator/internal/http/controller/payments_controller.go` (or its service layer — follow where `VerifyPayment` builds the response)
- Test: `licenseoperator/pkg/payments/types_test.go` (create)

### Step 1: Write a failing test for the new fields

Create `licenseoperator/pkg/payments/types_test.go`:

```go
package payments_test

import (
    "testing"
    "time"

    "github.com/authlance/licenseoperator/pkg/payments"
)

func TestLicenseVerificationSummaryHasNewFields(t *testing.T) {
    maint := time.Date(2027, 2, 21, 0, 0, 0, 0, time.UTC)
    s := payments.LicenseVerificationSummary{
        LicenseID:            "lic-001",
        LicenseType:          "perpetual_manual",
        MaintenanceExpiresAt: &maint,
    }
    if s.LicenseType != "perpetual_manual" {
        t.Fatalf("expected perpetual_manual, got %q", s.LicenseType)
    }
    if s.MaintenanceExpiresAt == nil || !s.MaintenanceExpiresAt.Equal(maint) {
        t.Fatalf("unexpected MaintenanceExpiresAt: %v", s.MaintenanceExpiresAt)
    }
}
```

### Step 2: Run to verify it fails

```bash
cd licenseoperator
go test ./pkg/payments/... -v -run TestLicenseVerificationSummaryHasNewFields
```

Expected: FAIL — `unknown field LicenseType`

### Step 3: Add new fields to `LicenseVerificationSummary`

In `licenseoperator/pkg/payments/types.go`, add two fields to `LicenseVerificationSummary`:

```go
type LicenseVerificationSummary struct {
    LicenseID            string     `json:"licenseId"`
    Plan                 string     `json:"plan,omitempty"`
    Domain               string     `json:"domain,omitempty"`
    Email                string     `json:"email,omitempty"`
    StripeInvoiceID      string     `json:"stripeInvoiceId,omitempty"`
    StripeCustomerID     string     `json:"stripeCustomerId,omitempty"`
    StripeCheckoutID     string     `json:"stripeCheckoutId,omitempty"`
    Seats                *int       `json:"seats,omitempty"`
    PriceLocked          bool       `json:"priceLocked"`
    CouponCode           string     `json:"couponCode,omitempty"`
    CreatedAt            *time.Time `json:"createdAt,omitempty"`
    ExpiresAt            *time.Time `json:"expiresAt,omitempty"`
    // New fields for perpetual license support
    LicenseType          string     `json:"licenseType,omitempty"`
    MaintenanceExpiresAt *time.Time `json:"maintenanceExpiresAt,omitempty"`
}
```

### Step 4: Populate the new fields in the verify-payment handler

Find where `LicenseVerificationSummary` is constructed in the verify-payment service or controller (search for `LicenseVerificationSummary{` in `licenseoperator/internal/`). Add logic to derive `LicenseType`:

```go
// Derive licenseType from the LicenseRecord fields
licenseType := "subscription"
if rec.LicenseType == "perpetual" {
    if rec.StripeMaintenanceSubID.Valid && rec.StripeMaintenanceSubID.String != "" {
        licenseType = "perpetual_auto"
    } else {
        licenseType = "perpetual_manual"
    }
}

summary := payments.LicenseVerificationSummary{
    // ... existing fields unchanged ...
    LicenseType: licenseType,
}
if rec.MaintenanceExpiresAt.Valid {
    t := rec.MaintenanceExpiresAt.Time.UTC()
    summary.MaintenanceExpiresAt = &t
}
```

### Step 5: Run tests

```bash
cd licenseoperator
go test ./pkg/payments/... -v
go test ./... -count=1
```

Expected: all pass.

### Step 6: Regenerate swagger

```bash
cd licenseoperator
make swagger
```

This updates `internal/http/openapi/docs.go`, `swagger.json`, and `swagger.yaml`.

### Step 7: Commit

```bash
git add licenseoperator/pkg/payments/types.go \
        licenseoperator/pkg/payments/types_test.go \
        licenseoperator/internal/ \
        licenseoperator/internal/http/openapi/
git commit -m "feat(licenseoperator): add licenseType and maintenanceExpiresAt to verify-payment response"
```

---

## Task 5: Regenerate TypeScript client for license-core

**Files:**
- Modify: `loop/packages/license-core/src/common/authlance-licenses/api.ts`

The `api.ts` file is generated from the licenseoperator `swagger.json`. After Task 4 updated the swagger spec, regenerate the client.

### Step 1: Run openapi-generator

From the repo root (adjust path to `swagger.json` as needed):

```bash
npx @openapitools/openapi-generator-cli generate \
  -i licenseoperator/internal/http/openapi/swagger.json \
  -g typescript-axios \
  -o loop/packages/license-core/src/common/authlance-licenses/ \
  --additional-properties=supportsES6=true,withSeparateModelsAndApi=false
```

### Step 2: Verify the new fields appear

Open `loop/packages/license-core/src/common/authlance-licenses/api.ts` and confirm `GithubComAuthlanceLicenseoperatorPkgPaymentsLicenseVerificationSummary` now includes `licenseType` and `maintenanceExpiresAt`.

### Step 3: Build license-core

```bash
cd loop/packages/license-core
yarn build
```

Expected: no TypeScript errors.

### Step 4: Commit

```bash
git add loop/packages/license-core/src/common/authlance-licenses/
git commit -m "chore(license-core): regenerate API client with licenseType and maintenanceExpiresAt"
```

---

## Task 6: Update license portal — maintenance column and action

**Files:**
- Modify: `loop/packages/license-core/src/browser/components/licenses/LicensesGroupContent.tsx`

Read the full file carefully before editing. Key sections:
- Lines 45–65: `LicenseSubscriptionState` interface
- Lines 117–287: `columns` definition (especially `expires` column at ~line 181 and `actions` column at ~line 198)
- Lines 545–594: `loadSubscriptionState` callback

### Step 1: Extend `LicenseSubscriptionState`

Find and replace the interface:

```ts
// Replace:
interface LicenseSubscriptionState {
    status: 'loading' | 'ready' | 'error'
    canManage: boolean
    customerId?: string
    seats?: number
}

// With:
interface LicenseSubscriptionState {
    status: 'loading' | 'ready' | 'error'
    canManage: boolean
    customerId?: string
    seats?: number
    licenseType?: string
    maintenanceExpiresAt?: Date
    canBuyMaintenance: boolean
}
```

### Step 2: Populate new fields in `loadSubscriptionState`

In `loadSubscriptionState` (around line 545), after reading `canManage`, add:

```ts
const licenseType =
    typeof response.data?.license?.licenseType === 'string'
        ? response.data.license.licenseType.trim()
        : 'subscription'

const rawMaintenance = response.data?.license?.maintenanceExpiresAt
const maintenanceExpiresAt =
    typeof rawMaintenance === 'string' ? new Date(rawMaintenance) : undefined

const canBuyMaintenance = licenseType === 'perpetual_manual'

setSubscriptionStates((previous) => ({
    ...previous,
    [licenseId]: {
        status: 'ready',
        canManage,
        customerId: rawCustomerId || undefined,
        seats,
        licenseType,
        maintenanceExpiresAt,
        canBuyMaintenance,
    },
}))
```

Also add `canBuyMaintenance: false` to the error state:

```ts
setSubscriptionStates((previous) => ({
    ...previous,
    [licenseId]: {
        status: 'error',
        canManage: false,
        canBuyMaintenance: false,
        seats: previous[licenseId]?.seats,
    },
}))
```

### Step 3: Update `LicenseTableProps` to pass new handlers

Add two props to `LicenseTableProps` and `LicensesTable`:

```ts
interface LicenseTableProps {
    // ... existing props ...
    onBuyMaintenance?: (licenseId: string) => void
    buyingMaintenanceId?: string
}
```

### Step 4: Update the "Expires" column

Find the `expires` column definition (around line 181). Replace its `cell`:

```tsx
{
    id: 'expires',
    header: 'Expires',
    cell: ({ row }) => {
        const licenseId = row.original.license.licenseId?.trim() || ''
        const state = licenseId ? subscriptionStates?.[licenseId] : undefined
        const isPerpetual = state?.licenseType?.startsWith('perpetual')
        if (isPerpetual) {
            return <Badge variant="outline">Perpetual</Badge>
        }
        return (
            <span className="text-sm text-muted-foreground">
                {formatDateLabel(row.original.license.exp)}
            </span>
        )
    },
},
```

### Step 5: Add "Maintenance" column

Add a new column definition after the `expires` column. Use a `useMemo`-derived boolean `hasPerpetualLicenses` to conditionally include it:

At the top of `LicensesGroupContent` (main component, around line 479), derive:

```ts
const hasPerpetualLicenses = useMemo(() => {
    return Object.values(subscriptionStates).some(
        s => s.licenseType?.startsWith('perpetual')
    )
}, [subscriptionStates])
```

Pass this to `LicensesTable` as a prop, or inline the column definition inside the `columns` useMemo using it directly.

Add the column:

```tsx
...(hasPerpetualLicenses ? [{
    id: 'maintenance',
    header: 'Maintenance',
    cell: ({ row }) => {
        const licenseId = row.original.license.licenseId?.trim() || ''
        const state = licenseId ? subscriptionStates?.[licenseId] : undefined
        if (!state?.licenseType?.startsWith('perpetual')) {
            return <span className="text-sm text-muted-foreground">—</span>
        }
        if (!state.maintenanceExpiresAt) {
            return <span className="text-sm text-muted-foreground">—</span>
        }
        return (
            <span className="text-sm text-muted-foreground">
                {state.maintenanceExpiresAt.toLocaleDateString()}
            </span>
        )
    },
}] : []),
```

### Step 6: Add "Buy maintenance renewal" to actions dropdown

In the actions `cell` (around line 201), after the existing `canManageSubscription` derivation, add:

```ts
const canBuyMaintenance =
    Boolean(licenseId && subscriptionState?.status === 'ready' && subscriptionState.canBuyMaintenance) &&
    Boolean(onBuyMaintenance)
const buyingMaintenance = Boolean(buyingMaintenanceId && buyingMaintenanceId === licenseId)
```

Then inside `<DropdownMenuContent>`, after the "Manage subscription" item:

```tsx
{canBuyMaintenance && (
    <DropdownMenuItem
        disabled={!licenseId || downloading || buyingMaintenance}
        onSelect={(event) => {
            event.preventDefault()
            if (!licenseId || downloading || buyingMaintenance) return
            onBuyMaintenance?.(licenseId)
        }}
    >
        {buyingMaintenance ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting…
            </>
        ) : (
            <>
                <CreditCard className="mr-2 h-4 w-4" />
                Buy maintenance renewal
            </>
        )}
    </DropdownMenuItem>
)}
```

### Step 7: Wire `onBuyMaintenance` in the parent component

In the parent `LicensesGroupContent` component (around line 479), add state and a handler:

```ts
const [buyingMaintenanceId, setBuyingMaintenanceId] = useState<string | undefined>(undefined)
const navigate = useNavigate()

const handleBuyMaintenance = useCallback((licenseId: string) => {
    const group = activeGroup
    if (!group || !licenseId) return
    navigate(`/subscription/buy-maintenance?group=${encodeURIComponent(group)}&license=${encodeURIComponent(licenseId)}`)
}, [activeGroup, navigate])
```

Pass to `<LicensesTable>`:

```tsx
<LicensesTable
    // ... existing props ...
    onBuyMaintenance={handleBuyMaintenance}
    buyingMaintenanceId={buyingMaintenanceId}
/>
```

### Step 8: Verify compilation

```bash
cd loop/packages/license-core
yarn build
```

Expected: no TypeScript errors.

### Step 9: Commit

```bash
git add loop/packages/license-core/src/browser/components/licenses/LicensesGroupContent.tsx
git commit -m "feat(license-core): show maintenance expiry in portal and add buy-maintenance action"
```

---

## Task 7: Create `BuyMaintenance` page

**Files:**
- Create: `loop/packages/payments/src/browser/pages/BuyMaintenance/index.tsx`
- Modify: `loop/packages/payments/src/browser/front-end-payments-module.ts`

### Step 1: Create the page

Create `loop/packages/payments/src/browser/pages/BuyMaintenance/index.tsx`. Model it directly on `ManagePayment/index.tsx`. The key differences: reads `license` param in addition to `group`, calls a new API method instead of the subscription portal.

```tsx
import React, { useContext, useEffect, useState } from 'react'
import { injectable } from 'inversify'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getOrCreateQueryClient } from '@authlance/core/lib/browser/query-client'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import Page, { PageContent } from '@authlance/core/lib/browser/components/layout/Page'
import { Toaster } from '@authlance/ui/lib/browser/components/toaster'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import { useLicensesSdk } from '@authlance/license-core/lib/browser/common/licenses-sdk'

function BuyMaintenanceContent() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const groupName = searchParams.get('group')
    const licenseId = searchParams.get('license')
    const { paymentsApi } = useLicensesSdk()
    const toast = useToast()
    const [isRedirecting, setIsRedirecting] = useState(false)

    useEffect(() => {
        if (!groupName || !licenseId) {
            toast.toast({
                title: 'Error',
                description: 'Group and license are required.',
                variant: 'destructive',
                duration: 5000,
            })
            navigate('/')
            return
        }

        if (isRedirecting || !paymentsApi) return

        const redirect = async () => {
            setIsRedirecting(true)
            try {
                const response = await paymentsApi.authlanceLicensePaymentsApiV1MaintenanceCheckoutPost({
                    licenseId,
                    groupName,
                })
                if (response.status !== 200 || !response.data?.url) {
                    toast.toast({
                        title: 'Error',
                        description: 'Could not create maintenance checkout session.',
                        variant: 'destructive',
                        duration: 5000,
                    })
                    navigate('/licenses/group')
                    return
                }
                window.location.href = response.data.url
            } catch (error) {
                console.error('Error creating maintenance checkout:', error)
                toast.toast({
                    title: 'Error',
                    description: 'An error occurred while creating the checkout session.',
                    variant: 'destructive',
                    duration: 5000,
                })
                navigate('/licenses/group')
            }
        }

        redirect()
    }, [groupName, licenseId, paymentsApi, navigate, toast, isRedirecting])

    return <DefaultDashboardContent loading={true} />
}

interface BuyMaintenancePageProps {
    queryClient?: QueryClient
}

function BuyMaintenancePage({ queryClient }: BuyMaintenancePageProps) {
    const resolvedQueryClient = queryClient ?? getOrCreateQueryClient()
    return (
        <QueryClientProvider client={resolvedQueryClient}>
            <Page>
                <PageContent>
                    <BuyMaintenanceContent />
                </PageContent>
            </Page>
            <Toaster />
        </QueryClientProvider>
    )
}

@injectable()
export class BuyMaintenancePageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/subscription/buy-maintenance',
            component: BuyMaintenancePage,
            name: 'Buy Maintenance',
            navBar: false,
            exact: true,
            root: true,
            authRequired: true,
        }
    }
}
```

> **Note:** `authlanceLicensePaymentsApiV1MaintenanceCheckoutPost` will be generated in the TypeScript client after Task 8 adds the backend endpoint and Task 5's client regeneration is repeated. For now use a placeholder or a direct `axios` call; the final regeneration in Task 9 fixes this.

### Step 2: Register the route

Open `loop/packages/payments/src/browser/front-end-payments-module.ts`. Follow the existing pattern for `ManagePaymentPageContribution`:

```ts
import { BuyMaintenancePageContribution } from './pages/BuyMaintenance'

// In the ContainerModule bind block:
bind(BuyMaintenancePageContribution).toSelf()
// ...
bind(RoutesApplicationContribution).toService(BuyMaintenancePageContribution)
```

### Step 3: Verify compilation

```bash
cd loop/packages/payments
yarn build
```

Expected: no TypeScript errors (the API method may show an error until the client is regenerated in Task 9 — acceptable at this stage).

### Step 4: Commit

```bash
git add loop/packages/payments/src/browser/pages/BuyMaintenance/index.tsx \
        loop/packages/payments/src/browser/front-end-payments-module.ts
git commit -m "feat(payments): add BuyMaintenance page for perpetual manual maintenance renewal"
```

---

## Task 8: Add `maintenance-checkout` backend endpoint

**Files:**
- Modify: `licenseoperator/pkg/payments/types.go`
- Modify: `licenseoperator/internal/http/controller/payments_controller.go`
- Modify: service layer (wherever `CreateCheckoutSession` lives — find it via `pc.service.CreateCheckoutSession`)
- Test: add to the relevant `_test.go` files

### Step 1: Add request/response types

In `licenseoperator/pkg/payments/types.go`, add:

```go
// CreateMaintenanceCheckoutRequest is the body for POST /maintenance-checkout.
type CreateMaintenanceCheckoutRequest struct {
    LicenseID string `json:"licenseId"`
    GroupName string `json:"groupName"`
}

// MaintenanceCheckoutResponse contains the Stripe Checkout redirect URL.
type MaintenanceCheckoutResponse struct {
    URL string `json:"url"`
}
```

### Step 2: Write a failing service test

Find the service layer test file for `CreateCheckoutSession`. Add:

```go
func TestCreateMaintenanceCheckoutSession_NotPerpetualManual(t *testing.T) {
    // A subscription license should be rejected
    ctx := context.Background()
    // set up a fake license record with LicenseType = "subscription"
    // call service.CreateMaintenanceCheckoutSession(ctx, req, identityID)
    // expect error wrapping ErrNotPerpetualManual (sentinel you'll define)
    _, err := svc.CreateMaintenanceCheckoutSession(ctx, payments.CreateMaintenanceCheckoutRequest{
        LicenseID: "sub-lic-1",
        GroupName: "acme",
    }, "user-identity-id")
    if !errors.Is(err, paymentservice.ErrNotPerpetualManual) {
        t.Fatalf("expected ErrNotPerpetualManual, got %v", err)
    }
}
```

### Step 3: Run to verify failure

```bash
cd licenseoperator
go test ./internal/service/payments/... -v -run TestCreateMaintenanceCheckout
```

Expected: FAIL — `ErrNotPerpetualManual undefined`, `CreateMaintenanceCheckoutSession undefined`.

### Step 4: Add sentinel error and service method

In the payments service package (follow the file that defines `ErrNonSubscriptionQuotaExceeded`):

```go
var ErrNotPerpetualManual = errors.New("license is not a perpetual manual license")
```

Implement `CreateMaintenanceCheckoutSession` in the service:

```go
func (s *service) CreateMaintenanceCheckoutSession(
    ctx context.Context,
    req payments.CreateMaintenanceCheckoutRequest,
    identityID string,
) (*payments.MaintenanceCheckoutResponse, error) {

    // 1. Look up the license by ID and group
    rec, err := s.licenseRepo.FindByLicenseIDAndGroup(ctx, req.LicenseID, req.GroupName)
    if err != nil {
        return nil, fmt.Errorf("find license: %w", err)
    }
    if rec == nil {
        return nil, ErrNotPerpetualManual
    }

    // 2. Validate it is a perpetual_manual license
    if rec.LicenseType != "perpetual" || (rec.StripeMaintenanceSubID.Valid && rec.StripeMaintenanceSubID.String != "") {
        return nil, ErrNotPerpetualManual
    }

    // 3. Create a Stripe one-time Checkout session for the maintenance price
    maintenanceLookupKey := s.cfg.MaintenancePriceLookupKey // add this to config
    sess, err := s.stripe.CreateCheckoutSession(&stripe.CheckoutSessionParams{
        Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
        LineItems: []*stripe.CheckoutSessionLineItemParams{
            {
                Price:    stripe.String(maintenanceLookupKey),
                Quantity: stripe.Int64(1),
            },
        },
        Metadata: map[string]string{
            "license_type":        "maintenance_renewal",
            "original_license_id": req.LicenseID,
            "group":               req.GroupName,
        },
        SuccessURL: stripe.String(s.cfg.BaseURL + "/licenses/group?maintenance=renewed"),
        CancelURL:  stripe.String(s.cfg.BaseURL + "/licenses/group"),
    })
    if err != nil {
        return nil, fmt.Errorf("create stripe checkout: %w", err)
    }

    return &payments.MaintenanceCheckoutResponse{URL: sess.URL}, nil
}
```

> **Note:** `FindByLicenseIDAndGroup` may need to be added to the `LicensesRepository` interface if it doesn't exist. Check first — if only `FindByLicenseID` exists, use that and validate `GroupName` matches the record.

### Step 5: Add the controller handler

In `licenseoperator/internal/http/controller/payments_controller.go`, add after the existing `handleCreateCheckoutSession`:

```go
// handleCreateMaintenanceCheckout creates a one-time Stripe checkout for perpetual maintenance renewal.
// @Summary      Create maintenance checkout session
// @Description  Creates a one-time Stripe checkout for renewing maintenance on a perpetual license.
// @Tags         payments
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      payments.CreateMaintenanceCheckoutRequest true  "Maintenance checkout request"
// @Success      200      {object}  payments.MaintenanceCheckoutResponse
// @Failure      400      {string}  string  "invalid request"
// @Failure      401      {string}  string  "unauthorized"
// @Failure      403      {string}  string  "license is not a perpetual manual license"
// @Failure      500      {string}  string  "failed to create maintenance checkout"
// @Router       /authlance/license/payments/api/v1/maintenance-checkout [post]
func (pc *PaymentsController) handleCreateMaintenanceCheckout(w http.ResponseWriter, r *http.Request) {
    var req payments.CreateMaintenanceCheckoutRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid request", http.StatusBadRequest)
        return
    }

    claims, ok := middleware.ClaimsFromContext(r.Context())
    if !ok || strings.TrimSpace(claims.User.IdentityID) == "" {
        http.Error(w, "unauthorized", http.StatusUnauthorized)
        return
    }

    resp, err := pc.service.CreateMaintenanceCheckoutSession(r.Context(), req, claims.User.IdentityID)
    if err != nil {
        if errors.Is(err, paymentservice.ErrNotPerpetualManual) {
            http.Error(w, "license is not a perpetual manual license", http.StatusForbidden)
            return
        }
        pc.logErr().Err(err).Msg("create maintenance checkout failed")
        http.Error(w, "failed to create maintenance checkout", http.StatusInternalServerError)
        return
    }

    writeJSON(w, http.StatusOK, resp)
}
```

Register the route in the router setup inside `PaymentsController.RegisterRoutes` (or wherever the other routes are registered):

```go
protected.Handle("/maintenance-checkout",
    pc.wrapAuth(http.HandlerFunc(pc.handleCreateMaintenanceCheckout))).Methods(http.MethodPost)
```

### Step 6: Run all tests

```bash
cd licenseoperator
go test ./... -count=1
```

Expected: all pass.

### Step 7: Regenerate swagger

```bash
cd licenseoperator
make swagger
```

### Step 8: Commit

```bash
git add licenseoperator/pkg/payments/types.go \
        licenseoperator/internal/http/controller/payments_controller.go \
        licenseoperator/internal/service/payments/ \
        licenseoperator/internal/http/openapi/
git commit -m "feat(licenseoperator): add maintenance-checkout endpoint for perpetual manual licenses"
```

---

## Task 9: Add `maintenance_renewal` webhook branch

**Files:**
- Modify: `licenseoperator/internal/service/stripe/webhook.go`
- Modify: `licenseoperator/internal/service/stripe/webhook_test.go`

### Step 1: Write a failing test

Open `licenseoperator/internal/service/stripe/webhook_test.go`. Read the existing `TestHandleCheckoutCompletedPerpetual` test pattern to understand the fixture helpers. Add:

```go
func TestHandleCheckoutCompletedMaintenanceRenewal(t *testing.T) {
    // A checkout with license_type=maintenance_renewal should extend the
    // existing perpetual license's maintenance window, not issue a new one.
    now := time.Date(2027, 3, 1, 0, 0, 0, 0, time.UTC)
    existingExpiry := time.Date(2027, 2, 21, 0, 0, 0, 0, time.UTC)
    licenseID := "lic-perp-manual-1"

    existingRecord := &repo.LicenseRecord{
        LicenseID:    licenseID,
        LicenseType:  "perpetual",
        MaintenanceExpiresAt: sql.NullTime{Time: existingExpiry, Valid: true},
        GroupName:    "acme",
        Plan:         "core",
        // PayloadB64 / SignatureB64 must be valid signed content for resignWithNewMaintenance
        // Use the test signer helpers already present in this file.
    }
    captureRepo := &capturePerpetualRepo{record: existingRecord}
    stub := &stubLicenseService{}
    mgr := buildTestWebhookManagerWithRepo(t, stub, captureRepo, now)

    event := buildFakeCheckoutEventWithMetadata(t, map[string]string{
        "license_type":        "maintenance_renewal",
        "original_license_id": licenseID,
        "group":               "acme",
    })

    err := mgr.ProcessQueuedEvent(context.Background(), event)
    if err != nil {
        t.Fatalf("ProcessQueuedEvent: %v", err)
    }

    // Issue should NOT have been called (no new license)
    if stub.lastIssue != nil {
        t.Fatal("expected Issue NOT to be called for maintenance_renewal")
    }

    // Maintenance expiry should have been extended by 1 year
    want := existingExpiry.AddDate(1, 0, 0)
    if !captureRepo.updatedExpiry.Equal(want) {
        t.Fatalf("expected new expiry %v, got %v", want, captureRepo.updatedExpiry)
    }
}
```

### Step 2: Run to verify failure

```bash
cd licenseoperator
go test ./internal/service/stripe/... -v -run TestHandleCheckoutCompletedMaintenanceRenewal
```

Expected: FAIL.

### Step 3: Implement `handleMaintenanceRenewalCheckout`

In `licenseoperator/internal/service/stripe/webhook.go`, add before `handleCheckoutCompleted`:

```go
// handleMaintenanceRenewalCheckout handles a one-off maintenance renewal checkout.
// It extends maintenance_expires_at by 1 year for an existing perpetual license.
func (m *WebhookManager) handleMaintenanceRenewalCheckout(ctx context.Context, sess *stripe.CheckoutSession) error {
    originalLicenseID := strings.TrimSpace(sess.Metadata["original_license_id"])
    if originalLicenseID == "" {
        return fmt.Errorf("maintenance_renewal checkout missing original_license_id metadata")
    }

    existing, err := m.licenseRepo.FindByLicenseID(ctx, originalLicenseID)
    if err != nil {
        return fmt.Errorf("find perpetual license for renewal: %w", err)
    }
    if existing == nil || existing.LicenseType != "perpetual" {
        return fmt.Errorf("perpetual license %q not found for maintenance renewal", originalLicenseID)
    }

    // Determine new expiry (extend from current, or from now if already lapsed)
    currentExpiry := existing.MaintenanceExpiresAt.Time
    newExpiry := currentExpiry.AddDate(1, 0, 0)
    if m.now().After(currentExpiry) {
        newExpiry = m.now().UTC().AddDate(1, 0, 0)
    }

    // Re-sign the artifact with new maintenance_expires_at
    newPayloadB64, newSigB64, _, err := m.resignWithNewMaintenance(existing, newExpiry)
    if err != nil {
        return fmt.Errorf("re-sign maintenance renewal: %w", err)
    }

    if err := m.licenseRepo.UpdateMaintenanceExpiry(ctx, existing.LicenseID, newExpiry, newPayloadB64, newSigB64); err != nil {
        return fmt.Errorf("update maintenance expiry: %w", err)
    }

    if m.logger != nil {
        m.logger.Info().
            Str("license_id", existing.LicenseID).
            Time("new_maintenance_expires_at", newExpiry).
            Msg("perpetual license maintenance renewed via one-off checkout")
    }

    m.publishMaintenanceRenewed(ctx, existing, newExpiry)
    return nil
}
```

### Step 4: Add detection at top of `handleCheckoutCompleted`

In `handleCheckoutCompleted`, before the existing perpetual branch (around line 308), add:

```go
// Maintenance renewal (one-off purchase for perpetual-manual licenses)
if strings.EqualFold(strings.TrimSpace(sess.Metadata["license_type"]), "maintenance_renewal") {
    return m.handleMaintenanceRenewalCheckout(ctx, sess)
}
```

### Step 5: Run all tests

```bash
cd licenseoperator
go test ./... -count=1
```

Expected: all pass including the new test.

### Step 6: Regenerate swagger (if handler annotations changed)

```bash
cd licenseoperator
make swagger
```

### Step 7: Commit

```bash
git add licenseoperator/internal/service/stripe/webhook.go \
        licenseoperator/internal/service/stripe/webhook_test.go \
        licenseoperator/internal/http/openapi/
git commit -m "feat(licenseoperator): handle maintenance_renewal checkout for perpetual manual licenses"
```

---

## Task 10: Final TypeScript client regeneration

After Tasks 8 and 9 added the `maintenance-checkout` endpoint to the swagger, regenerate the TypeScript client so `BuyMaintenance` page has a typed API call.

### Step 1: Regenerate

```bash
npx @openapitools/openapi-generator-cli generate \
  -i licenseoperator/internal/http/openapi/swagger.json \
  -g typescript-axios \
  -o loop/packages/license-core/src/common/authlance-licenses/ \
  --additional-properties=supportsES6=true,withSeparateModelsAndApi=false
```

### Step 2: Update `BuyMaintenance` page to use generated method

Replace any placeholder call with:

```ts
await paymentsApi.authlanceLicensePaymentsApiV1MaintenanceCheckoutPost({
    licenseId,
    groupName,
})
```

### Step 3: Build all affected packages in order

```bash
cd loop/packages/common && yarn build
cd loop/packages/license-core && yarn build
cd loop/packages/payments && yarn build
cd loop/packages/identity && yarn build
cd saas && yarn build
```

Expected: all succeed with no TypeScript errors.

### Step 4: Commit

```bash
git add loop/packages/license-core/src/common/authlance-licenses/ \
        loop/packages/payments/src/browser/pages/BuyMaintenance/index.tsx
git commit -m "chore: regenerate API client with maintenance-checkout endpoint; wire typed call in BuyMaintenance"
```

---

## Final Verification

```bash
# Backend
cd licenseoperator && go build ./... && go test ./... -count=1

# Frontend packages (in order)
cd loop/packages/common && yarn build
cd loop/packages/license-core && yarn build
cd loop/packages/payments && yarn build
cd loop/packages/identity && yarn build
cd saas && yarn build
```

All should build and all Go tests should pass.
