import { QueryClient, useQuery } from '@tanstack/react-query'
import { store } from '@authlance/core/lib/browser/store'
import { authlanceFactory } from '@authlance/core/lib/browser/common/authlance-sdk'
import {
    ControllersDevicesSecretsResponse,
    ControllersDevicesKeyStatusResponse,
    SecretsApi,
} from '@authlance/common/lib/common/authlance-client/api'

// Re-export types for convenience
export type GroupSecret = ControllersDevicesSecretsResponse
export type KeyStatus = ControllersDevicesKeyStatusResponse

const getSecretsApi = (): SecretsApi => {
    const state = store.getState()
    const token = state.auth.personalAccessToken || state.auth.token
    return authlanceFactory.groupSecretsApi(token || undefined)
}

// Hook to get group secrets
export const useGroupSecrets = (
    groupId: number | undefined,
    queryOptions: Record<string, unknown> = {}
) => {
    return useQuery<GroupSecret | null>(
        ['duna-group-secrets', groupId],
        async () => {
            if (!groupId) {
                return null
            }
            try {
                const secretsApi = getSecretsApi()
                const response = await secretsApi.authlanceIdentityApiV1RealmGroupsGroupIdSecretsGet(groupId)
                return response.data
            } catch (error: any) {
                if (error.response?.status === 404) {
                    return null
                }
                throw error
            }
        },
        {
            enabled: !!groupId,
            ...queryOptions,
        } as any
    )
}

// Hook to check key status
export const useKeyStatus = (
    groupId: number | undefined,
    queryOptions: Record<string, unknown> = {}
) => {
    return useQuery<KeyStatus>(
        ['duna-key-status', groupId],
        async () => {
            if (!groupId) {
                return { groupId: 0, keyReady: false }
            }
            const secretsApi = getSecretsApi()
            const response = await secretsApi.authlanceIdentityApiV1RealmGroupsGroupIdSecretsKeyStatusGet(groupId)
            return response.data
        },
        {
            enabled: !!groupId,
            ...queryOptions,
        } as any
    )
}

// Initialize secrets (first device only)
export const initializeSecrets = async (
    groupId: number,
    encryptedPayload: string,
    secretsApi: SecretsApi,
    queryClient: QueryClient
): Promise<{ secrets?: GroupSecret; error?: string; alreadyInitialized?: boolean }> => {
    try {
        const response = await secretsApi.authlanceIdentityApiV1RealmGroupsGroupIdSecretsPost(groupId, {
            encryptedPayload,
        })
        await queryClient.invalidateQueries(['duna-group-secrets', groupId])
        await queryClient.invalidateQueries(['duna-key-status', groupId])
        return { secrets: response.data }
    } catch (error: any) {
        if (error.response?.status === 409) {
            return { error: 'GROUP_KEY_ALREADY_INITIALIZED', alreadyInitialized: true }
        }
        console.error('Error initializing secrets', error)
        return { error: error.response?.data?.error || 'Error initializing secrets' }
    }
}

// Update secrets
export const updateSecrets = async (
    groupId: number,
    encryptedPayload: string,
    secretsApi: SecretsApi,
    queryClient: QueryClient
): Promise<{ secrets?: GroupSecret; error?: string }> => {
    try {
        const response = await secretsApi.authlanceIdentityApiV1RealmGroupsGroupIdSecretsPut(groupId, {
            encryptedPayload,
        })
        await queryClient.invalidateQueries(['duna-group-secrets', groupId])
        return { secrets: response.data }
    } catch (error: any) {
        console.error('Error updating secrets', error)
        return { error: error.response?.data || 'Error updating secrets' }
    }
}

// Reset secrets (WARNING: requires re-initialization)
export const resetSecrets = async (
    groupId: number,
    secretsApi: SecretsApi,
    queryClient: QueryClient
): Promise<{ success: boolean; error?: string }> => {
    try {
        await secretsApi.authlanceIdentityApiV1RealmAdminGroupsGroupIdSecretsResetPost(groupId)
        await queryClient.invalidateQueries(['duna-group-secrets', groupId])
        await queryClient.invalidateQueries(['duna-key-status', groupId])
        return { success: true }
    } catch (error: any) {
        console.error('Error resetting secrets', error)
        return { success: false, error: error.response?.data || 'Error resetting secrets' }
    }
}

// Delete secrets
export const deleteSecrets = async (
    groupId: number,
    secretsApi: SecretsApi,
    queryClient: QueryClient
): Promise<{ success: boolean; error?: string }> => {
    try {
        await secretsApi.authlanceIdentityApiV1RealmAdminGroupsGroupIdSecretsDelete(groupId)
        await queryClient.invalidateQueries(['duna-group-secrets', groupId])
        await queryClient.invalidateQueries(['duna-key-status', groupId])
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting secrets', error)
        return { success: false, error: error.response?.data || 'Error deleting secrets' }
    }
}
