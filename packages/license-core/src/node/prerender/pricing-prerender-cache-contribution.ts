import { inject, injectable } from 'inversify'
import { QueryClient, QueryKey } from '@tanstack/react-query'
import { PrerenderCacheContribution, RoutePrerenderContext } from '@authlance/core/lib/common/routes/routes'
import { Configuration, PublicApi } from '../../common/authlance-licenses'
import { LicensePublicProduct, withDerivedLookupKey } from '../../common/license-products'
import { ApplicationConfigProvider } from '@authlance/core/lib/node/backend-application'

const PUBLIC_PRODUCTS_QUERY_KEY = ['authlance', 'licenses', 'public', 'products'] as const

type HydrationEntry = {
    queryKey: QueryKey
    data: unknown
}

type SerializedHydrationPayload = {
    entries: HydrationEntry[]
}

const DEFAULT_CACHE_TTL_MS = 15 * 60 * 1000

@injectable()
export class PricingPrerenderCacheContribution implements PrerenderCacheContribution {
    readonly ttlMs = DEFAULT_CACHE_TTL_MS

    constructor(
        @inject(ApplicationConfigProvider) protected readonly appConfig: ApplicationConfigProvider
    ) {
        
    }

    buildCacheKey(context: RoutePrerenderContext): string | null {
        if (context.route?.path !== '/pricing') {
            return null
        }
        return 'licenses::pricing::public-products'
    }

    async load(): Promise<SerializedHydrationPayload> {
        const stagingClient = new QueryClient()
        try {
            await stagingClient.prefetchQuery(PUBLIC_PRODUCTS_QUERY_KEY, () => this.fetchPublicProducts())
            return collectHydrationEntries(stagingClient)
        } finally {
            stagingClient.clear()
        }
    }

    async hydrateQueryClient(context: RoutePrerenderContext, payload: unknown): Promise<string[]> {
        const entries = parseHydrationEntries(payload)
        if (entries.length === 0) {
            return []
        }
        return applyHydrationEntries(context.queryClient, entries)
    }

    private async fetchPublicProducts(): Promise<LicensePublicProduct[] | undefined> {
        const api = this.createPublicApi()
        try {
            const response = await api.authlanceLicenseProductsGet()
            const items = Array.isArray(response.data) ? response.data : []
            return items.map((product) => withDerivedLookupKey(product) as LicensePublicProduct)
        } catch (error) {
            console.error('[PricingPrerenderCache] Failed to load public catalog', error)
            return undefined
        }
    }

    private createPublicApi(): PublicApi {
        const basePath = this.resolveBaseUrl()
        const configuration = new Configuration({
            basePath,
            baseOptions: {
                withCredentials: true,
                timeout: 10000,
            },
        })
        return new PublicApi(configuration)
    }

    private resolveBaseUrl(): string {
        const env = typeof process !== 'undefined' ? process.env ?? {} : {}
        if (env.LICENSE_OPERATOR_API_SSR_URL && env.LICENSE_OPERATOR_API_SSR_URL.trim()) {
            return env.LICENSE_OPERATOR_API_SSR_URL.trim()
        }
        const rootAppUrl = this.appConfig.config.rootAppUrl
        if (typeof rootAppUrl === 'string' && rootAppUrl.trim()) {
            return rootAppUrl.trim().replace(/\/+$/, '')
        }
        const raw =
            (typeof env.LICENSE_OPERATOR_API_URL === 'string' && env.LICENSE_OPERATOR_API_URL.trim()) ||
            (typeof env.API_URL === 'string' && env.API_URL.trim()) ||
            'http://localhost:3000'
        return raw.trim() || 'http://localhost:3000'
    }
}

function collectHydrationEntries(client: QueryClient): SerializedHydrationPayload {
    const entries: HydrationEntry[] = client
        .getQueryCache()
        .getAll()
        .map((query) => ({
            queryKey: query.queryKey as QueryKey,
            data: query.state.data,
        }))
        .filter((entry) => entry.data !== undefined)
    return { entries }
}

function parseHydrationEntries(payload: unknown): HydrationEntry[] {
    if (!payload || typeof payload !== 'object') {
        return []
    }
    const candidate = payload as Partial<SerializedHydrationPayload>
    if (!Array.isArray(candidate.entries)) {
        return []
    }
    return candidate.entries.filter(
        (entry): entry is HydrationEntry =>
            Boolean(entry && entry.queryKey && Object.prototype.hasOwnProperty.call(entry, 'data'))
    )
}

function applyHydrationEntries(client: QueryClient, entries: HydrationEntry[]): string[] {
    const applied: string[] = []
    for (const entry of entries) {
        client.setQueryData(entry.queryKey, entry.data)
        applied.push(JSON.stringify(entry.queryKey))
    }
    return applied
}
