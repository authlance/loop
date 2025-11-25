import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@authlance/ui/lib/browser/components/select'
import { Input } from '@authlance/ui/lib/browser/components/input'
import { Textarea } from '@authlance/ui/lib/browser/components/textarea'
import { Label } from '@authlance/ui/lib/browser/components/label'
import { Switch } from '@authlance/ui/lib/browser/components/switch'
import { Button } from '@authlance/ui/lib/browser/components/button'
import {
    type LicenseAdminProduct,
    type LicenseAdminProductRequest,
    type LicensePricingMode,
    type LicensePricingTier,
    type LicensePricingTierRequest,
    useLicensesSdk,
} from '../../common/licenses-sdk'
import { useAdminProductKeys } from '../../hooks/use-licenses'
import {
    parseJsonRecord,
    parseNonNegativeIntegerField,
    parseOptionalPositiveFloatField,
    parseOptionalPositiveIntegerField,
    parseOptionalUnitAmount,
    parsePositiveIntegerField,
    parseUnitAmount,
} from './form-utils'

type ProductDialogMode = 'create' | 'edit'
type ProductTypeValue = 'subscription' | 'one_off'
type ProductPricingModeValue = LicensePricingMode

interface PricingTierFormState {
    id: string
    upperBound: string
    amount: string
    factor: string
    perUnit: boolean
}

interface BundledProductFormState {
    id: string
    productKey: string
    quantity: string
    managedProducts: string
}

interface ProductFormState {
    slug: string
    name: string
    description: string
    type: ProductTypeValue
    plan: string
    productKey: string
    pricingMode: ProductPricingModeValue
    active: boolean
    internal: boolean
    configManaged: boolean
    stripeProductId: string
    stripePriceId: string
    lookupKey: string
    currency: string
    unitAmount: string
    baseAmount: string
    billingInterval: string
    billingIntervalCount: string
    trialPeriodDays: string
    termDurationDays: string
    maxLicenseTotal: string
    maxManagedProducts: string
    metadataInput: string
    pricingTiers: PricingTierFormState[]
    bundledProducts: BundledProductFormState[]
}

const PRODUCT_TYPE_OPTIONS: { value: ProductTypeValue; label: string }[] = [
    { value: 'subscription', label: 'Subscription (recurring)' },
    { value: 'one_off', label: 'One-off (lifetime)' },
]

const PRICING_MODE_OPTIONS: { value: ProductPricingModeValue; label: string }[] = [
    { value: 'fixed', label: 'Fixed price' },
    { value: 'tiered', label: 'Tiered (managed products)' },
]

const createTierId = () => `tier-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`

const createEmptyTierState = (): PricingTierFormState => ({
    id: createTierId(),
    upperBound: '',
    amount: '',
    factor: '',
    perUnit: false,
})

const toTierFormState = (tier: LicensePricingTier): PricingTierFormState => ({
    id: createTierId(),
    upperBound: tier.upperBound != null ? String(tier.upperBound) : '',
    amount: tier.amount != null ? String(tier.amount) : '',
    factor: tier.factor != null ? String(tier.factor) : '',
    perUnit: Boolean(tier.perUnit),
})

const mapPricingTiersToState = (tiers: LicensePricingTier[] | undefined | null): PricingTierFormState[] => {
    if (!Array.isArray(tiers) || tiers.length === 0) {
        return []
    }
    return tiers.map(toTierFormState)
}

const createBundleId = () => `bundle-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`

const createEmptyBundleState = (): BundledProductFormState => ({
    id: createBundleId(),
    productKey: '',
    quantity: '1',
    managedProducts: '',
})

const mapBundledProductsToState = (
    bundles: LicenseAdminProduct['bundledProducts']
): BundledProductFormState[] => {
    if (!Array.isArray(bundles) || bundles.length === 0) {
        return []
    }
    return bundles.map((bundle) => ({
        id: createBundleId(),
        productKey: bundle?.productKey ?? '',
        quantity: bundle?.quantity != null ? String(bundle.quantity) : '1',
        managedProducts: bundle?.managedProducts != null ? String(bundle.managedProducts) : '',
    }))
}

const toProductFormState = (product?: LicenseAdminProduct): ProductFormState => {
    const normalizedProductKey = typeof product?.productKey === 'string' ? product.productKey.trim().toLowerCase() : ''
    const pricingMode: ProductPricingModeValue =
        (product?.pricingMode ?? '').trim().toLowerCase() === 'tiered' ? 'tiered' : 'fixed'
    return {
        slug: product?.slug ?? '',
        name: product?.name ?? '',
        description: product?.description ?? '',
        type: (product?.type as ProductTypeValue) ?? 'subscription',
        plan: product?.plan ?? '',
        productKey: normalizedProductKey,
        pricingMode,
        active: product?.active ?? true,
        internal: product?.internal ?? false,
        configManaged: product?.configManaged ?? false,
        stripeProductId: product?.stripeProductId ?? '',
        stripePriceId: product?.stripePriceId ?? '',
        lookupKey: product?.lookupKey ?? '',
        currency: product?.currency ?? 'usd',
        unitAmount: product?.unitAmount != null ? String(product.unitAmount) : '',
        baseAmount: product?.baseAmount != null ? String(product.baseAmount) : '',
        billingInterval: product?.billingInterval ?? 'month',
        billingIntervalCount: product?.billingIntervalCount != null ? String(product.billingIntervalCount) : '1',
        trialPeriodDays: product?.trialPeriodDays != null ? String(product.trialPeriodDays) : '0',
        termDurationDays: product?.termDurationDays != null ? String(product.termDurationDays) : '',
        maxLicenseTotal: product?.maxLicenseTotal != null ? String(product.maxLicenseTotal) : '',
        maxManagedProducts: product?.maxManagedProducts != null ? String(product.maxManagedProducts) : '',
        metadataInput:
            product?.metadata && Object.keys(product.metadata).length > 0
                ? JSON.stringify(product.metadata, null, 2)
                : '',
        pricingTiers: mapPricingTiersToState(product?.pricingTiers),
        bundledProducts: mapBundledProductsToState(product?.bundledProducts),
    }
}

const buildPricingTiersPayload = (tiers: PricingTierFormState[]): LicensePricingTierRequest[] => {
    if (!Array.isArray(tiers) || tiers.length === 0) {
        return []
    }
    return tiers.map((tier, index) => {
        const upperBound = parseOptionalPositiveIntegerField(tier.upperBound, `Tier ${index + 1} upper bound`)
        const amount = parseOptionalUnitAmount(tier.amount, `Tier ${index + 1} amount`)
        const factor = parseOptionalPositiveFloatField(tier.factor, `Tier ${index + 1} multiplier`)
        if (upperBound === undefined && amount === undefined && factor === undefined && !tier.perUnit) {
            throw new Error(`Configure an amount or multiplier for tier ${index + 1}.`)
        }
        const payload: LicensePricingTierRequest = {}
        if (upperBound !== undefined) {
            payload.upperBound = upperBound
        }
        if (amount !== undefined) {
            payload.amount = amount
        }
        if (factor !== undefined) {
            payload.factor = factor
        }
        if (tier.perUnit) {
            payload.perUnit = true
        }
        return payload
    })
}

const buildProductRequestPayload = (state: ProductFormState): LicenseAdminProductRequest => {
    const slug = state.slug.trim()
    if (!slug) {
        throw new Error('Slug is required.')
    }
    const name = state.name.trim()
    if (!name) {
        throw new Error('Name is required.')
    }
    const plan = state.plan.trim().toLowerCase()
    if (!plan) {
        throw new Error('Plan is required.')
    }
    const productKey = state.productKey.trim().toLowerCase()
    if (!productKey) {
        throw new Error('Product key is required.')
    }
    const pricingMode = state.pricingMode
    if (pricingMode !== 'fixed' && pricingMode !== 'tiered') {
        throw new Error('Pricing mode is required.')
    }
    const currency = state.currency.trim()
    if (!currency) {
        throw new Error('Currency is required.')
    }
    const billingInterval = state.billingInterval.trim()
    if (!billingInterval) {
        throw new Error('Billing interval is required.')
    }
    const stripeProductId = state.stripeProductId.trim()
    if (!stripeProductId) {
        throw new Error('Stripe product ID is required.')
    }
    const stripePriceId = state.stripePriceId.trim()
    if (!stripePriceId) {
        throw new Error('Stripe price ID is required.')
    }
    const metadata = parseJsonRecord(state.metadataInput, 'Metadata')
    const unitAmount = parseUnitAmount(state.unitAmount)
    const baseAmount = parseOptionalUnitAmount(state.baseAmount, 'Base amount') ?? unitAmount
    const billingIntervalCount = parsePositiveIntegerField(state.billingIntervalCount, 'Billing interval count', 1)
    const trialPeriodDays = parseNonNegativeIntegerField(state.trialPeriodDays, 'Trial period days', 0)
    const termDurationDays = parseOptionalPositiveIntegerField(state.termDurationDays, 'Term duration days')
    const maxLicenseTotal = parseOptionalPositiveIntegerField(state.maxLicenseTotal, 'Max license total')
    const maxManagedProducts = parseOptionalPositiveIntegerField(
        state.maxManagedProducts,
        'Max managed products'
    )

    let pricingTiers: LicensePricingTierRequest[] | undefined
    if (pricingMode === 'tiered') {
        const tiers = buildPricingTiersPayload(state.pricingTiers)
        if (tiers.length === 0) {
            throw new Error('Add at least one pricing tier for tiered pricing.')
        }
        pricingTiers = tiers
    }

    const lookupKey = state.lookupKey.trim() === '' ? undefined : state.lookupKey.trim()

    let bundledProducts: LicenseAdminProductRequest['bundledProducts']
    if (Array.isArray(state.bundledProducts) && state.bundledProducts.length > 0) {
        const seen = new Set<string>()
        bundledProducts = state.bundledProducts.map((bundle, index) => {
            const key = bundle.productKey.trim().toLowerCase()
            if (!key) {
                throw new Error(`Bundled product ${index + 1} requires a product key.`)
            }
            if (key === productKey) {
                throw new Error('A product cannot bundle itself.')
            }
            if (seen.has(key)) {
                throw new Error(`Bundled product ${key} is listed more than once.`)
            }
            seen.add(key)
            const quantity = parsePositiveIntegerField(
                bundle.quantity && bundle.quantity.trim() !== '' ? bundle.quantity : '1',
                `Bundled product ${index + 1} quantity`,
                1
            )
            const managedProducts = parseOptionalPositiveIntegerField(
                bundle.managedProducts,
                `Bundled product ${index + 1} managed products`
            )
            return {
                productKey: key,
                quantity,
                managedProducts,
            }
        })
    }

    return {
        slug,
        name,
        description: state.description.trim() === '' ? undefined : state.description.trim(),
        type: state.type,
        plan,
        productKey,
        pricingMode,
        active: state.active,
        internal: state.internal,
        configManaged: state.configManaged,
        stripeProductId,
        stripePriceId,
        lookupKey,
        currency: currency.toLowerCase(),
        unitAmount,
        baseAmount,
        billingInterval,
        billingIntervalCount,
        trialPeriodDays,
        termDurationDays,
        maxLicenseTotal,
        maxManagedProducts,
        metadata,
        pricingTiers,
        bundledProducts,
    }
}

interface PricingTierEditorProps {
    tiers: PricingTierFormState[]
    disabled: boolean
    onTierChange: (id: string, updates: Partial<PricingTierFormState>) => void
    onTierRemove: (id: string) => void
    onTierAdd: () => void
}

const PricingTierEditor: React.FC<PricingTierEditorProps> = ({ tiers, disabled, onTierChange, onTierRemove, onTierAdd }) => {
    return (
        <div className="space-y-4">
            {tiers.map((tier, index) => {
                const upperId = `pricing-tier-${tier.id}-upper`
                const amountId = `pricing-tier-${tier.id}-amount`
                const factorId = `pricing-tier-${tier.id}-factor`
                const perUnitId = `pricing-tier-${tier.id}-per-unit`
                return (
                    <div key={tier.id} className="space-y-3 rounded-md border border-border p-3">
                        <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Tier {index + 1}</h4>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onTierRemove(tier.id)}
                                disabled={disabled}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove tier
                            </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor={upperId}>Upper bound</Label>
                                <Input
                                    id={upperId}
                                    inputMode="numeric"
                                    value={tier.upperBound}
                                    onChange={(event) =>
                                        onTierChange(tier.id, { upperBound: event.target.value.replace(/[^0-9]/g, '') })
                                    }
                                    placeholder="e.g. 25"
                                    disabled={disabled}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Inclusive managed product count. Leave empty for the final tier.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={amountId}>Amount (minor units)</Label>
                                <Input
                                    id={amountId}
                                    value={tier.amount}
                                    onChange={(event) =>
                                        onTierChange(tier.id, { amount: event.target.value.replace(/[^0-9.]/g, '') })
                                    }
                                    placeholder="e.g. 49900"
                                    disabled={disabled}
                                />
                                <p className="text-xs text-muted-foreground">Optional explicit price in cents.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={factorId}>Multiplier</Label>
                                <Input
                                    id={factorId}
                                    value={tier.factor}
                                    onChange={(event) =>
                                        onTierChange(tier.id, { factor: event.target.value.replace(/[^0-9.]/g, '') })
                                    }
                                    placeholder="e.g. 1.5"
                                    disabled={disabled}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Multiplies the base amount when no explicit price is set.
                                </p>
                            </div>
                            <div className="flex items-center justify-between rounded-md border border-input bg-muted/20 px-3 py-2">
                                <div>
                                    <Label htmlFor={perUnitId} className="text-sm font-medium">
                                        Per-unit pricing
                                    </Label>
                                    <p className="text-xs text-muted-foreground">Apply amount per managed product.</p>
                                </div>
                                <Switch
                                    id={perUnitId}
                                    checked={tier.perUnit}
                                    onCheckedChange={(checked) => onTierChange(tier.id, { perUnit: Boolean(checked) })}
                                    disabled={disabled}
                                />
                            </div>
                        </div>
                    </div>
                )
            })}
            <Button type="button" variant="outline" onClick={onTierAdd} disabled={disabled}>
                <Plus className="mr-2 h-4 w-4" />
                Add pricing tier
            </Button>
        </div>
    )
}

interface BundledProductEditorProps {
    bundles: BundledProductFormState[]
    disabled: boolean
    onBundleChange: (id: string, updates: Partial<BundledProductFormState>) => void
    onBundleRemove: (id: string) => void
    onBundleAdd: () => void
}

const BundledProductEditor: React.FC<BundledProductEditorProps> = ({
    bundles,
    disabled,
    onBundleAdd,
    onBundleChange,
    onBundleRemove,
}) => {
    return (
        <div className="space-y-3">
            {bundles.length === 0 && (
                <p className="text-xs text-muted-foreground">No bundled products configured yet.</p>
            )}
            {bundles.map((bundle, index) => {
                const productKeyId = `bundle-${bundle.id}-product-key`
                const quantityId = `bundle-${bundle.id}-quantity`
                const managedId = `bundle-${bundle.id}-managed`
                return (
                    <div key={bundle.id} className="space-y-4 rounded-md border border-border p-3">
                        <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Bundled product {index + 1}
                            </h4>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => onBundleRemove(bundle.id)}
                                disabled={disabled}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                            </Button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor={productKeyId}>Product key</Label>
                                <Input
                                    id={productKeyId}
                                    value={bundle.productKey}
                                    onChange={(event) =>
                                        onBundleChange(bundle.id, { productKey: event.target.value.toLowerCase() })
                                    }
                                    placeholder="core_subscription"
                                    disabled={disabled}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Must match the product key of an existing product.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={quantityId}>Quantity</Label>
                                <Input
                                    id={quantityId}
                                    type="number"
                                    min={1}
                                    value={bundle.quantity || '1'}
                                    onChange={(event) =>
                                        onBundleChange(bundle.id, { quantity: event.target.value.replace(/[^0-9]/g, '') })
                                    }
                                    disabled={disabled}
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-3">
                                <Label htmlFor={managedId}>Managed products (optional)</Label>
                                <Input
                                    id={managedId}
                                    type="number"
                                    min={1}
                                    value={bundle.managedProducts}
                                    onChange={(event) =>
                                        onBundleChange(bundle.id, {
                                            managedProducts: event.target.value.replace(/[^0-9]/g, ''),
                                        })
                                    }
                                    placeholder="Only for tiered components"
                                    disabled={disabled}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Required when bundling tiered products to define managed-product allocation.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            })}
            <Button type="button" variant="outline" onClick={onBundleAdd} disabled={disabled}>
                <Plus className="mr-2 h-4 w-4" />
                Add bundled product
            </Button>
        </div>
    )
}

interface ProductFormProps {
    mode: ProductDialogMode
    product?: LicenseAdminProduct
    pending: boolean
    onSubmit: (payload: LicenseAdminProductRequest) => Promise<unknown>
    onCancel: () => void
}

export const ProductForm: React.FC<ProductFormProps> = ({ mode, product, pending, onSubmit, onCancel }) => {
    const { adminApi } = useLicensesSdk()
    const { data: productKeys, isLoading: productKeysLoading, error: productKeysError } = useAdminProductKeys(adminApi)

    const [form, setForm] = useState<ProductFormState>(() => toProductFormState(product))
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

    useEffect(() => {
        setForm(toProductFormState(product))
        setErrorMessage(undefined)
    }, [product, mode])

    useEffect(() => {
        setForm((prev) => {
            if (prev.pricingMode !== 'tiered' || prev.pricingTiers.length > 0) {
                return prev
            }
            return { ...prev, pricingTiers: [createEmptyTierState()] }
        })
    }, [form.pricingMode, form.pricingTiers.length])

    const productKeyOptions = useMemo(() => {
        const options = new Set<string>()
        if (Array.isArray(productKeys)) {
            for (const entry of productKeys) {
                if (entry?.productKey) {
                    options.add(entry.productKey)
                }
            }
        }
        if (form.productKey.trim() !== '') {
            options.add(form.productKey.trim())
        }
        return Array.from(options).sort()
    }, [productKeys, form.productKey])

    const handleTierChange = useCallback((id: string, updates: Partial<PricingTierFormState>) => {
        setForm((prev) => ({
            ...prev,
            pricingTiers: prev.pricingTiers.map((tier) => (tier.id === id ? { ...tier, ...updates } : tier)),
        }))
    }, [])

    const handleTierRemove = useCallback((id: string) => {
        setForm((prev) => ({
            ...prev,
            pricingTiers: prev.pricingTiers.filter((tier) => tier.id !== id),
        }))
    }, [])

    const handleTierAdd = useCallback(() => {
        setForm((prev) => ({
            ...prev,
            pricingTiers: [...prev.pricingTiers, createEmptyTierState()],
        }))
    }, [])

    const handleBundleChange = useCallback((id: string, updates: Partial<BundledProductFormState>) => {
        setForm((prev) => ({
            ...prev,
            bundledProducts: prev.bundledProducts.map((bundle) =>
                bundle.id === id ? { ...bundle, ...updates } : bundle
            ),
        }))
    }, [])

    const handleBundleRemove = useCallback((id: string) => {
        setForm((prev) => ({
            ...prev,
            bundledProducts: prev.bundledProducts.filter((bundle) => bundle.id !== id),
        }))
    }, [])

    const handleBundleAdd = useCallback(() => {
        setForm((prev) => ({
            ...prev,
            bundledProducts: [...prev.bundledProducts, createEmptyBundleState()],
        }))
    }, [])

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            try {
                const payload = buildProductRequestPayload(form)
                await onSubmit(payload)
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unable to save product.'
                setErrorMessage(message)
            }
        },
        [form, onSubmit]
    )

    const selectProductKeyValue = productKeyOptions.includes(form.productKey) ? form.productKey : undefined

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    {errorMessage}
                </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="product-name">Name</Label>
                    <Input
                        id="product-name"
                        value={form.name}
                        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Authlance Enterprise"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="product-slug">Slug</Label>
                    <Input
                        id="product-slug"
                        value={form.slug}
                        onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                        disabled={mode === 'edit'}
                        placeholder="enterprise"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="product-plan">Plan code</Label>
                    <Input
                        id="product-plan"
                        value={form.plan}
                        onChange={(event) => setForm((prev) => ({ ...prev, plan: event.target.value }))}
                        placeholder="enterprise"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="product-type">Product type</Label>
                    <Select
                        value={form.type}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as ProductTypeValue }))}
                    >
                        <SelectTrigger id="product-type">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {PRODUCT_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="product-pricing-mode">Pricing mode</Label>
                    <Select
                        value={form.pricingMode}
                        onValueChange={(value) =>
                            setForm((prev) => {
                                const nextMode = value as ProductPricingModeValue
                                if (nextMode === prev.pricingMode) {
                                    return prev
                                }
                                const hasTiers = prev.pricingTiers.length > 0
                                return {
                                    ...prev,
                                    pricingMode: nextMode,
                                    pricingTiers:
                                        nextMode === 'tiered' && !hasTiers
                                            ? [createEmptyTierState()]
                                            : prev.pricingTiers,
                                }
                            })
                        }
                    >
                        <SelectTrigger id="product-pricing-mode">
                            <SelectValue placeholder="Select pricing mode" />
                        </SelectTrigger>
                        <SelectContent>
                            {PRICING_MODE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <Label htmlFor="product-key-input">Product key</Label>
                    {productKeyOptions.length > 0 && (
                        <Select
                            value={selectProductKeyValue}
                            onValueChange={(value) =>
                                setForm((prev) => ({ ...prev, productKey: value.trim().toLowerCase() }))
                            }
                            disabled={productKeysLoading}
                        >
                            <SelectTrigger id="product-key">
                                <SelectValue
                                    placeholder={productKeysLoading ? 'Loading product keys…' : 'Select product key'}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {productKeyOptions.map((key) => (
                                    <SelectItem key={key} value={key}>
                                        {key}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <Input
                        id="product-key-input"
                        value={form.productKey}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, productKey: event.target.value.trim().toLowerCase() }))
                        }
                        placeholder="security"
                    />
                    <p className="text-xs text-muted-foreground">
                        Select one of the configured keys or enter a custom identifier in lowercase.
                    </p>
                    {productKeysError instanceof Error && (
                        <p className="text-xs text-destructive">
                            Unable to load product keys: {productKeysError.message}.
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                    id="product-description"
                    value={form.description}
                    rows={3}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Short summary for operators"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center justify-between rounded-md border border-input bg-muted/20 px-3 py-2">
                    <div>
                        <Label htmlFor="product-active" className="text-sm font-medium">
                            Active
                        </Label>
                        <p className="text-xs text-muted-foreground">Visible to checkout flows.</p>
                    </div>
                    <Switch
                        id="product-active"
                        checked={form.active}
                        onCheckedChange={(checked) => setForm((prev) => ({ ...prev, active: checked }))}
                    />
                </div>
                <div className="flex items-center justify-between rounded-md border border-input bg-muted/20 px-3 py-2">
                    <div>
                        <Label htmlFor="product-internal" className="text-sm font-medium">
                            Internal
                        </Label>
                        <p className="text-xs text-muted-foreground">Hide from public catalog.</p>
                    </div>
                    <Switch
                        id="product-internal"
                        checked={form.internal}
                        onCheckedChange={(checked) => setForm((prev) => ({ ...prev, internal: checked }))}
                    />
                </div>
                <div className="flex items-center justify-between rounded-md border border-input bg-muted/20 px-3 py-2">
                    <div>
                        <Label htmlFor="product-managed" className="text-sm font-medium">
                            Config managed
                        </Label>
                        <p className="text-xs text-muted-foreground">Managed via config sync.</p>
                    </div>
                    <Switch
                        id="product-managed"
                        checked={form.configManaged}
                        onCheckedChange={(checked) => setForm((prev) => ({ ...prev, configManaged: checked }))}
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="product-currency">Currency</Label>
                    <Input
                        id="product-currency"
                        value={form.currency}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, currency: event.target.value.toLowerCase() }))
                        }
                        placeholder="usd"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="product-price">Unit price</Label>
                    <Input
                        id="product-price"
                        value={form.unitAmount}
                        onChange={(event) => setForm((prev) => ({ ...prev, unitAmount: event.target.value }))}
                        placeholder="4999 (cents or decimal)"
                    />
                </div>
                {form.pricingMode === 'tiered' && (
                    <div className="space-y-2 sm:col-span-2 md:col-span-1">
                        <Label htmlFor="product-base-amount">Base amount</Label>
                        <Input
                            id="product-base-amount"
                            value={form.baseAmount}
                            onChange={(event) => setForm((prev) => ({ ...prev, baseAmount: event.target.value }))}
                            placeholder="Defaults to unit price"
                        />
                        <p className="text-xs text-muted-foreground">
                            Used as the baseline for tier multipliers when no explicit amount is set.
                        </p>
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="product-interval">Billing interval</Label>
                    <Input
                        id="product-interval"
                        value={form.billingInterval}
                        onChange={(event) => setForm((prev) => ({ ...prev, billingInterval: event.target.value }))}
                        placeholder="month"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="product-interval-count">Interval count</Label>
                    <Input
                        id="product-interval-count"
                        value={form.billingIntervalCount}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, billingIntervalCount: event.target.value }))
                        }
                        placeholder="1"
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="product-trial-days">Trial days</Label>
                    <Input
                        id="product-trial-days"
                        value={form.trialPeriodDays}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, trialPeriodDays: event.target.value.replace(/[^0-9]/g, '') }))
                        }
                        placeholder="0"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="product-term-days">Term duration (days)</Label>
                    <Input
                        id="product-term-days"
                        value={form.termDurationDays}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, termDurationDays: event.target.value.replace(/[^0-9]/g, '') }))
                        }
                        placeholder=""
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="product-max-licenses">Max license total</Label>
                    <Input
                        id="product-max-licenses"
                        value={form.maxLicenseTotal}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, maxLicenseTotal: event.target.value.replace(/[^0-9]/g, '') }))
                        }
                        placeholder=""
                    />
                </div>
                {form.pricingMode === 'tiered' && (
                    <div className="space-y-2">
                        <Label htmlFor="product-max-managed">Max managed products</Label>
                        <Input
                            id="product-max-managed"
                            value={form.maxManagedProducts}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    maxManagedProducts: event.target.value.replace(/[^0-9]/g, ''),
                                }))
                            }
                            placeholder=""
                        />
                    </div>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="product-stripe-product">Stripe product ID</Label>
                    <Input
                        id="product-stripe-product"
                        value={form.stripeProductId}
                        onChange={(event) => setForm((prev) => ({ ...prev, stripeProductId: event.target.value }))}
                        placeholder="prod_XXXX"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="product-stripe-price">Stripe price ID</Label>
                    <Input
                        id="product-stripe-price"
                        value={form.stripePriceId}
                        onChange={(event) => setForm((prev) => ({ ...prev, stripePriceId: event.target.value }))}
                        placeholder="price_YYYY"
                    />
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="product-lookup-key">Lookup key</Label>
                    <Input
                        id="product-lookup-key"
                        value={form.lookupKey}
                        onChange={(event) => setForm((prev) => ({ ...prev, lookupKey: event.target.value }))}
                        placeholder="Optional Stripe lookup key"
                    />
                    <p className="text-xs text-muted-foreground">
                        Optional Stripe lookup key. Leave blank to use the configured Stripe price defaults.
                    </p>
                </div>
            </div>

            {form.pricingMode === 'tiered' && (
                <div className="space-y-3 rounded-md border border-border p-4">
                    <div>
                        <h3 className="text-sm font-medium">Pricing tiers</h3>
                        <p className="text-xs text-muted-foreground">
                            Tiers are evaluated in ascending order by upper bound. Leave the upper bound empty for the final tier.
                        </p>
                    </div>
                    <PricingTierEditor
                        tiers={form.pricingTiers}
                        disabled={pending}
                        onTierAdd={handleTierAdd}
                        onTierChange={handleTierChange}
                        onTierRemove={handleTierRemove}
                    />
                </div>
            )}

            <div className="space-y-3 rounded-md border border-border p-4">
                <div>
                    <h3 className="text-sm font-medium">Bundled products</h3>
                    <p className="text-xs text-muted-foreground">
                        Issue additional licenses alongside this product. The bundled product must already exist and remain active.
                    </p>
                </div>
                <BundledProductEditor
                    bundles={form.bundledProducts}
                    disabled={pending}
                    onBundleAdd={handleBundleAdd}
                    onBundleChange={handleBundleChange}
                    onBundleRemove={handleBundleRemove}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="product-metadata">Metadata (JSON)</Label>
                <Textarea
                    id="product-metadata"
                    value={form.metadataInput}
                    onChange={(event) => setForm((prev) => ({ ...prev, metadataInput: event.target.value }))}
                    rows={4}
                    placeholder='{ "key": "value" }'
                />
                <p className="text-xs text-muted-foreground">
                    Optional key/value pairs stored alongside the product.
                </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" disabled={pending} onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                    {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {pending ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}
                </Button>
            </div>
        </form>
    )
}
