import { useContext } from 'react'
import { QueryClient, useQuery } from '@tanstack/react-query'
import { User } from '@authlance/core/lib/browser/common/auth'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import type { AdminApi } from '@authlance/core/lib/browser/common/authlance-sdk'

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
    const key = ['duna-roles', `page-${p}`, `${filter ? `filter-${filter}` : 'no-filter'}`]
    return useQuery<{ roles: string[]; pages: number }>(
        key,
        async () => {
            if (!systemRoles && user && user.roles && !user.roles.includes('sysadmin')) {
                const res = await usersApi!.authlanceIdentityApiV1ProfileMyGroupRolesUserPageGet(user.identity, p, undefined, filter as any)
                return { roles: res.data.roles || [], pages: res.data.pages || 0 }
            }
            const res = await adminApi!.authlanceIdentityApiV1AdminRolesPageGet(p, undefined, filter as any)
            return { roles: res.data.roles || [], pages: res.data.pages || 0 }
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
            console.error('Error deleting role', response)
            return { error: 'Error deleting role' }
        }
        await queryClient.invalidateQueries(['duna-roles'])
        await queryClient.invalidateQueries(['duna-user', `identity-${identity}`])
        return { user: response.data as unknown as User }
    } catch (error) {
        console.error('Error deleting role', error)
        return { error: 'Error deleting role' }
    }
}
