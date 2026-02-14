import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@authlance/ui/lib/browser/components/card'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { PaymentTierDto, PricingTierDto } from '@authlance/common/lib/common/types/subscriptions'
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
    const formatPrice = (price: number, cycle: string) => {
        return `$${price.toFixed(2)}/${cycle}`
    }

    return (
        <Card
            className={cn(
                'flex flex-col cursor-pointer transition-all',
                selected && 'ring-2 ring-primary',
                isCurrent && 'bg-muted',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !disabled && !isCurrent && onSelect(tier)}
        >
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{tier.tierName}</CardTitle>
                    {selected && <Check className="h-5 w-5 text-primary" />}
                </div>
                <div className="text-2xl font-bold">
                    {formatPrice(tier.price, tier.billingCycle)}
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <CardDescription>{tier.tierDescription}</CardDescription>
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
                    <Button variant="outline" disabled className="w-full">
                        Current Plan
                    </Button>
                ) : (
                    <Button
                        variant={selected ? 'default' : 'outline'}
                        className="w-full"
                        onClick={(e) => {
                            e.stopPropagation()
                            if (!disabled) {
                                onSelect(tier)
                            }
                        }}
                        disabled={disabled}
                    >
                        {selected ? 'Selected' : 'Select'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
