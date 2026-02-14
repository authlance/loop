import React from 'react'
import { PaymentTierDto } from '@authlance/common/lib/common/types/subscriptions'
import { TierCard } from './TierCard'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { Card, CardContent, CardHeader } from '@authlance/ui/lib/browser/components/card'
import { DunaAuthCommonGroupSubscriptionsDto } from '@authlance/common/lib/common/authlance-client'

export interface TierSelectionStepProps {
    tiers: PaymentTierDto[]
    selectedTier: PaymentTierDto | null
    onSelectTier: (tier: PaymentTierDto) => void
    onContinue: () => void
    currentSubscription?: DunaAuthCommonGroupSubscriptionsDto
    title?: string
    continueLabel?: string
}

export const TierSelectionStep: React.FC<TierSelectionStepProps> = ({
    tiers,
    selectedTier,
    onSelectTier,
    onContinue,
    currentSubscription,
    title = 'Select Your Plan',
    continueLabel = 'Continue',
}) => {
    const isCurrentTier = (tier: PaymentTierDto) => {
        return currentSubscription?.tierName === tier.tierName
    }

    return (
        <div className="p-4">
            <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">{title}</h2>
                            {currentSubscription && (
                                <p className="text-sm text-muted-foreground">
                                    Current Plan: {currentSubscription.tierName}
                                </p>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {tiers.map((tier) => (
                                    <TierCard
                                        key={tier.lookupKey}
                                        tier={tier}
                                        selected={selectedTier?.lookupKey === tier.lookupKey}
                                        isCurrent={isCurrentTier(tier)}
                                        onSelect={onSelectTier}
                                    />
                                ))}
                            </div>
                            {currentSubscription && (
                                <p className="text-sm text-muted-foreground mb-4">
                                    Selecting a different plan will redirect you to manage your subscription.
                                </p>
                            )}
                            <div className="flex justify-end">
                                <Button
                                    onClick={onContinue}
                                    disabled={!selectedTier || (currentSubscription && isCurrentTier(selectedTier))}
                                >
                                    {continueLabel}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
