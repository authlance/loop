import React from 'react'
import { injectable, inject } from 'inversify'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { AuthSession } from '@authlance/core/lib/browser/hooks/useAuth'
import { PlusCircle, Users } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { GroupMembers } from '../../components/groups/group-members'
import { GroupContext, USER_MANAGEMENT_CATEGORY } from '../../common/common'
import { HeaderAction, MainActionContribution } from '@authlance/core/lib/browser/common/ui-contributions'

export function ListGroupMembersPage() {
    const { groupName } = useParams<{ groupName?: string }>()
    if (!groupName) {
        return <div>Group not found</div>
    }
    return (
        <GroupMembers group={groupName}/>
    )
}

@injectable()
export class GroupsMembersPageContribution implements RoutesApplicationContribution {

    constructor(
        @inject(GroupContext)
        private groupContext: GroupContext
    ) {
        // such empty
    }

    getRoute(): RouteContribution {
        const currentGroup = this.groupContext.getGroup()
        return {
            path: '/group/:groupName/members',
            category: USER_MANAGEMENT_CATEGORY,
            component: ListGroupMembersPage,
            pathProvider: (user, targetGroup) => {
                if (!user || !targetGroup) {
                    return '/'
                }
                if (currentGroup && currentGroup.name !== targetGroup) {
                    return `/group/${currentGroup.name}/members`
                }
                return `/group/${targetGroup}/members`
            },
            nameProvider: (_authContext: AuthSession): string => {
                if (currentGroup) {
                    const routeName = `Group ${currentGroup.longName ? currentGroup.longName : currentGroup} Members`
                    return routeName
                }
                return 'Group Members'
            },
            icon: <Users/>,
            navBar: false,
            roles: ['sysadmin', 'group-admin'],
            name: 'Group Members',
            exact: true,
            root: false,
            canGoBack: true,
            forceParent: '/',
            authRequired: true
        }
    }
}

@injectable()
export class MyGroupsMembersPageContribution implements RoutesApplicationContribution {

    constructor(
        @inject(GroupContext)
        private groupContext: GroupContext
    ) {
        // such empty
    }

    getRoute(): RouteContribution {
        const currentGroup = this.groupContext.getGroup()
        return {
            path: '/my-group/:groupName/members',
            category: USER_MANAGEMENT_CATEGORY,
            component: ListGroupMembersPage,
            pathProvider: (user, targetGroup) => {
                if (!user || !targetGroup) {
                    return '/';
                }
                return `/my-group/${targetGroup}/members`;
            },
            nameProvider: (_authContext: AuthSession): string => {
                if (currentGroup) {
                    const routeName = `Group ${currentGroup.longName ? currentGroup.longName : currentGroup} Members`
                    return routeName
                }
                return 'My Group Members'
            },
            icon: <Users/>,
            navBar: true,
            roles: ['sysadmin', 'group-admin'],
            name: 'My Group Members',
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: true
        }
    }
}

@injectable()
export class AddGroupMemberMainActionContribution implements MainActionContribution {

    constructor(
        @inject(GroupContext)
        private groupContext: GroupContext
    ) {

    }

    getAction(authContext: AuthSession, path: string): HeaderAction | undefined {
        if (!authContext.user) {
            return undefined
        }
        const targetGroup = this.groupContext.getGroup()
        if (!targetGroup) {
            return undefined
        }
        if (path !== '/group/:groupName/members' && path !== '/my-group/:groupName/members') {
            return undefined
        }
        return {
            icon: <PlusCircle />,
            action: (authContext: AuthSession) => {
                authContext.navigateHandler.navigate(`/group/${targetGroup.name}/add-member`)
            },
            id: 'create-group-header-action',
            label: 'Add Group Member'
        }
    }
}
