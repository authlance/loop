# AdminGroupsApi

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
|[**authlanceIdentityApiV1AdminGroupIdGroupIdGet**](#authlanceidentityapiv1admingroupidgroupidget) | **GET** /authlance/identity/api/v1/admin/group/id/{groupId} | Get group by ID (admin)|
|[**authlanceIdentityApiV1AdminGroupMemberIdentityGet**](#authlanceidentityapiv1admingroupmemberidentityget) | **GET** /authlance/identity/api/v1/admin/group/member/{identity} | List groups for identity|
|[**authlanceIdentityApiV1AdminGroupPut**](#authlanceidentityapiv1admingroupput) | **PUT** /authlance/identity/api/v1/admin/group | Create group|
|[**authlanceIdentityApiV1AdminGroupRolesGroupGet**](#authlanceidentityapiv1admingrouprolesgroupget) | **GET** /authlance/identity/api/v1/admin/group/roles/{group} | List roles assigned within a group (admin)|
|[**authlanceIdentityApiV1AdminGroupsPageGet**](#authlanceidentityapiv1admingroupspageget) | **GET** /authlance/identity/api/v1/admin/groups/{page} | List groups|

# **authlanceIdentityApiV1AdminGroupGroupAvailableGet**
> DunaAuthCommonGroupAvailabilityResponse authlanceIdentityApiV1AdminGroupGroupAvailableGet()

Allows admins to check if a group slug is free before provisioning the group.

### Example

```typescript
import {
    AdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminGroupsApi(configuration);

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

Returns group metadata along with administrative attributes.

### Example

```typescript
import {
    AdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminGroupsApi(configuration);

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

Removes the specified user from the target group and updates their membership cache.

### Example

```typescript
import {
    AdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminGroupsApi(configuration);

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

Lists the users inside the given group, including admin-only metadata.

### Example

```typescript
import {
    AdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminGroupsApi(configuration);

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

Adds (or invites) a user to the target group, creating the account when needed.

### Example

```typescript
import {
    AdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminGroupsApi(configuration);

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
> DunaAuthCommonGroup authlanceIdentityApiV1AdminGroupGroupPost(payload)

Updates any group metadata, including avatar uploads, as an administrator.

### Example

```typescript
import {
    AdminGroupsApi,
    Configuration,
    DunaAuthCommonGroup
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminGroupsApi(configuration);

let group: string; //Group name (default to undefined)
let payload: DunaAuthCommonGroup; //Group data to update

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminGroupGroupPost(
    group,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **DunaAuthCommonGroup**| Group data to update | |
| **group** | [**string**] | Group name | defaults to undefined|


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
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1AdminGroupGroupRolePost**
> DunaAuthCommonUser authlanceIdentityApiV1AdminGroupGroupRolePost()

Replaces the set of roles granted to a group member. Requires admin privileges.

### Example

```typescript
import {
    AdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminGroupsApi(configuration);

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

Returns the roles granted to the specified user inside the given group. Requires admin privileges.

### Example

```typescript
import {
    AdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminGroupsApi(configuration);

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

# **authlanceIdentityApiV1AdminGroupIdGroupIdGet**
> DunaAuthCommonGroup authlanceIdentityApiV1AdminGroupIdGroupIdGet()

Returns group metadata by numeric group ID.

### Example

```typescript
import {
    AdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminGroupsApi(configuration);

let groupId: number; //Group ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminGroupIdGroupIdGet(
    groupId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|


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

# **authlanceIdentityApiV1AdminGroupMemberIdentityGet**
> Array<DunaAuthCommonGroup> authlanceIdentityApiV1AdminGroupMemberIdentityGet()

Lists all groups for the specified identity. Useful for administrative audits.

### Example

```typescript
import {
    AdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminGroupsApi(configuration);

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

Creates a new group using the provided display name. The logical slug is normalized automatically.

### Example

```typescript
import {
    AdminGroupsApi,
    Configuration,
    DunaAuthCommonGroup
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminGroupsApi(configuration);

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

Lists each member within the group alongside their assigned roles.

### Example

```typescript
import {
    AdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminGroupsApi(configuration);

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

Paginates through groups with optional filters by name.

### Example

```typescript
import {
    AdminGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminGroupsApi(configuration);

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

