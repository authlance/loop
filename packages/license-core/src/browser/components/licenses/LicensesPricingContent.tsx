import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Loader2, RefreshCw, ShieldCheck, Tag } from 'lucide-react'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@authlance/ui/lib/browser/components/card'
import { Badge } from '@authlance/ui/lib/browser/components/badge'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { Input } from '@authlance/ui/lib/browser/components/input'
import { Label } from '@authlance/ui/lib/browser/components/label'
import { Switch } from '@authlance/ui/lib/browser/components/switch'
import {
    formatLicensePrice,
    useLicensesSdk,
    type LicensePublicProduct,
    type LicenseCheckoutSessionPayload,
    createLicenseCheckoutSession,
    toLicenseOperatorError,
    withDerivedLookupKey,
    deriveLookupKey,
    isTieredPricing,
} from '../../common/licenses-sdk'
import { usePublicProducts } from '../../hooks/use-licenses'
import { RECURRING_INTERVALS } from './constants'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { useGetGroup } from '@authlance/identity/lib/browser/hooks/useGroups'

const isRecurringPublicProduct = (product: LicensePublicProduct | undefined) => {
    if (!product?.interval) {
        return false
    }
    return RECURRING_INTERVALS.has(product.interval.trim().toLowerCase())
}

const formatPublicInterval = (product: LicensePublicProduct) => {
    const interval = product.interval?.trim()
    if (!interval) {
        return 'One-year license'
    }
    const normalized = interval.toLowerCase()
    if (RECURRING_INTERVALS.has(normalized)) {
        return normalized === 'year' ? 'Billed annually' : `Billed every ${normalized}`
    }
    return interval.charAt(0).toUpperCase() + interval.slice(1)
}

const PricingCard: React.FC<{
    cardKey: string
    product: LicensePublicProduct
    recurring: boolean
    tiered: boolean
    managedProducts?: number
    maxManagedProducts?: number
    onManagedProductsChange?: (value: string) => void
    cookieDomain: string
    onCookieDomainChange: (value: string) => void
    couponEnabled: boolean
    couponCode: string
    onToggleCoupon: (enabled: boolean) => void
    onCouponChange: (value: string) => void
    onCheckout: () => void
    checkoutPending: boolean
    checkoutDisabled: boolean
    disabledReason?: string
    buttonLabel: string
    isBundle?: boolean
    bundledComponents?: Array<{ label: string; quantity: number }>
}> = ({
    cardKey,
    product,
    recurring,
    tiered,
    managedProducts,
    maxManagedProducts,
    onManagedProductsChange,
    cookieDomain,
    onCookieDomainChange,
    couponEnabled,
    couponCode,
    onToggleCoupon,
    onCouponChange,
    onCheckout,
    checkoutPending,
    checkoutDisabled,
    disabledReason,
    buttonLabel,
    isBundle,
    bundledComponents,
}) => {
    const showManagedInput = tiered && !isBundle
    const managedCount =
        showManagedInput && typeof managedProducts === 'number' && managedProducts > 0 ? managedProducts : undefined
    const priceLabel =
        showManagedInput && managedCount
            ? formatLicensePrice(product, { managedProducts: managedCount })
            : formatLicensePrice(product)
    const intervalLabel = formatPublicInterval(product)
    const features = product.features ?? []
    const coupons = (product.coupons ?? []).filter((coupon) => coupon.active)
    const couponSwitchId = `coupon-toggle-${cardKey}`
    const managedInputId = `managed-products-${cardKey}`

    return (
        <Card className="flex h-full flex-col">
            <CardHeader className="items-center space-y-3 text-center">
                <Badge variant="outline" className="uppercase tracking-wide">
                    {recurring ? 'Annual subscription' : 'One-off (12 months)'}
                </Badge>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                {product.description && <CardDescription>{product.description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="text-3xl font-semibold">{priceLabel ?? 'Contact sales'}</div>
                    <p className="text-sm text-muted-foreground">{intervalLabel}</p>
                    {tiered && managedCount && (
                        <p className="text-xs text-muted-foreground">Total for {managedCount} managed products.</p>
                    )}
                </div>
                {showManagedInput && (
                    <div className="space-y-2">
                        <Label htmlFor={managedInputId}>Seats / managed products</Label>
                        <Input
                            id={managedInputId}
                            type="number"
                            min={1}
                            value={String(managedCount ?? 1)}
                            onChange={(event) => onManagedProductsChange?.(event.target.value)}
                            autoComplete="off"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            {typeof maxManagedProducts === 'number'
                                ? `Published managed-product limit: ${maxManagedProducts}.`
                                : 'Adjust the count to reflect how many products or seats you need to manage.'}
                        </p>
                    </div>
                )}
                {isBundle && bundledComponents && bundledComponents.length > 0 && (
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Includes:</p>
                        <ul className="list-disc space-y-1 pl-5">
                            {bundledComponents.map((component, index) => (
                                <li key={`${cardKey}-bundle-${index}`}>
                                    {component.quantity}× {component.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor={`checkout-domain-${cardKey}`}>Cookie domain</Label>
                    <Input
                        id={`checkout-domain-${cardKey}`}
                        value={cookieDomain}
                        onChange={(event) => onCookieDomainChange(event.target.value)}
                        placeholder=".example.com"
                        autoComplete="off"
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        Auth cookies inherit this domain. Include a leading dot to cover subdomains (for example <code>.example.com</code>).
                    </p>
                </div>
                {features.length > 0 && (
                    <ul className="space-y-2 text-left text-sm text-muted-foreground">
                        {features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                                <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                )}
                {coupons.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs">
                        {coupons.map((coupon) => (
                            <Badge key={coupon.code} variant="secondary" className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                <span>{coupon.code}</span>
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="mt-auto flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex w-full flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Switch id={couponSwitchId} checked={couponEnabled} onCheckedChange={onToggleCoupon} />
                            <label htmlFor={couponSwitchId} className="text-sm font-medium text-muted-foreground">
                                Have a coupon?
                            </label>
                        </div>
                        {couponEnabled && (
                            <Input
                                aria-label="Coupon code"
                                placeholder="Enter coupon"
                                value={couponCode}
                                onChange={(event) => onCouponChange(event.target.value)}
                                autoComplete="off"
                                className="min-w-[8rem] flex-1"
                            />
                        )}
                    </div>
                    <Button onClick={onCheckout} disabled={checkoutDisabled}>
                        {checkoutPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {buttonLabel}
                    </Button>
                    {disabledReason && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
                </div>
                <div className="flex flex-col gap-1 text-center text-xs text-muted-foreground">
                    <span>Plan: {product.plan}</span>
                    <span>After the grace period, Authlance keeps running but user registration stops.</span>
                    <span>New groups and subscriptions cannot be created; existing features stay online.</span>
                </div>
            </CardFooter>
        </Card>
    )
}

const resolveProductKey = (product: LicensePublicProduct, fallbackIndex: number): string => {
    const candidate = product as {
        slug?: string
        plan?: string
        lookupKey?: string
        id?: string | number
        name?: string
    }
    const values: Array<string | number | undefined> = [
        candidate.slug,
        candidate.plan,
        candidate.lookupKey,
        candidate.id,
        candidate.name,
    ]

    for (const value of values) {
        if (typeof value === 'string') {
            const trimmed = value.trim()
            if (trimmed) {
                return trimmed
            }
        }
        if (typeof value === 'number') {
            return String(value)
        }
    }

    return `product-${fallbackIndex}`
}

const resolveInitialManagedProducts = (product: LicensePublicProduct): number => {
    const tiers = Array.isArray(product.pricingTiers) ? product.pricingTiers : []
    for (const tier of tiers) {
        if (typeof tier?.upperBound === 'number' && tier.upperBound > 0) {
            return Math.max(1, tier.upperBound)
        }
    }
    if (typeof product.maxManagedProducts === 'number' && product.maxManagedProducts > 0) {
        return product.maxManagedProducts
    }
    return 1
}

export const LicensesPricingContent: React.FC = () => {
    const { publicApi, paymentsApi } = useLicensesSdk()
    const { toast } = useToast()
    const { targetGroup, user } = useContext(SessionContext)

    const trimmedGroup = useMemo(() => (targetGroup ? targetGroup.trim() : ''), [targetGroup])

    const { data: products, isLoading, isFetching, error, refetch } = usePublicProducts(publicApi)

    const {
        data: groupDetails,
        isLoading: groupLoading,
        error: groupError,
    } = useGetGroup(true, trimmedGroup, {
        enabled: trimmedGroup.length > 0,
    })

    const [couponStates, setCouponStates] = useState<Record<string, { enabled: boolean; code: string }>>({})
    const [cookieDomains, setCookieDomains] = useState<Record<string, string>>({})
    const [managedSelections, setManagedSelections] = useState<Record<string, number>>({})
    const [creatingCheckoutFor, setCreatingCheckoutFor] = useState<string | null>(null)
    const [pricingFilter, setPricingFilter] = useState<'subscription' | 'one-off'>('subscription')

    const productCards = useMemo(() => {
        return (products ?? [])
            .map((rawProduct, index) => {
                const normalized = withDerivedLookupKey(rawProduct) ?? rawProduct
                return {
                    key: resolveProductKey(normalized, index),
                    product: normalized,
                    recurring: isRecurringPublicProduct(normalized),
                }
            })
            .sort((a, b) => Number(b.recurring) - Number(a.recurring))
    }, [products])

    const needsLogin = useMemo(() => {
        return !user
    }, [user])

    const filteredCards = useMemo(() => {
        return productCards.filter((card) => (pricingFilter === 'subscription' ? card.recurring : !card.recurring))
    }, [productCards, pricingFilter])

    const hasProducts = (products?.length ?? 0) > 0

    useEffect(() => {
        if (!error) {
            return
        }
        const message = error instanceof Error ? error.message : 'Unable to load pricing right now.'
        toast({
            title: 'Failed to load catalog',
            description: message,
            variant: 'destructive',
        })
    }, [error, toast])

    useEffect(() => {
        if (!groupError) {
            return
        }
        const message = groupError instanceof Error ? groupError.message : 'Unable to load group details right now.'
        toast({
            title: 'Group unavailable',
            description: message,
            variant: 'destructive',
        })
    }, [groupError, toast])

    const redirectToLogin = useCallback(() => {
        if (typeof window === 'undefined') {
            return
        }
        const next = window.location.pathname || '/pricing'
        const baseUrl = `${window.location.protocol}//${window.location.host}`
        const returnTo = `${baseUrl}${next}`
        window.location.href = `/login?return_to=${encodeURIComponent(returnTo)}`
    }, [])

    const handleCheckout = useCallback(
        async (
            productKey: string,
            product: LicensePublicProduct,
            couponCode: string,
            cookieDomainValue: string,
            managedProducts?: number
        ) => {
            if (creatingCheckoutFor) {
                return
            }
            if (!paymentsApi || !user) {
                redirectToLogin()
                return
            }
            if (!trimmedGroup) {
                toast({
                    title: 'No group selected',
                    description: 'Your account does not have an assigned group. Please contact your administrator.',
                    variant: 'destructive',
                })
                return
            }

            const isBundleProduct =
                Array.isArray(product?.bundledProducts) && product.bundledProducts.length > 0

            if (isTieredPricing(product) && !isBundleProduct) {
                if (typeof managedProducts !== 'number' || managedProducts <= 0) {
                    toast({
                        title: 'Managed products required',
                        description: 'Enter how many products, seats, or tokens this license needs to cover.',
                        variant: 'destructive',
                    })
                    return
                }
            }

            const lookupKey = deriveLookupKey(product)
            const trimmedCoupon = couponCode.trim()
            const trimmedCookieDomain = cookieDomainValue.trim()

            if (!trimmedCookieDomain) {
                toast({
                    title: 'Cookie domain required',
                    description: 'Provide the domain to assign to Authlance authentication cookies (for subdomains use a leading dot like .example.com).',
                    variant: 'destructive',
                })
                return
            }

            if (!lookupKey && !trimmedCoupon) {
                toast({
                    title: 'Checkout not ready',
                    description:
                        'We could not determine the Stripe price for this plan. Enter a valid coupon or contact support.',
                    variant: 'destructive',
                })
                return
            }

            const normalizedCookieDomain = trimmedCookieDomain.startsWith('.')
                ? trimmedCookieDomain
                : `.${trimmedCookieDomain}`

            const payload: LicenseCheckoutSessionPayload = {
                lookupKey: lookupKey || undefined,
                organizationName: trimmedGroup,
                organizationLongName: groupDetails?.longName?.trim() || trimmedGroup,
                couponCode: trimmedCoupon || undefined,
                cookieDomain: normalizedCookieDomain,
                managedProducts: isBundleProduct ? undefined : managedProducts,
            }

            setCreatingCheckoutFor(productKey)
            try {
                const session = await createLicenseCheckoutSession(paymentsApi, payload)
                if (typeof window !== 'undefined') {
                    window.location.href = session.url
                }
            } catch (error) {
                const normalized = toLicenseOperatorError(error, 'Unable to start checkout right now.')
                const description =
                    normalized.status === 409
                        ? 'The lifetime license allocation has been exhausted. Please reach out to Authlance support.'
                        : normalized.message
                toast({
                    title: 'Checkout unavailable',
                    description,
                    variant: 'destructive',
                })
            } finally {
                setCreatingCheckoutFor(null)
            }
        },
        [creatingCheckoutFor, trimmedGroup, groupDetails?.longName, paymentsApi, user, toast, redirectToLogin]
    )

    if (isLoading && !products) {
        return <DefaultDashboardContent loading />
    }

    const checkoutInFlight = Boolean(creatingCheckoutFor)

    const emptyFilterCopy =
        pricingFilter === 'subscription'
            ? {
                  title: 'Subscription plans unavailable',
                  description: 'No subscription plans are published right now. Try one-off licenses or check back soon.',
              }
            : {
                  title: 'One-off licenses unavailable',
                  description: 'No one-off licenses are published right now. Switch to subscriptions or contact support.',
              }

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Explore subscription plans and one-off licenses available for Authlance tenants.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        All paid licenses include 12 months of Authlance access. Create an account and visit <strong>My Licenses</strong> to request a trial license whenever you are ready to evaluate.
                    </p>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:items-end">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">License type</span>
                    <div className="flex gap-2">
                        <Button
                            variant={pricingFilter === 'subscription' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPricingFilter('subscription')}
                            aria-pressed={pricingFilter === 'subscription'}
                        >
                            Subscriptions
                        </Button>
                        <Button
                            variant={pricingFilter === 'one-off' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPricingFilter('one-off')}
                            aria-pressed={pricingFilter === 'one-off'}
                        >
                            One-off licenses
                        </Button>
                    </div>
                </div>
            </div>
            {isFetching && hasProducts && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating catalog…
                </div>
            )}
            {!hasProducts ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing unavailable</CardTitle>
                        <CardDescription>We could not load the product catalog. Try again shortly.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                            {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            {isFetching ? 'Refreshing…' : 'Retry'}
                        </Button>
                    </CardFooter>
                </Card>
            ) : filteredCards.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredCards.map(({ key, product, recurring }) => {
                        const couponState = couponStates[key] ?? { enabled: false, code: '' }
                        const cookieDomain = cookieDomains[key] ?? ''
                        const checkoutPending = creatingCheckoutFor === key
                        const missingGroup = !needsLogin && !trimmedGroup
                        const tiered = isTieredPricing(product)
                        const bundledList = Array.isArray(product.bundledProducts) ? product.bundledProducts : []
                        const isBundle = bundledList.length > 0
                        const bundleDescriptions = bundledList.map((bundle, index) => {
                            const label =
                                bundle?.plan?.trim() ||
                                bundle?.productKey?.trim() ||
                                bundle?.productSlug?.trim() ||
                                `Component ${index + 1}`
                            return {
                                label,
                                quantity: bundle?.quantity ?? 1,
                            }
                        })
                        const requiresManagedInput = tiered && !isBundle
                        const initialManaged = requiresManagedInput ? resolveInitialManagedProducts(product) : undefined
                        const storedManaged = requiresManagedInput ? managedSelections[key] : undefined
                        const resolvedManaged =
                            requiresManagedInput && typeof storedManaged === 'number' && storedManaged > 0
                                ? storedManaged
                                : initialManaged
                        const managedCount =
                            requiresManagedInput && resolvedManaged ? Math.max(1, resolvedManaged) : undefined
                        const checkoutDisabled =
                            checkoutPending ||
                            (checkoutInFlight && !checkoutPending) ||
                            (!needsLogin && (missingGroup || groupLoading))

                        let disabledReason: string | undefined
                        if (!needsLogin && missingGroup) {
                            disabledReason = 'Select a group to continue.'
                        } else if (!needsLogin && groupLoading) {
                            disabledReason = 'Preparing checkout…'
                        } else if (checkoutInFlight && !checkoutPending) {
                            disabledReason = 'Checkout in progress…'
                        } else if (requiresManagedInput && (!managedCount || managedCount <= 0)) {
                            disabledReason = 'Enter the managed product count.'
                        }

                        const buttonLabel = needsLogin
                            ? 'Log in to buy'
                            : checkoutPending
                                ? 'Redirecting…'
                                : 'Buy / Checkout'

                        return (
                            <div key={key} className="flex h-full flex-col">
                                <PricingCard
                                    cardKey={key}
                                    product={product}
                                    recurring={recurring}
                                    tiered={tiered}
                                    managedProducts={managedCount}
                                    maxManagedProducts={product.maxManagedProducts ?? undefined}
                                    onManagedProductsChange={
                                        requiresManagedInput
                                            ? (value) => {
                                                  const sanitized = value.replace(/[^0-9]/g, '')
                                                  let next = Number.parseInt(sanitized, 10)
                                                  if (!Number.isFinite(next) || next <= 0) {
                                                      next = initialManaged ?? 1
                                                  }
                                                  setManagedSelections((previous) => {
                                                      if (previous[key] === next) {
                                                          return previous
                                                      }
                                                      return { ...previous, [key]: next }
                                                  })
                                              }
                                            : undefined
                                    }
                                    cookieDomain={cookieDomain}
                                    onCookieDomainChange={(value) =>
                                        setCookieDomains((previous) => ({
                                            ...previous,
                                            [key]: value,
                                        }))
                                    }
                                    couponEnabled={couponState.enabled}
                                    couponCode={couponState.code}
                                    onToggleCoupon={(enabled) =>
                                        setCouponStates((previous) => ({
                                            ...previous,
                                            [key]: { enabled, code: previous[key]?.code ?? '' },
                                        }))
                                    }
                                    onCouponChange={(value) =>
                                        setCouponStates((previous) => ({
                                            ...previous,
                                            [key]: { enabled: previous[key]?.enabled ?? true, code: value },
                                        }))
                                    }
                                    onCheckout={() =>
                                        handleCheckout(
                                            key,
                                            product,
                                            couponState.enabled ? couponState.code : '',
                                            cookieDomain,
                                            requiresManagedInput ? managedCount : undefined
                                        )
                                    }
                                    checkoutPending={checkoutPending}
                                    checkoutDisabled={
                                        checkoutDisabled || (requiresManagedInput && (!managedCount || managedCount <= 0))
                                    }
                                    disabledReason={disabledReason}
                                    buttonLabel={buttonLabel}
                                    isBundle={isBundle}
                                    bundledComponents={bundleDescriptions}
                                />
                            </div>
                        )
                    })}
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>{emptyFilterCopy.title}</CardTitle>
                        <CardDescription>{emptyFilterCopy.description}</CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    )
}
