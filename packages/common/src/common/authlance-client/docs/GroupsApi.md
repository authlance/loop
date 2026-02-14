# GroupsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceIdentityApiV1ProfileMyGroupGroupUserAvailableGet**](#authlanceidentityapiv1profilemygroupgroupuseravailableget) | **GET** /authlance/identity/api/v1/profile/my-group/{group}/{user}/available | Check if a group name is available|
|[**authlanceIdentityApiV1RealmGroupGroupGet**](#authlanceidentityapiv1realmgroupgroupget) | **GET** /authlance/identity/api/v1/realm/group/{group} | Get group|
|[**authlanceIdentityApiV1RealmGroupGroupMembersGet**](#authlanceidentityapiv1realmgroupgroupmembersget) | **GET** /authlance/identity/api/v1/realm/group/{group}/members | List group members|
|[**authlanceIdentityApiV1RealmGroupGroupPost**](#authlanceidentityapiv1realmgroupgrouppost) | **POST** /authlance/identity/api/v1/realm/group/{group} | Update group|
|[**authlanceIdentityApiV1RealmGroupGroupRoleUserGet**](#authlanceidentityapiv1realmgroupgrouproleuserget) | **GET** /authlance/identity/api/v1/realm/group/{group}/role/{user} | Get a member\&#39;s roles in a group|

# **authlanceIdentityApiV1ProfileMyGroupGroupUserAvailableGet**
> DunaAuthCommonGroupAvailabilityResponse authlanceIdentityApiV1ProfileMyGroupGroupUserAvailableGet()


### Example

```typescript
import {
    GroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupsApi(configuration);

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

# **authlanceIdentityApiV1RealmGroupGroupGet**
> DunaAuthCommonGroup authlanceIdentityApiV1RealmGroupGroupGet()


### Example

```typescript
import {
    GroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupsApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupGroupGet(
    group
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **group** | [**string**] | Group name | defaults to undefined|


### Return type

**DunaAuthCommonGroup**

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

# **authlanceIdentityApiV1RealmGroupGroupMembersGet**
> Array<DunaAuthCommonUser> authlanceIdentityApiV1RealmGroupGroupMembersGet()


### Example

```typescript
import {
    GroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupsApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupGroupMembersGet(
    group
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **group** | [**string**] | Group name | defaults to undefined|


### Return type

**Array<DunaAuthCommonUser>**

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

# **authlanceIdentityApiV1RealmGroupGroupPost**
> DunaAuthCommonGroup authlanceIdentityApiV1RealmGroupGroupPost()


### Example

```typescript
import {
    GroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupsApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupGroupPost(
    group
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **group** | [**string**] | Group name | defaults to undefined|


### Return type

**DunaAuthCommonGroup**

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

# **authlanceIdentityApiV1RealmGroupGroupRoleUserGet**
> DunaAuthCommonGroupMemberRolesResponse authlanceIdentityApiV1RealmGroupGroupRoleUserGet()


### Example

```typescript
import {
    GroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupsApi(configuration);

let group: string; //Group name (default to undefined)
let user: string; //User identity (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupGroupRoleUserGet(
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

**DunaAuthCommonGroupMemberRolesResponse**

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

