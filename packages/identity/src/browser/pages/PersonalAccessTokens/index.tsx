import React from 'react'
import { injectable, inject } from 'inversify'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { PersonalAccessTokensList } from '../../components/groups/personal-access-tokens'
import { CreatePersonalAccessTokenForm } from '../../components/groups/create-personal-access-token'
import { useParams } from 'react-router-dom'
import { USER_MANAGEMENT_CATEGORY, GroupContext } from '../../common/common'
import { Key, PlusCircle } from 'lucide-react'
import { HeaderAction, MainActionContribution } from '@authlance/core/lib/browser/common/ui-contributions'
import { AuthSession } from '@authlance/core/lib/browser/hooks/useAuth'
import { GroupAction, GroupActionContribution } from '../../common/contributions'
import { Group } from '@authlance/core/lib/browser/common/auth'

function PersonalAccessTokensPage() {
    const { groupName } = useParams<{ groupName?: string }>()
    if (!groupName) {
        return <div>Group not found</div>
    }
    return <PersonalAccessTokensList group={groupName} />
}

function CreatePersonalAccessTokenPage() {
    const { groupName } = useParams<{ groupName?: string }>()
    if (!groupName) {
        return <div>Group not found</div>
    }
    return <CreatePersonalAccessTokenForm group={groupName} />
}

@injectable()
export class GroupPersonalAccessTokensPageContribution implements RoutesApplicationContribution {
    constructor(
        @inject(GroupContext)
        private readonly groupContext: GroupContext
    ) {}

    getRoute(): RouteContribution {
        const self = this
        return {
            path: '/group/:groupName/personal-access-tokens',
            component: PersonalAccessTokensPage,
            category: USER_MANAGEMENT_CATEGORY,
            icon: <Key />,
            navBar: false,
            roles: ['sysadmin', 'group-admin'],
            name: 'Personal Access Tokens',
            exact: true,
            root: false,
            canGoBack: true,
            forceParent: '/',
            authRequired: true,
            pathProvider: (_user, targetGroup) => {
                if (!targetGroup) {
                    return '/'
                }
                const current = self.groupContext.getGroup()
                if (current && current.name !== targetGroup) {
                    return `/group/${current.name}/personal-access-tokens`
                }
                return `/group/${targetGroup}/personal-access-tokens`
            },
            nameProvider: () => {
                const current = self.groupContext.getGroup()
                if (!current) {
                    return 'Personal Access Tokens'
                }
                const label = current.longName ? current.longName : current.name
                return `${label} Tokens`
            },
        }
    }
}

@injectable()
export class MyGroupPersonalAccessTokensPageContribution implements RoutesApplicationContribution {
    constructor(
        @inject(GroupContext)
        private readonly groupContext: GroupContext
    ) {}

    getRoute(): RouteContribution {
        const self = this
        return {
            path: '/my-group/:groupName/personal-access-tokens',
            component: PersonalAccessTokensPage,
            category: USER_MANAGEMENT_CATEGORY,
            icon: <Key />,
            navBar: true,
            roles: ['sysadmin', 'group-admin'],
            name: 'Personal Access Tokens',
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: true,
            pathProvider: (_user, targetGroup) => {
                if (!targetGroup) {
                    return '/'
                }
                return `/my-group/${targetGroup}/personal-access-tokens`
            },
            nameProvider: () => {
                const current = self.groupContext.getGroup()
                if (!current) {
                    return 'Personal Access Tokens'
                }
                const label = current.longName ? current.longName : current.name
                return `${label} Tokens`
            },
        }
    }
}

@injectable()
export class CreatePersonalAccessTokenPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/group/:groupName/personal-access-tokens/create',
            component: CreatePersonalAccessTokenPage,
            navBar: false,
            roles: ['sysadmin', 'group-admin'],
            name: 'Create Personal Access Token',
            exact: true,
            root: false,
            canGoBack: true,
            forceParent: '/',
            authRequired: true,
        }
    }
}

@injectable()
export class MyGroupCreatePersonalAccessTokenPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/my-group/:groupName/personal-access-tokens/create',
            component: CreatePersonalAccessTokenPage,
            navBar: false,
            roles: ['sysadmin', 'group-admin'],
            name: 'Create Personal Access Token',
            exact: true,
            root: false,
            canGoBack: true,
            forceParent: '/',
            authRequired: true,
        }
    }
}

@injectable()
export class CreatePersonalAccessTokenMainActionContribution implements MainActionContribution {
    constructor(
        @inject(GroupContext)
        private readonly groupContext: GroupContext
    ) {}

    getAction(authContext: AuthSession, path: string): HeaderAction | undefined {
        if (!authContext.user) {
            return undefined
        }
        const currentGroup = this.groupContext.getGroup()
        if (!currentGroup) {
            return undefined
        }
        if (path !== '/group/:groupName/personal-access-tokens' && path !== '/my-group/:groupName/personal-access-tokens') {
            return undefined
        }
        return {
            icon: <PlusCircle />,
            action: (context: AuthSession) => {
                context.navigateHandler.navigate(`/group/${currentGroup.name}/personal-access-tokens/create`)
            },
            id: 'create-group-personal-access-token-action',
            label: 'Create PAT',
        }
    }
}

@injectable()
export class PersonalAccessTokensGroupActionContribution implements GroupActionContribution {
    getAction(): GroupAction {
        return {
            label: 'Personal Access Tokens',
            icon: <Key className="w-4 h-4" />,
            action: (authContext: AuthSession, group: Group) => {
                authContext.navigateHandler.navigate(`/group/${group.name}/personal-access-tokens`)
            }
        }
    }
}

export default PersonalAccessTokensPage
