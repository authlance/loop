# ProfileApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceIdentityApiV1ProfileMePost**](#authlanceidentityapiv1profilemepost) | **POST** /authlance/identity/api/v1/profile/me | Update current profile|
|[**authlanceIdentityApiV1ProfileMyGroupGroupUserAvailableGet**](#authlanceidentityapiv1profilemygroupgroupuseravailableget) | **GET** /authlance/identity/api/v1/profile/my-group/{group}/{user}/available | Check if a group name is available|
|[**authlanceIdentityApiV1ProfileMyGroupRolesUserPageGet**](#authlanceidentityapiv1profilemygrouprolesuserpageget) | **GET** /authlance/identity/api/v1/profile/my-group/roles/{user}/{page} | List available roles for current context|
|[**authlanceIdentityApiV1ProfileMyGroupsUserGet**](#authlanceidentityapiv1profilemygroupsuserget) | **GET** /authlance/identity/api/v1/profile/my-groups/{user} | List authenticated user\&#39;s groups|

# **authlanceIdentityApiV1ProfileMePost**
> DunaAuthCommonUser authlanceIdentityApiV1ProfileMePost()

Updates the authenticated user\'s profile. JSON payloads update the basic attributes and multipart bodies may include an avatar upload.

### Example

```typescript
import {
    ProfileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProfileApi(configuration);

const { status, data } = await apiInstance.authlanceIdentityApiV1ProfileMePost();
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

# **authlanceIdentityApiV1ProfileMyGroupGroupUserAvailableGet**
> DunaAuthCommonGroupAvailabilityResponse authlanceIdentityApiV1ProfileMyGroupGroupUserAvailableGet()

Verifies if a group slug is free before the authenticated user attempts to create or join it.

### Example

```typescript
import {
    ProfileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProfileApi(configuration);

let group: string; //Group name (default to undefined)
let user: string; //User identity (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1ProfileMyGroupGroupUserAvailableGet(
    group,
    user
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **group** | [**string**] | Group name | defaults to undefined|
| **user** | [**string**] | User identity | defaults to undefined|


### Return type

**DunaAuthCommonGroupAvailabilityResponse**

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

# **authlanceIdentityApiV1ProfileMyGroupRolesUserPageGet**
> DunaAuthCommonRolesPageResponse authlanceIdentityApiV1ProfileMyGroupRolesUserPageGet()

Returns paginated platform roles that the authenticated user can request within their groups.

### Example

```typescript
import {
    ProfileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProfileApi(configuration);

let user: string; //User identity (default to undefined)
let page: number; //Page number (default to undefined)
let perPage: number; //Page size (optional) (default to undefined)
let filter: string; //Text filter (optional) (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1ProfileMyGroupRolesUserPageGet(
    user,
    page,
    perPage,
    filter
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **user** | [**string**] | User identity | defaults to undefined|
| **page** | [**number**] | Page number | defaults to undefined|
| **perPage** | [**number**] | Page size | (optional) defaults to undefined|
| **filter** | [**string**] | Text filter | (optional) defaults to undefined|


### Return type

**DunaAuthCommonRolesPageResponse**

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

# **authlanceIdentityApiV1ProfileMyGroupsUserGet**
> Array<DunaAuthCommonGroup> authlanceIdentityApiV1ProfileMyGroupsUserGet()

Returns every group that belongs to the authenticated identity. The `{user}` parameter is kept for compatibility and is ignored.

### Example

```typescript
import {
    ProfileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProfileApi(configuration);

let user: string; //Compatibility placeholder (use \'me\') (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1ProfileMyGroupsUserGet(
    user
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **user** | [**string**] | Compatibility placeholder (use \&#39;me\&#39;) | defaults to undefined|


### Return type

**Array<DunaAuthCommonGroup>**

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

