# InternalApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceLicenseInternalIssuePost**](#authlancelicenseinternalissuepost) | **POST** /authlance/license/internal/issue | Issue license|

# **authlanceLicenseInternalIssuePost**
> string authlanceLicenseInternalIssuePost(payload)

Issues a signed license and optionally persists it for retrieval.

### Example

```typescript
import {
    InternalApi,
    Configuration,
    InternalHttpControllerIssueLicenseRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new InternalApi(configuration);

let payload: InternalHttpControllerIssueLicenseRequest; //License issuance data

const { status, data } = await apiInstance.authlanceLicenseInternalIssuePost(
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **InternalHttpControllerIssueLicenseRequest**| License issuance data | |


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
|**200** | existing license (PEM) |  -  |
|**201** | issued license (PEM) |  -  |
|**400** | invalid payload |  -  |
|**401** | unauthorized |  -  |
|**500** | failed to issue license |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

