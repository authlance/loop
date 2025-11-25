import React, { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import axios from 'axios'
import {
    AdminApi,
    Configuration,
    GithubComAuthlanceLicenseoperatorPkgDomainPricingTier,
    GithubComAuthlanceLicenseoperatorPkgPaymentsCreateCheckoutSessionRequest,
    GithubComAuthlanceLicenseoperatorPkgPaymentsStripeCheckoutSessionResponse,
    GithubComAuthlanceLicenseoperatorPkgPaymentsPaymentRecord,
    GithubComAuthlanceLicenseoperatorPkgPaymentsPaymentsPage,
    InternalHttpControllerCouponRequest,
    InternalHttpControllerCouponListResponse,
    InternalHttpControllerCouponResponse,
    InternalHttpControllerPaginatedLicenseList,
    InternalHttpControllerProductKeyItem,
    InternalHttpControllerProductKeyListResponse,
    InternalHttpControllerProductListResponse,
    InternalHttpControllerPricingTierRequest,
    InternalHttpControllerProductRequest,
    InternalHttpControllerProductResponse,
    LicenseApi,
    PaymentsApi,
    PublicApi,
} from '../../common/authlance-licenses'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { LicenseProduct } from '../../common/license-products'

const resolveDefaultLicenseBaseUrl = () =>
    (process.env.LICENSE_OPERATOR_API_URL && process.env.LICENSE_OPERATOR_API_URL.trim()) ||
    (process.env.API_URL && process.env.API_URL.trim()) ||
    'http://localhost:3000'

export const INITIAL_LICENSE_BASE_URL = resolveDefaultLicenseBaseUrl()

const buildConfiguration = (basePath: string, token?: string) =>
    new Configuration({
        basePath,
        baseOptions: {
            withCredentials: true,
            timeout: 10000,
            ...(token
                ? {
                      headers: {
                          Authorization: `Bearer ${token}`,
                      },
                  }
                : {}),
        },
    })

const createPublicApi = (basePath: string) => new PublicApi(buildConfiguration(basePath))
const createAdminApi = (basePath: string, token?: string) => new AdminApi(buildConfiguration(basePath, token))
const createLicenseApi = (basePath: string, token?: string) => new LicenseApi(buildConfiguration(basePath, token))
const createPaymentsApi = (basePath: string, token?: string) => new PaymentsApi(buildConfiguration(basePath, token))

const normalizeToken = (raw: unknown): string | undefined => {
    if (!raw) {
        return undefined
    }
    if (typeof raw === 'string') {
        return raw
    }
    if (typeof raw === 'object' && 'token' in (raw as Record<string, unknown>)) {
        const value = (raw as { token?: unknown }).token
        return typeof value === 'string' ? value : undefined
    }
    return undefined
}

export type PaginatedLicenseList = InternalHttpControllerPaginatedLicenseList
export type LicenseAdminProduct = InternalHttpControllerProductResponse
export type LicenseAdminProductList = InternalHttpControllerProductListResponse
export type LicenseAdminProductRequest = InternalHttpControllerProductRequest
export type LicenseAdminProductKey = InternalHttpControllerProductKeyItem
export type LicenseAdminProductKeyList = InternalHttpControllerProductKeyListResponse
export type LicensePricingTier = GithubComAuthlanceLicenseoperatorPkgDomainPricingTier
export type LicensePricingTierRequest = InternalHttpControllerPricingTierRequest
export type LicensePricingMode = 'fixed' | 'tiered'
export type LicenseAdminCoupon = InternalHttpControllerCouponResponse
export type LicenseAdminCouponList = InternalHttpControllerCouponListResponse
export type LicenseAdminCouponRequest = InternalHttpControllerCouponRequest
export type LicenseDownloadPayload = string
export interface LicenseDownloadOptions {
    fileName?: string
}

export type { LicenseProduct, LicensePublicProduct } from '../../common/license-products'
export { deriveLookupKey, withDerivedLookupKey } from '../../common/license-products'

export interface LicenseListQuery {
    page?: number
    pageSize?: number
    plan?: string
}

export type PaymentRecord = GithubComAuthlanceLicenseoperatorPkgPaymentsPaymentRecord
export type PaymentsPage = GithubComAuthlanceLicenseoperatorPkgPaymentsPaymentsPage

export interface PaymentsQuery {
    name?: string
    organizationName?: string
    from?: string
    to?: string
    page?: number
    pageSize?: number
}

export interface PaymentsExportResult {
    blob: Blob
    fileName?: string
}

export type LicenseCheckoutSessionPayload = GithubComAuthlanceLicenseoperatorPkgPaymentsCreateCheckoutSessionRequest

export type LicenseCheckoutSessionResponse =
    GithubComAuthlanceLicenseoperatorPkgPaymentsStripeCheckoutSessionResponse & {
        url: string
    }

export class LicenseOperatorError extends Error {
    status?: number
    details?: unknown

    constructor(message: string, status?: number, details?: unknown) {
        super(message)
        this.name = 'LicenseOperatorError'
        this.status = status
        this.details = details
    }
}

const extractErrorMessage = (details: unknown): string | undefined => {
    if (!details) {
        return undefined
    }
    if (typeof details === 'string') {
        const trimmed = details.trim()
        return trimmed.length > 0 ? trimmed : undefined
    }
    if (typeof details === 'object') {
        if ('error' in (details as Record<string, unknown>)) {
            const value = (details as { error?: unknown }).error
            if (typeof value === 'string' && value.trim() !== '') {
                return value.trim()
            }
        }
        if ('message' in (details as Record<string, unknown>)) {
            const value = (details as { message?: unknown }).message
            if (typeof value === 'string' && value.trim() !== '') {
                return value.trim()
            }
        }
    }
    return undefined
}

export const toLicenseOperatorError = (error: unknown, fallback: string): LicenseOperatorError => {
    if (error instanceof LicenseOperatorError) {
        return error
    }
    if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const details = error.response?.data
        const message =
            extractErrorMessage(details) ||
            (typeof error.message === 'string' && error.message.trim() !== '' ? error.message.trim() : undefined) ||
            fallback
        return new LicenseOperatorError(message, status, details)
    }
    if (error instanceof Error) {
        return new LicenseOperatorError(error.message || fallback)
    }
    return new LicenseOperatorError(fallback)
}

interface LicensesSdkContextValue {
    baseUrl: string
    publicApi: PublicApi
    adminApi?: AdminApi
    licenseApi?: LicenseApi
    paymentsApi?: PaymentsApi
}

const LicensesSdkContext = createContext<LicensesSdkContextValue>({
    baseUrl: INITIAL_LICENSE_BASE_URL,
    publicApi: createPublicApi(INITIAL_LICENSE_BASE_URL),
    adminApi: undefined,
    licenseApi: undefined,
    paymentsApi: undefined,
})

interface LicensesProviderProps {
    baseUrl?: string
}

export const LicensesProvider: React.FC<PropsWithChildren<LicensesProviderProps>> = ({ children }) => {
    const { user, token, personalAccessToken } = useContext(SessionContext)
    const baseUrl = useMemo(() => resolveDefaultLicenseBaseUrl(), [])

    const bearerToken = useMemo(() => {
        const normalized = normalizeToken(token) || normalizeToken(personalAccessToken)
        return normalized
    }, [token, personalAccessToken])

    const publicApi = useMemo(() => createPublicApi(baseUrl), [baseUrl])
    const adminApi = useMemo(() => {
        if (!user && !bearerToken) {
            return undefined
        }
        return createAdminApi(baseUrl, user ? undefined : bearerToken)
    }, [baseUrl, bearerToken, user])
    const licenseApi = useMemo(() => {
        if (!user && !bearerToken) {
            return undefined
        }
        return createLicenseApi(baseUrl, user ? undefined : bearerToken)
    }, [baseUrl, bearerToken, user])

    const paymentsApi = useMemo(() => {
        if (!user && !bearerToken) {
            return undefined
        }
        return createPaymentsApi(baseUrl, user ? undefined : bearerToken)
    }, [baseUrl, bearerToken, user])

    const value = useMemo<LicensesSdkContextValue>(
        () => ({
            baseUrl,
            publicApi,
            adminApi,
            licenseApi,
            paymentsApi,
        }),
        [baseUrl, publicApi, adminApi, licenseApi, paymentsApi]
    )

    return <LicensesSdkContext.Provider value={value}>{children}</LicensesSdkContext.Provider>
}

export const useLicensesSdk = () => useContext(LicensesSdkContext)

export const buildCheckoutUrl = (product: LicenseProduct | undefined, group?: string): string | undefined => {
    if (!product || !product.publicBaseUrl) {
        return undefined
    }
    try {
        const url = new URL(product.publicBaseUrl)
        if (product.priceId && !url.searchParams.has('priceId')) {
            url.searchParams.set('priceId', product.priceId)
        }
        if (group && group.trim() !== '') {
            url.searchParams.set('group', group.trim())
        }
        return url.toString()
    } catch (error) {
        console.warn('Invalid checkout url from license operator', error)
        return undefined
    }
}

export const createLicenseCheckoutSession = async (
    paymentsApi: PaymentsApi | undefined,
    payload: LicenseCheckoutSessionPayload
): Promise<LicenseCheckoutSessionResponse> => {
    if (!paymentsApi) {
        throw new LicenseOperatorError('Authentication required to create a checkout session.')
    }

    try {
        const { data, status } = await paymentsApi.authlanceLicensePaymentsApiV1CheckoutSessionPost(payload)
        const url = typeof data?.url === 'string' ? data.url.trim() : undefined

        if (!url) {
            throw new LicenseOperatorError('License operator did not return a checkout URL.', status, data)
        }

        return { ...(data ?? {}), url } as LicenseCheckoutSessionResponse
    } catch (error) {
        throw toLicenseOperatorError(error, 'Failed to create checkout session.')
    }
}

const normalizePaymentsString = (value: string | undefined) => {
    if (!value) {
        return undefined
    }
    const trimmed = value.trim()
    return trimmed === '' ? undefined : trimmed
}

const normalizePaymentsDate = (value: string | undefined) => {
    if (!value) {
        return undefined
    }
    const trimmed = value.trim()
    return trimmed === '' ? undefined : trimmed
}

const ensurePaymentsApi = (paymentsApi: PaymentsApi | undefined) => {
    if (!paymentsApi) {
        throw new LicenseOperatorError('Authentication required to view payments.')
    }
    return paymentsApi
}

export const listPayments = async (
    paymentsApi: PaymentsApi | undefined,
    query: PaymentsQuery
): Promise<PaymentsPage> => {
    const client = ensurePaymentsApi(paymentsApi)
    const page = query.page && query.page > 0 ? query.page : 1
    const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 25
    const name = normalizePaymentsString(query.name)
    const organizationName = normalizePaymentsString(query.organizationName)
    const from = normalizePaymentsDate(query.from)
    const to = normalizePaymentsDate(query.to)

    try {
        const response = await client.authlanceLicensePaymentsApiV1ReportsPaymentsGet(
            from,
            to,
            undefined,
            organizationName,
            name,
            page,
            pageSize
        )
        const data = response.data ?? {}
        const items = Array.isArray(data.items) ? data.items : []

        return {
            items,
            page: typeof data.page === 'number' ? data.page : page,
            pageSize: typeof data.pageSize === 'number' ? data.pageSize : pageSize,
            total: typeof data.total === 'number' ? data.total : items.length,
        }
    } catch (error) {
        throw toLicenseOperatorError(error, 'Failed to load payments.')
    }
}

export const exportPaymentsReport = async (
    paymentsApi: PaymentsApi | undefined,
    query: PaymentsQuery
): Promise<PaymentsExportResult> => {
    const client = ensurePaymentsApi(paymentsApi)
    const name = normalizePaymentsString(query.name)
    const organizationName = normalizePaymentsString(query.organizationName)
    const from = normalizePaymentsDate(query.from)
    const to = normalizePaymentsDate(query.to)

    try {
        const response = await client.authlanceLicensePaymentsApiV1ReportsPaymentsExportGet(
            from,
            to,
            undefined,
            organizationName,
            name
        )
        const data = response.data
        const blob = data instanceof Blob ? data : new Blob([data ?? ''], { type: 'text/csv;charset=utf-8' })
        const fileName = data instanceof File && typeof data.name === 'string' ? data.name : undefined
        return { blob, fileName }
    } catch (error) {
        throw toLicenseOperatorError(error, 'Failed to export payments report.')
    }
}

const normalizeProductType = (value: unknown) => {
    if (typeof value !== 'string') {
        return ''
    }
    return value.trim().toLowerCase()
}

export const isSubscriptionProduct = (product: { type?: string } | undefined): boolean => {
    if (!product) {
        return false
    }
    return normalizeProductType(product.type) === 'subscription'
}

export const isOneOffProduct = (product: { type?: string } | undefined): boolean => {
    if (!product) {
        return false
    }
    return normalizeProductType(product.type) === 'one_off'
}

export const describeProductType = (product: { type?: string } | undefined): string => {
    if (isSubscriptionProduct(product)) {
        return 'Subscription'
    }
    if (isOneOffProduct(product)) {
        return 'One-off'
    }
    return 'Unknown'
}

const normalizePricingMode = (value: unknown): LicensePricingMode | undefined => {
    if (typeof value !== 'string') {
        return undefined
    }
    const normalized = value.trim().toLowerCase()
    if (normalized === 'fixed' || normalized === 'tiered') {
        return normalized as LicensePricingMode
    }
    return undefined
}

export const isTieredPricing = (product: { pricingMode?: string } | undefined): boolean => {
    if (!product) {
        return false
    }
    return normalizePricingMode(product.pricingMode) === 'tiered'
}

export const isFixedPricing = (product: { pricingMode?: string } | undefined): boolean => {
    if (!product) {
        return false
    }
    return normalizePricingMode(product.pricingMode) === 'fixed'
}

export const describePricingMode = (product: { pricingMode?: string } | undefined): string => {
    if (isTieredPricing(product)) {
        return 'Tiered pricing'
    }
    if (isFixedPricing(product)) {
        return 'Fixed price'
    }
    return 'Pricing not configured'
}

const ensureAdminApi = (adminApi: AdminApi | undefined) => {
    if (!adminApi) {
        throw new LicenseOperatorError('Admin access required for this operation.')
    }
    return adminApi
}

const normalizeSlug = (slug: string) => slug.trim()

export const createAdminProduct = async (
    adminApi: AdminApi | undefined,
    payload: LicenseAdminProductRequest
): Promise<LicenseAdminProduct> => {
    const client = ensureAdminApi(adminApi)
    try {
        const response = await client.authlanceLicenseAdminProductsPost(payload)
        return response.data
    } catch (error) {
        throw toLicenseOperatorError(error, 'Failed to create product.')
    }
}

export const updateAdminProduct = async (
    adminApi: AdminApi | undefined,
    slug: string,
    payload: LicenseAdminProductRequest
): Promise<LicenseAdminProduct> => {
    const client = ensureAdminApi(adminApi)
    const normalizedSlug = normalizeSlug(slug)
    if (!normalizedSlug) {
        throw new LicenseOperatorError('A product slug is required to update a product.')
    }
    try {
        const response = await client.authlanceLicenseAdminProductsSlugPut(normalizedSlug, payload)
        return response.data
    } catch (error) {
        throw toLicenseOperatorError(error, 'Failed to update product.')
    }
}

export const createAdminProductCoupon = async (
    adminApi: AdminApi | undefined,
    slug: string,
    payload: LicenseAdminCouponRequest
): Promise<LicenseAdminCoupon> => {
    const client = ensureAdminApi(adminApi)
    const normalizedSlug = normalizeSlug(slug)
    if (!normalizedSlug) {
        throw new LicenseOperatorError('A product slug is required to create coupons.')
    }
    try {
        const response = await client.authlanceLicenseAdminProductsSlugCouponsPost(normalizedSlug, payload)
        return response.data
    } catch (error) {
        throw toLicenseOperatorError(error, 'Failed to create coupon.')
    }
}

export const updateAdminProductCoupon = async (
    adminApi: AdminApi | undefined,
    slug: string,
    couponId: number,
    payload: LicenseAdminCouponRequest
): Promise<LicenseAdminCoupon> => {
    const client = ensureAdminApi(adminApi)
    const normalizedSlug = normalizeSlug(slug)
    if (!normalizedSlug) {
        throw new LicenseOperatorError('A product slug is required to update coupons.')
    }
    if (!Number.isFinite(couponId) || couponId <= 0) {
        throw new LicenseOperatorError('A valid coupon id is required to update coupons.')
    }
    try {
        const response = await client.authlanceLicenseAdminProductsSlugCouponsCouponIdPut(
            normalizedSlug,
            couponId,
            payload
        )
        return response.data
    } catch (error) {
        throw toLicenseOperatorError(error, 'Failed to update coupon.')
    }
}

export const listAdminProductCoupons = async (
    adminApi: AdminApi | undefined,
    slug: string,
    includeInactive = true,
    page?: number,
    pageSize?: number
): Promise<LicenseAdminCouponList> => {
    const client = ensureAdminApi(adminApi)
    const normalizedSlug = normalizeSlug(slug)
    if (!normalizedSlug) {
        throw new LicenseOperatorError('A product slug is required to list coupons.')
    }
    try {
        const resolvedPage = page && page > 0 ? page : 1
    const resolvedPageSize = pageSize && pageSize > 0 ? pageSize : 10
        const response = await client.authlanceLicenseAdminProductsSlugCouponsGet(
            normalizedSlug,
            includeInactive,
            resolvedPage,
            resolvedPageSize
        )
        const data = response.data ?? {}
        const items = Array.isArray(data.items) ? data.items : []
        return { ...data, items }
    } catch (error) {
        throw toLicenseOperatorError(error, 'Failed to load coupons.')
    }
}

export const deleteAdminProductCoupon = async (
    adminApi: AdminApi | undefined,
    slug: string,
    couponId: number
): Promise<void> => {
    const client = ensureAdminApi(adminApi)
    const normalizedSlug = normalizeSlug(slug)
    if (!normalizedSlug) {
        throw new LicenseOperatorError('A product slug is required to delete coupons.')
    }
    if (!Number.isFinite(couponId) || couponId <= 0) {
        throw new LicenseOperatorError('A valid coupon id is required to delete coupons.')
    }
    try {
        await client.authlanceLicenseAdminProductsSlugCouponsCouponIdDelete(normalizedSlug, couponId)
    } catch (error) {
        throw toLicenseOperatorError(error, 'Failed to delete coupon.')
    }
}

const LICENSE_DOWNLOAD_MIME_TYPE = 'application/json'
const DEFAULT_LICENSE_DOWNLOAD_NAME = 'authlance.lic'

const ensureJsonFileName = (rawName: string): string => {
    const trimmed = rawName.trim()
    if (trimmed.toLowerCase().endsWith('.lic')) {
        return trimmed
    }
    return `${trimmed}.lic`
}

const resolveLicenseFileName = (options?: LicenseDownloadOptions): string => {
    const explicit = options?.fileName?.trim()
    if (explicit) {
        return ensureJsonFileName(explicit)
    }
    return DEFAULT_LICENSE_DOWNLOAD_NAME
}

const toLicenseBlob = (payload: LicenseDownloadPayload): Blob => {
    return new Blob([payload], { type: LICENSE_DOWNLOAD_MIME_TYPE })
}

export const triggerLicenseDownload = (payload: LicenseDownloadPayload, options?: LicenseDownloadOptions) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        throw new Error('Downloads are only available in a browser context')
    }
    const blob = toLicenseBlob(payload)
    const downloadName = resolveLicenseFileName(options)
    const link = document.createElement('a')
    const objectUrl = window.URL.createObjectURL(blob)
    link.href = objectUrl
    link.download = downloadName
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(objectUrl)
}

export interface FormatLicensePriceOptions {
    managedProducts?: number
}

const clampManagedProducts = (raw: number | undefined): number | undefined => {
    if (typeof raw !== 'number' || !Number.isFinite(raw)) {
        return undefined
    }
    const normalized = Math.floor(raw)
    if (normalized <= 0) {
        return undefined
    }
    return normalized
}

const selectPricingTier = (tiers: LicensePricingTier[], managedProducts: number): LicensePricingTier | undefined => {
    if (managedProducts < 0) {
        managedProducts = 0
    }
    let fallback: LicensePricingTier | undefined
    for (const tier of tiers) {
        if (typeof tier.upperBound !== 'number') {
            if (!fallback) {
                fallback = tier
            }
            continue
        }
        if (managedProducts <= tier.upperBound) {
            return tier
        }
    }
    return fallback
}

const tierAmount = (tier: LicensePricingTier, baseAmount: number, managedProducts: number): number => {
    if (baseAmount < 0) {
        baseAmount = 0
    }
    if (managedProducts < 0) {
        managedProducts = 0
    }

    if (typeof tier.amount === 'number' && tier.amount > 0) {
        return tier.amount
    }

    let amount = baseAmount
    if (typeof tier.factor === 'number') {
        amount = Math.round(baseAmount * tier.factor)
    }

    if (tier.perUnit) {
        return amount * managedProducts
    }

    return amount
}

const calculateAmountFromTiers = (
    tiers: LicensePricingTier[],
    baseAmount: number,
    managedProducts: number
): number | undefined => {
    if (!Array.isArray(tiers) || tiers.length === 0) {
        return undefined
    }
    const tier = selectPricingTier(tiers, managedProducts)
    if (!tier) {
        return undefined
    }
    return tierAmount(tier, baseAmount, managedProducts)
}

const calculateDefaultTieredAmount = (baseAmount: number, managedProducts: number): number => {
    if (baseAmount <= 0) {
        return 0
    }
    const count = managedProducts < 0 ? 0 : managedProducts
    if (count <= 3) {
        return baseAmount
    }
    if (count <= 10) {
        return baseAmount * 10
    }
    if (count <= 15) {
        return baseAmount * 15
    }
    const numerator = baseAmount * 4 * count
    return Math.floor((numerator + 2) / 5)
}

export const getLicenseAmount = (
    product:
        | undefined
        | {
              unitAmount?: number | null
              baseAmount?: number | null
              pricingMode?: string | null
              pricingTiers?: LicensePricingTier[] | null
          },
    options?: FormatLicensePriceOptions
): number | undefined => {
    if (!product) {
        return undefined
    }

    const pricingMode = normalizePricingMode(product.pricingMode)
    const numericUnit = typeof product.unitAmount === 'number' ? product.unitAmount : undefined
    const numericBase = typeof product.baseAmount === 'number' ? product.baseAmount : undefined

    if (pricingMode === 'fixed' || !pricingMode) {
        return typeof numericUnit === 'number' && numericUnit >= 0 ? numericUnit : undefined
    }

    if (pricingMode === 'tiered') {
        const managed = clampManagedProducts(options?.managedProducts)
        if (typeof managed !== 'number') {
            return undefined
        }

        const tiers = Array.isArray(product.pricingTiers) ? product.pricingTiers : []
        if (tiers.length > 0) {
            const amount = calculateAmountFromTiers(tiers, numericBase ?? 0, managed)
            return typeof amount === 'number' && amount >= 0 ? amount : undefined
        }

        if (typeof numericBase === 'number') {
            const amount = calculateDefaultTieredAmount(numericBase, managed)
            return amount >= 0 ? amount : undefined
        }
    }

    return undefined
}

export const formatLicensePrice = (
    product:
        | undefined
        | {
              currency?: string
              unitAmount?: number | null
              baseAmount?: number | null
              pricingMode?: string | null
              pricingTiers?: LicensePricingTier[] | null
          },
    options?: FormatLicensePriceOptions
) => {
    if (!product || !product.currency) {
        return undefined
    }

    const currency = product.currency.toUpperCase()
    const numericUnit = typeof product.unitAmount === 'number' ? product.unitAmount : undefined
    const numericBase = typeof product.baseAmount === 'number' ? product.baseAmount : undefined
    const pricingMode = normalizePricingMode(product.pricingMode)
    const hasTiers = Array.isArray(product.pricingTiers) && product.pricingTiers.length > 0

    const formatAmount = (amount: number) => {
        try {
            const formatter = new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            })
            return formatter.format(amount / 100)
        } catch (error) {
            console.warn('Unable to format license price', error)
            return `${amount / 100} ${currency}`
        }
    }

    if (pricingMode === 'tiered') {
        const explicitAmount = getLicenseAmount(product, options)
        if (typeof explicitAmount === 'number') {
            return formatAmount(explicitAmount)
        }

        const reference = numericBase ?? numericUnit
        if (typeof reference === 'number' && reference > 0) {
            const formatted = formatAmount(reference)
            return hasTiers ? `Tiered from ${formatted}` : `Tiered (${formatted})`
        }
        return 'Tiered'
    }

    if (typeof numericUnit === 'number') {
        return formatAmount(numericUnit)
    }

    return undefined
}

export const formatCurrencyAmount = (currency: string | undefined, amount?: number) => {
    if (!currency || typeof amount !== 'number') {
        return undefined
    }

    const value = amount / 100

    try {
        const formatter = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        return formatter.format(value)
    } catch (error) {
        console.warn('Unable to format currency amount', error)
        return `${value.toFixed(2)} ${currency.toUpperCase()}`
    }
}
