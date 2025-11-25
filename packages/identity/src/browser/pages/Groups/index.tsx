import React from 'react'
import { inject, injectable } from 'inversify'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { ListGroupsComponent } from '../../components/groups/list-groups'
import { Castle, PlusCircle } from 'lucide-react'
import { CreateGroup, EditGroup } from '../../components/groups/group'
import { useParams } from 'react-router-dom'
import { AddGroupMember, EditGroupMember } from '../../components/groups/group-members'
import { GroupContext, USER_MANAGEMENT_CATEGORY } from '../../common/common'
import { HeaderAction, MainActionContribution, SecondaryItem, SecondaryItemContribution } from '@authlance/core/lib/browser/common/ui-contributions'
import { AuthSession } from '@authlance/core/lib/browser/hooks/useAuth'
import UserGroupsComponent from '../../components/groups/list-user-groups'

function GroupsPage() {

    return (
        <ListGroupsComponent />
    )
}

function CreateGroupPage() {
    return (
        <CreateGroup/>
    )
}

function GroupsEditPage() {
    const { groupName } = useParams<{ groupName?: string }>()

    if (!groupName) {
        return <div>Group not found</div>
    }

    return (
        <EditGroup group={groupName}/>
    )
}

function AddGroupMemberPage() {
    const { groupName } = useParams<{ groupName?: string }>()
    if (!groupName) {
        return <div>Group not found</div>
    }
    return (
        <AddGroupMember group={groupName}/>
    )
}

function EditGroupMemberPage() {
    const { groupName } = useParams<{ groupName?: string }>()
    const { identity } = useParams<{ identity?: string }>()
    if (!groupName || !identity) {
        return <div>Group or identity not found</div>
    }
    return (
        <EditGroupMember group={groupName} identity={identity} />
    )
}

function UserGroupsPage() {
    return (
        <UserGroupsComponent />
    )
}

@injectable()
export class GroupsEditMemberPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/group/:groupName/edit-member/:identity',
            component: EditGroupMemberPage,
            navBar: false,
            roles: ['sysadmin', 'group-admin'],
            name: 'Edit Group Member',
            exact: true,
            root: false,
            canGoBack: true,
            forceParent: '/',
            authRequired: true
        }
    }
}

@injectable()
export class GroupsAddMemberPageContribution implements RoutesApplicationContribution {

    constructor(
        @inject(GroupContext) private groupContext: GroupContext
    ) {
        // such empty
    }

    getRoute(): RouteContribution {
        return {
            path: '/group/:groupName/add-member',
            component: AddGroupMemberPage,
            navBar: false,
            roles: ['sysadmin', 'group-admin'],
            name: 'Add Group Member',
            nameProvider: (authContext: AuthSession): string => {
                const group = this.groupContext.getGroup()
                if (group) {
                    return `Add Member to ${group.longName ? group.longName : group.name}`
                }
                return 'Add Member to Group'
            },
            exact: true,
            root: false,
            canGoBack: true,
            forceParent: '/',
            authRequired: true
        }
    }
}

@injectable()
export class GroupsCreatePageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/group/create',
            component: CreateGroupPage,
            navBar: false,
            roles: ['sysadmin'],
            name: 'Create Groups',
            exact: true,
            root: false,
            canGoBack: true,
            forceParent: '/',
            authRequired: true
        }
    }
}

@injectable()
export class GroupsEditPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/group/:groupName/edit',
            component: GroupsEditPage,
            navBar: false,
            roles: ['sysadmin'],
            name: 'Edit Group',
            exact: true,
            root: false,
            canGoBack: true,
            forceParent: '/',
            authRequired: true
        }
    }
}

@injectable()
export class MyGroupsEditPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/my-group/:groupName/edit',
            component: GroupsEditPage,
            navBar: false,
            roles: ['group-admin'],
            name: 'Edit Group',
            exact: true,
            root: false,
            canGoBack: false,
            forceParent: '/',
            authRequired: true
        }
    }
}

@injectable()
export class GroupsPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/groups',
            component: GroupsPage,
            category: USER_MANAGEMENT_CATEGORY,
            icon: <Castle/>,
            navBar: true,
            roles: ['sysadmin'],
            name: 'Groups',
            exact: true,
            root: false,
            authRequired: true
        }
    }
}

@injectable()
export class GroupsPaginationPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/groups/:page',
            component: GroupsPage,
            navBar: false,
            name: 'Groups',
            roles: ['sysadmin'],
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: true
        }
    }
}

@injectable()
export class UserGroupsPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/user/groups/:identity',
            component: UserGroupsPage,
            navBar: false,
            roles: ['sysadmin'],
            name: 'User Groups',
            nameProvider: (authContext: AuthSession): string => {
                const identityUser = authContext.identityUser
                if (identityUser) {
                    return `${identityUser.firstName ? identityUser.firstName : identityUser.identity} Groups`
                }
                return 'User Groups'
            },
            exact: true,
            root: false,
            canGoBack: true,
            forceParent: '/',
            authRequired: true
        }
    }
}

@injectable()
export class AddGroupMainActionContribution implements MainActionContribution {

    getAction(authContext: AuthSession, path: string): HeaderAction | undefined {
        if (!authContext.user) {
            return undefined
        }
        if (path !== '/groups' && path !== '/groups/:page') {
            return undefined
        }
        return {
            icon: <PlusCircle />,
            action: (authContext: AuthSession) => {
                authContext.navigateHandler.navigate('/group/create')
            },
            id: 'create-group-header-action',
            label: 'Create Group'
        }
    }
}

@injectable()
export class BusinessAccountGroupSidebarSecondaryItem implements SecondaryItemContribution {

    constructor(
        @inject(GroupContext)
        private groupContext: GroupContext
    ) {
        // such empty
    }

    getItem(authContext: AuthSession): SecondaryItem | undefined {
        if (authContext && authContext.user && authContext.user.groups && authContext.user.groups.length > 0 && authContext.targetGroup) {
            const groupRoles = authContext.user.groupRoles.filter(role => role.group === authContext.targetGroup)
            if (groupRoles.length < 1) {
                return undefined
            }
            const isAdmin = groupRoles.some(role => role.role === 'sysadmin' || role.role === 'group-admin')
            if (!isAdmin) {
                return undefined
            }
        }
        const actionEnabled = this.groupContext.isShowSecondaryAction()
        if (!actionEnabled) {
            return undefined
        }
        const customGroupLabel = this.groupContext.getSecondaryActionLabel()
        
        return {
            id: 'edit-my-group',
            label: customGroupLabel ? customGroupLabel : 'Business Account',
            action: () => {
                if (!authContext || !authContext.user) {
                    return
                }

                if (!authContext.user.groups || authContext.user.groups.length === 0) {
                    authContext.navigateHandler.navigate('/activate-business-account', { replace: true })
                    return
                }

                if (authContext.targetGroup) {
                    authContext.navigateHandler.navigate(`/my-group/${authContext.targetGroup}/edit`)
                }
            }
        }
    }
}

@injectable()
export class GroupBillingDetailsSidebarSecondaryItem implements SecondaryItemContribution {

    constructor(
        @inject(GroupContext)
        private readonly groupContext: GroupContext,
    ) {
        // such empty
    }

    getItem(authContext: AuthSession): SecondaryItem | undefined {
        if (!authContext || !authContext.user || !authContext.targetGroup) {
            return undefined
        }
        if (authContext.user.groups.length < 1) {
            return undefined
        }
        if (!this.groupContext.isShowGroupBillingDetails()) {
            return undefined
        }
        const targetGroup = authContext.targetGroup
        let isAdmin = false
        if (authContext.user.groupRoles && authContext.user.groupRoles.length > 0) {
            isAdmin = authContext.user.groupRoles.some(role => role.group === targetGroup && (role.role === 'group-admin'))
        }
        if (!isAdmin) {
            return undefined
        }

        return {
            id: 'group-billing-details',
            label: 'Subscription Billing Details',
            action: async () => {
                
                if (!targetGroup || !authContext.user) {
                    console.error('No target group found for billing details')
                    return
                }
                try {
                    const response = await authContext.subscriptionsApi.authlanceIdentityApiV1ProfileSubscriptionsUserGroupActiveGet(authContext.user.identity, targetGroup)
                    if (response.status !== 200) {
                        console.error('Error fetching group billing details:', response)
                        return
                    }
                    
                    const subscription = response.data
                    const mResponse = await authContext.paymentsApi.authlancePaymentsApiV1CustomerPortalPost({
                        customerId: subscription.billingCustomerId
                    })
                    if (mResponse.status !== 200) {
                        console.error('Error creating customer portal session:', mResponse)
                        return
                    }
                    const session = mResponse.data
                    if (!session || !session.url) {
                        console.error('No session URL returned from customer portal creation')
                        return
                    }
                    window.location.href = session.url
                } catch (error) {
                    console.error('Error navigating to group billing details:', error)
                    authContext.navigateHandler.navigate('/activate-business-account', { replace: true })
                }
            }
        }
    }
}

export default GroupsPage
