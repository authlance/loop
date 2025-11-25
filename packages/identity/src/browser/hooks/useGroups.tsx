import { useContext } from 'react'
import { QueryClient, useQuery } from '@tanstack/react-query'
import { Group, GroupRole, User } from '@authlance/core/lib/browser/common/auth'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import type { AdminApi } from '@authlance/core/lib/browser/common/authlance-sdk'
import type { CommonUserGroupRole, DunaAuthCommonUser } from '@authlance/common/lib/common/authlance-client/api'

export const useGetGroups = (
    page: number | undefined,
    params?: Record<string, string>,
    queryOptions: Record<string, unknown> = {}
) => {
    const { adminApi } = useContext(SessionContext)
    const p = page ? page : 1
    const filter = params?.filter
    return useQuery<{ groups: Group[]; pages: number }>(
        ['duna-groups', `page-${p}`, `${filter ? `filter-${filter}` : 'no-filter'}`],
        async () => {
            const res = await adminApi.authlanceIdentityApiV1AdminGroupsPageGet(p, undefined, filter as any)
            return { groups: (res.data.groups || []) as unknown as Group[], pages: res.data.pages || 0 }
        },
        queryOptions as any
    )
}

export const createGroup = async (
    group: Group,
    queryClient: QueryClient,
    adminApi: AdminApi
): Promise<{ group?: string; error?: string }> => {
    try {
        const response = await adminApi.authlanceIdentityApiV1AdminGroupPut(group as any)
        await queryClient.invalidateQueries(['duna-groups'])
        return { group: (response.data as any)?.name as string }
    } catch (error) {
        console.error('Error creating group', error)
        return { error: 'Error creating group' }
    }
}

export const deleteGroupMembership = async (
    identity: string,
    group: string,
    queryClient: QueryClient,
    adminApi: AdminApi
): Promise<{ user?: User; error?: string }> => {
    try {
        const response = await adminApi.authlanceIdentityApiV1AdminGroupGroupMembersDelete(group, { data: { group, identity } } as any)
        if (response.status !== 200) {
            console.error('Error deleting group', response)
            return { error: 'Error deleting group' }
        }
        await queryClient.invalidateQueries(['duna-groups'])
        await queryClient.invalidateQueries(['duna-group', `group-${identity}`])
        return { user: response.data as unknown as User }
    } catch (error) {
        console.error('Error deleting role', error)
        return { error: 'Error deleting role' }
    }
}

export const useIsGroupAvailable = (isSysAdmin: boolean, identity: string, group: string, queryOptions: Record<string, unknown> = {}) => {
    const { adminApi, usersApi } = useContext(SessionContext)
    const queryOptionsAny = queryOptions as any
    const normalizedGroup = group?.trim?.() ?? ''
    const shouldFetch = normalizedGroup.length > 0
    const userEnabledOption = typeof queryOptionsAny?.enabled === 'boolean' ? queryOptionsAny.enabled : undefined
    return useQuery<{ available: boolean; signature: string }>(
        ['duna-group-available', normalizedGroup],
        async () => {
            if (isSysAdmin) {
                const res = await adminApi.authlanceIdentityApiV1AdminGroupGroupAvailableGet(normalizedGroup)
                return { available: !!res.data.available, signature: (res.data as any).signature }
            }
            const res = await usersApi!.authlanceIdentityApiV1ProfileMyGroupGroupUserAvailableGet(normalizedGroup, identity)
            return { available: !!res.data.available, signature: (res.data as any).signature }
        },
        {
            ...queryOptionsAny,
            enabled: shouldFetch && (userEnabledOption ?? true)
        } as any
    )
}

export const useGetGroup = (selfGroup: boolean, group: string, queryOptions: Record<string, unknown> = {}) => {
    const { adminApi, groupsApi } = useContext(SessionContext)
    return useQuery<Group>(
        ['duna-group', `group-${group}`],
        async () => {
            if (selfGroup) {
                const res = await groupsApi.authlanceIdentityApiV1RealmGroupGroupGet(group)
                return res.data as unknown as Group
            }
            const res = await adminApi.authlanceIdentityApiV1AdminGroupGroupGet(group)
            return res.data as unknown as Group
        },
        queryOptions as any
    )
}

export const updateGroup = async (
    myGroup: boolean,
    group: Group,
    queryClient: QueryClient,
    file: File | undefined,
    adminApi: AdminApi
): Promise<{ group?: Group; error?: string }> => {
    try {
        // Only admin update is available in SDK; fallback to admin API when myGroup is true
        let response
        if (!file) {
            response = await adminApi.authlanceIdentityApiV1AdminGroupPut(group as any)
        } else {
            const formData = new FormData()
            formData.append('group', JSON.stringify(group))
            formData.append('avatarImage', file)
            response = await adminApi.authlanceIdentityApiV1AdminGroupPut({} as any, { headers: { 'Content-Type': 'multipart/form-data' }, data: formData } as any)
        }
        await queryClient.invalidateQueries(['duna-groups'])
        await queryClient.invalidateQueries(['duna-group', `group-${group.id}`])
        return { group: response.data as unknown as Group }
    } catch (error) {
        console.error('Error updating group', error)
        return { error: 'Error updating group' }
    }
}

export const addGroupMember = async (
    myGroup: boolean,
    group: string,
    firstName: string,
    lastName: string,
    email: string,
    queryClient: QueryClient,
    adminApi: AdminApi
): Promise<{ user?: User; error?: string }> => {
    try {
        const response = myGroup
            ? await adminApi.authlanceIdentityApiV1RealmAdminGroupGroupMembersPost(group, { data: { firstName, lastName, email, group } } as any)
            : await adminApi.authlanceIdentityApiV1AdminGroupGroupMembersPost(group, { data: { firstName, lastName, email, group } } as any)
        await queryClient.invalidateQueries(['duna-group-members', `group-${group}`])
        return { user: response.data as unknown as User }
    } catch (error) {
        console.error('Error adding group member', error)
        return { error: 'Error adding group member' }
    }
}

export const removeGroupMember = async (
    myGroup: boolean,
    group: string,
    identity: string,
    queryClient: QueryClient,
    adminApi: AdminApi
): Promise<{ user?: User; error?: string }> => {
    try {
        const response = myGroup
            ? await adminApi.authlanceIdentityApiV1RealmAdminGroupGroupMembersDelete(group, { data: { identity, group } } as any)
            : await adminApi.authlanceIdentityApiV1AdminGroupGroupMembersDelete(group, { data: { identity, group } } as any)
        await queryClient.invalidateQueries(['duna-group-members', `group-${group}`])
        return { user: response.data as unknown as User }
    } catch (error) {
        console.error('Error removing group member', error)
        return { error: 'Error removing group member' }
    }
}

export const assignGroupMemberRoles = async (
    myGroup: boolean,
    group: string,
    identity: string,
    roles: string[],
    queryClient: QueryClient,
    adminApi: AdminApi
): Promise<{ user?: User; error?: string }> => {
    try {
        const response = myGroup
            ? await adminApi.authlanceIdentityApiV1RealmAdminGroupGroupRolePost(group, { data: { identity, group, roles } } as any)
            : await adminApi.authlanceIdentityApiV1AdminGroupGroupRolePost(group, { data: { identity, group, roles } } as any)
        await queryClient.invalidateQueries(['duna-user', `identity-${identity}`])
        await queryClient.invalidateQueries(['duna-group-member-roles', `group-${group}`, `identity-${identity}`])
        return { user: response.data as unknown as User }
    } catch (error) {
        console.error('Error assigning group member roles', error)
        return { error: 'Error assigning group member roles' }
    }
}

export const useGetGroupMembers = (
    selfGroup: boolean,
    group: string,
    params?: Record<string, string>,
    queryOptions: Record<string, unknown> = {}
) => {
    const { adminApi, groupsApi } = useContext(SessionContext)
    return useQuery<Array<User>>(
        ['duna-group-members', `group-${group}`],
        async () => {
            if (selfGroup) {
                const res = await groupsApi.authlanceIdentityApiV1RealmGroupGroupMembersGet(group)
                return res.data as unknown as Array<User>
            }
            const res = await adminApi.authlanceIdentityApiV1AdminGroupGroupMembersGet(group)
            return res.data as unknown as Array<User>
        },
        queryOptions as any
    )
}

export const useGetGroupMemberRoles = (
    selfGroup: boolean,
    group: string,
    identity: string,
    queryOptions: Record<string, unknown> = {}
) => {
    const { adminApi, groupsApi } = useContext(SessionContext)
    return useQuery<[{ group: string, user: string, role: string }]>(
        ['duna-group-member-roles', `group-${group}`, `identity-${identity}`],
        async () => {
            if (selfGroup) {
                const res = await groupsApi.authlanceIdentityApiV1RealmGroupGroupRoleUserGet(group, identity)
                const roles = (res.data.groupRoles || []).map((r: CommonUserGroupRole) => ({ group: r.group || '', user: identity, role: r.role || '' }))
                return roles as any
            }
            const res = await adminApi.authlanceIdentityApiV1AdminGroupGroupRoleUserGet(group, identity)
            const roles = (res.data.groupRoles || []).map((r: CommonUserGroupRole) => ({ group: r.group || '', user: identity, role: r.role || '' }))
            return roles as any
        },
        queryOptions as any
    )
}

export const useGetGroupMember = (
    selfGroup: boolean,
    group: string,
    identity: string,
    queryOptions: Record<string, unknown> = {}
) => {
    const { adminApi, groupsApi } = useContext(SessionContext)
    return useQuery<{ groupRoles: GroupRole[], user: User }>(
        ['duna-group-member', `group-${group}`, `identity-${identity}`],
        async () => {
            // Compose from roles + either direct user fetch or from group members
            const rolesRes = selfGroup
                ? await groupsApi.authlanceIdentityApiV1RealmGroupGroupRoleUserGet(group, identity)
                : await adminApi.authlanceIdentityApiV1AdminGroupGroupRoleUserGet(group, identity)
            const roles = (rolesRes.data.groupRoles || []).map((r: CommonUserGroupRole) => ({ group: r.group || '', user: identity, role: r.role || '' })) as GroupRole[]
            let userData: User
            if (selfGroup) {
                const m = await groupsApi.authlanceIdentityApiV1RealmGroupGroupMembersGet(group)
                const found = (m.data || []).find((u: DunaAuthCommonUser) => u.identity === identity)
                userData = (found as unknown) as User
            } else {
                const u = await adminApi!.authlanceIdentityApiV1AdminUserIdentityGet(identity)
                userData = (u.data as unknown) as User
            }
            return { groupRoles: roles, user: userData }
        },
        queryOptions as any
    )
}

export const useGetMyGroups = (identity: string) => {
    const { usersApi } = useContext(SessionContext)
    return useQuery<Array<Group>>(
        ['duna-my-groups'],
        async () => {
            const res = await usersApi.authlanceIdentityApiV1ProfileMyGroupsUserGet(identity)
            return res.data as unknown as Array<Group>
        },
        { refetchOnWindowFocus: true }
    )
}
