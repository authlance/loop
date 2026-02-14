# AdminSubscriptionsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceIdentityApiV1AdminSubscriptionsGroupGroupIdGet**](#authlanceidentityapiv1adminsubscriptionsgroupgroupidget) | **GET** /authlance/identity/api/v1/admin/subscriptions/group/{groupId} | List subscriptions for a group (admin)|

# **authlanceIdentityApiV1AdminSubscriptionsGroupGroupIdGet**
> Array<DunaAuthCommonGroupSubscriptionsDto> authlanceIdentityApiV1AdminSubscriptionsGroupGroupIdGet()

Returns all subscriptions for the specified group by group ID.

### Example

```typescript
import {
    AdminSubscriptionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminSubscriptionsApi(configuration);

let groupId: number; //Group ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1AdminSubscriptionsGroupGroupIdGet(
    groupId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupId** | [**number**] | Group ID | defaults to undefined|


### Return type

**Array<DunaAuthCommonGroupSubscriptionsDto>**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Invalid group ID |  -  |
|**404** | No subscriptions found |  -  |
|**500** | Internal error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

