import { inject, injectable, interfaces, named } from 'inversify'
import { ContributionProvider } from '../common'
import { renderStart } from './main'
import { WebSocketConnectionProvider } from './messaging'
import { QueryClient } from '@tanstack/react-query'
import { AppStore, getOrCreateStore, setStoreInstance } from './store'
import { setContainer } from './store/slices/app-slice'
import { getOrCreateQueryClient, setQueryClient } from './query-client'
import { FrontendApplicationContribution } from './frontend-contribution'

export { createQueryClient, getOrCreateQueryClient, setQueryClient } from './query-client'
export { BASE_DASHBOARD_PATH, BRAND_ICON, BRAND_LOGO } from './branding'
export { FrontendApplicationContribution, DefaultFrontendApplicationContribution } from './frontend-contribution'

export const API_URL = process.env.API_URL || 'http://localhost:3000'

export const queryClient = getOrCreateQueryClient()

export const bindContainerToStore = (container: interfaces.Container, store: AppStore = getOrCreateStore()): void => {
    store.dispatch(setContainer(container))
}

export interface FrontendRuntimeContext {
    store: AppStore
    queryClient: QueryClient
}

export interface FrontendRuntimeOptions {
    store?: AppStore
    queryClient?: QueryClient
}

export const configureFrontendRuntime = (options?: FrontendRuntimeOptions): FrontendRuntimeContext => {
    const store = options?.store ?? getOrCreateStore()
    setStoreInstance(store)
    const queryClientInstance = options?.queryClient ?? getOrCreateQueryClient()
    if (options?.queryClient) {
        setQueryClient(options.queryClient)
    }
    return {
        store,
        queryClient: queryClientInstance,
    }
}
/**
 * Clients can implement to get a callback for contributing widgets to a shell on start.
 */
@injectable()
export class FrontendApplication {
    public container: interfaces.Container
    constructor(
        @inject(ContributionProvider)
        @named(FrontendApplicationContribution)
        protected readonly contributions: ContributionProvider<FrontendApplicationContribution>,
        @inject(WebSocketConnectionProvider) protected connectionProvider: WebSocketConnectionProvider
    ) {}
    public async start(): Promise<void> {
        await this.startContributions()

        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return
        }

        await this.getHost()
        const preload = document.getElementById('loop-preload')
        if (!preload) {
            throw new Error('Loop preload element not found')
        }

        const runtime = configureFrontendRuntime()
        renderStart({
            mainProps: {
                store: runtime.store,
            },
        })
    }

    private getHost(): Promise<HTMLElement> {
        if (typeof document === 'undefined') {
            return Promise.reject(new Error('Document is not available'))
        }
        if (document.body) {
            return Promise.resolve(document.body)
        }
        return new Promise<HTMLElement>((resolve) =>
            window.addEventListener('load', () => resolve(document.body), { once: true })
        )
    }

    /**
     * Initialize and start the frontend application contributions.
     */
    protected async startContributions(): Promise<void> {
        for (const contribution of this.contributions.getContributions()) {
            if (contribution.initialize) {
                try {
                    contribution.initialize()
                } catch (error) {
                    console.error('Could not initialize contribution', error)
                }
            }
        }

        for (const contribution of this.contributions.getContributions()) {
            if (contribution.configure) {
                try {
                    await contribution.configure(this)
                } catch (error) {
                    console.error('Could not configure contribution', error)
                }
            }
        }

        for (const contribution of this.contributions.getContributions()) {
            if (contribution.onStart) {
                try {
                    await contribution.onStart(this)
                } catch (error) {
                    console.error('Could not start contribution', error)
                }
            }
        }
    }

    /**
     * Stop the frontend application contributions. This is called when the window is unloaded.
     */
    protected stopContributions(): void {
        console.info('>>> Stopping frontend contributions...')
        for (const contribution of this.contributions.getContributions()) {
            if (contribution.onStop) {
                try {
                    contribution.onStop(this)
                } catch (error) {
                    console.error('Could not stop contribution', error)
                }
            }
        }
        console.info('<<< All frontend contributions have been stopped.')
    }
}
