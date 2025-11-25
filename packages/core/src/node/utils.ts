import { QueryClient, QueryKey } from '@tanstack/react-query'
import { CachePayload, QueryHydrationEntry } from '../common/routes/routes'

export const DEFAULT_CACHE_TTL_MS = 15 * 60 * 1000

export function collectHydrationEntries(client: QueryClient): CachePayload {
    const entries: QueryHydrationEntry[] = client
        .getQueryCache()
        .getAll()
        .map(query => ({
            queryKey: query.queryKey as QueryKey,
            data: query.state.data,
        }))
        .filter((entry): entry is QueryHydrationEntry => entry.data !== undefined)
    return { entries }
}

export function parseHydrationEntries(payload: Partial<CachePayload>): QueryHydrationEntry[] {
    if (!payload || typeof payload !== 'object') {
        return []
    }
    const candidate = payload
    if (!Array.isArray(candidate.entries)) {
        return []
    }
    return candidate.entries.filter(isQueryHydrationEntry)
}

function isQueryHydrationEntry(entry: unknown): entry is QueryHydrationEntry {
    if (!entry || typeof entry !== 'object') {
        return false
    }
    const candidate = entry as Partial<QueryHydrationEntry>
    const validKey = Array.isArray(candidate.queryKey) || typeof candidate.queryKey === 'string'
    return validKey && Object.prototype.hasOwnProperty.call(candidate, 'data') && candidate.data !== undefined
}

export function applyHydrationEntries(client: QueryClient, entries: QueryHydrationEntry[]): string[] {
    const applied: string[] = []
    for (const entry of entries) {
        client.setQueryData(entry.queryKey, entry.data)
        applied.push(JSON.stringify(entry.queryKey))
    }
    return applied
}

