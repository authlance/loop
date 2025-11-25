import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { PaymentTierDto } from '@authlance/common/lib/common/types/subscriptions'

export const useSubscriptionTiers = (
    userIdentity: string,
    queryOptions: Record<string, unknown> = {}
) =>
{
    const { subscriptionsApi } = useContext(SessionContext)
    return useQuery<PaymentTierDto[]>(
        ['duna-subscription-tiers'],
        async () => {
            const res = await subscriptionsApi.authlanceIdentityApiV1ProfileSubscriptionsUserTiersGet(userIdentity)
            return res.data as unknown as PaymentTierDto[]
        },
        queryOptions as any
    )
}
