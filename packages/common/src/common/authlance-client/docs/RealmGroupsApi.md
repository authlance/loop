# RealmGroupsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceIdentityApiV1RealmGroupGroupGet**](#authlanceidentityapiv1realmgroupgroupget) | **GET** /authlance/identity/api/v1/realm/group/{group} | Get group|
|[**authlanceIdentityApiV1RealmGroupGroupMembersGet**](#authlanceidentityapiv1realmgroupgroupmembersget) | **GET** /authlance/identity/api/v1/realm/group/{group}/members | List group members|
|[**authlanceIdentityApiV1RealmGroupGroupPost**](#authlanceidentityapiv1realmgroupgrouppost) | **POST** /authlance/identity/api/v1/realm/group/{group} | Update group|
|[**authlanceIdentityApiV1RealmGroupGroupRoleUserGet**](#authlanceidentityapiv1realmgroupgrouproleuserget) | **GET** /authlance/identity/api/v1/realm/group/{group}/role/{user} | Get a member\&#39;s roles in a group|

# **authlanceIdentityApiV1RealmGroupGroupGet**
> DunaAuthCommonGroup authlanceIdentityApiV1RealmGroupGroupGet()

Returns public details for the specified group within the caller\'s realm.

### Example

```typescript
import {
    RealmGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RealmGroupsApi(configuration);

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

Lists the users that belong to the given group inside the caller\'s realm.

### Example

```typescript
import {
    RealmGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RealmGroupsApi(configuration);

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
> DunaAuthCommonGroup authlanceIdentityApiV1RealmGroupGroupPost(payload)

Updates group metadata that is accessible within the current realm.

### Example

```typescript
import {
    RealmGroupsApi,
    Configuration,
    DunaAuthCommonGroup
} from './api';

const configuration = new Configuration();
const apiInstance = new RealmGroupsApi(configuration);

let group: string; //Group name (default to undefined)
let payload: DunaAuthCommonGroup; //Group data to update

const { status, data } = await apiInstance.authlanceIdentityApiV1RealmGroupGroupPost(
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

# **authlanceIdentityApiV1RealmGroupGroupRoleUserGet**
> DunaAuthCommonGroupMemberRolesResponse authlanceIdentityApiV1RealmGroupGroupRoleUserGet()

Returns the roles granted to the specified user inside the given group within the caller\'s realm.

### Example

```typescript
import {
    RealmGroupsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RealmGroupsApi(configuration);

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

