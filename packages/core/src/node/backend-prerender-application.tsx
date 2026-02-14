import React from 'react'
import { inject, injectable, named, postConstruct, interfaces } from 'inversify'
import { renderToString } from 'react-dom/server'
import { QueryClient, QueryClientProvider, dehydrate } from '@tanstack/react-query'
import yargs from 'yargs'
import path from 'path'
import fs from 'fs-extra'
import { ContributionProvider } from '../common/contribution-provider'
import { RouteContribution, RoutePrerenderConfig, RoutesApplicationContribution, RoutesProvider, RoutePrerenderContext, RoutePrerenderContextContribution, RoutePrerenderDocumentDefinition, RouteDocumentTagDefinition, PrerenderCacheContribution, PrerenderCache, runPrerenderCacheLayer } from '../common/routes/routes'
import { LoopContainer } from '../common/common'
import { initializeStore, setStoreInstance, AppStore, RootState } from '../browser/store'
import { SessionContext, AuthSession } from '../browser/hooks/useAuth'
import { Debouncer } from '../browser/common/utils'
import { NavigateHandler, PathProvider } from '../browser/common/common'
import { authlanceFactory } from '../browser/common/authlance-sdk'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { buildRouteObjects } from '../browser/routes'
import { Provider } from 'react-redux'
import { setContainer } from '../browser/store/slices/app-slice'
import { CliContribution } from './cli'
import LayoutContainer from '../browser/containers/LayoutContainer'
import { ApplicationConfig } from './backend-application'
import { parse } from 'comment-json'

export interface PrerenderRouteEntry {
    route: RouteContribution
    config: RoutePrerenderConfig
    outputPath: string
}

interface NormalizedRouteDocumentTag {
    attributes: Record<string, string>
}

interface NormalizedRouteDocumentDefinition {
    title?: string
    meta: NormalizedRouteDocumentTag[]
    links: NormalizedRouteDocumentTag[]
}

const defaultPort = 3000
const defaultHost = 'localhost'
const defaultConfig = 'app-config.json'

@injectable()
export class PrerendererApplicationCliContribution implements CliContribution {
    port: number
    hostname: string | undefined
    appConfig: string | undefined

    configure(conf: yargs.Argv): void {
        conf.option('port', {
            alias: 'p',
            description: 'The port the backend server listens on.',
            type: 'number',
            default: defaultPort,
        })
        conf.option('hostname', {
            alias: 'h',
            description: 'The allowed hostname for connections.',
            type: 'string',
            default: defaultHost,
        })
        conf.option('config', {
            alias: 'cfg',
            description: 'The json config for the application.',
            type: 'string',
            default: defaultConfig,
        })
    }

    setArguments(args: yargs.Arguments): void {
        const portArg = args.port
        this.port = typeof portArg === 'number' ? portArg : defaultPort

        const hostArg = args.hostname
        this.hostname = typeof hostArg === 'string' ? hostArg : defaultHost

        const configArg = args.config
        this.appConfig = typeof configArg === 'string' ? configArg : defaultConfig
    }

    protected appProjectPath(): string {
        return process.cwd()
    }
}

@injectable()
export class BackendPrerenderCliContribution extends PrerendererApplicationCliContribution {
    outputDirectory: string
    bundleName: string | undefined
    frontendBasePath: string | undefined

    configure(conf: yargs.Argv): void {
        super.configure(conf)
        const defaultOutput = path.resolve(this.appProjectPath(), 'prerender-output')
        conf.option('prerender-output', {
            alias: 'prerender-out',
            description: 'Directory to store prerendered output files.',
            type: 'string',
            default: defaultOutput,
        })
        conf.option('prerender-bundle', {
            description: 'Bundle file name to reference from prerendered pages.',
            type: 'string',
        })
        conf.option('prerender-base-path', {
            description: 'Base path used to prefix asset links in prerendered pages.',
            type: 'string',
        })
    }

    setArguments(args: yargs.Arguments): void {
        super.setArguments(args)
        const outputArg = typeof args['prerender-output'] === 'string'
            ? args['prerender-output']
            : (typeof args['prerender-out'] === 'string' ? args['prerender-out'] : undefined)
        const target = outputArg ?? path.resolve(this.appProjectPath(), 'prerender-output')
        this.outputDirectory = path.resolve(target)
        this.bundleName = typeof args['prerender-bundle'] === 'string' ? args['prerender-bundle'] : undefined
        this.frontendBasePath = typeof args['prerender-base-path'] === 'string' ? args['prerender-base-path'] : undefined
    }
}

@injectable()
export class BackendPrerenderApplication {
    protected routes: PrerenderRouteEntry[] = []
    protected prerenderParamsProviderInitialized = false
    protected prerenderParamsProvider: ContributionProvider<RoutePrerenderContextContribution> | undefined
    protected prerenderCacheProviderInitialized = false
    protected prerenderCacheProvider: ContributionProvider<PrerenderCacheContribution> | undefined
    protected cachedPersonalAccessToken: string | undefined
    protected prerenderCacheResolved = false
    protected resolvedPrerenderCache: PrerenderCache | undefined
    private noopPrerenderCache: PrerenderCache | undefined
    private config: ApplicationConfig

    constructor(
        @inject(BackendPrerenderCliContribution) protected readonly cliContribution: BackendPrerenderCliContribution,
        @inject(ContributionProvider) @named(RoutesApplicationContribution)
        protected readonly routeContributions: ContributionProvider<RoutesApplicationContribution>,
        @inject(RoutesProvider) protected readonly routesProvider: RoutesProvider,
        @inject(LoopContainer) protected readonly container: interfaces.Container
    ) {
        if (!this.cliContribution.appConfig) {
            throw new Error('Missing --config argument')
        }
        this.config = parse(fs.readFileSync(this.cliContribution.appConfig).toString()) as any
    }

    @postConstruct()
    protected async initializeOutputDirectory(): Promise<void> {
        await fs.ensureDir(this.cliContribution.outputDirectory)
    }

    async preRender(): Promise<void> {
        this.getPersonalAccessToken()
        this.routeContributions.getContributions()
        this.routesProvider.getRoutes() // Ensure routes are loaded
        if (!this.cliContribution.bundleName) {
            this.cliContribution.bundleName = this.config.frontEndBundleName ?? 'dashboard-bundle.js'
        }
        const allRoutes = this.routesProvider.getFlatRoutes()
        this.routes = allRoutes
            .filter(route => this.isPrerenderEligible(route))
            .map(route => ({
                route,
                config: route.prerender!,
                outputPath: this.resolveRouteOutputPath(route.path),
            }))
    }

    async start(): Promise<void> {
        for (const entry of this.routes) {
            await this.renderRoute(entry)
        }
    }

    protected resolveRouteOutputPath(routePath: string): string {
        const sanitized = routePath.replace(/^\//, '').replace(/:/g, '__') || 'index'
        const directory = sanitized === 'index'
            ? this.cliContribution.outputDirectory
            : path.join(this.cliContribution.outputDirectory, sanitized)
        return path.join(directory, 'index.html')
    }

    protected isPrerenderEligible(route: RouteContribution): route is RouteContribution & { prerender: RoutePrerenderConfig } {
        if (!route.prerender || !route.prerender.enabled) {
            return false
        }
        if (route.authRequired) {
            console.warn(`Skipping prerender for auth protected route: ${route.path}`)
            return false
        }
        return true
    }

    protected async renderRoute(entry: PrerenderRouteEntry): Promise<void> {
        const queryClient = new QueryClient()
        const store = initializeStore()
        setStoreInstance(store)
        store.dispatch(setContainer(this.container))

        const personalAccessToken = this.getPersonalAccessToken()
        const authSession = this.createAnonymousSession(entry.route.path, undefined, personalAccessToken)

        const context: RoutePrerenderContext = {
            authContext: authSession,
            queryClient,
            personalAccessToken,
            params: {},
            query: {},
            extraParams: {},
            route: entry.route,
            store,
        }
        await this.collectRouteExtraParams(entry.route, context)
        const cacheContributions = this.getPrerenderCacheContributions()
        if (cacheContributions.length > 0) {
            const cache = this.getPrerenderCache() ?? this.getFallbackPrerenderCache()
            await runPrerenderCacheLayer(context, cacheContributions, cache)
        }
        if (entry.config.preload) {
            await entry.config.preload(context)
        }
        const documentDefinition = await this.resolveRouteDocument(entry.config, context)

        const markup = this.renderMarkup(entry.route, queryClient, store, authSession)
        const dehydratedState = dehydrate(queryClient)
        const serializedQueryState = this.serialize(dehydratedState)
        const serializedStoreState = this.serialize(this.createSerializableStoreState(store))

        const html = this.composeDocument(markup, serializedStoreState, serializedQueryState, documentDefinition)
        await fs.ensureDir(path.dirname(entry.outputPath))
        await fs.writeFile(entry.outputPath, html)
        queryClient.clear()
    }

    protected getPersonalAccessToken(): string {
        if (this.cachedPersonalAccessToken) {
            return this.cachedPersonalAccessToken
        }
        const config = this.config
        const rawToken = config.pat
        if (typeof rawToken !== 'string' || rawToken.trim().length === 0) {
            throw new Error('Missing `config.pat` personal access token for prerendering')
        }
        this.cachedPersonalAccessToken = rawToken.trim()
        return this.cachedPersonalAccessToken
    }

    protected renderMarkup(route: RouteContribution, queryClient: QueryClient, store: AppStore, authSession: AuthSession): string {
        const routeObjects = buildRouteObjects(this.routesProvider.getRoutes(), (next) => this.routesProvider.getChildren(next))
        const router = createMemoryRouter(routeObjects, {
            initialEntries: [route.path],
            initialIndex: 0,
        })

        const element = (
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <SessionContext.Provider value={authSession}>
                        <LayoutContainer>
                            {({ theme }) => (
                                <div id="theme-wrapper" className={ theme === 'dark' ? 'h-full dark' : 'h-full'}>
                                    <RouterProvider router={router} />
                                </div>
                            )}
                        </LayoutContainer>
                    </SessionContext.Provider>
                </QueryClientProvider>
            </Provider>
        )

        try {
            return renderToString(element)
        } finally {
            router.dispose()
        }
    }

    protected async resolveRouteDocument(config: RoutePrerenderConfig, context: RoutePrerenderContext): Promise<NormalizedRouteDocumentDefinition | undefined> {
        if (!config.document) {
            return undefined
        }
        const definition = typeof config.document === 'function'
            ? await config.document(context)
            : config.document
        if (!definition) {
            return undefined
        }
        return this.normalizeDocumentDefinition(definition)
    }

    protected normalizeDocumentDefinition(document: RoutePrerenderDocumentDefinition): NormalizedRouteDocumentDefinition | undefined {
        if (!document || typeof document !== 'object') {
            return undefined
        }
        const title = typeof document.title === 'string' ? document.title : undefined
        const meta = this.normalizeDocumentTags(document.meta)
        const links = this.normalizeDocumentTags(document.links)
        if (!title && meta.length === 0 && links.length === 0) {
            return undefined
        }
        return {
            title,
            meta,
            links,
        }
    }

    protected normalizeDocumentTags(entries?: RouteDocumentTagDefinition[]): NormalizedRouteDocumentTag[] {
        if (!Array.isArray(entries)) {
            return []
        }
        const normalized: NormalizedRouteDocumentTag[] = []
        for (const entry of entries) {
            if (!entry || typeof entry !== 'object' || !entry.attributes) {
                continue
            }
            const normalizedAttributes: Record<string, string> = {}
            for (const [key, value] of Object.entries(entry.attributes)) {
                const attributeName = typeof key === 'string' ? key.trim() : ''
                if (!attributeName) {
                    continue
                }
                if (value === undefined || value === null) {
                    continue
                }
                normalizedAttributes[attributeName] = `${value}`
            }
            if (Object.keys(normalizedAttributes).length > 0) {
                normalized.push({ attributes: normalizedAttributes })
            }
        }
        return normalized
    }

    protected composeDocument(markup: string, storeState: string, queryState: string, document?: NormalizedRouteDocumentDefinition): string {
        const bundleName = this.config.frontEndBundleName ?? 'dashboard-bundle.js'
        const basePath = this.config.frontEndBasePath ?? '/'
        const defaultTitle = typeof this.config.applicationName === 'string' && this.config.applicationName.trim().length > 0
            ? this.config.applicationName
            : 'Loop'
        const resolvedTitle = document?.title ?? defaultTitle
        const scriptPath = this.resolveScriptPath(basePath, bundleName)
        const stylesheetHrefs = this.collectStylesheets(this.config.frontEndStylesheets, basePath, bundleName)
        const stylesheetMarkup = stylesheetHrefs.length
            ? `\n    ${stylesheetHrefs.map(href => `<link rel="stylesheet" href="${href}" />`).join('\n    ')}`
            : ''
        const metaMarkup = this.renderMetaTags(document?.meta)
        const linkMarkup = this.renderLinkTags(document?.links)

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${this.escapeHtml(resolvedTitle)}</title>${metaMarkup}${linkMarkup}${stylesheetMarkup}
</head>
<body>
    <div id="loop-preload">${markup}</div>
    <script>window.__PRERENDER_STORE__=${storeState};window.__PRERENDER_QUERY__=${queryState};</script>
    <script src="${scriptPath}" charset="utf-8"></script>
</body>
</html>`
    }

    protected renderMetaTags(entries?: NormalizedRouteDocumentTag[]): string {
        if (!entries || entries.length === 0) {
            return ''
        }
        return `\n    ${entries.map(entry => `<meta${this.renderAttributes(entry.attributes)} />`).join('\n    ')}`
    }

    protected renderLinkTags(entries?: NormalizedRouteDocumentTag[]): string {
        if (!entries || entries.length === 0) {
            return ''
        }
        return `\n    ${entries.map(entry => `<link${this.renderAttributes(entry.attributes)} />`).join('\n    ')}`
    }

    protected renderAttributes(attributes: Record<string, string>): string {
        const parts: string[] = []
        for (const [key, value] of Object.entries(attributes)) {
            if (!key) {
                continue
            }
            parts.push(`${key}="${this.escapeAttributeValue(value)}"`)
        }
        return parts.length > 0 ? ` ${parts.join(' ')}` : ''
    }

    protected escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;')
    }

    protected escapeAttributeValue(value: string): string {
        return this.escapeHtml(value).replace(/"/g, '&quot;')
    }

    protected serialize(value: unknown): string {
        return JSON.stringify(value).replace(/</g, '\\u003c')
    }

    protected resolveScriptPath(basePath: string | undefined, bundleName: string): string {
        const normalizedBundle = bundleName.replace(/^\/+/, '')
        if (!basePath || basePath === '.' || basePath === './') {
            return `./${normalizedBundle}`
        }
        if (basePath === '/' || basePath === '//') {
            return `/${normalizedBundle}`
        }
        const trimmed = basePath.replace(/\/+$/, '')
        const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
        return `${withLeadingSlash}/${normalizedBundle}`.replace(/\/{2,}/g, '/').replace(/\/$/, '')
    }

    protected collectStylesheets(configured: unknown, basePath: string | undefined, bundleName: string): string[] {
        const entries = this.normalizeStylesheetConfig(configured)
        const derived = this.deriveCssBundleName(bundleName)
        const resolved: string[] = []
        if (derived) {
            resolved.push(this.resolveStylesheetPath(basePath, derived))
        }
        for (const entry of entries) {
            resolved.push(this.resolveStylesheetPath(basePath, entry))
        }
        return Array.from(new Set(resolved.filter(href => href.length > 0)))
    }

    protected normalizeStylesheetConfig(value: unknown): string[] {
        if (!value) {
            return []
        }
        const entries = Array.isArray(value) ? value : [value]
        return entries
            .filter((entry): entry is string => typeof entry === 'string')
            .map(entry => entry.trim())
            .filter(entry => entry.length > 0)
    }

    protected deriveCssBundleName(bundleName: string | undefined): string | undefined {
        if (!bundleName) {
            return undefined
        }
        const [file, ...rest] = bundleName.split('?')
        const query = rest.length > 0 ? `?${rest.join('?')}` : ''
        if (!file) {
            return undefined
        }
        const normalized = file.endsWith('.js')
            ? `${file.slice(0, -3)}.css`
            : `${file}.css`
        return `${normalized}${query}`
    }

    protected resolveStylesheetPath(basePath: string | undefined, href: string): string {
        if (/^https?:\/\//i.test(href) || href.startsWith('//')) {
            return href
        }
        if (href.startsWith('/')) {
            return href
        }
        const normalizedHref = href.replace(/^\/+/, '')
        if (!basePath || basePath === '.' || basePath === './') {
            return `./${normalizedHref}`
        }
        if (basePath === '/' || basePath === '//') {
            return `/${normalizedHref}`
        }
        const trimmed = basePath.replace(/\/+$/, '')
        const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
        return `${withLeadingSlash}/${normalizedHref}`.replace(/\/{2,}/g, '/').replace(/\/$/, '')
    }

    protected createSerializableStoreState(store: AppStore): RootState {
        const state = store.getState()
        return {
            ...state,
            app: {
                ...state.app,
                container: undefined,
            },
        }
    }

    protected createAnonymousSession(currentPath: string, token?: string, personalAccessToken?: string): AuthSession {
        const emptyNavigate: NavigateHandler = {
            navigate: () => undefined,
        }
        const emptyPathProvider: PathProvider = {
            getCurrentPath: () => currentPath,
        }

        const bearerToken = personalAccessToken

        return {
            session: undefined,
            logoutUrl: undefined,
            token,
            personalAccessToken,
            loading: false,
            user: undefined,
            targetGroup: undefined,
            isSysAdmin: false,
            identityUser: undefined,
            pathProvider: emptyPathProvider,
            debouncer: new Debouncer(() => undefined, 750),
            navigateHandler: emptyNavigate,
            clearSession: () => Promise.resolve(),
            changeTargetGroup: () => undefined,
            setSessionNavigate: () => undefined,
            forceChallenge: () => undefined,
            verifySession: () => undefined,
            setSidebarToggle: () => undefined,
            sidebarToggle: () => undefined,
            setIdentity: () => undefined,
            authApi: authlanceFactory.authApi(bearerToken),
            usersApi: authlanceFactory.usersApi(bearerToken),
            groupsApi: authlanceFactory.groupsApi(bearerToken),
            adminApi: authlanceFactory.adminApi(bearerToken),
            licenseApi: authlanceFactory.licenseApi(bearerToken),
            subscriptionsApi: authlanceFactory.subscriptionsApi(bearerToken),
            personalAccessTokensApi: authlanceFactory.personalAccessTokensApi(bearerToken),
            paymentsApi: authlanceFactory.paymentsApi(bearerToken),
        }
    }

    protected async collectRouteExtraParams(route: RouteContribution, context: RoutePrerenderContext): Promise<Record<string, any>> {
        const provider = this.getRoutePrerenderParamsProvider()
        if (!provider) {
            return context.extraParams
        }
        const contributions = provider.getContributions() || []
        for (const contribution of contributions) {
            const params = await contribution.getParams(route, context)
            if (params && typeof params === 'object') {
                Object.assign(context.extraParams, params)
            }
        }
        return context.extraParams
    }

    protected getRoutePrerenderParamsProvider(): ContributionProvider<RoutePrerenderContextContribution> | undefined {
        if (this.prerenderParamsProviderInitialized) {
            return this.prerenderParamsProvider
        }
        this.prerenderParamsProviderInitialized = true
        if (this.container.isBoundNamed(ContributionProvider, RoutePrerenderContextContribution)) {
            this.prerenderParamsProvider = this.container
                .getNamed<ContributionProvider<RoutePrerenderContextContribution>>(ContributionProvider, RoutePrerenderContextContribution)
        }
        return this.prerenderParamsProvider
    }

    protected getPrerenderCacheContributionProvider(): ContributionProvider<PrerenderCacheContribution> | undefined {
        if (this.prerenderCacheProviderInitialized) {
            return this.prerenderCacheProvider
        }
        this.prerenderCacheProviderInitialized = true
        if (this.container.isBoundNamed(ContributionProvider, PrerenderCacheContribution)) {
            this.prerenderCacheProvider = this.container
                .getNamed<ContributionProvider<PrerenderCacheContribution>>(ContributionProvider, PrerenderCacheContribution)
        }
        return this.prerenderCacheProvider
    }

    protected getPrerenderCacheContributions(): PrerenderCacheContribution[] {
        const provider = this.getPrerenderCacheContributionProvider()
        if (!provider) {
            return []
        }
        return provider.getContributions() || []
    }

    protected getPrerenderCache(): PrerenderCache | undefined {
        if (this.prerenderCacheResolved) {
            return this.resolvedPrerenderCache
        }
        this.prerenderCacheResolved = true
        if (this.container.isBound(PrerenderCache)) {
            this.resolvedPrerenderCache = this.container.get<PrerenderCache>(PrerenderCache)
        }
        return this.resolvedPrerenderCache
    }

    protected getFallbackPrerenderCache(): PrerenderCache {
        if (!this.noopPrerenderCache) {
            this.noopPrerenderCache = {
                get: (): any => undefined,
                set: () => undefined,
                del: () => undefined,
                clear: () => undefined,
            }
        }
        return this.noopPrerenderCache
    }
}
