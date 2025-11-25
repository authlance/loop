import { useMemo } from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import {
    LicenseListQuery,
    LicenseProduct,
    LicensePublicProduct,
    LicenseAdminProductList,
    LicenseAdminProductKey,
    PaginatedLicenseList,
    withDerivedLookupKey,
} from '../common/licenses-sdk'
import {
    AdminApi,
    LicenseApi,
    PublicApi,
    type InternalHttpControllerSeatUsageResponse,
} from '../../common/authlance-licenses'

export const licenseProductQueryKey = ['authlance', 'licenses', 'product'] as const
export const publicProductsQueryKey = ['authlance', 'licenses', 'public', 'products'] as const
export const adminProductKeysQueryKey = ['authlance', 'licenses', 'admin', 'product-keys'] as const
export const adminSeatUsageQueryKey = ['authlance', 'licenses', 'admin', 'seat-usage'] as const

const buildGroupLicensesQueryKey = (groupName: string | undefined, query: LicenseListQuery) => [
    'authlance',
    'licenses',
    'groups',
    groupName ?? 'anonymous',
    query.page ?? 1,
    query.pageSize ?? 10,
    query.plan ?? null,
]

export const buildAdminProductsQueryKey = (
    includeInactive: boolean,
    includeInternal: boolean,
    page: number,
    pageSize: number
) =>
    [
        'authlance',
        'licenses',
        'admin',
        'products',
        includeInactive ? 'all' : 'active',
        includeInternal ? 'internal' : 'public',
        page,
        pageSize,
    ] as const

export interface AdminProductsQuery {
    includeInactive?: boolean
    includeInternal?: boolean
    page?: number
    pageSize?: number
}

export const useLicenseProduct = (publicApi?: PublicApi): UseQueryResult<LicenseProduct | undefined> => {
    return useQuery<LicenseProduct | undefined>({
        queryKey: licenseProductQueryKey,
        enabled: Boolean(publicApi),
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            if (!publicApi) {
                return undefined
            }
            const response = await publicApi.authlanceLicenseProductGet()
            return withDerivedLookupKey(response.data) as LicenseProduct | undefined
        },
    })
}

export const usePublicProducts = (publicApi?: PublicApi): UseQueryResult<LicensePublicProduct[] | undefined> => {
    return useQuery<LicensePublicProduct[] | undefined>({
        queryKey: publicProductsQueryKey,
        enabled: Boolean(publicApi),
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            if (!publicApi) {
                return undefined
            }
            const response = await publicApi.authlanceLicenseProductsGet()
            const data = response.data
            if (!Array.isArray(data)) {
                return []
            }
            return data.map((product) => withDerivedLookupKey(product) as LicensePublicProduct)
        },
    })
}

export const useAdminProductKeys = (
    adminApi: AdminApi | undefined
): UseQueryResult<LicenseAdminProductKey[] | undefined> => {
    return useQuery<LicenseAdminProductKey[] | undefined>({
        queryKey: adminProductKeysQueryKey,
        enabled: Boolean(adminApi),
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            if (!adminApi) {
                return undefined
            }
            const response = await adminApi.authlanceLicenseProductKeysGet()
            const data = response.data
            const items = Array.isArray(data?.keys) ? data?.keys : []
            const seen = new Set<string>()
            const normalized: LicenseAdminProductKey[] = []
            for (const entry of items) {
                const rawPriceMode =
                    typeof entry?.priceMode === 'string' ? entry.priceMode.trim().toLowerCase() : undefined
                const rawKey = typeof entry?.productKey === 'string' ? entry.productKey.trim() : ''
                if (rawKey === '') {
                    continue
                }
                const canonical = rawKey.toLowerCase()
                if (seen.has(canonical)) {
                    continue
                }
                seen.add(canonical)
                normalized.push({ productKey: canonical, priceMode: rawPriceMode, productType: entry.productType } )
            }
            return normalized
        },
    })
}

export const useAdminProducts = (
    adminApi: AdminApi | undefined,
    options: AdminProductsQuery = {}
): UseQueryResult<LicenseAdminProductList | undefined> => {
    const includeInactive = options.includeInactive ?? false
    const includeInternal = options.includeInternal ?? false
    const page = options.page && options.page > 0 ? options.page : 1
    const pageSize = options.pageSize && options.pageSize > 0 ? options.pageSize : 10

    return useQuery<LicenseAdminProductList | undefined>({
        queryKey: buildAdminProductsQueryKey(includeInactive, includeInternal, page, pageSize),
        enabled: Boolean(adminApi),
        keepPreviousData: true,
        staleTime: 30 * 1000,
        queryFn: async () => {
            if (!adminApi) {
                return undefined
            }
            const response = await adminApi.authlanceLicenseAdminProductsGet(
                includeInactive,
                includeInternal,
                page,
                pageSize
            )
            const data = response.data ?? {}
            const items = Array.isArray(data.items) ? data.items : []
            return { ...data, items }
        },
    })
}

export const useAdminSeatUsage = (
    adminApi: AdminApi | undefined
): UseQueryResult<InternalHttpControllerSeatUsageResponse | undefined> => {
    return useQuery<InternalHttpControllerSeatUsageResponse | undefined>({
        queryKey: adminSeatUsageQueryKey,
        enabled: Boolean(adminApi),
        staleTime: 30 * 1000,
        queryFn: async () => {
            if (!adminApi) {
                return undefined
            }
            const response = await adminApi.authlanceLicenseAdminProductsSeatUsageGet()
            return response.data
        },
    })
}

export const useGroupLicenses = (
    licenseApi: LicenseApi | undefined,
    groupName: string | undefined,
    query: LicenseListQuery
): UseQueryResult<PaginatedLicenseList | undefined> => {
    const normalizedQuery = useMemo(
        () => ({
            page: query.page ?? 1,
            pageSize: query.pageSize ?? 10,
            plan: query.plan,
        }),
        [query.page, query.pageSize, query.plan]
    )

    return useQuery<PaginatedLicenseList | undefined>({
        queryKey: buildGroupLicensesQueryKey(groupName, normalizedQuery),
        enabled: Boolean(licenseApi && groupName),
        keepPreviousData: true,
        staleTime: 60 * 1000,
        queryFn: async () => {
            if (!licenseApi || !groupName) {
                return undefined
            }
            const response = await licenseApi.authlanceLicenseGroupsGroupNameLicensesGet(
                groupName,
                normalizedQuery.page,
                normalizedQuery.pageSize,
                normalizedQuery.plan
            )
            return response.data
        },
    })
}
