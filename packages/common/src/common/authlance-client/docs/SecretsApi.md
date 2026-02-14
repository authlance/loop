# SecretsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceIdentityApiV1RealmAdminGroupsGroupIdSecretsDelete**](#authlanceidentityapiv1realmadmingroupsgroupidsecretsdelete) | **DELETE** /authlance/identity/api/v1/realm/admin/groups/{groupId}/secrets | Delete group secrets|
|[**authlanceIdentityApiV1RealmAdminGroupsGroupIdSecretsResetPost**](#authlanceidentityapiv1realmadmingroupsgroupidsecretsresetpost) | **POST** /authlance/identity/api/v1/realm/admin/groups/{groupId}/secrets/reset | Reset group secrets|
|[**authlanceIdentityApiV1RealmGroupsGroupIdSecretsGet**](#authlanceidentityapiv1realmgroupsgroupidsecretsget) | **GET** /authlance/identity/api/v1/realm/groups/{groupId}/secrets | Get group secrets|
|[**authlanceIdentityApiV1RealmGroupsGroupIdSecretsKeyStatusGet**](#authlanceidentityapiv1realmgroupsgroupidsecretskeystatusget) | **GET** /authlance/identity/api/v1/realm/groups/{groupId}/secrets/key-status | Get key status|
|[**authlanceIdentityApiV1RealmGroupsGroupIdSecretsPost**](#authlanceidentityapiv1realmgroupsgroupidsecretspost) | **POST** /authlance/identity/api/v1/realm/groups/{groupId}/secrets | Initialize group secrets|
|[**authlanceIdentityApiV1RealmGroupsGroupIdSecretsPut**](#authlanceidentityapiv1realmgroupsgroupidsecretsput) | **PUT** /authlance/identity/api/v1/realm/groups/{groupId}/secrets | Update group secrets|

# **authlanceIdentityApiV1RealmAdminGroupsGroupIdSecretsDelete**
> authlanceIdentityApiV1RealmAdminGroupsGroupIdSecretsDelete()

Deletes all encrypted secrets for a group (admin only)

### Example

```typescript
import {
    SecretsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SecretsApi(configuration);

let groupId: number; //Group ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmAdminGroupsGroupIdSecretsDelete(
    groupId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|


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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmAdminGroupsGroupIdSecretsResetPost**
> authlanceIdentityApiV1RealmAdminGroupsGroupIdSecretsResetPost()

Resets the group key and secrets (admin only). Warning: This permanently deletes all encrypted data.

### Example

```typescript
import {
    SecretsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SecretsApi(configuration);

let groupId: number; //Group ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmAdminGroupsGroupIdSecretsResetPost(
    groupId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|


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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdSecretsGet**
> ControllersDevicesSecretsResponse authlanceIdentityApiV1RealmGroupsGroupIdSecretsGet()

Gets the encrypted secrets payload for a group

### Example

```typescript
import {
    SecretsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SecretsApi(configuration);

let groupId: number; //Group ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdSecretsGet(
    groupId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|


### Return type

**ControllersDevicesSecretsResponse**

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

# **authlanceIdentityApiV1RealmGroupsGroupIdSecretsKeyStatusGet**
> ControllersDevicesKeyStatusResponse authlanceIdentityApiV1RealmGroupsGroupIdSecretsKeyStatusGet()

Checks if the group key has been initialized

### Example

```typescript
import {
    SecretsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SecretsApi(configuration);

let groupId: number; //Group ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdSecretsKeyStatusGet(
    groupId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|


### Return type

**ControllersDevicesKeyStatusResponse**

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

# **authlanceIdentityApiV1RealmGroupsGroupIdSecretsPost**
> ControllersDevicesSecretsResponse authlanceIdentityApiV1RealmGroupsGroupIdSecretsPost(payload)

Initializes the encrypted secrets for a group (first device only)

### Example

```typescript
import {
    SecretsApi,
    Configuration,
    ControllersDevicesInitializeSecretsRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SecretsApi(configuration);

let groupId: number; //Group ID (default to undefined)
let payload: ControllersDevicesInitializeSecretsRequest; //Secrets payload

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdSecretsPost(
    groupId,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersDevicesInitializeSecretsRequest**| Secrets payload | |
| **groupId** | [**number**] | Group ID | defaults to undefined|


### Return type

**ControllersDevicesSecretsResponse**

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
|**409** | GROUP_KEY_ALREADY_INITIALIZED |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1RealmGroupsGroupIdSecretsPut**
> ControllersDevicesSecretsResponse authlanceIdentityApiV1RealmGroupsGroupIdSecretsPut(payload)

Updates the encrypted secrets payload for a group

### Example

```typescript
import {
    SecretsApi,
    Configuration,
    ControllersDevicesUpdateSecretsRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SecretsApi(configuration);

let groupId: number; //Group ID (default to undefined)
let payload: ControllersDevicesUpdateSecretsRequest; //Updated secrets payload

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupsGroupIdSecretsPut(
    groupId,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersDevicesUpdateSecretsRequest**| Updated secrets payload | |
| **groupId** | [**number**] | Group ID | defaults to undefined|


### Return type

**ControllersDevicesSecretsResponse**

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

