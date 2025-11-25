import React from 'react'
import HydraContextProvider from '@authlance/core/lib/browser/common/hydra-sdk'
import OidcClientsComponent from '../../components/clients/oidc-client-list'
import OidcClientCreateComponent from '../../components/clients/create-oidc-client'
import { injectable } from 'inversify'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { IdCard, PlusCircle } from 'lucide-react'
import OidcClientUpdateComponent from '../../components/clients/update-oidc-client'
import { useParams } from 'react-router-dom'
import RenderIf from '@authlance/core/lib/browser/components/RenderIf'
import { USER_MANAGEMENT_CATEGORY } from '../../common/common'
import { HeaderAction, MainActionContribution } from '@authlance/core/lib/browser/common/ui-contributions'
import { AuthSession } from '@authlance/core/lib/browser/hooks/useAuth'

const OauthClientsPage: React.FC<{}> = () => {
    const { token } = useParams()
    return (
        <HydraContextProvider>
            <OidcClientsComponent token={token && token === '' ? undefined : token} />
        </HydraContextProvider>
    )
}

export const OauthClientCreatePage: React.FC<{}> = () => {
    
    return (
        <HydraContextProvider>
            <OidcClientCreateComponent />
        </HydraContextProvider>
    )
}

export const OauthUpdateClientPage: React.FC<{}> = () => {
    const { clientId } = useParams()
    return (
        <HydraContextProvider>
            <RenderIf isTrue={!!clientId}>
                <OidcClientUpdateComponent clientId={clientId!} />
            </RenderIf>
        </HydraContextProvider>
    )
}

@injectable()
export class OauthClientsPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/oauth-clients',
            component: OauthClientsPage,
            navBar: true,
            category: USER_MANAGEMENT_CATEGORY,
            icon: <IdCard/>,
            roles: ['sysadmin'],
            name: 'OIDC Clients',
            exact: true,
            root: false,
            authRequired: true
        }
    }
}

@injectable()
export class OauthClientsPagePaginatedContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/oauth-clients/:token',
            component: OauthClientsPage,
            navBar: false,
            roles: ['sysadmin'],
            name: 'OIDC Clients',
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: true
        }
    }
}

@injectable()
export class OauthClientCreatePageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/oauth-client-create',
            component: OauthClientCreatePage,
            navBar: false,
            roles: ['sysadmin'],
            name: 'Create OIDC Client',
            exact: true,
            root: false,
            canGoBack: true,
            authRequired: true
        }
    }
}


@injectable()
export class OauthClientUpdatePageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/oauth-client/:clientId',
            component: OauthUpdateClientPage,
            navBar: false,
            roles: ['sysadmin'],
            name: 'Update OIDC Client',
            exact: true,
            root: false,
            forceParent: '/',
            canGoBack: true,
            authRequired: true
        }
    }
}

@injectable()
export class AddOauthClientActionContribution implements MainActionContribution {

    getAction(authContext: AuthSession, path: string): HeaderAction | undefined {
        if (!authContext.user) {
            return undefined
        }
        if (path !== '/oauth-clients' && path !== '/oauth-clients/:token') {
            return undefined
        }
        return {
            icon: <PlusCircle />,
            action: (authContext: AuthSession) => {
                authContext.navigateHandler.navigate('/oauth-client-create')
            },
            id: 'create-oauth-client-header-action',
            label: 'Create OIDC Client'
        }
    }
}

export default OauthClientsPage
