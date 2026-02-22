import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@authlance/ui/lib/browser/components/card'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { PaymentTierDto, PricingTierDto, TierVariant } from '@authlance/common/lib/common/types/subscriptions'
import { cn } from '@authlance/ui/lib/browser/utils/cn'
import { Check } from 'lucide-react'

export interface TierCardProps {
    tier: PaymentTierDto
    selected?: boolean
    isCurrent?: boolean
    onSelect: (tier: PaymentTierDto) => void
    disabled?: boolean
}

const formatTierRange = (tier: PricingTierDto, index: number, tiers: PricingTierDto[]): string => {
    const prev = index > 0 ? tiers[index - 1].upTo : 0
    const from = prev + 1
    if (tier.upTo === 0) {
        return `${from}+`
    }
    if (from === tier.upTo) {
        return `${from}`
    }
    return `${from}–${tier.upTo}`
}

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
        if (disabled || isCurrent) { return }
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
