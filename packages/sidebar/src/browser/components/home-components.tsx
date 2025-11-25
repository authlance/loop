import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getOrCreateQueryClient } from '@authlance/core/lib/browser/query-client'
import { SidebarInset, SidebarProvider, useSidebar } from '@authlance/ui/lib/browser/components/sidebar'
import { AppSidebar } from './authenticated-sidebar'
import useDashboardContentProvider from '../hooks/useDashboardContent'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Toaster } from '@authlance/ui/lib/browser/components/toaster'
import useRoutesProvider from '@authlance/core/lib/browser/hooks/user-routes-provider'
import useMainActionProvider from '../hooks/useMainActionProvider'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { useAppSelector } from '@authlance/core/lib/browser/store'
import RenderIf from '@authlance/core/lib/browser/components/RenderIf'
import { cn } from '@authlance/ui/lib/browser/utils/cn'
import { ChevronDown, ChevronLeft, LogOut, PanelLeft, PanelRight } from 'lucide-react'
import { HashLink as RouterHashLink, HashLinkProps as RouterHashLinkProps } from 'react-router-hash-link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@authlance/ui/lib/browser/components/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@authlance/ui/lib/browser/components/avatar'
import useSidebarSecondaryItemProvider from '../hooks/useSidebarSecondaryItemProvider'
import { useBrandLogo } from '@authlance/core/lib/browser/hooks/useBrand'
import { PathProvider } from '@authlance/core/lib/browser/common/common'
import { match } from 'path-to-regexp'

const DASHBOARD_TITLE = 'Dashboard'

type HashLinkProps = Omit<RouterHashLinkProps, 'children'> & { children?: React.ReactNode }

// Locally retype the hash link so we rely on the app's React version.
const HashLink = RouterHashLink as unknown as React.FC<HashLinkProps>

interface HiddenSidebarTriggerProps {
    className?: string
    onClick?: (event: React.MouseEvent) => void
    direction?: 'left' | 'right'
}

const HiddenSidebarTrigger: React.FC<HiddenSidebarTriggerProps> = ({ className, onClick, direction = 'left' }) => {
    const { setSidebarToggle } = useContext(SessionContext)
    const { toggleSidebar } = useSidebar()

    useEffect(() => {
        setSidebarToggle(toggleSidebar)
    }, [toggleSidebar, setSidebarToggle])

    const Icon = direction === 'left' ? PanelLeft : PanelRight

    return (
        <Button
            data-sidebar="trigger"
            variant="ghost"
            size="icon"
            className={cn('algo', className)}
            onClick={(event) => {
                onClick?.(event)
                toggleSidebar()
            }}
        >
            <Icon />
        </Button>
    )
}

function useSmartBack() {
    const navigate = useNavigate()
    const location = useLocation()
    const historyRef = useRef<string[]>([])

    // Track visited locations
    useEffect(() => {
        const currentPath = location.pathname + location.search
        const lastPath = historyRef.current[historyRef.current.length - 1]
        if (currentPath !== lastPath) {
            historyRef.current.push(currentPath)
        }
    }, [location])

    const stripParams = (url: string) => {
        try {
            const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
            const u = new URL(url, base)
            return u.pathname
        } catch {
            // Fallback if it's a relative path
            return url.split('?')[0].split('#')[0]
        }
    }

    const goBackToDifferent = () => {
        const paths = historyRef.current
        const current = paths.pop()
        let prev = paths.pop()

        const currentBase = current ? stripParams(current) : null

        while (prev && currentBase && stripParams(prev) === currentBase) {
            prev = paths.pop()
        }

        if (prev) {
            navigate(prev)
        } else {
            navigate('/')
        }
    }

    return goBackToDifferent
}

export const HomeHeader: React.FC = ({}) => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logoutUrl, clearSession, forceChallenge, targetGroup } = useContext(SessionContext)
    const authContext = useContext(SessionContext)
    const isRoot = useMemo(() => location.pathname === '/', [location.pathname])
    const brandLogo = useBrandLogo()
    const sidebarSecondaryItemProvider = useSidebarSecondaryItemProvider()

    const avatarFallback = useMemo(() => {
        if (user && user.firstName && user.lastName && user.firstName.length > 0 && user.lastName.length > 0) {
            return user.firstName.charAt(0) + user.lastName.charAt(0)
        }
        if (user && user.firstName && user.firstName.length >= 2) {
            return user.firstName.substring(0, 2)
        }
        return 'NA'
    }, [user])

    const logoutAction = useCallback(async () => {
        try {
            if (logoutUrl && typeof window !== 'undefined') {
                clearSession()
                window.location.href = logoutUrl
            }
        } catch (error) {
            console.error(error)
        }
    }, [clearSession, logoutUrl])

    const loginAction = useCallback(async () => {
        forceChallenge()
    }, [forceChallenge])

    const viewProfile = useCallback(() => {
        navigate('/user/profile')
    }, [navigate])

    const secondaryItems = useMemo(() => {
        if (!authContext || !sidebarSecondaryItemProvider) {
            return []
        }
        return sidebarSecondaryItemProvider.getSecondaryItems(authContext)
    }, [sidebarSecondaryItemProvider, authContext])

    return (
        <header className="sticky top-0 z-40 border-b backdrop-blur bg-background/75 border-border">
            <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                        <RenderIf isTrue={Boolean(user && targetGroup)}>
                            <HiddenSidebarTrigger />
                        </RenderIf>
                    </div>
                    <RenderIf isTrue={Boolean(!(user && targetGroup))}>
                        <Link to="/" className="flex items-center gap-2">
                            <div className="h-8">
                                <img height={24} src={brandLogo} className="h-8" alt="Authlance" />
                            </div>
                            <span className="font-semibold sr-only">Authlance</span>
                        </Link>
                    </RenderIf>
                </div>
                <RenderIf isTrue={isRoot}>
                    <nav className="items-center hidden gap-6 text-sm md:flex">
                        <HashLink smooth to={{ hash: '#features' }} className="hover:underline">
                            Features
                        </HashLink>
                    </nav>
                </RenderIf>
                <RenderIf isTrue={!isRoot}>
                    <nav className="items-center hidden gap-6 text-sm md:flex">
                        { /** TODO */ }
                    </nav>
                </RenderIf>
                <div className="flex items-center gap-2">
                    <RenderIf isTrue={Boolean(!user)}>
                        <Button
                            variant="link"
                            className="px-3 py-2 text-sm rounded-xl hover:underline"
                            onClick={(e) => {
                                e.preventDefault()
                                loginAction()
                            }}
                        >
                            Sign in
                        </Button>
                    </RenderIf>
                    <RenderIf isTrue={Boolean(user && targetGroup)}>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={logoutAction}>
                                <LogOut />
                            </Button>
                        </div>
                    </RenderIf>
                    <RenderIf isTrue={Boolean(user && !targetGroup)}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 px-2">
                                    <Avatar className="w-8 h-8 rounded-lg">
                                        <AvatarImage src={user?.avatar} alt={user?.firstName} />
                                        <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-col items-start hidden text-sm leading-tight sm:flex">
                                        <span className="font-semibold truncate max-w-[8rem]">{user?.firstName}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[8rem]">
                                            {user?.email}
                                        </span>
                                    </div>
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {secondaryItems.map((item, index) => (
                                    <DropdownMenuItem
                                        key={`plain-layout-footer-item-${item.id}-${index}`}
                                        onClick={item.action}
                                    >
                                        <span>{item.label}</span>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem onClick={viewProfile}>
                                    <span>Account Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={logoutAction}>
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </RenderIf>
                </div>
            </div>
        </header>
    )
}

export const HomeFooter: React.FC = ({}) => {
    const { user, forceChallenge } = useContext(SessionContext)
    const brandLogo = useBrandLogo()

    const loginAction = useCallback(async () => {
        forceChallenge()
    }, [forceChallenge])

    useEffect(() => {
        if (!document) {
            return
        }
        const yearEl = document.getElementById('year')
        if (!yearEl) {
            return
        }
        yearEl.textContent = new Date().getFullYear().toString()
    }, [])

    return (
        <footer className="py-12">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <img src={brandLogo} alt="Authlance logo" className="h-8" />
                            <span className="sr-only">Authlance</span>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Deployable authentication and access control for SaaS, built for extensibility and multi-tenancy.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Product</h3>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <li>
                                <HashLink smooth to={{ hash: '#features' }} className="hover:underline">
                                    Features
                                </HashLink>
                            </li>
                            <RenderIf isTrue={Boolean(!user)}>
                                <li>
                                    <Button
                                        variant="link"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            loginAction()
                                        }}
                                        className="h-auto p-0 m-0 font-normal text-muted-foreground "
                                    >
                                        Sign in
                                    </Button>
                                </li>
                            </RenderIf>
                        </ul>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-6 mt-10 text-xs border-t border-border text-muted-foreground">
                    <p>
                        © <span id="year"></span> Authlance
                    </p>
                </div>
            </div>
        </footer>
    )
}

export const SideBarAppLayout: React.FC = ({}) => {
    const location = useLocation()
    const dashboardContentProvider = useDashboardContentProvider()
    const mainActionsProvider = useMainActionProvider()
    const { pathProvider, user, identityUser, clearSession, logoutUrl } = useContext(SessionContext)
    const { userId } = useParams<{ userId?: string }>()
    const navigate = useNavigate()
    const authContext = useContext(SessionContext)
    const routeProvider = useRoutesProvider()
    const isRoot = useMemo(() => location.pathname === '/', [location.pathname])
    const refreshTick = useAppSelector((state) => state.groupContext.refreshTick)
    const goBack = useSmartBack()

    const getTitle = useCallback(() => {
        if (isRoot) {
            return ''
        }
        if (!pathProvider) {
            return DASHBOARD_TITLE
        }
        const currentPath = pathProvider.getCurrentPath()
        const currentRoute = routeProvider.getRoute(currentPath)
        if (!currentRoute) {
            return DASHBOARD_TITLE
        }
        if (currentRoute.nameProvider) {
            return currentRoute.nameProvider(authContext)
        }
        return currentRoute.name
    }, [pathProvider, routeProvider, refreshTick, identityUser, user, authContext, isRoot])

    const canGoBack = useCallback(() => {
        if (!pathProvider) {
            return false
        }
        const currentPath = pathProvider.getCurrentPath()
        const currentRoute = routeProvider.getRoute(currentPath)
        if (!currentRoute) {
            return false
        }
        return currentRoute.canGoBack || false
    }, [pathProvider, routeProvider, user, userId])

    const getCurrentPath = useCallback(() => {
        if (!pathProvider) {
            return ''
        }
        return pathProvider.getCurrentPath()
    }, [pathProvider, routeProvider])

    const currentRoute = useMemo(() => {
        if (!pathProvider) {
            return undefined
        }
        const currentPath = pathProvider.getCurrentPath()
        if (!currentPath) {
            return undefined
        }
        const currentRoute = routeProvider.getRoute(currentPath)
        if (!currentRoute) {
            return undefined
        }
        return currentRoute
    }, [pathProvider, routeProvider])

    const logoutAction = useCallback(async () => {
        try {
            if (logoutUrl && typeof window !== 'undefined') {
                clearSession()
                window.location.href = logoutUrl
            }
        } catch (error) {
            console.error(error)
        }
    }, [clearSession, logoutUrl])

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <RenderIf isTrue={Boolean(isRoot)}>
                    <HomeHeader />
                </RenderIf>
                <RenderIf isTrue={Boolean(!isRoot)}>
                    <header className="bg-background/40 flex shrink-0 items-center justify-between px-4 transition-[width,height] h-[--header-height] md:peer-data-[state=collapsed]:h-[calc(var(--header-height)-4px)] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border backdrop-blur-md sticky z-50 top-0 md:rounded-tl-xl md:rounded-tr-xl">
                        {/* Left side: Sidebar trigger + title */}
                        <div className="flex items-center gap-2">
                            <HiddenSidebarTrigger />
                        </div>
                        {/* Right side: header actions */}
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={logoutAction}>
                                <LogOut />
                            </Button>
                        </div>
                    </header>
                </RenderIf>
                <div className="p-4">
                    <div className="h-full space-y-4">
                        <div className="flex shrink-0 items-center justify-between w-full transition-[width,height] ease-linear">
                            <div className="flex items-center gap-4">
                                <RenderIf isTrue={canGoBack()}>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={(event) => {
                                            event.preventDefault()
                                            if (currentRoute && currentRoute.backPath) {
                                                const backPath = currentRoute.backPath(authContext)
                                                navigate(backPath)
                                                return
                                            }
                                            goBack()
                                        }}
                                    >
                                        <ChevronLeft />
                                    </Button>
                                </RenderIf>
                                <h1 className="text-xl font-medium tracking-tight lg:text-2xl">{getTitle()}</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                {mainActionsProvider.getMainActions(authContext, getCurrentPath()).map((next) => {
                                    const variant = next.variant ? next.variant : 'default'
                                    return (
                                        <Button
                                            key={next.label}
                                            onClick={(event: React.MouseEvent<HTMLElement>) => {
                                                event.preventDefault()
                                                next.action(authContext)
                                            }}
                                            variant={variant}
                                        >
                                            {next.icon} {next.label}
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="w-full">
                            {isRoot ? dashboardContentProvider.getHomeDashboard().getContent(authContext) : <Outlet />}
                        </div>
                    </div>
                </div>
                <RenderIf isTrue={Boolean(isRoot)}>
                    <HomeFooter />
                </RenderIf>
            </SidebarInset>
        </SidebarProvider>
    )
}

export const PlainLayout: React.FC = ({}) => {
    const location = useLocation()
    const dashboardContentProvider = useDashboardContentProvider()
    const { user, targetGroup } = useContext(SessionContext)
    const navigate = useNavigate()
    const authContext = useContext(SessionContext)
    const routeProvider = useRoutesProvider()
    const isRoot = useMemo(() => location.pathname === '/', [location.pathname])
    const refreshTick = useAppSelector((state) => state.groupContext.refreshTick)
    const mainActionsProvider = useMainActionProvider()
    const goBack = useSmartBack()
    const { userId } = useParams<{ userId?: string }>()
    const [isClient, setClient] = React.useState(false)

    const pathProvider = useMemo<PathProvider>(
        () => ({
            getCurrentPath: () => {
                const flatRoutes = routeProvider.getFlatRoutes()
                const exactMatch = flatRoutes.find((route) => route.path === location.pathname)
                if (exactMatch) {
                    return exactMatch.path
                }
                const matchingRoute = flatRoutes
                    .map((route) => route.path)
                    .find((routePath) => match(routePath)(location.pathname))
                return matchingRoute ?? location.pathname
            },
        }),
        [location.pathname, routeProvider]
    )

    const canGoBack = useCallback(() => {
        if (!pathProvider) {
            return false
        }
        const currentPath = pathProvider.getCurrentPath()
        const currentRoute = routeProvider.getRoute(currentPath)
        if (!currentRoute) {
            return false
        }
        return currentRoute.canGoBack || false
    }, [pathProvider, routeProvider, user, userId])

    const getCurrentPath = useCallback(() => {
        if (!pathProvider) {
            return ''
        }
        return pathProvider.getCurrentPath()
    }, [pathProvider, routeProvider])

    const getTitle = useCallback(() => {
        if (isRoot || !isClient) {
            return ''
        }
        if (!pathProvider) {
            return DASHBOARD_TITLE
        }
        const currentPath = pathProvider.getCurrentPath()
        const currentRoute = routeProvider.getRoute(currentPath)
        if (!currentRoute) {
            return DASHBOARD_TITLE
        }
        if (currentRoute.nameProvider) {
            return currentRoute.nameProvider(authContext)
        }
        return currentRoute.name
    }, [pathProvider, routeProvider, refreshTick, user, authContext, isRoot, isClient])

    const currentRoute = useMemo(() => {
        if (!pathProvider) {
            return undefined
        }
        const currentPath = pathProvider.getCurrentPath()
        if (!currentPath) {
            return undefined
        }
        const currentRoute = routeProvider.getRoute(currentPath)
        if (!currentRoute) {
            return undefined
        }
        return currentRoute
    }, [pathProvider, routeProvider])

    useEffect(() => {
        if (user && user.groups && user.groups.length > 0 && !targetGroup) {
            navigate('/group/selection')
        }
    }, [refreshTick, user, navigate, targetGroup])

    useEffect(() => {
        if (!document) {
            return
        }
        const yearEl = document.getElementById('year')
        if (!yearEl) {
            return
        }
        yearEl.textContent = new Date().getFullYear().toString()
    }, [])

    useEffect(() => {
        setClient(true)
    }, [])

    return (
        <div>
            <HomeHeader />
            <RenderIf isTrue={Boolean(!isRoot)}>
                <div className="p-4">
                    <div className="h-full space-y-4">
                        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                            <div className="flex shrink-0 items-center justify-between w-full transition-[width,height] ease-linear">
                                <div className="flex items-center gap-4">
                                    <RenderIf isTrue={canGoBack()}>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={(event) => {
                                                event.preventDefault()
                                                if (currentRoute && currentRoute.backPath) {
                                                    const backPath = currentRoute.backPath(authContext)
                                                    navigate(backPath)
                                                    return
                                                }
                                                goBack()
                                            }}
                                        >
                                            <ChevronLeft />
                                        </Button>
                                    </RenderIf>
                                    <h1 className="text-xl font-medium tracking-tight lg:text-2xl">{getTitle()}</h1>
                                </div>
                                <RenderIf isTrue={Boolean(isClient)}>
                                    <div className="flex items-center gap-2">
                                        {mainActionsProvider
                                            .getMainActions(authContext, getCurrentPath())
                                            .map((next) => {
                                                const variant = next.variant ? next.variant : 'default'
                                                return (
                                                    <Button
                                                        key={next.label}
                                                        onClick={(event: React.MouseEvent<HTMLElement>) => {
                                                            event.preventDefault()
                                                            next.action(authContext)
                                                        }}
                                                        variant={variant}
                                                    >
                                                        {next.icon} {next.label}
                                                    </Button>
                                                )
                                            })}
                                    </div>
                                </RenderIf>
                            </div>
                        </div>
                    </div>
                </div>
            </RenderIf>
            <div>
                <RenderIf isTrue={Boolean(isRoot)}>
                    {dashboardContentProvider.getHomeDashboard().getContent(authContext)}
                </RenderIf>
                <RenderIf isTrue={Boolean(!isRoot)}>
                    <div className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <Outlet />
                    </div>
                </RenderIf>
            </div>
            {/* Footer */}
            <HomeFooter />
        </div>
    )
}

interface HomeComponentProps {
    queryClient?: QueryClient
}

export const HomeComponent: React.FC<HomeComponentProps> = ({ queryClient }) => {
    const { user } = useContext(SessionContext)
    const navigate = useNavigate()
    const resolvedQueryClient = queryClient ?? getOrCreateQueryClient()
    const dehydrated = typeof window !== 'undefined' ? (window as any).__PRERENDER_QUERY__ : undefined

    const shouldUsePlain = useMemo(() => {
        if (!user) {
            return true
        }
        if (user && user.groups && user.groups.length > 0) {
            return false
        }
        return true
    }, [user])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const next = params.get('next')
        if (next && next.length > 0) {
            navigate(next)
        }
    }, [navigate])

    if (shouldUsePlain) {
        return (
            <QueryClientProvider client={resolvedQueryClient}>
                <Hydrate state={dehydrated}>
                    <PlainLayout />
                    <Toaster />
                    <ReactQueryDevtools initialIsOpen={false} />
                </Hydrate>
            </QueryClientProvider>
        )
    }

    return (
        <QueryClientProvider client={resolvedQueryClient}>
            <SideBarAppLayout />
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}
