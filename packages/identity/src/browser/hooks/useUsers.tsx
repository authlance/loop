import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { User } from '@authlance/core/lib/browser/common/auth'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'

export const useGetUsers = (
    page: number | undefined,
    params?: Record<string, string>,
    queryOptions: Record<string, unknown> = {}
) => {
    const { adminApi } = useContext(SessionContext)
    const p = page ? page : 1
    const filter = params?.filter
    return useQuery<{ users: User[]; pages: number }>(
        ['duna-users', `page-${p}`, `${filter ? `filter-${filter}` : 'no-filter'}`],
        async () => {
            const res = await adminApi.authlanceIdentityApiV1AdminUsersPageGet(p, filter as any)
            return { users: (res.data.users || []) as unknown as User[], pages: res.data.pages || 0 }
        },
        queryOptions as any
    )
}
