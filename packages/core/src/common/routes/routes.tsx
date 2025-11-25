import React from 'react'
import { User } from '../../browser/common/auth';
import { AuthSession } from '../../browser/hooks/useAuth';
import { QueryClient, QueryKey } from '@tanstack/react-query';
import { MaybePromise } from '../types';

export const RoutesApplicationContribution = Symbol('RoutesApplicationContribution');
export const PrerenderCache = Symbol('PrerenderCache')
export const PrerenderCacheContribution = Symbol('PrerenderCacheContribution')

export interface PrerenderCacheEntry<T = unknown> {
    value: T
    createdAt: number
    ttlMs?: number
}

export interface PrerenderCache {
    get<T = unknown>(key: string): MaybePromise<T | undefined>
    set<T = unknown>(key: string, value: T, ttlMs?: number): MaybePromise<void>
    del(key: string): MaybePromise<void>
    clear(): MaybePromise<void>
}

export class RouteCategory {
    constructor(
        public name: string,
        public icon: React.ReactElement,
        public weight?: number,
    ) {}
}

export interface RoutePrerenderContext {
    authContext?: AuthSession
    queryClient: QueryClient
    personalAccessToken?: string
    params?: Record<string, string>
    query?: Record<string, string | string[]>
    extraParams: Record<string, any>
    route?: RouteContribution
}

export interface RoutePrerenderConfig {
    enabled: boolean
    preload?: (context: RoutePrerenderContext) => MaybePromise<void>
    document?: RoutePrerenderDocumentDefinition | RoutePrerenderDocumentProvider
}

export const RoutePrerenderContextContribution = Symbol('RoutePrerenderContextContribution')

export type QueryHydrationEntry = {
    queryKey: QueryKey
    data: unknown
}

export interface CachePayload {
    entries: QueryHydrationEntry[]
}

export interface PrerenderCacheContribution {
    /**
     * Return `null` to skip caching for this route/context.
     */
    buildCacheKey(ctx: RoutePrerenderContext): string | null

    /**
     * Compute payload for cache miss. Must be pure I/O (no DOM).
     */
    load(ctx: RoutePrerenderContext): MaybePromise<CachePayload>

    /**
     * Map the loaded/cached payload into QueryClient keys.
     * Must return the list of set keys for observability.
     */
    hydrateQueryClient(ctx: RoutePrerenderContext, payload: unknown): MaybePromise<string[]>

    /**
     * Per-payload TTL. If undefined, use cache default.
     */
    ttlMs?: number
}

export interface RoutePrerenderContextContribution {
    getParams(route: RouteContribution, context: RoutePrerenderContext): MaybePromise<Record<string, any> | void>
}

export type RouteDocumentAttributeValue = string | number | boolean | null | undefined

export interface RouteDocumentTagDefinition {
    attributes: Record<string, RouteDocumentAttributeValue>
}

export interface RouteDocumentMetaDefinition extends RouteDocumentTagDefinition {}

export interface RouteDocumentLinkDefinition extends RouteDocumentTagDefinition {}

export interface RoutePrerenderDocumentDefinition {
    title?: string
    meta?: RouteDocumentMetaDefinition[]
    links?: RouteDocumentLinkDefinition[]
}

export type RoutePrerenderDocumentProvider = (context: RoutePrerenderContext) => MaybePromise<RoutePrerenderDocumentDefinition | undefined>

export interface RouteContribution {
    path: string
    name: string
    navBar: boolean
    icon?: React.ReactElement
    component: React.ComponentType
    pathProvider?: (user: User, targetGroup?: string) => string
    nameProvider?: (authContext: AuthSession) => string
    canGoBack?: boolean
    backPath?: (authContext: AuthSession) => string
    category?: RouteCategory
    roles?: string[]
    exact: boolean
    root: boolean
    authRequired: boolean
    forceParent?: string
    prerender?: RoutePrerenderConfig
}
export interface RoutesApplicationContribution {
    getRoute(): RouteContribution;
}

export const RoutesProvider = Symbol('RoutesProvider');
export interface RoutesProvider {
    getRoutes(): RouteContribution[]
    getFlatRoutes(): RouteContribution[]
    getChildren(route: RouteContribution): RouteContribution[]
    getRoute(path: string): RouteContribution | undefined
}

export async function runPrerenderCacheLayer(
    ctx: RoutePrerenderContext,
    contributions: PrerenderCacheContribution[],
    cache: PrerenderCache
): Promise<void> {
    for (const contribution of contributions) {
        const key = contribution.buildCacheKey(ctx)
        if (!key) {
            continue
        }

        let payload = await cache.get(key)
        const cacheMiss = payload === undefined
        if (cacheMiss) {
            payload = await contribution.load(ctx)
            await cache.set(key, payload, contribution.ttlMs)
        }
        try {
            await contribution.hydrateQueryClient(ctx, payload)
        } catch (error) {
            if (cacheMiss) {
                try {
                    await cache.del(key)
                } catch {
                    // Ignore cache eviction errors to preserve original failure
                }
            }
            throw error
        }
    }
}
