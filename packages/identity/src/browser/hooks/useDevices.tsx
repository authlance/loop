import { QueryClient, useQuery } from '@tanstack/react-query'
import { store } from '@authlance/core/lib/browser/store'
import { authlanceFactory } from '@authlance/core/lib/browser/common/authlance-sdk'
import {
    ControllersDevicesDeviceResponse,
    DunaAuthCommonGroupDevicePresenceResponse,
    ControllersDevicesKeyRequestResponse,
    DevicesApi,
} from '@authlance/common/lib/common/authlance-client/api'

// Re-export types for convenience
export type GroupDevice = ControllersDevicesDeviceResponse
export type DevicePresence = DunaAuthCommonGroupDevicePresenceResponse
export type KeyRequest = ControllersDevicesKeyRequestResponse

const getDevicesApi = (): DevicesApi => {
    const state = store.getState()
    const token = state.auth.personalAccessToken || state.auth.token
    return authlanceFactory.groupDevicesApi(token || undefined)
}

// Hook to list devices for a group
export const useGroupDevices = (
    groupId: number | undefined,
    queryOptions: Record<string, unknown> = {}
) => {
    return useQuery<GroupDevice[]>(
        ['duna-group-devices', groupId],
        async () => {
            if (!groupId) {
                return []
            }
            const devicesApi = getDevicesApi()
            const response = await devicesApi.authlanceIdentityApiV1RealmGroupsGroupIdDevicesGet(groupId)
            return response.data || []
        },
        {
            enabled: !!groupId,
            ...queryOptions,
        } as any
    )
}

// Hook to get device presence
export const useDevicePresence = (
    groupId: number | undefined,
    queryOptions: Record<string, unknown> = {}
) => {
    return useQuery<DevicePresence | null>(
        ['duna-device-presence', groupId],
        async () => {
            if (!groupId) {
                return null
            }
            const devicesApi = getDevicesApi()
            const response = await devicesApi.authlanceIdentityApiV1RealmGroupsGroupIdDevicesPresenceGet(groupId)
            return response.data || null
        },
        {
            enabled: !!groupId,
            refetchInterval: 30000, // Refresh every 30 seconds
            ...queryOptions,
        } as any
    )
}

// Hook to get pending key requests
export const usePendingKeyRequests = (
    groupId: number | undefined,
    queryOptions: Record<string, unknown> = {}
) => {
    return useQuery<KeyRequest[]>(
        ['duna-key-requests', groupId],
        async () => {
            if (!groupId) {
                return []
            }
            const devicesApi = getDevicesApi()
            const response = await devicesApi.authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsGet(groupId)
            return response.data || []
        },
        {
            enabled: !!groupId,
            refetchInterval: 10000, // Refresh every 10 seconds for pending requests
            ...queryOptions,
        } as any
    )
}

// Device registration
export const registerDevice = async (
    groupId: number,
    deviceName: string,
    deviceType: string,
    publicKey: string,
    devicesApi: DevicesApi,
    queryClient: QueryClient
): Promise<{ device?: GroupDevice; error?: string; limitReached?: boolean }> => {
    try {
        const response = await devicesApi.authlanceIdentityApiV1RealmGroupsGroupIdDevicesPost(groupId, {
            deviceName,
            deviceType,
            publicKey,
        })
        await queryClient.invalidateQueries(['duna-group-devices', groupId])
        await queryClient.invalidateQueries(['duna-device-presence', groupId])
        return { device: response.data }
    } catch (error: any) {
        if (error.response?.status === 409) {
            return { error: 'Device limit reached', limitReached: true }
        }
        console.error('Error registering device', error)
        return { error: error.response?.data || 'Error registering device' }
    }
}

// Activate device with encrypted group key
export const activateDevice = async (
    groupId: number,
    deviceId: string,
    encryptedGroupKey: string,
    devicesApi: DevicesApi,
    queryClient: QueryClient
): Promise<{ device?: GroupDevice; error?: string }> => {
    try {
        const response = await devicesApi.authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdActivatePost(
            groupId,
            deviceId,
            { encryptedGroupKey }
        )
        await queryClient.invalidateQueries(['duna-group-devices', groupId])
        await queryClient.invalidateQueries(['duna-device-presence', groupId])
        return { device: response.data }
    } catch (error: any) {
        console.error('Error activating device', error)
        return { error: error.response?.data || 'Error activating device' }
    }
}

// Revoke a device
export const revokeDevice = async (
    groupId: number,
    deviceId: string,
    devicesApi: DevicesApi,
    queryClient: QueryClient
): Promise<{ success: boolean; error?: string }> => {
    try {
        await devicesApi.authlanceIdentityApiV1RealmAdminGroupsGroupIdDevicesDeviceIdRevokePost(groupId, deviceId)
        await queryClient.invalidateQueries(['duna-group-devices', groupId])
        await queryClient.invalidateQueries(['duna-device-presence', groupId])
        return { success: true }
    } catch (error: any) {
        console.error('Error revoking device', error)
        return { success: false, error: error.response?.data || 'Error revoking device' }
    }
}

// Remove a device
export const removeDevice = async (
    groupId: number,
    deviceId: string,
    devicesApi: DevicesApi,
    queryClient: QueryClient
): Promise<{ success: boolean; error?: string }> => {
    try {
        await devicesApi.authlanceIdentityApiV1RealmAdminGroupsGroupIdDevicesDeviceIdDelete(groupId, deviceId)
        await queryClient.invalidateQueries(['duna-group-devices', groupId])
        await queryClient.invalidateQueries(['duna-device-presence', groupId])
        return { success: true }
    } catch (error: any) {
        console.error('Error removing device', error)
        return { success: false, error: error.response?.data || 'Error removing device' }
    }
}

// Send device heartbeat
export const sendDeviceHeartbeat = async (
    groupId: number,
    deviceId: string,
    devicesApi: DevicesApi
): Promise<{ success: boolean }> => {
    try {
        await devicesApi.authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdHeartbeatPost(groupId, deviceId)
        return { success: true }
    } catch (error) {
        console.error('Error sending heartbeat', error)
        return { success: false }
    }
}

// Create key request
export const createKeyRequest = async (
    groupId: number,
    requestingDeviceId: string,
    devicesApi: DevicesApi,
    queryClient: QueryClient
): Promise<{ request?: KeyRequest; error?: string }> => {
    try {
        const response = await devicesApi.authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsPost(groupId, {
            requestingDeviceId,
        })
        await queryClient.invalidateQueries(['duna-key-requests', groupId])
        return { request: response.data }
    } catch (error: any) {
        console.error('Error creating key request', error)
        return { error: error.response?.data || 'Error creating key request' }
    }
}

// Grant key request
export const grantKeyRequest = async (
    groupId: number,
    requestId: string,
    encryptedGroupKey: string,
    devicesApi: DevicesApi,
    queryClient: QueryClient
): Promise<{ success: boolean; error?: string }> => {
    try {
        await devicesApi.authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsRequestIdGrantPost(
            groupId,
            requestId,
            { encryptedGroupKey }
        )
        await queryClient.invalidateQueries(['duna-key-requests', groupId])
        await queryClient.invalidateQueries(['duna-group-devices', groupId])
        return { success: true }
    } catch (error: any) {
        console.error('Error granting key request', error)
        return { success: false, error: error.response?.data || 'Error granting key request' }
    }
}

// Reject key request
export const rejectKeyRequest = async (
    groupId: number,
    requestId: string,
    devicesApi: DevicesApi,
    queryClient: QueryClient
): Promise<{ success: boolean; error?: string }> => {
    try {
        await devicesApi.authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsRequestIdRejectPost(
            groupId,
            requestId
        )
        await queryClient.invalidateQueries(['duna-key-requests', groupId])
        return { success: true }
    } catch (error: any) {
        console.error('Error rejecting key request', error)
        return { success: false, error: error.response?.data || 'Error rejecting key request' }
    }
}
