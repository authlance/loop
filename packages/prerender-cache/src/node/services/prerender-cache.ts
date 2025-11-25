import { injectable } from 'inversify'
import { PrerenderCache } from '@authlance/core/lib/common/routes/routes'
import { BackendApplicationContribution } from '@authlance/core/lib/node/backend-application'
import { TransientData } from '@authlance/sequelize/lib/node/model/transient-data-model'
import { Op } from 'sequelize'

@injectable()
export class SequelizePrerenderCache implements PrerenderCache, BackendApplicationContribution {
    private cleanupTimer?: NodeJS.Timeout
    private readonly defaultTtlMs = 60 * 60 * 1000 // 1 hour
    private readonly cleanupIntervalMs = 4 * 60 * 60 * 1000 // 4 hours
    private readonly keyPrefix = 'prerender::'
    private modelReadyPromise?: Promise<void>

    initialize(): void {
        this.startCleanup()
    }

    onStop(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer)
            this.cleanupTimer = undefined
        }
    }

    async get<T = unknown>(key: string): Promise<T | undefined> {
        const normalized = this.normalizeKey(key)
        await this.waitForModelReady()
        try {
            const row = await TransientData.findOne({
                where: {
                    key: normalized,
                },
            })
            if (!row) {
                return undefined
            }
            const expiresAt = row.expiresAt ? new Date(row.expiresAt).getTime() : undefined
            if (this.isExpired(expiresAt)) {
                await this.removeByKeys([normalized])
                return undefined
            }
            return JSON.parse(row.value) as T
        } catch (error) {
            console.warn('[PrerenderCache] Failed to load cache entry', normalized, error)
            return undefined
        }
    }

    async set<T = unknown>(key: string, value: T, ttlMs?: number): Promise<void> {
        const normalized = this.normalizeKey(key)
        const rawPayload = this.serializePayload(value, normalized)
        if (rawPayload === undefined) {
            return
        }
        await this.waitForModelReady()
        const expiresAt = this.computeExpiresAt(ttlMs)
        try {
            await TransientData.upsert({
                key: normalized,
                value: rawPayload,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            })
        } catch (error) {
            console.warn('[PrerenderCache] Failed to persist cache entry', normalized, error)
        }
    }

    async del(key: string): Promise<void> {
        const normalized = this.normalizeKey(key)
        await this.waitForModelReady()
        await this.removeByKeys([normalized])
    }

    async clear(): Promise<void> {
        await this.waitForModelReady()
        try {
            await TransientData.destroy({
                truncate: true,
            })
        } catch (error) {
            console.warn('[PrerenderCache] Failed to clear cache entries', error)
        }
    }

    private normalizeKey(key: string): string {
        return key.startsWith(this.keyPrefix) ? key : `${this.keyPrefix}${key}`
    }

    private resolveTtl(ttlMs?: number): number | undefined {
        if (typeof ttlMs === 'number' && ttlMs > 0) {
            return ttlMs
        }
        return this.defaultTtlMs
    }

    private computeExpiresAt(ttlMs?: number): number | undefined {
        const ttl = this.resolveTtl(ttlMs)
        if (!ttl) {
            return undefined
        }
        return Date.now() + ttl
    }

    private isExpired(expiresAt?: number): boolean {
        if (!expiresAt || expiresAt <= 0) {
            return false
        }
        return Date.now() >= expiresAt
    }

    private async removeByKeys(keys: string[]): Promise<void> {
        if (keys.length === 0) {
            return
        }
        await this.waitForModelReady()
        try {
            await TransientData.destroy({
                where: {
                    key: {
                        [Op.in]: keys,
                    },
                },
            })
        } catch (error) {
            console.warn('[PrerenderCache] Failed to remove cache entries', keys, error)
        }
    }

    private startCleanup(): void {
        if (this.cleanupTimer) {
            return
        }
        this.cleanupTimer = setInterval(() => {
            this.runSilently(this.deleteExpiredFromStorage())
        }, this.cleanupIntervalMs)
        if (typeof this.cleanupTimer.unref === 'function') {
            this.cleanupTimer.unref()
        }
        this.runSilently(this.deleteExpiredFromStorage())
    }

    private async deleteExpiredFromStorage(): Promise<void> {
        await this.waitForModelReady()
        try {
            await TransientData.destroy({
                where: {
                    expiresAt: {
                        [Op.lte]: new Date(),
                    },
                },
            })
        } catch (error) {
            console.warn('[PrerenderCache] Failed to prune expired cache entries', error)
        }
    }

    private serializePayload(value: unknown, key: string): string | undefined {
        try {
            const serialized = JSON.stringify(value)
            if (typeof serialized === 'undefined') {
                console.warn('[PrerenderCache] Skipping cache set for non-serializable payload', key)
                return undefined
            }
            return serialized
        } catch (error) {
            console.warn('[PrerenderCache] Failed to serialize payload for key', key, error)
            return undefined
        }
    }

    private runSilently(promise: Promise<unknown>): void {
        promise.catch((): void => {
            // Swallow errors from background cleanup
        })
    }

    private isModelReady(): boolean {
        return Boolean((TransientData as any)?.sequelize)
    }

    private async waitForModelReady(): Promise<void> {
        if (this.isModelReady()) {
            return
        }
        if (!this.modelReadyPromise) {
            this.modelReadyPromise = new Promise<void>((resolve) => {
                const poll = (): void => {
                    if (this.isModelReady()) {
                        this.modelReadyPromise = Promise.resolve()
                        resolve()
                        return
                    }
                    setTimeout(poll, 50)
                }
                poll()
            })
        }
        await this.modelReadyPromise
    }
}
