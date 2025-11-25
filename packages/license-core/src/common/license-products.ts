import {
    InternalHttpControllerProductDetailsResponse,
    InternalHttpControllerPublicProductResponse,
} from './authlance-licenses'

export type LicenseProduct = InternalHttpControllerProductDetailsResponse
export type LicensePublicProduct = InternalHttpControllerPublicProductResponse

const extractFromUrl = (rawUrl: string | undefined, ...keys: string[]): string | undefined => {
    if (!rawUrl) {
        return undefined
    }
    try {
        const url = new URL(rawUrl)
        for (const key of keys) {
            const value = url.searchParams.get(key)
            if (value && value.trim() !== '') {
                return value.trim()
            }
        }
    } catch (error) {
        console.warn('Failed to parse checkout URL while extracting lookup key', error)
    }
    return undefined
}

const normalizeLookupKeyValue = (value: unknown): string | undefined => {
    if (typeof value !== 'string') {
        return undefined
    }
    const trimmed = value.trim()
    return trimmed === '' ? undefined : trimmed
}

export const deriveLookupKey = (product: LicenseProduct | LicensePublicProduct | undefined): string | undefined => {
    if (!product) {
        return undefined
    }
    const record = product as Record<string, unknown>
    const directLookup = normalizeLookupKeyValue((product as { lookupKey?: string }).lookupKey)
    if (directLookup) {
        return directLookup
    }

    const snakeLookup = normalizeLookupKeyValue(record['lookup_key'])
    if (snakeLookup) {
        return snakeLookup
    }

    const fromUrl = extractFromUrl(
        (record['publicBaseUrl'] as string | undefined) ?? undefined,
        'lookupKey',
        'lookup_key',
        'priceId',
        'price_id'
    )
    if (fromUrl) {
        return fromUrl
    }

    const priceId = normalizeLookupKeyValue(record['priceId'])
    if (priceId) {
        return priceId
    }

    const stripePriceId = normalizeLookupKeyValue(record['stripePriceId'] ?? record['stripe_price_id'])
    if (stripePriceId) {
        return stripePriceId
    }

    return undefined
}

export function withDerivedLookupKey<T>(product: T | undefined): T | undefined {
    if (!product || typeof product !== 'object') {
        return product
    }

    const resolved = deriveLookupKey(product as LicenseProduct)

    if (!resolved) {
        return product
    }

    const current = normalizeLookupKeyValue((product as { lookupKey?: string }).lookupKey)
    if (current === resolved) {
        return product
    }

    return { ...(product as Record<string, unknown>), lookupKey: resolved } as T
}

