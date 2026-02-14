# AdminApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceIdentityApiV1AdminGroupGroupAvailableGet**](#authlanceidentityapiv1admingroupgroupavailableget) | **GET** /authlance/identity/api/v1/admin/group/{group}/available | Check if a group name is available (admin)|
|[**authlanceIdentityApiV1AdminGroupGroupGet**](#authlanceidentityapiv1admingroupgroupget) | **GET** /authlance/identity/api/v1/admin/group/{group} | Get group (admin)|
|[**authlanceIdentityApiV1AdminGroupGroupMembersDelete**](#authlanceidentityapiv1admingroupgroupmembersdelete) | **DELETE** /authlance/identity/api/v1/admin/group/{group}/members | Remove user from group (admin)|
|[**authlanceIdentityApiV1AdminGroupGroupMembersGet**](#authlanceidentityapiv1admingroupgroupmembersget) | **GET** /authlance/identity/api/v1/admin/group/{group}/members | List group members (admin)|
|[**authlanceIdentityApiV1AdminGroupGroupMembersPost**](#authlanceidentityapiv1admingroupgroupmemberspost) | **POST** /authlance/identity/api/v1/admin/group/{group}/members | Add user to group (admin)|
|[**authlanceIdentityApiV1AdminGroupGroupPost**](#authlanceidentityapiv1admingroupgrouppost) | **POST** /authlance/identity/api/v1/admin/group/{group} | Update group (admin)|
|[**authlanceIdentityApiV1AdminGroupGroupRolePost**](#authlanceidentityapiv1admingroupgrouprolepost) | **POST** /authlance/identity/api/v1/admin/group/{group}/role | Assign roles to group member (admin)|
|[**authlanceIdentityApiV1AdminGroupGroupRoleUserGet**](#authlanceidentityapiv1admingroupgrouproleuserget) | **GET** /authlance/identity/api/v1/admin/group/{group}/role/{user} | Get a member\&#39;s roles in a group (admin)|
|[**authlanceIdentityApiV1AdminGroupMemberIdentityGet**](#authlanceidentityapiv1admingroupmemberidentityget) | **GET** /authlance/identity/api/v1/admin/group/member/{identity} | List groups for identity|
|[**authlanceIdentityApiV1AdminGroupPut**](#authlanceidentityapiv1admingroupput) | **PUT** /authlance/identity/api/v1/admin/group | Create group|
|[**authlanceIdentityApiV1AdminGroupRolesGroupGet**](#authlanceidentityapiv1admingrouprolesgroupget) | **GET** /authlance/identity/api/v1/admin/group/roles/{group} | List roles assigned within a group (admin)|
|[**authlanceIdentityApiV1AdminGroupsPageGet**](#authlanceidentityapiv1admingroupspageget) | **GET** /authlance/identity/api/v1/admin/groups/{page} | List groups|
|[**authlanceIdentityApiV1AdminRolePut**](#authlanceidentityapiv1adminroleput) | **PUT** /authlance/identity/api/v1/admin/role | Create role|
|[**authlanceIdentityApiV1AdminRolesPageGet**](#authlanceidentityapiv1adminrolespageget) | **GET** /authlance/identity/api/v1/admin/roles/{page} | List available roles (admin)|
|[**authlanceIdentityApiV1AdminUserIdentityBanPost**](#authlanceidentityapiv1adminuseridentitybanpost) | **POST** /authlance/identity/api/v1/admin/user/{identity}/ban | Ban user|
|[**authlanceIdentityApiV1AdminUserIdentityGet**](#authlanceidentityapiv1adminuseridentityget) | **GET** /authlance/identity/api/v1/admin/user/{identity} | Find user by identity|
|[**authlanceIdentityApiV1AdminUserIdentityUnbanPost**](#authlanceidentityapiv1adminuseridentityunbanpost) | **POST** /authlance/identity/api/v1/admin/user/{identity}/unban | Unban user|
|[**authlanceIdentityApiV1AdminUserPost**](#authlanceidentityapiv1adminuserpost) | **POST** /authlance/identity/api/v1/admin/user | Update user (admin)|
|[**authlanceIdentityApiV1AdminUserPut**](#authlanceidentityapiv1adminuserput) | **PUT** /authlance/identity/api/v1/admin/user | Create user|
|[**authlanceIdentityApiV1AdminUserRolePut**](#authlanceidentityapiv1adminuserroleput) | **PUT** /authlance/identity/api/v1/admin/user/role | Assign roles to user|
|[**authlanceIdentityApiV1AdminUsersPageGet**](#authlanceidentityapiv1adminuserspageget) | **GET** /authlance/identity/api/v1/admin/users/{page} | List users|
|[**authlanceIdentityApiV1RealmAdminGroupGroupMembersDelete**](#authlanceidentityapiv1realmadmingroupgroupmembersdelete) | **DELETE** /authlance/identity/api/v1/realm/admin/group/{group}/members | Remove user from group (realm admin)|
|[**authlanceIdentityApiV1RealmAdminGroupGroupMembersPost**](#authlanceidentityapiv1realmadmingroupgroupmemberspost) | **POST** /authlance/identity/api/v1/realm/admin/group/{group}/members | Add user to group (realm admin)|
|[**authlanceIdentityApiV1RealmAdminGroupGroupRolePost**](#authlanceidentityapiv1realmadmingroupgrouprolepost) | **POST** /authlance/identity/api/v1/realm/admin/group/{group}/role | Assign roles to group member (realm admin)|
|[**authlanceIdentityApiV1RealmAdminGroupGroupRoleUserGet**](#authlanceidentityapiv1realmadmingroupgrouproleuserget) | **GET** /authlance/identity/api/v1/realm/admin/group/{group}/role/{user} | Get a member\&#39;s roles in a group (realm admin)|
|[**authlanceIdentityApiV1RealmAdminGroupRolesGroupGet**](#authlanceidentityapiv1realmadmingrouprolesgroupget) | **GET** /authlance/identity/api/v1/realm/admin/group/roles/{group} | List roles assigned within a group (realm admin)|

# **authlanceIdentityApiV1AdminGroupGroupAvailableGet**
> DunaAuthCommonGroupAvailabilityResponse authlanceIdentityApiV1AdminGroupGroupAvailableGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminGroupGroupAvailableGet(
    group
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **group** | [**string**] | Group name | defaults to undefined|


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

# **authlanceIdentityApiV1AdminGroupGroupGet**
> DunaAuthCommonGroup authlanceIdentityApiV1AdminGroupGroupGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminGroupGroupGet(
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

# **authlanceIdentityApiV1AdminGroupGroupMembersDelete**
> DunaAuthCommonUser authlanceIdentityApiV1AdminGroupGroupMembersDelete()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminGroupGroupMembersDelete(
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

# **authlanceIdentityApiV1AdminGroupGroupMembersGet**
> Array<DunaAuthCommonUser> authlanceIdentityApiV1AdminGroupGroupMembersGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminGroupGroupMembersGet(
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

# **authlanceIdentityApiV1AdminGroupGroupMembersPost**
> DunaAuthCommonUser authlanceIdentityApiV1AdminGroupGroupMembersPost()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminGroupGroupMembersPost(
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

# **authlanceIdentityApiV1AdminGroupGroupPost**
> DunaAuthCommonGroup authlanceIdentityApiV1AdminGroupGroupPost()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminGroupGroupPost(
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

# **authlanceIdentityApiV1AdminGroupGroupRolePost**
> DunaAuthCommonUser authlanceIdentityApiV1AdminGroupGroupRolePost()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminGroupGroupRolePost(
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

# **authlanceIdentityApiV1AdminGroupGroupRoleUserGet**
> DunaAuthCommonGroupMemberRolesResponse authlanceIdentityApiV1AdminGroupGroupRoleUserGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let group: string; //Group name (default to undefined)
let user: string; //User identity (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminGroupGroupRoleUserGet(
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

# **authlanceIdentityApiV1AdminGroupMemberIdentityGet**
> Array<DunaAuthCommonGroup> authlanceIdentityApiV1AdminGroupMemberIdentityGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let identity: string; //Identity ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminGroupMemberIdentityGet(
    identity
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **identity** | [**string**] | Identity ID | defaults to undefined|


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
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1AdminGroupPut**
> DunaAuthCommonGroup authlanceIdentityApiV1AdminGroupPut(payload)


### Example

```typescript
import {
    AdminApi,
    Configuration,
    DunaAuthCommonGroup
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let payload: DunaAuthCommonGroup; //Group to create (id = -1)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminGroupPut(
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **DunaAuthCommonGroup**| Group to create (id &#x3D; -1) | |


### Return type

**DunaAuthCommonGroup**

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

# **authlanceIdentityApiV1AdminGroupRolesGroupGet**
> DunaAuthCommonGroupMembershipRolesListResponse authlanceIdentityApiV1AdminGroupRolesGroupGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminGroupRolesGroupGet(
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

# **authlanceIdentityApiV1AdminGroupsPageGet**
> DunaAuthCommonGroupsPageResponse authlanceIdentityApiV1AdminGroupsPageGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let page: number; //Page number (default to undefined)
let perPage: number; //Per-page size (optional) (default to undefined)
let filter: string; //Filter by name (optional) (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminGroupsPageGet(
    page,
    perPage,
    filter
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] | Page number | defaults to undefined|
| **perPage** | [**number**] | Per-page size | (optional) defaults to undefined|
| **filter** | [**string**] | Filter by name | (optional) defaults to undefined|


### Return type

**DunaAuthCommonGroupsPageResponse**

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

# **authlanceIdentityApiV1AdminRolePut**
> DunaAuthCommonRoleResponse authlanceIdentityApiV1AdminRolePut(payload)


### Example

```typescript
import {
    AdminApi,
    Configuration,
    DunaAuthCommonRoleResponse
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

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


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

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

# **authlanceIdentityApiV1AdminUserIdentityBanPost**
> DunaAuthCommonIdentityStateResponse authlanceIdentityApiV1AdminUserIdentityBanPost()

Deactivates a user\'s identity and optionally revokes active sessions.

### Example

```typescript
import {
    AdminApi,
    Configuration,
    ControllersUsersBanUserRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

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


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

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
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

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

Admin endpoint to update a user profile; supports JSON or multipart with avatar.

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

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


### Example

```typescript
import {
    AdminApi,
    Configuration,
    DunaAuthCommonUser
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

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

# **authlanceIdentityApiV1AdminUserRolePut**
> DunaAuthCommonUser authlanceIdentityApiV1AdminUserRolePut(payload)


### Example

```typescript
import {
    AdminApi,
    Configuration,
    ControllersUsersRoleAssignmentPayload
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

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

# **authlanceIdentityApiV1AdminUsersPageGet**
> DunaAuthCommonUsersPageResponse authlanceIdentityApiV1AdminUsersPageGet()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

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

# **authlanceIdentityApiV1RealmAdminGroupGroupMembersDelete**
> DunaAuthCommonUser authlanceIdentityApiV1RealmAdminGroupGroupMembersDelete()


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

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


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

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


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

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


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

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


### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

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

