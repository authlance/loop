# LicenseApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceLicenseGroupGet**](#authlancelicensegroupget) | **GET** /authlance/license/{group} | List group licenses (simple)|
|[**authlanceLicenseGroupsGroupNameLicensesGet**](#authlancelicensegroupsgroupnamelicensesget) | **GET** /authlance/license/groups/{groupName}/licenses | List group licenses (paginated)|
|[**authlanceLicenseIdentifierGet**](#authlancelicenseidentifierget) | **GET** /authlance/license/{identifier} | Get issued license|
|[**authlanceLicenseIdentifierGet_0**](#authlancelicenseidentifierget_0) | **GET** /authlance/license/{identifier} | Get issued license|
|[**authlanceLicenseLicenseIdGet**](#authlancelicenselicenseidget) | **GET** /authlance/license/{licenseId} | Get issued license|
|[**authlanceLicenseLicenseIdGet_0**](#authlancelicenselicenseidget_0) | **GET** /authlance/license/{licenseId} | Get issued license|
|[**authlanceLicenseTrialGroupIssuePost**](#authlancelicensetrialgroupissuepost) | **POST** /authlance/license/trial/{group}/issue | Issue trial license|

# **authlanceLicenseGroupGet**
> InternalHttpControllerPaginatedLicenseList authlanceLicenseGroupGet()


### Example

```typescript
import {
    LicenseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LicenseApi(configuration);

let group: string; //Group name (default to undefined)
let page: number; //Page number (default 1) (optional) (default to undefined)
let pageSize: number; //Page size (default 20, max 100) (optional) (default to undefined)
let plan: string; //Filter by plan (optional) (default to undefined)

const { status, data } = await apiInstance.authlanceLicenseGroupGet(
    group,
    page,
    pageSize,
    plan
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **group** | [**string**] | Group name | defaults to undefined|
| **page** | [**number**] | Page number (default 1) | (optional) defaults to undefined|
| **pageSize** | [**number**] | Page size (default 20, max 100) | (optional) defaults to undefined|
| **plan** | [**string**] | Filter by plan | (optional) defaults to undefined|


### Return type

**InternalHttpControllerPaginatedLicenseList**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | invalid pagination |  -  |
|**401** | unauthorized |  -  |
|**403** | forbidden |  -  |
|**500** | failed to list licenses |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseGroupsGroupNameLicensesGet**
> InternalHttpControllerPaginatedLicenseList authlanceLicenseGroupsGroupNameLicensesGet()


### Example

```typescript
import {
    LicenseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LicenseApi(configuration);

let groupName: string; //Group name (default to undefined)
let page: number; //Page number (default 1) (optional) (default to undefined)
let pageSize: number; //Page size (default 20, max 100) (optional) (default to undefined)
let plan: string; //Filter by plan (optional) (default to undefined)

const { status, data } = await apiInstance.authlanceLicenseGroupsGroupNameLicensesGet(
    groupName,
    page,
    pageSize,
    plan
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupName** | [**string**] | Group name | defaults to undefined|
| **page** | [**number**] | Page number (default 1) | (optional) defaults to undefined|
| **pageSize** | [**number**] | Page size (default 20, max 100) | (optional) defaults to undefined|
| **plan** | [**string**] | Filter by plan | (optional) defaults to undefined|


### Return type

**InternalHttpControllerPaginatedLicenseList**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | invalid pagination |  -  |
|**401** | unauthorized |  -  |
|**403** | forbidden |  -  |
|**500** | failed to list licenses |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseIdentifierGet**
> string authlanceLicenseIdentifierGet()


### Example

```typescript
import {
    LicenseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LicenseApi(configuration);

let identifier: string; //License ID (prefixed with L-) or group name (default to undefined)

const { status, data } = await apiInstance.authlanceLicenseIdentifierGet(
    identifier
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **identifier** | [**string**] | License ID (prefixed with L-) or group name | defaults to undefined|


### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/plain


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | license (PEM) |  -  |
|**400** | license id required |  -  |
|**401** | unauthorized |  -  |
|**403** | forbidden |  -  |
|**404** | license not found |  -  |
|**500** | failed to load license |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseIdentifierGet_0**
> string authlanceLicenseIdentifierGet_0()


### Example

```typescript
import {
    LicenseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LicenseApi(configuration);

let identifier: string; //License ID (prefixed with L-) or group name (default to undefined)

const { status, data } = await apiInstance.authlanceLicenseIdentifierGet_0(
    identifier
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **identifier** | [**string**] | License ID (prefixed with L-) or group name | defaults to undefined|


### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/plain


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | license (PEM) |  -  |
|**400** | license id required |  -  |
|**401** | unauthorized |  -  |
|**403** | forbidden |  -  |
|**404** | license not found |  -  |
|**500** | failed to load license |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseLicenseIdGet**
> string authlanceLicenseLicenseIdGet()


### Example

```typescript
import {
    LicenseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LicenseApi(configuration);

let licenseId: string; //License ID (default to undefined)

const { status, data } = await apiInstance.authlanceLicenseLicenseIdGet(
    licenseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **licenseId** | [**string**] | License ID | defaults to undefined|


### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/plain


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | license (PEM) |  -  |
|**400** | license id required |  -  |
|**401** | unauthorized |  -  |
|**403** | forbidden |  -  |
|**404** | license not found |  -  |
|**500** | failed to load license |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseLicenseIdGet_0**
> string authlanceLicenseLicenseIdGet_0()


### Example

```typescript
import {
    LicenseApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LicenseApi(configuration);

let licenseId: string; //License ID (default to undefined)

const { status, data } = await apiInstance.authlanceLicenseLicenseIdGet_0(
    licenseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **licenseId** | [**string**] | License ID | defaults to undefined|


### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/plain


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | license (PEM) |  -  |
|**400** | license id required |  -  |
|**401** | unauthorized |  -  |
|**403** | forbidden |  -  |
|**404** | license not found |  -  |
|**500** | failed to load license |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseTrialGroupIssuePost**
> string authlanceLicenseTrialGroupIssuePost(payload)


### Example

```typescript
import {
    LicenseApi,
    Configuration,
    InternalHttpControllerTrialIssueRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new LicenseApi(configuration);

let group: string; //Group name (default to undefined)
let payload: InternalHttpControllerTrialIssueRequest; //Trial issuance data

const { status, data } = await apiInstance.authlanceLicenseTrialGroupIssuePost(
    group,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **InternalHttpControllerTrialIssueRequest**| Trial issuance data | |
| **group** | [**string**] | Group name | defaults to undefined|


### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/plain


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | existing trial license (PEM) |  -  |
|**201** | issued trial license (PEM) |  -  |
|**400** | invalid payload |  -  |
|**401** | unauthorized |  -  |
|**403** | forbidden |  -  |
|**409** | trial already issued |  -  |
|**500** | failed to issue trial |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

