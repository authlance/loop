export interface PricingTierDto {
    setupPrice: number
    unitPrice: number
    upTo: number
}

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
