import React, { useCallback, useContext, useMemo } from 'react'
import { ChevronRight, ChevronUp } from 'lucide-react'
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
import { Link, useNavigate } from 'react-router-dom'
import useRoutesProvider from '@authlance/core/lib/browser/hooks/user-routes-provider'
import useSidebarSecondaryItemProvider from '../hooks/useSidebarSecondaryItemProvider'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { hasGroupRole } from '@authlance/core/lib/browser/common/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@authlance/ui/lib/browser/components/avatar'
import RenderIf from '@authlance/core/lib/browser/components/RenderIf'
import { RouteContribution } from '@authlance/core/lib/common/routes/routes'
import { useBrandIcon, useBrandLogo } from '@authlance/core/lib/browser/hooks/useBrand'

export function AppSidebar() {
    const authContext = useContext(SessionContext)
    const { user, targetGroup, isSysAdmin } = authContext
    const routesProvider = useRoutesProvider()
    const sidebarSecondaryItemProvider = useSidebarSecondaryItemProvider()
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    const brandIcon = useBrandIcon()
    const brandLogo = useBrandLogo()
    const { state, toggleSidebar } = useSidebar()

    const navigateHandler = useMemo(() => ({
        navigate: (path: string, options: any) => {
            navigate(path, { replace: true })
        },
    }), [navigate])

    const items = useMemo(() => {
        const root = routesProvider.getRoutes().filter((next) => next.path === '/')
        if (!root || !root.length) {
            return []
        }
        let childs = routesProvider.getChildren(root[0]).filter((next) => Boolean(next.navBar))
        childs = childs.sort((a, b) => a.name.localeCompare(b.name))
        childs.unshift(root[0])
        if (!user) {
            return childs
        }
        return childs.filter(
            (next) =>
                !next.roles ||
                next.roles?.some((role) => user.roles.includes(role) || (targetGroup && hasGroupRole(role, targetGroup, user.groupRoles)))
        )
    }, [routesProvider, user, targetGroup])

    const secondaryItems = useMemo(() => {
        if (!authContext || !sidebarSecondaryItemProvider) {
            return []
        }
        const items = sidebarSecondaryItemProvider.getSecondaryItems(authContext)
        if (!items || !items.length) {
            return []
        }
        return items
    }, [sidebarSecondaryItemProvider, authContext, targetGroup, isSysAdmin, navigateHandler])

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

    const viewProfile = useCallback(() => {
        navigate('/user/profile')
    }, [items])

    const avatarFallback = useMemo(() => {
        if (user && user.firstName && user.lastName && user.firstName.length > 0 && user.lastName.length > 0) {
            return user.firstName.charAt(0) + user.lastName.charAt(0)
        }
        if (user && user.firstName && user.firstName.length >= 2) {
            return user.firstName.substring(0, 2)
        }
        return 'NA'
    }, [user])

    return (
        <Sidebar collapsible='icon' variant={isMobile ? 'floating' : 'inset'}>
            <SidebarHeader>
                <Link to="/" className={`flex items-center gap-2} ${state === 'collapsed' ? 'h-[calc(var(--header-height)-24px)]' : 'h-[calc(var(--header-height)-16px)]' }`}>
                    <div
                        className={state === 'collapsed' ? 'h-[calc(var(--header-height)-24px)]' : 'h-[calc(var(--header-height)-16px)]'}>
                        <img height={state === 'collapsed' ? 24 : 50} src={state === 'collapsed' ? brandIcon : brandLogo} className='h-full' />
                    </div>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sortedItems.map((item) => {
                                if (item.type === 'item' && item.route) {
                                    return (
                                        <SidebarMenuItem key={item.route.path}>
                                            <SidebarMenuButton asChild tooltip={item.name}>
                                                <Link to={user && item.route.pathProvider ? item.route.pathProvider(user, targetGroup) : item.route.path} onClick={() => {
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
                                    return (
                                        <Collapsible key={item.name} className="group/collapsible">
                                            <DropdownMenu>
                                                <RenderIf isTrue={state === 'collapsed'}>
                                                    <DropdownMenuTrigger asChild>
                                                        <CollapsibleTrigger asChild >
                                                            <SidebarMenuButton tooltip={item.name}>
                                                                {item && item.icon}
                                                                <span>{item.name}</span>
                                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                                
                                                                
                                                            </SidebarMenuButton>
                                                        </CollapsibleTrigger>
                                                    </DropdownMenuTrigger>
                                                </RenderIf>
                                                <RenderIf isTrue={state !== 'collapsed'}>
                                                    <CollapsibleTrigger asChild >
                                                        <SidebarMenuButton tooltip={item.name}>
                                                            {item && item.icon}
                                                            <span>{item.name}</span>
                                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                            
                                                            
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                </RenderIf>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.routes.map((subRoute) => (
                                                            <SidebarMenuSubItem key={subRoute.path}>
                                                                <SidebarMenuSubButton asChild>
                                                                    <Link to={user && subRoute.pathProvider ? subRoute.pathProvider(user, targetGroup) : subRoute.path} onClick={() => {
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
                                                    {item.routes.map((subRoute) => (
                                                        <DropdownMenuItem key={subRoute.path} onClick={() => {
                                                            const route = user && subRoute.pathProvider ? subRoute.pathProvider(user, targetGroup) : subRoute.path
                                                            navigate(route)
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
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <RenderIf isTrue={Boolean(user)}>
                                        <Avatar className="w-8 h-8 rounded-lg">
                                            <AvatarImage src={user!.avatar} alt={user!.firstName} />
                                            <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-sm leading-tight text-left">
                                            <span className="font-semibold truncate">{user!.firstName}</span>
                                            <span className="text-xs truncate">{user!.email}</span>
                                        </div>
                                    </RenderIf>
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                                {
                                    secondaryItems.map((item, index) => (
                                        <DropdownMenuItem key={`footer-item-${item.id}-${index}`} onClick={item.action}>
                                            <span>{item.label}</span>
                                        </DropdownMenuItem>
                                    ))
                                }
                                <DropdownMenuItem onClick={viewProfile}>
                                    <span>Account Profile</span>
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem>
                                    <span>Billing</span>
                                </DropdownMenuItem> */}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
