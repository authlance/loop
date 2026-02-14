# PersonalAccessTokensApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceIdentityApiV1PatsGet**](#authlanceidentityapiv1patsget) | **GET** /authlance/identity/api/v1/pats | List personal access tokens for a group|
|[**authlanceIdentityApiV1PatsPost**](#authlanceidentityapiv1patspost) | **POST** /authlance/identity/api/v1/pats | Create personal access token|
|[**authlanceIdentityApiV1PatsTokenIdDelete**](#authlanceidentityapiv1patstokeniddelete) | **DELETE** /authlance/identity/api/v1/pats/{tokenId} | Revoke personal access token|
|[**authlanceIdentityApiV1PatsVerifyPost**](#authlanceidentityapiv1patsverifypost) | **POST** /authlance/identity/api/v1/pats/verify | Verify personal access token|

# **authlanceIdentityApiV1PatsGet**
> Array<ControllersPersonalaccesstokensPersonalAccessTokenResponse> authlanceIdentityApiV1PatsGet()

Lists personal access tokens for the specified group.

### Example

```typescript
import {
    PersonalAccessTokensApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PersonalAccessTokensApi(configuration);

let groupId: number; //Group identifier (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1PatsGet(
    groupId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group identifier | defaults to undefined|


### Return type

**Array<ControllersPersonalaccesstokensPersonalAccessTokenResponse>**

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
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1PatsPost**
> ControllersPersonalaccesstokensPersonalAccessTokenResponse authlanceIdentityApiV1PatsPost(payload)

Creates a new personal access token for a group and returns the token value once.

### Example

```typescript
import {
    PersonalAccessTokensApi,
    Configuration,
    ControllersPersonalaccesstokensCreatePersonalAccessTokenRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PersonalAccessTokensApi(configuration);

let payload: ControllersPersonalaccesstokensCreatePersonalAccessTokenRequest; //Personal access token payload

const { status, data } = await apiInstance.authlanceIdentityApiV1PatsPost(
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersPersonalaccesstokensCreatePersonalAccessTokenRequest**| Personal access token payload | |


### Return type

**ControllersPersonalaccesstokensPersonalAccessTokenResponse**

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
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1PatsTokenIdDelete**
> authlanceIdentityApiV1PatsTokenIdDelete()

Revokes a personal access token by setting its revokedAt timestamp.

### Example

```typescript
import {
    PersonalAccessTokensApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PersonalAccessTokensApi(configuration);

let tokenId: string; //Token identifier (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1PatsTokenIdDelete(
    tokenId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tokenId** | [**string**] | Token identifier | defaults to undefined|


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
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1PatsVerifyPost**
> ControllersPersonalaccesstokensVerifyPersonalAccessTokenResponse authlanceIdentityApiV1PatsVerifyPost()

Verifies whether a personal access token is valid and returns its metadata.

### Example

```typescript
import {
    PersonalAccessTokensApi,
    Configuration,
    ControllersPersonalaccesstokensVerifyPersonalAccessTokenRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PersonalAccessTokensApi(configuration);

let authorization: string; //Bearer pat_<prefix>-<secret> (optional) (default to undefined)
let payload: ControllersPersonalaccesstokensVerifyPersonalAccessTokenRequest; //Verification payload (optional)

const { status, data } = await apiInstance.authlanceIdentityApiV1PatsVerifyPost(
    authorization,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersPersonalaccesstokensVerifyPersonalAccessTokenRequest**| Verification payload | |
| **authorization** | [**string**] | Bearer pat_&lt;prefix&gt;-&lt;secret&gt; | (optional) defaults to undefined|


### Return type

**ControllersPersonalaccesstokensVerifyPersonalAccessTokenResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

