import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { Input } from '@authlance/ui/lib/browser/components/input'
import { Label } from '@authlance/ui/lib/browser/components/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@authlance/ui/lib/browser/components/select'
import { Switch } from '@authlance/ui/lib/browser/components/switch'
import { Textarea } from '@authlance/ui/lib/browser/components/textarea'
import { Loader2 } from 'lucide-react'
import {
    type LicenseAdminCoupon,
    type LicenseAdminCouponRequest,
} from '../../common/licenses-sdk'
import { parseJsonRecord, parseOptionalPositiveIntegerField, parsePositiveIntegerField } from './form-utils'

export type CouponEditorMode = 'create' | 'edit'

type CouponBehaviorValue = 'product_override' | 'stripe_promotion'
type StripePromotionDurationValue = 'forever' | 'once' | 'repeating'
type StripePromotionDiscountMode = 'percent' | 'amount'

const ZERO_DECIMAL_CURRENCIES = new Set([
    'BIF',
    'CLP',
    'DJF',
    'GNF',
    'JPY',
    'KMF',
    'KRW',
    'MGA',
    'PYG',
    'RWF',
    'UGX',
    'VND',
    'VUV',
    'XAF',
    'XOF',
    'XPF',
])

const formatAmountForForm = (amount: number, currency: string): string => {
    if (!Number.isFinite(amount) || amount <= 0) {
        return ''
    }
    const normalizedCurrency = currency.toUpperCase()
    if (ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency)) {
        return String(Math.round(amount))
    }
    const value = amount / 100
    const fixed = value.toFixed(2)
    return fixed.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
}

const DEFAULT_COUPON_BEHAVIOR: CouponBehaviorValue = 'product_override'

const COUPON_BEHAVIOR_OPTIONS: Array<{
    value: CouponBehaviorValue
    label: string
    description: string
}> = [
    {
        value: 'product_override',
        label: 'Product override',
        description: 'Switch the checkout to the configured one-off price for this product.',
    },
    {
        value: 'stripe_promotion',
        label: 'Stripe promotion',
        description: 'Forward the coupon code to Stripe as an existing promotion code.',
    },
]

const STRIPE_PROMOTION_DISCOUNT_OPTIONS: Array<{
    value: StripePromotionDiscountMode
    label: string
    description: string
}> = [
    {
        value: 'percent',
        label: 'Percent off',
        description: 'Apply a percentage discount to the Stripe subscription.',
    },
    {
        value: 'amount',
        label: 'Amount off',
        description: 'Subtract a fixed amount from the Stripe subscription price.',
    },
]

const STRIPE_PROMOTION_DURATION_OPTIONS: Array<{
    value: StripePromotionDurationValue
    label: string
    description: string
}> = [
    {
        value: 'forever',
        label: 'Forever',
        description: 'Discount applies to every invoice until canceled.',
    },
    {
        value: 'once',
        label: 'Once',
        description: 'Discount applies to the first invoice only.',
    },
    {
        value: 'repeating',
        label: 'Repeating',
        description: 'Discount repeats for a limited number of months.',
    },
]

interface CouponFormState {
    code: string
    active: boolean
    behavior: CouponBehaviorValue
    maxPerGroup: string
    maxTotal: string
    metadataInput: string
    stripeDiscountMode: StripePromotionDiscountMode
    stripePercentOff: string
    stripeAmountOff: string
    stripeAmountCurrency: string
    stripeDuration: StripePromotionDurationValue
    stripeDurationInMonths: string
}

const toCouponFormState = (coupon?: LicenseAdminCoupon): CouponFormState => {
    const normalizedBehavior = (() => {
        const raw = typeof coupon?.behavior === 'string' ? coupon.behavior.toLowerCase() : ''
        return raw === 'stripe_promotion' ? 'stripe_promotion' : DEFAULT_COUPON_BEHAVIOR
    })()
    const stripePromotion = coupon?.stripePromotion
    const stripeDiscountMode: StripePromotionDiscountMode =
        stripePromotion?.percentOff != null && Number.isFinite(stripePromotion.percentOff)
            ? 'percent'
            : stripePromotion?.amountOff != null && Number.isFinite(stripePromotion.amountOff)
            ? 'amount'
            : 'percent'
    const stripePercentOff =
        stripePromotion?.percentOff != null && Number.isFinite(stripePromotion.percentOff)
            ? String(stripePromotion.percentOff)
            : ''
    const stripeAmountCurrency =
        typeof stripePromotion?.currency === 'string' && stripePromotion.currency.trim() !== ''
            ? stripePromotion.currency.trim()
            : 'usd'
    const stripeAmountOff =
        stripePromotion?.amountOff != null && Number.isFinite(stripePromotion.amountOff)
            ? formatAmountForForm(stripePromotion.amountOff, stripeAmountCurrency)
            : ''
    const stripeDuration = (() => {
        const raw = typeof stripePromotion?.duration === 'string' ? stripePromotion.duration.toLowerCase() : ''
        if (raw === 'once' || raw === 'repeating') {
            return raw
        }
        return 'forever'
    })() as StripePromotionDurationValue
    const stripeDurationInMonths =
        stripePromotion?.durationInMonths != null && Number.isFinite(stripePromotion.durationInMonths)
            ? String(stripePromotion.durationInMonths)
            : ''

    return {
        code: coupon?.code ?? '',
        active: coupon?.active ?? true,
        behavior: normalizedBehavior,
        maxPerGroup: coupon?.maxPerGroup != null ? String(coupon.maxPerGroup) : '',
        maxTotal: coupon?.maxTotal != null ? String(coupon.maxTotal) : '',
        metadataInput:
            coupon?.metadata && Object.keys(coupon.metadata).length > 0
                ? JSON.stringify(coupon.metadata, null, 2)
                : '',
        stripeDiscountMode,
        stripePercentOff,
        stripeAmountOff,
        stripeAmountCurrency,
        stripeDuration,
        stripeDurationInMonths,
    }
}

const buildCouponRequestPayload = (state: CouponFormState): LicenseAdminCouponRequest => {
    const code = state.code.trim()
    if (!code) {
        throw new Error('Coupon code is required.')
    }
    const metadata = parseJsonRecord(state.metadataInput, 'Coupon metadata')
    const maxPerGroup = parseOptionalPositiveIntegerField(state.maxPerGroup, 'Max per group')
    const maxTotal = parseOptionalPositiveIntegerField(state.maxTotal, 'Max total')
    const parsePercentOff = (value: string, field: string) => {
        const trimmed = value.trim()
        if (trimmed === '') {
            throw new Error(`${field} is required.`)
        }
        const parsed = Number.parseFloat(trimmed)
        if (!Number.isFinite(parsed) || parsed <= 0) {
            throw new Error(`${field} must be greater than zero.`)
        }
        if (parsed > 100) {
            throw new Error(`${field} cannot exceed 100%.`)
        }
        return parsed
    }
    const parseStripeAmount = (value: string, currencyInput: string) => {
        const trimmedCurrency = currencyInput.trim()
        if (!trimmedCurrency) {
            throw new Error('Currency is required when using amount discounts.')
        }
        if (!/^[A-Za-z]{3}$/.test(trimmedCurrency)) {
            throw new Error('Currency must be a three-letter ISO code (e.g. USD).')
        }
        const normalizedCurrency = trimmedCurrency.toUpperCase()
        const zeroDecimal = ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency)
        const trimmedValue = value.trim()
        if (trimmedValue === '') {
            throw new Error('Amount off is required for Stripe promotions.')
        }
        if (zeroDecimal && trimmedValue.includes('.')) {
            throw new Error(`${normalizedCurrency} is a zero-decimal currency; enter a whole number amount.`)
        }
        const parsed = Number.parseFloat(trimmedValue)
        if (!Number.isFinite(parsed) || parsed <= 0) {
            throw new Error('Amount off must be greater than zero.')
        }
        const multiplier = zeroDecimal ? 1 : 100
        const scaled = Math.round(parsed * multiplier)
        if (!Number.isFinite(scaled) || scaled <= 0) {
            throw new Error('Amount off must be greater than zero.')
        }
        return {
            amountOff: scaled,
            currency: normalizedCurrency.toLowerCase(),
        }
    }

    const buildStripePromotionPayload = () => {
        if (state.behavior !== 'stripe_promotion') {
            return undefined
        }
        const duration = state.stripeDuration
        if (!duration) {
            throw new Error('Select a duration for the Stripe promotion.')
        }
        let durationInMonths: number | undefined
        if (duration === 'repeating') {
            durationInMonths = parsePositiveIntegerField(state.stripeDurationInMonths, 'Duration in months')
        } else if (state.stripeDurationInMonths.trim() !== '') {
            throw new Error('Duration in months only applies when the duration is repeating.')
        }

        if (state.stripeDiscountMode === 'amount') {
            const { amountOff, currency } = parseStripeAmount(state.stripeAmountOff, state.stripeAmountCurrency)
            return {
                amountOff,
                currency,
                duration,
                durationInMonths,
            }
        }

        const percentOff = parsePercentOff(state.stripePercentOff, 'Percent off')
        return {
            percentOff,
            duration,
            durationInMonths,
        }
    }

    return {
        code,
        active: state.active,
        behavior: state.behavior,
        maxPerGroup,
        maxTotal,
        metadata,
        stripePromotion: buildStripePromotionPayload(),
    }
}

export interface CouponEditorPanelProps {
    mode: CouponEditorMode
    coupon?: LicenseAdminCoupon
    pending: boolean
    onSubmit: (payload: LicenseAdminCouponRequest) => Promise<unknown>
    onCancel: () => void
}

export const CouponEditorPanel: React.FC<CouponEditorPanelProps> = ({ mode, coupon, pending, onSubmit, onCancel }) => {
    const [form, setForm] = useState<CouponFormState>(() => toCouponFormState(coupon))
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

    const selectedBehaviorDescription = COUPON_BEHAVIOR_OPTIONS.find((option) => option.value === form.behavior)?.description
    const selectedDiscountDescription = useMemo(
        () => STRIPE_PROMOTION_DISCOUNT_OPTIONS.find((option) => option.value === form.stripeDiscountMode)?.description,
        [form.stripeDiscountMode]
    )
    const selectedDurationDescription = useMemo(
        () => STRIPE_PROMOTION_DURATION_OPTIONS.find((option) => option.value === form.stripeDuration)?.description,
        [form.stripeDuration]
    )

    useEffect(() => {
        setForm(toCouponFormState(coupon))
        setErrorMessage(undefined)
    }, [coupon, mode])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            const payload = buildCouponRequestPayload(form)
            await onSubmit(payload)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to save coupon.'
            setErrorMessage(message)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    {errorMessage}
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="coupon-code">Code</Label>
                <Input
                    id="coupon-code"
                    value={form.code}
                    onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                    placeholder="LIFETIME"
                />
            </div>
            <div className="flex items-center justify-between rounded-md border border-input bg-muted/20 px-3 py-2">
                <div>
                    <Label htmlFor="coupon-active" className="text-sm font-medium">
                        Active
                    </Label>
                    <p className="text-xs text-muted-foreground">Allow using this coupon.</p>
                </div>
                <Switch
                    id="coupon-active"
                    checked={form.active}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, active: checked }))}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="coupon-behavior">Coupon behavior</Label>
                <Select
                    value={form.behavior}
                    onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, behavior: value as CouponBehaviorValue }))
                    }
                >
                    <SelectTrigger id="coupon-behavior">
                        <SelectValue placeholder="Select behavior" />
                    </SelectTrigger>
                    <SelectContent>
                        {COUPON_BEHAVIOR_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium">{option.label}</span>
                                    <span className="text-xs text-muted-foreground">{option.description}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    {selectedBehaviorDescription ?? 'Switch the checkout to the configured one-off price for this product.'}
                </p>
            </div>
            {form.behavior === 'stripe_promotion' && (
                <div className="space-y-4 rounded-md border border-input bg-muted/20 p-4">
                    <div className="space-y-2">
                        <Label htmlFor="stripe-discount-mode">Stripe discount</Label>
                        <Select
                            value={form.stripeDiscountMode}
                            onValueChange={(value) =>
                                setForm((prev) => ({ ...prev, stripeDiscountMode: value as StripePromotionDiscountMode }))
                            }
                        >
                            <SelectTrigger id="stripe-discount-mode">
                                <SelectValue placeholder="Select discount type" />
                            </SelectTrigger>
                            <SelectContent>
                                {STRIPE_PROMOTION_DISCOUNT_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium">{option.label}</span>
                                            <span className="text-xs text-muted-foreground">{option.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {selectedDiscountDescription ?? 'Configure how the discount is forwarded to Stripe.'}
                        </p>
                    </div>
                    {form.stripeDiscountMode === 'percent' ? (
                        <div className="space-y-2">
                            <Label htmlFor="stripe-percent-off">Percent off</Label>
                            <Input
                                id="stripe-percent-off"
                                value={form.stripePercentOff}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, stripePercentOff: event.target.value }))
                                }
                                placeholder="25"
                                inputMode="decimal"
                            />
                            <p className="text-xs text-muted-foreground">
                                Specify how much of the invoice total to discount (1-100).
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="stripe-amount-off">Amount off</Label>
                                <Input
                                    id="stripe-amount-off"
                                    value={form.stripeAmountOff}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, stripeAmountOff: event.target.value }))
                                    }
                                    placeholder="50.00"
                                    inputMode="decimal"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the amount to discount in major units. Zero-decimal currencies must use whole numbers.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stripe-amount-currency">Currency</Label>
                                <Input
                                    id="stripe-amount-currency"
                                    value={form.stripeAmountCurrency}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, stripeAmountCurrency: event.target.value }))
                                    }
                                    placeholder="usd"
                                    inputMode="text"
                                />
                                <p className="text-xs text-muted-foreground">Three-letter ISO currency code.</p>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="stripe-duration">Duration</Label>
                        <Select
                            value={form.stripeDuration}
                            onValueChange={(value) =>
                                setForm((prev) => ({
                                    ...prev,
                                    stripeDuration: value as StripePromotionDurationValue,
                                    stripeDurationInMonths: value === 'repeating' ? prev.stripeDurationInMonths : '',
                                }))
                            }
                        >
                            <SelectTrigger id="stripe-duration">
                                <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                                {STRIPE_PROMOTION_DURATION_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium">{option.label}</span>
                                            <span className="text-xs text-muted-foreground">{option.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {selectedDurationDescription ??
                                'Select how long the discount should be applied when forwarded to Stripe.'}
                        </p>
                    </div>
                    {form.stripeDuration === 'repeating' && (
                        <div className="space-y-2">
                            <Label htmlFor="stripe-duration-months">Duration in months</Label>
                            <Input
                                id="stripe-duration-months"
                                value={form.stripeDurationInMonths}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, stripeDurationInMonths: event.target.value }))
                                }
                                placeholder="3"
                                inputMode="numeric"
                            />
                            <p className="text-xs text-muted-foreground">
                                Number of months the repeating discount should remain active.
                            </p>
                        </div>
                    )}
                </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="coupon-max-group">Max per group</Label>
                    <Input
                        id="coupon-max-group"
                        value={form.maxPerGroup}
                        onChange={(event) => setForm((prev) => ({ ...prev, maxPerGroup: event.target.value }))}
                        placeholder=""
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="coupon-max-total">Max total</Label>
                    <Input
                        id="coupon-max-total"
                        value={form.maxTotal}
                        onChange={(event) => setForm((prev) => ({ ...prev, maxTotal: event.target.value }))}
                        placeholder=""
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="coupon-metadata">Metadata (JSON)</Label>
                <Textarea
                    id="coupon-metadata"
                    rows={3}
                    value={form.metadataInput}
                    onChange={(event) => setForm((prev) => ({ ...prev, metadataInput: event.target.value }))}
                    placeholder='{ "key": "value" }'
                />
                <p className="text-xs text-muted-foreground">Optional metadata applied when redeeming the coupon.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" disabled={pending} onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                    {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {pending ? 'Saving…' : mode === 'create' ? 'Create coupon' : 'Save changes'}
                </Button>
            </div>
        </form>
    )
}
