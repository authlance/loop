# DevicesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceIdentityApiV1RealmAdminGroupsGroupIdDevicesDeviceIdDelete**](#authlanceidentityapiv1realmadmingroupsgroupiddevicesdeviceiddelete) | **DELETE** /authlance/identity/api/v1/realm/admin/groups/{groupId}/devices/{deviceId} | Remove a device|
|[**authlanceIdentityApiV1RealmAdminGroupsGroupIdDevicesDeviceIdRevokePost**](#authlanceidentityapiv1realmadmingroupsgroupiddevicesdeviceidrevokepost) | **POST** /authlance/identity/api/v1/realm/admin/groups/{groupId}/devices/{deviceId}/revoke | Revoke a device|
|[**authlanceIdentityApiV1RealmAdminGroupsGroupIdKeysRotatePost**](#authlanceidentityapiv1realmadmingroupsgroupidkeysrotatepost) | **POST** /authlance/identity/api/v1/realm/admin/groups/{groupId}/keys/rotate | Rotate group encryption key|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesCountGet**](#authlanceidentityapiv1realmgroupsgroupiddevicescountget) | **GET** /authlance/identity/api/v1/realm/groups/{groupId}/devices/count | Get device count|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdActivatePost**](#authlanceidentityapiv1realmgroupsgroupiddevicesdeviceidactivatepost) | **POST** /authlance/identity/api/v1/realm/groups/{groupId}/devices/{deviceId}/activate | Activate a device|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdGet**](#authlanceidentityapiv1realmgroupsgroupiddevicesdeviceidget) | **GET** /authlance/identity/api/v1/realm/groups/{groupId}/devices/{deviceId} | Get a device|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdHeartbeatPost**](#authlanceidentityapiv1realmgroupsgroupiddevicesdeviceidheartbeatpost) | **POST** /authlance/identity/api/v1/realm/groups/{groupId}/devices/{deviceId}/heartbeat | Update device heartbeat|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdKeyGet**](#authlanceidentityapiv1realmgroupsgroupiddevicesdeviceidkeyget) | **GET** /authlance/identity/api/v1/realm/groups/{groupId}/devices/{deviceId}/key | Get device\&#39;s encrypted group key|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdPublicKeyPut**](#authlanceidentityapiv1realmgroupsgroupiddevicesdeviceidpublickeyput) | **PUT** /authlance/identity/api/v1/realm/groups/{groupId}/devices/{deviceId}/public-key | Update device public key|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdPushTokenDelete**](#authlanceidentityapiv1realmgroupsgroupiddevicesdeviceidpushtokendelete) | **DELETE** /authlance/identity/api/v1/realm/groups/{groupId}/devices/{deviceId}/push-token | Clear device push token|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdPushTokenPut**](#authlanceidentityapiv1realmgroupsgroupiddevicesdeviceidpushtokenput) | **PUT** /authlance/identity/api/v1/realm/groups/{groupId}/devices/{deviceId}/push-token | Update device push token|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesEventsGet**](#authlanceidentityapiv1realmgroupsgroupiddeviceseventsget) | **GET** /authlance/identity/api/v1/realm/groups/{groupId}/devices/events | Subscribe to group device events|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesGet**](#authlanceidentityapiv1realmgroupsgroupiddevicesget) | **GET** /authlance/identity/api/v1/realm/groups/{groupId}/devices | List devices in a group|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsGet**](#authlanceidentityapiv1realmgroupsgroupiddeviceskeyrequestsget) | **GET** /authlance/identity/api/v1/realm/groups/{groupId}/devices/key-requests | List pending key requests|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsPost**](#authlanceidentityapiv1realmgroupsgroupiddeviceskeyrequestspost) | **POST** /authlance/identity/api/v1/realm/groups/{groupId}/devices/key-requests | Create a key sharing request|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsRequestIdGet**](#authlanceidentityapiv1realmgroupsgroupiddeviceskeyrequestsrequestidget) | **GET** /authlance/identity/api/v1/realm/groups/{groupId}/devices/key-requests/{requestId} | Get a key request|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsRequestIdGrantPost**](#authlanceidentityapiv1realmgroupsgroupiddeviceskeyrequestsrequestidgrantpost) | **POST** /authlance/identity/api/v1/realm/groups/{groupId}/devices/key-requests/{requestId}/grant | Grant a key request|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsRequestIdRejectPost**](#authlanceidentityapiv1realmgroupsgroupiddeviceskeyrequestsrequestidrejectpost) | **POST** /authlance/identity/api/v1/realm/groups/{groupId}/devices/key-requests/{requestId}/reject | Reject a key request|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesPost**](#authlanceidentityapiv1realmgroupsgroupiddevicespost) | **POST** /authlance/identity/api/v1/realm/groups/{groupId}/devices | Register a new device|
|[**authlanceIdentityApiV1RealmGroupsGroupIdDevicesPresenceGet**](#authlanceidentityapiv1realmgroupsgroupiddevicespresenceget) | **GET** /authlance/identity/api/v1/realm/groups/{groupId}/devices/presence | Get device presence|
|[**authlanceIdentityApiV1RealmGroupsGroupIdKeysVersionGet**](#authlanceidentityapiv1realmgroupsgroupidkeysversionget) | **GET** /authlance/identity/api/v1/realm/groups/{groupId}/keys/version | Get key version info|

# **authlanceIdentityApiV1RealmAdminGroupsGroupIdDevicesDeviceIdDelete**
> authlanceIdentityApiV1RealmAdminGroupsGroupIdDevicesDeviceIdDelete()

Removes a device from the group (admin only)

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let deviceId: string; //Device ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmAdminGroupsGroupIdDevicesDeviceIdDelete(
    groupId,
    deviceId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **deviceId** | [**string**] | Device ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No Content |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmAdminGroupsGroupIdDevicesDeviceIdRevokePost**
> DunaAuthCommonKeyRotationResponse authlanceIdentityApiV1RealmAdminGroupsGroupIdDevicesDeviceIdRevokePost()

Revokes a device (admin only). Optionally includes rotation data to atomically revoke and rotate.

### Example

```typescript
import {
    DevicesApi,
    Configuration,
    ControllersDevicesRevokeWithRotationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let deviceId: string; //Device ID (default to undefined)
let payload: ControllersDevicesRevokeWithRotationRequest; //Optional rotation payload (optional)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmAdminGroupsGroupIdDevicesDeviceIdRevokePost(
    groupId,
    deviceId,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersDevicesRevokeWithRotationRequest**| Optional rotation payload | |
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **deviceId** | [**string**] | Device ID | defaults to undefined|


### Return type

**DunaAuthCommonKeyRotationResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | When rotation is included |  -  |
|**204** | No Content |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmAdminGroupsGroupIdKeysRotatePost**
> DunaAuthCommonKeyRotationResponse authlanceIdentityApiV1RealmAdminGroupsGroupIdKeysRotatePost(payload)

Rotates the group key and re-encrypts secrets (admin only)

### Example

```typescript
import {
    DevicesApi,
    Configuration,
    ControllersDevicesRotateKeyRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let payload: ControllersDevicesRotateKeyRequest; //Rotation payload

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmAdminGroupsGroupIdKeysRotatePost(
    groupId,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersDevicesRotateKeyRequest**| Rotation payload | |
| **groupId** | [**number**] | Group ID | defaults to undefined|


### Return type

**DunaAuthCommonKeyRotationResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**409** | KEY_VERSION_CONFLICT |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesCountGet**
> DunaAuthCommonDeviceLimitReachedResponse authlanceIdentityApiV1RealmGroupsGroupIdDevicesCountGet()

Gets the count of active devices in a group (for subscription enforcement)

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesCountGet(
    groupId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|


### Return type

**DunaAuthCommonDeviceLimitReachedResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdActivatePost**
> ControllersDevicesDeviceResponse authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdActivatePost(payload)

Activates a device with its encrypted group key

### Example

```typescript
import {
    DevicesApi,
    Configuration,
    ControllersDevicesActivateDeviceRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let deviceId: string; //Device ID (default to undefined)
let payload: ControllersDevicesActivateDeviceRequest; //Activation payload

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdActivatePost(
    groupId,
    deviceId,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersDevicesActivateDeviceRequest**| Activation payload | |
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **deviceId** | [**string**] | Device ID | defaults to undefined|


### Return type

**ControllersDevicesDeviceResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdGet**
> ControllersDevicesDeviceResponse authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdGet()

Gets a specific device by ID

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let deviceId: string; //Device ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdGet(
    groupId,
    deviceId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **deviceId** | [**string**] | Device ID | defaults to undefined|


### Return type

**ControllersDevicesDeviceResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdHeartbeatPost**
> authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdHeartbeatPost()

Updates the last seen timestamp for a device

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let deviceId: string; //Device ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdHeartbeatPost(
    groupId,
    deviceId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **deviceId** | [**string**] | Device ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No Content |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdKeyGet**
> { [key: string]: any; } authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdKeyGet()

Returns the encrypted group key for a device (if updated during rotation)

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let deviceId: string; //Device ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdKeyGet(
    groupId,
    deviceId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **deviceId** | [**string**] | Device ID | defaults to undefined|


### Return type

**{ [key: string]: any; }**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | No key available |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdPublicKeyPut**
> authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdPublicKeyPut(payload)

Updates the public key for a device. Used for key migration scenarios.

### Example

```typescript
import {
    DevicesApi,
    Configuration,
    ControllersDevicesUpdatePublicKeyRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let deviceId: string; //Device ID (default to undefined)
let payload: ControllersDevicesUpdatePublicKeyRequest; //Public key

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdPublicKeyPut(
    groupId,
    deviceId,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersDevicesUpdatePublicKeyRequest**| Public key | |
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **deviceId** | [**string**] | Device ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No Content |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdPushTokenDelete**
> authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdPushTokenDelete()

Clears the push notification token for a device

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let deviceId: string; //Device ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdPushTokenDelete(
    groupId,
    deviceId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **deviceId** | [**string**] | Device ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No Content |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdPushTokenPut**
> authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdPushTokenPut(payload)

Updates the push notification token for a device

### Example

```typescript
import {
    DevicesApi,
    Configuration,
    ControllersDevicesUpdatePushTokenRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let deviceId: string; //Device ID (default to undefined)
let payload: ControllersDevicesUpdatePushTokenRequest; //Push token payload

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesDeviceIdPushTokenPut(
    groupId,
    deviceId,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersDevicesUpdatePushTokenRequest**| Push token payload | |
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **deviceId** | [**string**] | Device ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No Content |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesEventsGet**
> ControllersDevicesSSEMessage authlanceIdentityApiV1RealmGroupsGroupIdDevicesEventsGet()

Opens an SSE connection to receive real-time device events for a group

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let deviceId: string; //Device ID (optional, for device-specific events) (optional) (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesEventsGet(
    groupId,
    deviceId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **deviceId** | [**string**] | Device ID (optional, for device-specific events) | (optional) defaults to undefined|


### Return type

**ControllersDevicesSSEMessage**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/event-stream


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesGet**
> Array<ControllersDevicesDeviceResponse> authlanceIdentityApiV1RealmGroupsGroupIdDevicesGet()

Lists all devices registered in a group

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let status: string; //Filter by status (active, pending, revoked) (optional) (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesGet(
    groupId,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **status** | [**string**] | Filter by status (active, pending, revoked) | (optional) defaults to undefined|


### Return type

**Array<ControllersDevicesDeviceResponse>**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsGet**
> Array<ControllersDevicesKeyRequestResponse> authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsGet()

Lists all pending key requests for a group

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsGet(
    groupId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|


### Return type

**Array<ControllersDevicesKeyRequestResponse>**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsPost**
> ControllersDevicesKeyRequestResponse authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsPost(payload)

Creates a request to receive the encrypted group key from another device

### Example

```typescript
import {
    DevicesApi,
    Configuration,
    ControllersDevicesCreateKeyRequestRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let payload: ControllersDevicesCreateKeyRequestRequest; //Key request payload

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsPost(
    groupId,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersDevicesCreateKeyRequestRequest**| Key request payload | |
| **groupId** | [**number**] | Group ID | defaults to undefined|


### Return type

**ControllersDevicesKeyRequestResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsRequestIdGet**
> ControllersDevicesKeyRequestResponse authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsRequestIdGet()

Gets a specific key request by ID

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let requestId: string; //Request ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsRequestIdGet(
    groupId,
    requestId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **requestId** | [**string**] | Request ID | defaults to undefined|


### Return type

**ControllersDevicesKeyRequestResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsRequestIdGrantPost**
> authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsRequestIdGrantPost(payload)

Grants a key request by providing the encrypted group key

### Example

```typescript
import {
    DevicesApi,
    Configuration,
    ControllersDevicesGrantKeyRequestRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let requestId: string; //Request ID (default to undefined)
let payload: ControllersDevicesGrantKeyRequestRequest; //Grant payload

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsRequestIdGrantPost(
    groupId,
    requestId,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersDevicesGrantKeyRequestRequest**| Grant payload | |
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **requestId** | [**string**] | Request ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No Content |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsRequestIdRejectPost**
> authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsRequestIdRejectPost()

Rejects a pending key request

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let requestId: string; //Request ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesKeyRequestsRequestIdRejectPost(
    groupId,
    requestId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **requestId** | [**string**] | Request ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No Content |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesPost**
> ControllersDevicesDeviceResponse authlanceIdentityApiV1RealmGroupsGroupIdDevicesPost(payload)

Registers a new device for the current user in a group

### Example

```typescript
import {
    DevicesApi,
    Configuration,
    ControllersDevicesRegisterDeviceRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let payload: ControllersDevicesRegisterDeviceRequest; //Device registration payload

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesPost(
    groupId,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersDevicesRegisterDeviceRequest**| Device registration payload | |
| **groupId** | [**number**] | Group ID | defaults to undefined|


### Return type

**ControllersDevicesDeviceResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**409** | Device limit reached |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdDevicesPresenceGet**
> DunaAuthCommonGroupDevicePresenceResponse authlanceIdentityApiV1RealmGroupsGroupIdDevicesPresenceGet()

Gets real-time presence information for all devices in a group

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdDevicesPresenceGet(
    groupId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|


### Return type

**DunaAuthCommonGroupDevicePresenceResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdKeysVersionGet**
> DunaAuthCommonKeyVersionResponse authlanceIdentityApiV1RealmGroupsGroupIdKeysVersionGet()

Returns current key version and whether device needs update

### Example

```typescript
import {
    DevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DevicesApi(configuration);

let groupId: number; //Group ID (default to undefined)
let deviceId: string; //Device ID (optional, uses current user\'s device if not specified) (optional) (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdKeysVersionGet(
    groupId,
    deviceId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|
| **deviceId** | [**string**] | Device ID (optional, uses current user\&#39;s device if not specified) | (optional) defaults to undefined|


### Return type

**DunaAuthCommonKeyVersionResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

