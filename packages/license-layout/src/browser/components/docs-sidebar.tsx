import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { ChevronRight, PanelLeft, PanelRight } from 'lucide-react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar
} from '@authlance/ui/lib/browser/components/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@authlance/ui/lib/browser/components/collapsible'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@authlance/ui/lib/browser/components/dropdown-menu'
import { useIsMobile } from '@authlance/ui/lib/browser/hooks/use-mobile'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useRoutesProvider from '@authlance/core/lib/browser/hooks/user-routes-provider'
// import useSidebarSecondaryItemProvider from '../hooks/useSidebarSecondaryItemProvider'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { hasGroupRole } from '@authlance/core/lib/browser/common/auth'
import RenderIf from '@authlance/core/lib/browser/components/RenderIf'
import { RouteContribution } from '@authlance/core/lib/common/routes/routes'
import { useBrandIcon, useBrandLogo } from '@authlance/core/lib/browser/hooks/useBrand'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { cn } from '@authlance/ui/lib/browser/utils/cn'
import { useSideBarContext } from '../hooks/useSideBarContext'

const normalizePathname = (value: string) => {
    if (!value || value === '/') {
        return '/'
    }
    return value.replace(/\/+$/, '')
}

export interface HiddenSidebarTriggerProps {
    className?: string
    onClick?: (event: React.MouseEvent) => void
    direction?: 'left' | 'right'
}

export const HiddenSidebarTrigger: React.FC<HiddenSidebarTriggerProps> = ({ className, onClick, direction = 'left' }) => {
    const { setSidebarToggle } = useContext(SessionContext)
    const { setState } = useSideBarContext()
    const { toggleSidebar, state } = useSidebar()

    useEffect(() => {
        setSidebarToggle(toggleSidebar ?? (() => undefined))
    }, [toggleSidebar, setSidebarToggle])

    useEffect(() => {
        setState(state)
    }, [state, setState])

    const Icon = direction === 'left' ? PanelLeft : PanelRight

    return (
        <Button
            data-sidebar="trigger"
            variant="ghost"
            size="icon"
            className={cn('algo', className)}
            onClick={(event) => {
                onClick?.(event)
                toggleSidebar?.()
                setState(state === 'collapsed' ? 'expanded' : 'collapsed')
            }}
            disabled={!toggleSidebar}
        >
            <Icon />
        </Button>
    )
}

export function DocsSidebar() {
    const authContext = useContext(SessionContext)
    const user = authContext?.user
    const targetGroup = authContext?.targetGroup
    const routesProvider = useRoutesProvider()
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    const brandIcon = useBrandIcon()
    const brandLogo = useBrandLogo()
    const location = useLocation()
    const { state, toggleSidebar } = useSidebar()

    const items = useMemo(() => {
        const root = routesProvider.getRoutes().filter((next) => next.path === '/')
        if (!root || !root.length) {
            return []
        }
        let childs = routesProvider.getChildren(root[0]).filter((next) => Boolean(next.navBar) && next.path.startsWith('/docs'))
        childs = childs.sort((a, b) => a.name.localeCompare(b.name))
        if (!user) {
            return childs
        }
        return childs.filter(
            (next) =>
                !next.roles ||
                next.roles?.some((role) => user.roles.includes(role) || (targetGroup && hasGroupRole(role, targetGroup, user.groupRoles)))
        )
    }, [routesProvider, user, targetGroup])

    const sortedItems = useMemo(() => {
        const result: {
            type: 'group' | 'item'
            name: string
            icon?: React.ReactElement
            routes?: RouteContribution[]
            route?: RouteContribution
            weight?: number
        }[] = []

        const groups = new Map<string, RouteContribution[]>()
        const groupWeights = new Map<string, number>()

        for (const item of items) {
            if (item.category) {
                const group = groups.get(item.category.name) ?? []
                group.push(item)
                groups.set(item.category.name, group)
                if (item.category.weight !== undefined) {
                    groupWeights.set(item.category.name, item.category.weight)
                }
            } else {
                result.push({
                    type: 'item',
                    name: item.name,
                    route: item,
                })
            }
        }

        for (const [groupName, routes] of groups.entries()) {
            routes.sort((a, b) => a.name.localeCompare(b.name))
            result.push({
                type: 'group',
                name: groupName,
                icon: routes[0].category?.icon,
                weight: groupWeights.get(groupName),
                routes,
            })
        }

        result.sort((a, b) => {
            if (a.route && a.route.path === '/') {
                return -1
            }
            if (a.type === 'item' && b.type === 'group') {
                return -1
            }
            if (a.type === 'group' && b.type === 'item') {
                return 1
            }
            if (a.type === 'group' && b.type === 'group') {
                if (a.weight && b.weight) {
                    return a.weight - b.weight
                }
                if (a.weight) {
                    return -1
                }
                return a.name.localeCompare(b.name)
            }
            return a.name.localeCompare(b.name)
        })

        return result
    }, [items])

    const normalizedLocationPath = useMemo(() => normalizePathname(location.pathname), [location.pathname])

    const resolveRoutePath = useCallback((route: RouteContribution) => {
        return user && route.pathProvider ? route.pathProvider(user, targetGroup) : route.path
    }, [user, targetGroup])

    const isPathActive = useCallback((path?: string) => {
        if (!path) {
            return false
        }
        const normalizedTarget = normalizePathname(path)
        if (normalizedTarget === '/') {
            return normalizedLocationPath === '/'
        }
        if (normalizedLocationPath === normalizedTarget) {
            return true
        }
        return normalizedTarget !== '/docs' && normalizedLocationPath.startsWith(`${normalizedTarget}/`)
    }, [normalizedLocationPath])

    return (
        <Sidebar collapsible='icon' variant={isMobile ? 'floating' : 'inset'}>
            <SidebarHeader>
                <div
                    className={state === 'collapsed' ? 'h-[calc(var(--header-height)-24px)]' : 'h-[calc(var(--header-height)-16px)]'}>
                    <Link to="/" className='h-full'>
                        <img height={state === 'collapsed' ? 24 : 50} src={state === 'collapsed' ? brandIcon : brandLogo} className='h-full' />
                    </Link>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sortedItems.map((item) => {
                                if (item.type === 'item' && item.route) {
                                    const routePath = resolveRoutePath(item.route)
                                    const isActive = isPathActive(routePath)
                                    return (
                                        <SidebarMenuItem key={item.route.path}>
                                            <SidebarMenuButton asChild tooltip={item.name} isActive={isActive}>
                                                <Link to={routePath} onClick={() => {
                                                    if (isMobile) {
                                                        toggleSidebar()
                                                    }
                                                }}>
                                                    {item.route.icon && item.route.icon}
                                                    <span>{item.route.name}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                }

                                if (item.type === 'group' && item.routes) {
                                    const subRoutes = item.routes.map((subRoute) => {
                                        const path = resolveRoutePath(subRoute)
                                        return {
                                            path,
                                            isActive: isPathActive(path),
                                            subRoute,
                                        }
                                    })
                                    const groupIsActive = subRoutes.some((subRoute) => subRoute.isActive)
                                    return (
                                        <Collapsible key={item.name} className="group/collapsible" defaultOpen>
                                            <DropdownMenu>
                                                <RenderIf isTrue={state === 'collapsed'}>
                                                    <DropdownMenuTrigger asChild>
                                                        <CollapsibleTrigger asChild >
                                                            <SidebarMenuButton tooltip={item.name} isActive={groupIsActive}>
                                                                {item && item.icon}
                                                                <span>{item.name}</span>
                                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                            </SidebarMenuButton>
                                                        </CollapsibleTrigger>
                                                    </DropdownMenuTrigger>
                                                </RenderIf>
                                                <RenderIf isTrue={state !== 'collapsed'}>
                                                    <CollapsibleTrigger asChild >
                                                        <SidebarMenuButton tooltip={item.name} isActive={groupIsActive}>
                                                            {item && item.icon}
                                                            <span>{item.name}</span>
                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                </RenderIf>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {subRoutes.map(({ subRoute, path, isActive }) => (
                                                            <SidebarMenuSubItem key={subRoute.path}>
                                                                <SidebarMenuSubButton asChild isActive={isActive}>
                                                                    <Link to={path} onClick={() => {
                                                                        if (isMobile) {
                                                                            toggleSidebar()
                                                                        }
                                                                    }}>
                                                                        {subRoute.icon && subRoute.icon}
                                                                        <span>{subRoute.name}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                                
                                                <DropdownMenuContent align="start" side='right'>
                                                    {subRoutes.map(({ subRoute, path }) => (
                                                        <DropdownMenuItem key={subRoute.path} onClick={() => {
                                                            navigate(path)
                                                        }}>
                                                            {subRoute.icon && subRoute.icon}
                                                            <span>{subRoute.name}</span>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </Collapsible>
                                    )
                                }

                                return <></>
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <RenderIf isTrue={state === 'collapsed'}>
                    <HiddenSidebarTrigger />
                </RenderIf>
            </SidebarFooter>
        </Sidebar>
    )
}
