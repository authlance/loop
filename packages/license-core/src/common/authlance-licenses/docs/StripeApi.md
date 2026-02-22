# StripeApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceLicenseStripeWebhookPost**](#authlancelicensestripewebhookpost) | **POST** /authlance/license/stripe/webhook | Stripe webhook|

# **authlanceLicenseStripeWebhookPost**
> string authlanceLicenseStripeWebhookPost()


### Example

```typescript
import {
    StripeApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new StripeApi(configuration);

const { status, data } = await apiInstance.authlanceLicenseStripeWebhookPost();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | ok |  -  |
|**400** | webhook error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

