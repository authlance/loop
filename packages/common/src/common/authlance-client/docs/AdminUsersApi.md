# AdminUsersApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceIdentityApiV1AdminUserIdentityBanPost**](#authlanceidentityapiv1adminuseridentitybanpost) | **POST** /authlance/identity/api/v1/admin/user/{identity}/ban | Ban user|
|[**authlanceIdentityApiV1AdminUserIdentityGet**](#authlanceidentityapiv1adminuseridentityget) | **GET** /authlance/identity/api/v1/admin/user/{identity} | Find user by identity|
|[**authlanceIdentityApiV1AdminUserIdentityUnbanPost**](#authlanceidentityapiv1adminuseridentityunbanpost) | **POST** /authlance/identity/api/v1/admin/user/{identity}/unban | Unban user|
|[**authlanceIdentityApiV1AdminUserPost**](#authlanceidentityapiv1adminuserpost) | **POST** /authlance/identity/api/v1/admin/user | Update user (admin)|
|[**authlanceIdentityApiV1AdminUserPut**](#authlanceidentityapiv1adminuserput) | **PUT** /authlance/identity/api/v1/admin/user | Create user|
|[**authlanceIdentityApiV1AdminUsersPageGet**](#authlanceidentityapiv1adminuserspageget) | **GET** /authlance/identity/api/v1/admin/users/{page} | List users|

# **authlanceIdentityApiV1AdminUserIdentityBanPost**
> DunaAuthCommonIdentityStateResponse authlanceIdentityApiV1AdminUserIdentityBanPost()

Deactivates a user\'s identity and optionally revokes active sessions.

### Example

```typescript
import {
    AdminUsersApi,
    Configuration,
    ControllersUsersBanUserRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminUsersApi(configuration);

let identity: string; //Identity ID (default to undefined)
let payload: ControllersUsersBanUserRequest; //Ban options (optional)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminUserIdentityBanPost(
    identity,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersUsersBanUserRequest**| Ban options | |
| **identity** | [**string**] | Identity ID | defaults to undefined|


### Return type

**DunaAuthCommonIdentityStateResponse**

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
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1AdminUserIdentityGet**
> DunaAuthCommonUser authlanceIdentityApiV1AdminUserIdentityGet()

Retrieves a user profile by identity identifier.

### Example

```typescript
import {
    AdminUsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminUsersApi(configuration);

let identity: string; //Identity ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminUserIdentityGet(
    identity
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **identity** | [**string**] | Identity ID | defaults to undefined|


### Return type

**DunaAuthCommonUser**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1AdminUserIdentityUnbanPost**
> DunaAuthCommonIdentityStateResponse authlanceIdentityApiV1AdminUserIdentityUnbanPost()

Reactivates a previously banned user\'s identity.

### Example

```typescript
import {
    AdminUsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminUsersApi(configuration);

let identity: string; //Identity ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminUserIdentityUnbanPost(
    identity
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **identity** | [**string**] | Identity ID | defaults to undefined|


### Return type

**DunaAuthCommonIdentityStateResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1AdminUserPost**
> DunaAuthCommonUser authlanceIdentityApiV1AdminUserPost()

Admin endpoint to update any user profile. JSON payloads update basic attributes and multipart bodies may include an avatar upload.

### Example

```typescript
import {
    AdminUsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminUsersApi(configuration);

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminUserPost();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**DunaAuthCommonUser**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1AdminUserPut**
> DunaAuthCommonUser authlanceIdentityApiV1AdminUserPut(payload)

Creates a new user identity and seeds it with the provided global roles.

### Example

```typescript
import {
    AdminUsersApi,
    Configuration,
    DunaAuthCommonUser
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminUsersApi(configuration);

let payload: DunaAuthCommonUser; //User to create (set identityId to -1)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminUserPut(
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **DunaAuthCommonUser**| User to create (set identityId to -1) | |


### Return type

**DunaAuthCommonUser**

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
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1AdminUsersPageGet**
> DunaAuthCommonUsersPageResponse authlanceIdentityApiV1AdminUsersPageGet()

Paginates over users with optional filter by name or email.

### Example

```typescript
import {
    AdminUsersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminUsersApi(configuration);

let page: number; //Page number (default to undefined)
let filter: string; //Filter by name or email (optional) (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminUsersPageGet(
    page,
    filter
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] | Page number | defaults to undefined|
| **filter** | [**string**] | Filter by name or email | (optional) defaults to undefined|


### Return type

**DunaAuthCommonUsersPageResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

