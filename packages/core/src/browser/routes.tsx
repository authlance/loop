import React, { useContext, useEffect, useMemo } from 'react'
import { NavigateOptions, createBrowserRouter, Outlet, RouteObject, RouterProvider, useLocation, useNavigate } from 'react-router-dom'
import Header from './components/layout/Header'
import useRoutesProvider from './hooks/user-routes-provider'
import { SessionContext } from './hooks/useAuth'
import { RouteContribution, RoutesProvider } from '../common/routes/routes'
import { NavigateHandler, PathProvider, getBasePath } from './common/common'
import { match } from 'path-to-regexp'
import { User, hasGroupRole } from './common/auth'
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics'
import { DefaultDashboardContent } from './components/layout/default-dashboard-content'

const NotFound: React.FC = () => <DefaultDashboardContent loading={false} />

export const buildRouteObjects = (
    contributions: RouteContribution[],
    getChildren: (route: RouteContribution) => RouteContribution[]
): RouteObject[] => {
    return contributions.map((route) => {
        const children = getChildren(route)
        const childObjects = children.length ? buildRouteObjects(children, getChildren) : undefined

        return {
            path: route.path,
            element: route.component ? <route.component /> : undefined,
            children: childObjects,
        }
    })
}

export interface RouteVisibilityOptions {
    user?: User
    targetGroup?: string
}

export const resolveVisibleRoutes = (
    provider: RoutesProvider,
    options: RouteVisibilityOptions
): RouteContribution[] => {
    const routes = provider.getRoutes()
    const { user, targetGroup } = options
    if (user) {
        return routes.filter((next) => (
            !next.roles ||
            next.roles.some((role) => (
                user.roles.includes(role) ||
                (targetGroup && hasGroupRole(role, targetGroup, user.groupRoles))
            ))
        ))
    }
    return routes.filter((next) => !next.authRequired)
}

const LayoutRoute: React.FC = () => {
    const routeProvider = useRoutesProvider()
    const { user, setSessionNavigate } = useContext(SessionContext)
    const navigate = useNavigate()
    const location = useLocation()
    useGoogleAnalytics()

    const navigateHandler = useMemo<NavigateHandler>(() => ({
        navigate: (path: string, options?: NavigateOptions) => {
            navigate(path, { replace: true, ...(options ?? {}) })
        }
    }), [navigate])

    const pathProvider = useMemo<PathProvider>(() => ({
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
        }
    }), [location.pathname, routeProvider])

    useEffect(() => {
        setSessionNavigate(navigateHandler, pathProvider)
    }, [navigateHandler, pathProvider, setSessionNavigate])

    return (
        <>
            <Header title="Loop" authenticated={Boolean(user)} />
            <Outlet />
        </>
    )
}

const useAppRouteObjects = (): RouteObject[] => {
    const routeProvider = useRoutesProvider()
    const { user, targetGroup } = useContext(SessionContext)

    const filteredRoutes = useMemo(
        () => resolveVisibleRoutes(routeProvider, { user, targetGroup }),
        [routeProvider, targetGroup, user]
    )

    return useMemo(() => {
        const userRoutes = buildRouteObjects(filteredRoutes, (route) => routeProvider.getChildren(route))
        return [
            {
                element: <LayoutRoute />,
                children: [
                    ...userRoutes,
                    {
                        path: '*',
                        element: <NotFound />,
                    },
                ],
            },
        ]
    }, [filteredRoutes, routeProvider])
}

const AppRouter: React.FC = () => {
    const routes = useAppRouteObjects()

    const router = useMemo(() => {
        return createBrowserRouter(routes, { basename: getBasePath() })
    }, [routes])

    useEffect(() => () => router.dispose(), [router])

    return <RouterProvider router={router} />
}

export default AppRouter
