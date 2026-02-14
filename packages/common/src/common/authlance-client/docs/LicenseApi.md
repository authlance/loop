# LicenseApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceIdentityApiV1AdminLicenseReloadPost**](#authlanceidentityapiv1adminlicensereloadpost) | **POST** /authlance/identity/api/v1/admin/license/reload | Reload license|
|[**authlanceIdentityApiV1AdminLicenseStatusGet**](#authlanceidentityapiv1adminlicensestatusget) | **GET** /authlance/identity/api/v1/admin/license/status | Get license status|
|[**authlanceIdentityApiV1AdminLicenseValuePut**](#authlanceidentityapiv1adminlicensevalueput) | **PUT** /authlance/identity/api/v1/admin/license/value | Update license|

# **authlanceIdentityApiV1AdminLicenseReloadPost**
> ControllersLicenseLicenseStatusResponse authlanceIdentityApiV1AdminLicenseReloadPost()

Forces the license manager to reload the license file immediately (requires sysadmin privileges).

### Example

```typescript
import {
    LicenseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LicenseApi(configuration);

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminLicenseReloadPost();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ControllersLicenseLicenseStatusResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**503** | license manager unavailable |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1AdminLicenseStatusGet**
> ControllersLicenseLicenseStatusResponse authlanceIdentityApiV1AdminLicenseStatusGet()

Returns the current evaluated license status (requires sysadmin privileges).

### Example

```typescript
import {
    LicenseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LicenseApi(configuration);

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminLicenseStatusGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ControllersLicenseLicenseStatusResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**503** | license manager unavailable |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1AdminLicenseValuePut**
> ControllersLicenseLicenseStatusResponse authlanceIdentityApiV1AdminLicenseValuePut(payload)

Persists a new license payload and reloads the active license status (requires sysadmin privileges).

### Example

```typescript
import {
    LicenseApi,
    Configuration,
    ControllersLicenseUpdateLicenseRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new LicenseApi(configuration);

let payload: ControllersLicenseUpdateLicenseRequest; //License payload

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminLicenseValuePut(
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersLicenseUpdateLicenseRequest**| License payload | |


### Return type

**ControllersLicenseLicenseStatusResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | invalid license payload |  -  |
|**503** | license manager unavailable |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

