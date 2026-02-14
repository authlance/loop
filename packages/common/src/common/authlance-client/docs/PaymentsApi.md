# PaymentsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlancePaymentsApiV1CheckoutSessionPost**](#authlancepaymentsapiv1checkoutsessionpost) | **POST** /authlance/payments/api/v1/checkout-session | Create checkout session|
|[**authlancePaymentsApiV1CustomerPortalPost**](#authlancepaymentsapiv1customerportalpost) | **POST** /authlance/payments/api/v1/customer-portal | Create customer portal session|
|[**authlancePaymentsApiV1ProductDetailsPost**](#authlancepaymentsapiv1productdetailspost) | **POST** /authlance/payments/api/v1/product-details | Get product details|
|[**authlancePaymentsApiV1SessionIdPost**](#authlancepaymentsapiv1sessionidpost) | **POST** /authlance/payments/api/v1/session-id | Get subscription from session|
|[**authlancePaymentsApiV1StripeWebhookPost**](#authlancepaymentsapiv1stripewebhookpost) | **POST** /authlance/payments/api/v1/stripe/webhook | Handle Stripe webhook|

# **authlancePaymentsApiV1CheckoutSessionPost**
> DunaAuthCommonCreateCheckoutSessionResponse authlancePaymentsApiV1CheckoutSessionPost(request)

Creates a new Stripe checkout session for subscription payment

### Example

```typescript
import {
    PaymentsApi,
    Configuration,
    DunaAuthCommonCreateCheckoutSessionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let request: DunaAuthCommonCreateCheckoutSessionRequest; //Checkout session request

const { status, data } = await apiInstance.authlancePaymentsApiV1CheckoutSessionPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DunaAuthCommonCreateCheckoutSessionRequest**| Checkout session request | |


### Return type

**DunaAuthCommonCreateCheckoutSessionResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad request |  -  |
|**401** | Unauthorized |  -  |
|**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlancePaymentsApiV1CustomerPortalPost**
> DunaAuthCommonCreateCustomerPortalSessionResponse authlancePaymentsApiV1CustomerPortalPost(request)

Creates a Stripe customer portal session for subscription management

### Example

```typescript
import {
    PaymentsApi,
    Configuration,
    DunaAuthCommonCreateCustomerPortalSessionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let request: DunaAuthCommonCreateCustomerPortalSessionRequest; //Portal session request

const { status, data } = await apiInstance.authlancePaymentsApiV1CustomerPortalPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DunaAuthCommonCreateCustomerPortalSessionRequest**| Portal session request | |


### Return type

**DunaAuthCommonCreateCustomerPortalSessionResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad request |  -  |
|**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlancePaymentsApiV1ProductDetailsPost**
> DunaAuthCommonGetProductDetailsResponse authlancePaymentsApiV1ProductDetailsPost(request)

Retrieves Stripe product details by lookup key

### Example

```typescript
import {
    PaymentsApi,
    Configuration,
    DunaAuthCommonGetProductDetailsRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let request: DunaAuthCommonGetProductDetailsRequest; //Product details request

const { status, data } = await apiInstance.authlancePaymentsApiV1ProductDetailsPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DunaAuthCommonGetProductDetailsRequest**| Product details request | |


### Return type

**DunaAuthCommonGetProductDetailsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad request |  -  |
|**404** | Product not found |  -  |
|**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlancePaymentsApiV1SessionIdPost**
> DunaAuthCommonGetSubscriptionSessionResponse authlancePaymentsApiV1SessionIdPost(request)

Retrieves the subscription ID from a checkout session

### Example

```typescript
import {
    PaymentsApi,
    Configuration,
    DunaAuthCommonGetSubscriptionSessionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let request: DunaAuthCommonGetSubscriptionSessionRequest; //Session request

const { status, data } = await apiInstance.authlancePaymentsApiV1SessionIdPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **DunaAuthCommonGetSubscriptionSessionRequest**| Session request | |


### Return type

**DunaAuthCommonGetSubscriptionSessionResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad request |  -  |
|**404** | Subscription not found |  -  |
|**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlancePaymentsApiV1StripeWebhookPost**
> string authlancePaymentsApiV1StripeWebhookPost()

Processes Stripe webhook events

### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

const { status, data } = await apiInstance.authlancePaymentsApiV1StripeWebhookPost();
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
|**200** | Webhook processed successfully |  -  |
|**400** | Bad request |  -  |
|**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

