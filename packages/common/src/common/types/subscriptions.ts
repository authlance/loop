export interface PricingTierDto {
    setupPrice: number
    unitPrice: number
    upTo: number
}

export interface PaymentTierDto {
    tierName: string
    maxMembers: number
    price: number
    billingCycle: string
    lookupKey: string
    tierDescription: string
    pricingTiers?: PricingTierDto[]
}
