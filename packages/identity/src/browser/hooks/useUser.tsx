import { useContext } from 'react'
import { Group, User } from '@authlance/core/lib/browser/common/auth'
import { QueryClient, useQuery } from '@tanstack/react-query'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import type { UsersApi, AdminApi } from '@authlance/core/lib/browser/common/authlance-sdk'

export const useGetUser = (
    identity: string,
    queryOptions: Record<string, unknown> = {}
) => {
    const { adminApi } = useContext(SessionContext)
    return useQuery<User>(
        ['duna-user', `identity-${identity}`],
        async () => {
            const res = await adminApi.authlanceIdentityApiV1AdminUserIdentityGet(identity)
            return res.data as unknown as User
        },
        queryOptions as any
    )
}

export const updateUser = async (requestor: User, targetUser: User, queryClient: QueryClient, data: FormData | undefined, usersApi: UsersApi, adminApi: AdminApi): Promise<{ user?: User, error?: string }> => {
    try {
        const response = requestor.identity === targetUser.identity
            ? await usersApi.authlanceIdentityApiV1ProfileMePost({
                headers: { 'Content-Type': data ? 'multipart/form-data' : 'application/json' },
                data: data ? data : targetUser,
              } as any)
            : await adminApi.authlanceIdentityApiV1AdminUserPut(targetUser as any)
        await queryClient.invalidateQueries(['duna-user', `identity-${targetUser.identity}`])
        await queryClient.invalidateQueries([
            'duna-users',
        ])
        return { user: response.data as unknown as User }
    } catch (error) {
        console.error('Error updating user', error)
        return { error: 'Error updating user' }
    }
}

export const useGetUserGroups = (
    user: User | undefined,
    queryOptions: Record<string, unknown> = {}
) => {
    const { adminApi } = useContext(SessionContext)
    return useQuery<Group[]>(
        ['duna-user-groups', `identity-${user?.identity}`],
        async () => {
            const res = await adminApi.authlanceIdentityApiV1AdminGroupMemberIdentityGet(user!.identity)
            return res.data as unknown as Group[]
        },
        queryOptions as any
    )
}
