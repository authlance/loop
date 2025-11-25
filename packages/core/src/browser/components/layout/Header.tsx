import React, { useCallback, useContext, useMemo } from 'react'
import LayoutContainer from '../../containers/LayoutContainer'
import RenderIf from '../RenderIf'
import { SessionContext } from '../../hooks/useAuth'
import useRoutesProvider from '../../hooks/user-routes-provider'
import { RouteContribution } from '../../../common/routes/routes'

interface HeaderProps {
    title: string
    authenticated: boolean
}

interface AuthenticatedHeaderProps extends HeaderProps {
    currentRoute: RouteContribution | undefined
    logoutAction: () => void
}

const AuthenticatedRouteHeader: React.FC<AuthenticatedHeaderProps> = ({  title, authenticated, logoutAction, currentRoute }) => {
    return (
        <LayoutContainer>
            {({ theme, setThemeLayout }) => (
                <>
                    {/* <Button
                        onClick={() => setThemeLayout(theme === 'light' ? 'dark' : 'light')}
                        variant="ghost"
                        className="bg-primary text-muted-foreground hover:text-muted-foreground"
                    >
                        <RenderIf isTrue={theme === 'light'}>
                            <Sun />
                        </RenderIf>
                        <RenderIf isTrue={theme === 'dark'}>
                            <Moon />
                        </RenderIf>
                    </Button> */}
                    {/* <RenderIf isTrue={authenticated}>
                        <Button
                            variant="outline"
                            onClick={logoutAction}
                        >
                            <LogOut />
                        </Button>
                    </RenderIf> */}
                </>
            )}
        </LayoutContainer>
    )
    // return (
    //     <>
    //         <div className="flex items-center justify-between h-full px-4">
    //             <div className="flex items-center space-x-4">
    //                 <RenderIf isTrue={authenticated && currentRoute && (currentRoute.path === '/' || !currentRoute.root)}>
    //                     <CustomSideBarTrigger className="text-muted-foreground hover:text-foreground" />
    //                 </RenderIf>
    //             </div>

    //             <div className="flex items-center space-x-4">
    //                 <LayoutContainer>
    //                     {({ theme, setThemeLayout }) => (
    //                         <>
    //                             {/* <Button
    //                                 onClick={() => setThemeLayout(theme === 'light' ? 'dark' : 'light')}
    //                                 variant="ghost"
    //                                 className="bg-primary text-muted-foreground hover:text-muted-foreground"
    //                             >
    //                                 <RenderIf isTrue={theme === 'light'}>
    //                                     <Sun />
    //                                 </RenderIf>
    //                                 <RenderIf isTrue={theme === 'dark'}>
    //                                     <Moon />
    //                                 </RenderIf>
    //                             </Button> */}
    //                             {/* <RenderIf isTrue={authenticated}>
    //                                 <Button
    //                                     variant="outline"
    //                                     onClick={logoutAction}
    //                                 >
    //                                     <LogOut />
    //                                 </Button>
    //                             </RenderIf> */}
    //                         </>
    //                     )}
    //                 </LayoutContainer>
    //             </div>
    //         </div>
    //     </>
    // )

}

const PublicRouteHeader: React.FC<HeaderProps> = ({ title, authenticated }) => {
    return (
        <></>
    )
}

const Header: React.FC<HeaderProps> = ({ title, authenticated }) => {
    const { clearSession, logoutUrl, pathProvider } = useContext(SessionContext)
    const routeProvider = useRoutesProvider()

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

    const logoutAction = useCallback(
        async () => {
            try {
                if (logoutUrl) {
                    clearSession()
                    window.location.href = logoutUrl
                }
            } catch (error) {
                console.error(error)
            }
        },
        [clearSession, logoutUrl]
    )

    return (
        <>
            <RenderIf isTrue={!currentRoute || (currentRoute && (currentRoute.authRequired || authenticated))}>
                <AuthenticatedRouteHeader title={title} authenticated={authenticated} logoutAction={logoutAction} currentRoute={currentRoute} />
            </RenderIf>
            <RenderIf isTrue={currentRoute && !currentRoute.authRequired}>
                <PublicRouteHeader title={title} authenticated={authenticated} />
            </RenderIf>
        </>
    )
}

export default Header
