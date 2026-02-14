# RealmAdminGroupsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceIdentityApiV1RealmAdminGroupGroupMembersDelete**](#authlanceidentityapiv1realmadmingroupgroupmembersdelete) | **DELETE** /authlance/identity/api/v1/realm/admin/group/{group}/members | Remove user from group (realm admin)|
|[**authlanceIdentityApiV1RealmAdminGroupGroupMembersPost**](#authlanceidentityapiv1realmadmingroupgroupmemberspost) | **POST** /authlance/identity/api/v1/realm/admin/group/{group}/members | Add user to group (realm admin)|
|[**authlanceIdentityApiV1RealmAdminGroupGroupRolePost**](#authlanceidentityapiv1realmadmingroupgrouprolepost) | **POST** /authlance/identity/api/v1/realm/admin/group/{group}/role | Assign roles to group member (realm admin)|
|[**authlanceIdentityApiV1RealmAdminGroupGroupRoleUserGet**](#authlanceidentityapiv1realmadmingroupgrouproleuserget) | **GET** /authlance/identity/api/v1/realm/admin/group/{group}/role/{user} | Get a member\&#39;s roles in a group (realm admin)|
|[**authlanceIdentityApiV1RealmAdminGroupRolesGroupGet**](#authlanceidentityapiv1realmadmingrouprolesgroupget) | **GET** /authlance/identity/api/v1/realm/admin/group/roles/{group} | List roles assigned within a group (realm admin)|

# **authlanceIdentityApiV1RealmAdminGroupGroupMembersDelete**
> DunaAuthCommonUser authlanceIdentityApiV1RealmAdminGroupGroupMembersDelete()

Realm-level admin endpoint to remove a user from the target group.

### Example

```typescript
import {
    RealmAdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RealmAdminGroupsApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmAdminGroupGroupMembersDelete(
    group
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **group** | [**string**] | Group name | defaults to undefined|


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

# **authlanceIdentityApiV1RealmAdminGroupGroupMembersPost**
> DunaAuthCommonUser authlanceIdentityApiV1RealmAdminGroupGroupMembersPost()

Realm-level admin endpoint to add or invite a user to the target group.

### Example

```typescript
import {
    RealmAdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RealmAdminGroupsApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmAdminGroupGroupMembersPost(
    group
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **group** | [**string**] | Group name | defaults to undefined|


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

# **authlanceIdentityApiV1RealmAdminGroupGroupRolePost**
> DunaAuthCommonUser authlanceIdentityApiV1RealmAdminGroupGroupRolePost()

Realm-level admin endpoint to manage roles assigned to a group member.

### Example

```typescript
import {
    RealmAdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RealmAdminGroupsApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmAdminGroupGroupRolePost(
    group
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **group** | [**string**] | Group name | defaults to undefined|


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

# **authlanceIdentityApiV1RealmAdminGroupGroupRoleUserGet**
> DunaAuthCommonGroupMemberRolesResponse authlanceIdentityApiV1RealmAdminGroupGroupRoleUserGet()

Realm-level admin endpoint that returns the roles granted to the specified user inside the given group.

### Example

```typescript
import {
    RealmAdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RealmAdminGroupsApi(configuration);

let group: string; //Group name (default to undefined)
let user: string; //User identity (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmAdminGroupGroupRoleUserGet(
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

# **authlanceIdentityApiV1RealmAdminGroupRolesGroupGet**
> DunaAuthCommonGroupMembershipRolesListResponse authlanceIdentityApiV1RealmAdminGroupRolesGroupGet()

Realm-level admin endpoint that lists every member in the group with their roles.

### Example

```typescript
import {
    RealmAdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RealmAdminGroupsApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmAdminGroupRolesGroupGet(
    group
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **group** | [**string**] | Group name | defaults to undefined|


### Return type

**DunaAuthCommonGroupMembershipRolesListResponse**

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

