export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ProductDetails {
    id: string
    object: string
    active: boolean
    billing_scheme: string
    created: number
    currency: string
    custom_unit_amount: any
    livemode: boolean
    lookup_key: string
    metadata: Record<string, any>
    nickname: string | null
    product: {
        id: string
        object: string
        active: boolean
        attributes: string[]
        created: number
        default_price: string
        description: string | null
        images: string[]
        livemode: boolean
        marketing_features: string[]
        metadata: Record<string, any>
        name: string
        package_dimensions: any
        shippable: boolean | null
        statement_descriptor: string | null
        tax_code: string | null
        type: string
        unit_label: string | null
        updated: number
        url: string | null
    }
    recurring: {
        aggregate_usage: string | null
        interval: string
        interval_count: number
        meter: string | null
        trial_period_days: number | null
        usage_type: string
    }
    tax_behavior: string
    tiers: Tier[]
    tiers_mode: string | null
    transform_quantity: any
    type: string
    unit_amount: number | null
    unit_amount_decimal: string | null
}

export interface Tier {
    flat_amount: number | null
    flat_amount_decimal: string | null
    unit_amount: number | null
    unit_amount_decimal: string | null
    up_to: number | null
}
