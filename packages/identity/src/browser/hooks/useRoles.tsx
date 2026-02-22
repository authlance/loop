import { useContext } from 'react'
import { QueryClient, useQuery } from '@tanstack/react-query'
import { User } from '@authlance/core/lib/browser/common/auth'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import type { AdminApi } from '@authlance/core/lib/browser/common/authlance-sdk'

const SYSTEM_ONLY_ROLES = ['sysadmin']

export const useGetRoles = (
    user: User | undefined,
    page: number | undefined,
    systemRoles: boolean = false,
    params?: Record<string, string>,
    queryOptions: Record<string, unknown> = {}
) => {
    const { adminApi, usersApi } = useContext(SessionContext)
    const p = page ? page : 1
    const filter = params?.filter
    const key = ['duna-roles', systemRoles ? 'system' : 'group', `page-${p}`, `${filter ? `filter-${filter}` : 'no-filter'}`]
    return useQuery<{ roles: string[]; pages: number }>(
        key,
        async () => {
            if (!systemRoles && user && user.roles && !user.roles.includes('sysadmin')) {
                const res = await usersApi!.authlanceIdentityApiV1ProfileMyGroupRolesUserPageGet(user.identity, p, undefined, filter as any)
                return { roles: res.data.roles || [], pages: res.data.pages || 0 }
            }
            const res = await adminApi!.authlanceIdentityApiV1AdminRolesPageGet(p, undefined, filter as any)
            const allRoles = res.data.roles || []
            const roles = systemRoles ? allRoles : allRoles.filter((r: string) => !SYSTEM_ONLY_ROLES.includes(r))
            return { roles, pages: res.data.pages || 0 }
        },
        queryOptions as any
    )
}

export const createRole = async (role: string, queryClient: QueryClient, adminApi: AdminApi): Promise<{ role?: string, error?: string }> => {
    try {
        const response = await adminApi.authlanceIdentityApiV1AdminRolePut({ name: role } as any)
        await queryClient.invalidateQueries(['duna-roles'])
        return { role: response.data?.name }
    } catch (error) {
        console.error('Error creating role', error)
        return { error: 'Error creating role' }
    }
}

export const assignUserRoles = async ( identity: string, roles: string[], queryClient: QueryClient, adminApi: AdminApi): Promise<{ user?: User, error?: string }> => {
    try {
        const response = await adminApi.authlanceIdentityApiV1AdminUserRolePut({ roles, identity } as any)
        if (response.status !== 200) {
            console.error('Error assigning roles', response)
            return { error: 'Error assigning roles' }
        }
        const updatedUser = response.data as unknown as User
        const missingRoles = roles.filter((r) => !updatedUser.roles?.includes(r))
        if (missingRoles.length > 0) {
            console.error('Roles not saved by server:', missingRoles)
            return { error: `Failed to assign roles: ${missingRoles.join(', ')}` }
        }
        await queryClient.invalidateQueries(['duna-roles'])
        await queryClient.invalidateQueries(['duna-user', `identity-${identity}`])
        return { user: updatedUser }
    } catch (error) {
        console.error('Error assigning roles', error)
        return { error: 'Error assigning roles' }
    }
}
