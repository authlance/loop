# AuthApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceIdentityMeLogoutGet**](#authlanceidentitymelogoutget) | **GET** /authlance/identity/me/logout | Logout user|
|[**authlanceIdentityMePost**](#authlanceidentitymepost) | **POST** /authlance/identity/me | Exchange a session for JWT|

# **authlanceIdentityMeLogoutGet**
> ControllersAuthLogoutResponse authlanceIdentityMeLogoutGet()

Clears the authentication cookie to log out the user.

### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.authlanceIdentityMeLogoutGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ControllersAuthLogoutResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityMePost**
> ControllersAuthAuthResponse authlanceIdentityMePost(payload)

Accepts a `session` ID and returns a signed JWT used for the protected API.

### Example

```typescript
import {
    AuthApi,
    Configuration,
    ControllersAuthAuthRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let payload: ControllersAuthAuthRequest; //Authentication payload

const { status, data } = await apiInstance.authlanceIdentityMePost(
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersAuthAuthRequest**| Authentication payload | |


### Return type

**ControllersAuthAuthResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Invalid request payload |  -  |
|**401** | Invalid session or unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

