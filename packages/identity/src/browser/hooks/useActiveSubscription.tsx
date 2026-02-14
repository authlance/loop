import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { DunaAuthCommonGroupSubscriptionsDto } from '@authlance/common/lib/common/authlance-client'

export const useActiveSubscription = (
    groupName: string,
    queryOptions: Record<string, unknown> = {}
) => {
    const { user, subscriptionsApi } = useContext(SessionContext)

    return useQuery<DunaAuthCommonGroupSubscriptionsDto | null>(
        ['duna-active-subscription', groupName],
        async () => {
            if (!user?.identity || !groupName) {
                return null
            }
            try {
                const res = await subscriptionsApi.authlanceIdentityApiV1ProfileSubscriptionsUserGroupActiveGet(
                    user.identity,
                    groupName
                )
                return res.data as DunaAuthCommonGroupSubscriptionsDto
            } catch (error) {
                console.error('Error fetching active subscription:', error)
                return null
            }
        },
        {
            enabled: !!user?.identity && !!groupName,
            ...queryOptions,
        } as any
    )
}
