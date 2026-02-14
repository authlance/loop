# AdminRolesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceIdentityApiV1AdminRolePut**](#authlanceidentityapiv1adminroleput) | **PUT** /authlance/identity/api/v1/admin/role | Create role|
|[**authlanceIdentityApiV1AdminRolesPageGet**](#authlanceidentityapiv1adminrolespageget) | **GET** /authlance/identity/api/v1/admin/roles/{page} | List system roles (admin)|
|[**authlanceIdentityApiV1AdminUserRolePut**](#authlanceidentityapiv1adminuserroleput) | **PUT** /authlance/identity/api/v1/admin/user/role | Assign roles to user|

# **authlanceIdentityApiV1AdminRolePut**
> DunaAuthCommonRoleResponse authlanceIdentityApiV1AdminRolePut(payload)

Registers a new platform role that can later be assigned to identities.

### Example

```typescript
import {
    AdminRolesApi,
    Configuration,
    DunaAuthCommonRoleResponse
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminRolesApi(configuration);

let payload: DunaAuthCommonRoleResponse; //{ name: roleName }

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminRolePut(
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **DunaAuthCommonRoleResponse**| { name: roleName } | |


### Return type

**DunaAuthCommonRoleResponse**

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

# **authlanceIdentityApiV1AdminRolesPageGet**
> DunaAuthCommonRolesPageResponse authlanceIdentityApiV1AdminRolesPageGet()

Lists platform roles available for assignment, including pagination and filters.

### Example

```typescript
import {
    AdminRolesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminRolesApi(configuration);

let page: number; //Page number (default to undefined)
let perPage: number; //Page size (optional) (default to undefined)
let filter: string; //Text filter (optional) (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminRolesPageGet(
    page,
    perPage,
    filter
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
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

# **authlanceIdentityApiV1AdminUserRolePut**
> DunaAuthCommonUser authlanceIdentityApiV1AdminUserRolePut(payload)

Replaces the set of global roles attached to the specified identity.

### Example

```typescript
import {
    AdminRolesApi,
    Configuration,
    ControllersUsersRoleAssignmentPayload
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminRolesApi(configuration);

let payload: ControllersUsersRoleAssignmentPayload; //Identity and roles

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminUserRolePut(
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersUsersRoleAssignmentPayload**| Identity and roles | |


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
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

