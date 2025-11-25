import express from 'express'
import React from 'react'
import { dehydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { inject, injectable, interfaces, LazyServiceIdentifer } from 'inversify'
import { createMemoryRouter, matchPath, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { renderToString } from 'react-dom/server'
import { ApplicationConfig } from '@authlance/application-package'
import { ContributionProvider } from '../common/contribution-provider'
import { RoutesProvider, RouteContribution, RoutePrerenderConfig, RoutesApplicationContribution, RoutePrerenderContext, RoutePrerenderContextContribution, RoutePrerenderDocumentDefinition, RouteDocumentTagDefinition, PrerenderCacheContribution, PrerenderCache, runPrerenderCacheLayer } from '../common/routes/routes'
import { initializeStore, setStoreInstance, AppStore, RootState } from '../browser/store'
import { setContainer } from '../browser/store/slices/app-slice'
import { SessionContext, AuthSession } from '../browser/hooks/useAuth'
import { buildRouteObjects } from '../browser/routes'
import { NavigateHandler, PathProvider } from '../browser/common/common'
import { Debouncer } from '../browser/common/utils'
import { authlanceFactory } from '../browser/common/authlance-sdk'
import LayoutContainer from '../browser/containers/LayoutContainer'
import { ServerRenderContainerProvider } from './server-render-container-provider'
import { setQueryClient } from '../browser/query-client'
import { setPersonalAccessToken } from '../browser/store/slices/auth-slice'
import { LoopContainer } from '../common'
import { BASE_DASHBOARD_PATH as BASEDASHBOARDPATH, BRAND_ICON as BRANDICON, BRAND_LOGO as BRANDLOGO } from '../browser/branding'

export const HtmlRenderer = Symbol('HtmlRenderer')
export interface HtmlRenderer {
    render(request: express.Request, config: ApplicationConfig): Promise<string | undefined>
}

export const ServerRenderContainer = Symbol('ServerRenderContainer')

interface MatchedRoute {
    contribution: RouteContribution & { prerender: RoutePrerenderConfig }
    params: Record<string, string>
    pathname: string
    search: string
}

interface NormalizedRouteDocumentTag {
    attributes: Record<string, string>
}

interface NormalizedRouteDocumentDefinition {
    title?: string
    meta: NormalizedRouteDocumentTag[]
    links: NormalizedRouteDocumentTag[]
}

@injectable()
export class DefaultHtmlRenderer implements HtmlRenderer {

    protected routesProvider: RoutesProvider | undefined
    protected routesInitialized = false
    protected prerenderParamsProviderInitialized = false
    protected prerenderParamsProvider: ContributionProvider<RoutePrerenderContextContribution> | undefined
    protected containerVersion = -1
    protected prerenderCacheProviderInitialized = false
    protected prerenderCacheProvider: ContributionProvider<PrerenderCacheContribution> | undefined
    protected prerenderCacheResolved = false
    protected resolvedPrerenderCache: PrerenderCache | undefined
    private noopPrerenderCache: PrerenderCache | undefined

    constructor(
        @inject(ServerRenderContainer) protected readonly containerProvider: ServerRenderContainerProvider,
        @inject(new LazyServiceIdentifer(() => LoopContainer)) protected loopContainer: interfaces.Container,
    ) { }

    async render(request: express.Request, config: ApplicationConfig): Promise<string | undefined> {
        const container = this.getActiveContainer()
        const match = this.matchRequest(request, config, container)
        if (!match) {
            return undefined
        }

        const personalAccessToken = this.resolvePersonalAccessToken(config)
        const queryClient = new QueryClient()
        setQueryClient(queryClient)
        const store = initializeStore()
        setStoreInstance(store)
        store.dispatch(setContainer(container))

        const authSession = this.createAnonymousSession(`${match.pathname}${match.search}`, undefined, personalAccessToken)
        const contextQuery = this.extractQuery(request)
        store.dispatch(setPersonalAccessToken(personalAccessToken))
        const context: RoutePrerenderContext = {
            authContext: authSession,
            queryClient,
            personalAccessToken: config.pat,
            params: match.params,
            query: contextQuery,
            extraParams: {},
            route: match.contribution,
        }
        await this.collectRouteExtraParams(match.contribution, context, container)
        const cacheContributions = this.getPrerenderCacheContributions()
        if (cacheContributions.length > 0) {
            const cache = this.getPrerenderCache() ?? this.getFallbackPrerenderCache()
            await runPrerenderCacheLayer(context, cacheContributions, cache)
        }
        if (match.contribution.prerender.preload) {
            await match.contribution.prerender.preload(context)
        }
        const documentDefinition = await this.resolveRouteDocument(match.contribution.prerender, context)

        const markup = this.renderMarkup(match.pathname, match.search, queryClient, store, authSession, container)
        const dehydratedState = dehydrate(queryClient)
        const serializedQueryState = this.serialize(dehydratedState)
        const serializedStoreState = this.serialize(this.createSerializableStoreState(store))

        queryClient.clear()

        return this.composeDocument(markup, serializedStoreState, serializedQueryState, config, documentDefinition)
    }

    protected resolvePersonalAccessToken(config: ApplicationConfig): string {
        const rawToken = config?.pat
        if (typeof rawToken !== 'string' || rawToken.trim().length === 0) {
            throw new Error('Missing `config.pat` personal access token for HTML rendering')
        }
        return rawToken.trim()
    }

    protected matchRequest(request: express.Request, config: ApplicationConfig, container: interfaces.Container): MatchedRoute | undefined {
        const normalized = this.normalizeRequest(request, config)
        if (!normalized) {
            return undefined
        }
        const { pathname, search } = normalized
        const provider = this.getRoutesProvider(container)
        const routes = provider.getFlatRoutes()
        for (const contribution of routes) {
            if (!this.isRenderableRoute(contribution)) {
                continue
            }
            const matcher = matchPath({ path: contribution.path, end: contribution.exact !== false }, pathname)
            if (matcher) {
                const params: Record<string, string> = {}
                for (const [key, value] of Object.entries(matcher.params)) {
                    if (typeof value === 'string') {
                        params[key] = value
                    }
                }
                return {
                    contribution: contribution as RouteContribution & { prerender: RoutePrerenderConfig },
                    params,
                    pathname,
                    search,
                }
            }
        }
        return undefined
    }

    protected getRoutesProvider(container: interfaces.Container): RoutesProvider {
        if (!this.routesProvider) {
            this.routesProvider = container.get<RoutesProvider>(RoutesProvider)
        }
        if (!this.routesInitialized) {
            const contributionProvider = container.getNamed<ContributionProvider<RoutesApplicationContribution>>(ContributionProvider, RoutesApplicationContribution)
            contributionProvider.getContributions()
            this.routesProvider.getRoutes()
            this.routesInitialized = true
        }
        return this.routesProvider
    }

    protected async collectRouteExtraParams(route: RouteContribution, context: RoutePrerenderContext, container: interfaces.Container): Promise<Record<string, any>> {
        const provider = this.getRoutePrerenderParamsProvider(container)
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

    protected getRoutePrerenderParamsProvider(container: interfaces.Container): ContributionProvider<RoutePrerenderContextContribution> | undefined {
        if (this.prerenderParamsProviderInitialized) {
            return this.prerenderParamsProvider
        }
        this.prerenderParamsProviderInitialized = true
        if (container.isBoundNamed(ContributionProvider, RoutePrerenderContextContribution)) {
            this.prerenderParamsProvider = container
                .getNamed<ContributionProvider<RoutePrerenderContextContribution>>(ContributionProvider, RoutePrerenderContextContribution)
        }
        return this.prerenderParamsProvider
    }

    protected getPrerenderCacheContributionProvider(): ContributionProvider<PrerenderCacheContribution> | undefined {
        if (this.prerenderCacheProviderInitialized) {
            return this.prerenderCacheProvider
        }
        this.prerenderCacheProviderInitialized = true
        if (this.loopContainer.isBoundNamed(ContributionProvider, PrerenderCacheContribution)) {
            this.prerenderCacheProvider = this.loopContainer
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
        if (this.loopContainer.isBound(PrerenderCache)) {
            this.resolvedPrerenderCache = this.loopContainer.get<PrerenderCache>(PrerenderCache)
        }
        return this.resolvedPrerenderCache
    }

    protected getFallbackPrerenderCache(): PrerenderCache {
        if (!this.noopPrerenderCache) {
            this.noopPrerenderCache = {
                get: (_error): any => undefined,
                set: () => undefined,
                del: () => undefined,
                clear: () => undefined,
            }
        }
        return this.noopPrerenderCache
    }

    protected getActiveContainer(): interfaces.Container {
        const version = this.containerProvider.getVersion()
        if (this.containerVersion !== version) {
            this.routesProvider = undefined
            this.routesInitialized = false
            this.prerenderParamsProviderInitialized = false
            this.prerenderParamsProvider = undefined
            this.prerenderCacheProviderInitialized = false
            this.prerenderCacheProvider = undefined
            this.prerenderCacheResolved = false
            this.resolvedPrerenderCache = undefined
            this.noopPrerenderCache = undefined
            this.containerVersion = version
        }
        const { BRAND_ICON, BRAND_LOGO, BASE_DASHBOARD_PATH } = require('@authlance/core/lib/browser/branding')
        const brandIcon = this.loopContainer.get<string>(BRANDICON)
        const brandLogo = this.loopContainer.get<string>(BRANDLOGO)
        const baseUrl = this.loopContainer.isBound(BASEDASHBOARDPATH)
        const container = this.containerProvider.getContainer()
        if (brandIcon && !container.isBound(BRAND_ICON)) {
            container.bind<string>(BRAND_ICON).toConstantValue(brandIcon)
        }
        if (brandLogo && !container.isBound(BRAND_LOGO)) {
            container.bind<string>(BRAND_LOGO).toConstantValue(brandLogo)
        }
        if (baseUrl && !container.isBound(BASE_DASHBOARD_PATH)) {
            container.bind<string>(BASE_DASHBOARD_PATH).toConstantValue(this.loopContainer.get<string>(BASEDASHBOARDPATH))
        }
        return container
    }

    protected normalizeRequest(request: express.Request, config: ApplicationConfig): { pathname: string; search: string } | undefined {
        const frontEndBasePath = this.resolveFrontEndBasePath(config)
        const url = new URL(request.originalUrl || request.url, 'http://localhost')
        let pathname = url.pathname
        if (!pathname.startsWith('/')) {
            pathname = `/${pathname}`
        }
        const base = this.normalizeBasePath(frontEndBasePath)
        if (base !== '/' && pathname.startsWith(base)) {
            pathname = pathname.substring(base.length)
            if (!pathname.startsWith('/')) {
                pathname = `/${pathname}`
            }
        }
        if (base !== '/' && !request.path.startsWith(base)) {
            return undefined
        }
        if (pathname.length === 0) {
            pathname = '/'
        }
        return {
            pathname: pathname === '' ? '/' : pathname,
            search: url.search || '',
        }
    }

    protected normalizeBasePath(basePath: string | undefined): string {
        if (!basePath) {
            return '/'
        }
        if (basePath === '/') {
            return '/'
        }
        const trimmed = basePath.replace(/\/+$/, '')
        return trimmed.length === 0 ? '/' : (trimmed.startsWith('/') ? trimmed : `/${trimmed}`)
    }

    protected resolveFrontEndBasePath(config: ApplicationConfig): string {
        return config.frontEndBasePath
    }

    protected isRenderableRoute(route: RouteContribution): route is RouteContribution & { prerender: RoutePrerenderConfig } {
        if (!route.prerender || !route.prerender.enabled) {
            return false
        }
        if (route.authRequired) {
            return false
        }
        return true
    }

    protected renderMarkup(pathname: string, search: string, queryClient: QueryClient, store: AppStore, authSession: AuthSession, container: interfaces.Container): string {
        const provider = this.getRoutesProvider(container)
        const routeObjects = buildRouteObjects(provider.getRoutes(), next => provider.getChildren(next))
        const location = search
            ? `${pathname}${search}`
            : pathname
        const router = createMemoryRouter(routeObjects, {
            initialEntries: [location],
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

    protected composeDocument(markup: string, storeState: string, queryState: string, config: ApplicationConfig, document?: NormalizedRouteDocumentDefinition): string {
        const bundleName = config.frontEndBundleName ?? 'dashboard-bundle.js'
        const basePath = config.frontEndBasePath
        const defaultTitle = typeof config.applicationName === 'string' && config.applicationName.trim().length > 0
            ? config.applicationName
            : 'Loop'
        const resolvedTitle = document?.title ?? defaultTitle
        const scriptPath = this.resolveScriptPath(basePath, bundleName)
        const stylesheetHrefs = this.collectStylesheets(config, basePath, bundleName)
        const stylesheetMarkup = stylesheetHrefs.length
            ? `\n    ${stylesheetHrefs.map(href => `<link rel="stylesheet" href="${href}" />`).join('\n    ')}`
            : ''
        const metaMarkup = this.renderMetaTags(document?.meta)
        const linkMarkup = this.renderLinkTags(document?.links)

        return `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${this.escapeHtml(resolvedTitle)}</title>${metaMarkup}${linkMarkup}${stylesheetMarkup}
</head>
<body class="h-full">
    <div id="loop-preload" class="h-full min-h-screen">${markup}</div>
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

    protected collectStylesheets(config: ApplicationConfig, basePath: string | undefined, bundleName: string): string[] {
        const configured = this.normalizeStylesheetConfig(config.frontEndStylesheets)
        const derived = this.deriveCssBundleName(bundleName)
        const resolved: string[] = []
        if (derived) {
            resolved.push(this.resolveStylesheetPath(basePath, derived))
        }
        for (const entry of configured) {
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

    protected serialize(value: unknown): string {
        return JSON.stringify(value).replace(/</g, '\\u003c')
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

    protected extractQuery(request: express.Request): Record<string, string | string[]> {
        const query: Record<string, string | string[]> = {}
        const source = request.query || {}
        for (const [key, value] of Object.entries(source)) {
            if (Array.isArray(value)) {
                query[key] = value.map(entry => entry != null ? `${entry}` : '')
            } else if (value !== undefined && value !== null) {
                query[key] = `${value}`
            }
        }
        return query
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
            setSidebarToggle: () => undefined,
            sidebarToggle: () => undefined,
            setIdentity: () => undefined,
            verifySession: () => undefined,
            authApi: authlanceFactory.authApi(bearerToken),
            usersApi: authlanceFactory.usersApi(bearerToken),
            groupsApi: authlanceFactory.groupsApi(bearerToken),
            adminApi: authlanceFactory.adminApi(bearerToken),
            subscriptionsApi: authlanceFactory.subscriptionsApi(bearerToken),
            personalAccessTokensApi: authlanceFactory.personalAccessTokensApi(bearerToken),
            paymentsApi: authlanceFactory.paymentsApi(bearerToken),
            licenseApi: authlanceFactory.licenseApi(bearerToken),
        }
    }
}
