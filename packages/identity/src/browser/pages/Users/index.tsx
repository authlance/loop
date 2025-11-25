import React from 'react'
import { injectable } from 'inversify'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import UsersComponent from '../../components/users-component'
import { User } from 'lucide-react'
import { USER_MANAGEMENT_CATEGORY } from '../../common/common'
import { AuthSession } from '@authlance/core/lib/browser/hooks/useAuth'
import { UserRolesComponent } from '../../components/roles/list-user-roles'

function UsersPage() {

    return (
        <UsersComponent />
    )
}

function UserRolesPage() {
    return (
        <UserRolesComponent />
    )
}

@injectable()
export class UsersPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/users',
            component: UsersPage,
            category: USER_MANAGEMENT_CATEGORY,
            icon: <User/>,
            navBar: true,
            roles: ['sysadmin'],
            name: 'Users',
            exact: true,
            root: false,
            authRequired: true
        }
    }
}

@injectable()
export class UsersPaginationPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/users/:page',
            component: UsersPage,
            navBar: false,
            name: 'Users',
            roles: ['sysadmin'],
            exact: true,
            root: false,
            authRequired: true
        }
    }
}

@injectable()
export class UserRolesPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/users/:identity/roles',
            component: UserRolesPage,
            navBar: false,
            name: 'User System Roles',
            nameProvider: (authContext: AuthSession): string => {
                const user = authContext.user
                if (!user) {
                    return 'User System Roles'
                }
                return `System roles for ${user.firstName + ' ' + user.lastName}`
            },
            roles: ['sysadmin'],
            exact: true,
            root: false,
            canGoBack: true,
            forceParent: '/',
            authRequired: true
        }
    }
}

export default UsersPage

