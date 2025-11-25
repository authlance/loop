import { useContext } from 'react'
import { QueryClient, useQuery } from '@tanstack/react-query'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import type {
    ControllersPersonalaccesstokensCreatePersonalAccessTokenRequest,
    ControllersPersonalaccesstokensPersonalAccessTokenResponse,
    PersonalAccessTokensApi,
} from '@authlance/common/lib/common/authlance-client/api'

export const useGroupPersonalAccessTokens = (
    groupId: number | undefined,
    queryOptions: Record<string, unknown> = {}
) => {
    const { personalAccessTokensApi } = useContext(SessionContext)

    return useQuery<Array<ControllersPersonalaccesstokensPersonalAccessTokenResponse>>(
        ['duna-group-personal-access-tokens', groupId],
        async () => {
            if (!groupId) {
                return []
            }
            const response = await personalAccessTokensApi.authlanceIdentityApiV1PatsGet(groupId)
            return response.data || []
        },
        {
            enabled: !!groupId,
            ...queryOptions,
        } as any
    )
}

export const createPersonalAccessToken = async (
    payload: ControllersPersonalaccesstokensCreatePersonalAccessTokenRequest,
    queryClient: QueryClient,
    personalAccessTokensApi: PersonalAccessTokensApi
): Promise<{ token?: ControllersPersonalaccesstokensPersonalAccessTokenResponse; error?: string }> => {
    try {
        const response = await personalAccessTokensApi.authlanceIdentityApiV1PatsPost(payload)
        if (payload.groupId) {
            await queryClient.invalidateQueries(['duna-group-personal-access-tokens', payload.groupId])
        }
        return { token: response.data }
    } catch (error) {
        console.error('Error creating personal access token', error)
        return { error: 'Error creating personal access token' }
    }
}

export const revokePersonalAccessToken = async (
    tokenId: string,
    groupId: number,
    queryClient: QueryClient,
    personalAccessTokensApi: PersonalAccessTokensApi
): Promise<{ success: boolean; error?: string }> => {
    try {
        await personalAccessTokensApi.authlanceIdentityApiV1PatsTokenIdDelete(tokenId)
        await queryClient.invalidateQueries(['duna-group-personal-access-tokens', groupId])
        return { success: true }
    } catch (error) {
        console.error('Error revoking personal access token', error)
        return { success: false, error: 'Error revoking personal access token' }
    }
}
