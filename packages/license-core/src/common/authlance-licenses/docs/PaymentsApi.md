# PaymentsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceLicensePaymentsApiV1CheckoutSessionPost**](#authlancelicensepaymentsapiv1checkoutsessionpost) | **POST** /authlance/license/payments/api/v1/checkout-session | Create checkout session|
|[**authlanceLicensePaymentsApiV1CustomerPortalPost**](#authlancelicensepaymentsapiv1customerportalpost) | **POST** /authlance/license/payments/api/v1/customer-portal | Create customer portal session|
|[**authlanceLicensePaymentsApiV1MaintenanceCheckoutPost**](#authlancelicensepaymentsapiv1maintenancecheckoutpost) | **POST** /authlance/license/payments/api/v1/maintenance-checkout | Create maintenance checkout session|
|[**authlanceLicensePaymentsApiV1ReportsPaymentsExportGet**](#authlancelicensepaymentsapiv1reportspaymentsexportget) | **GET** /authlance/license/payments/api/v1/reports/payments/export | Export payments as CSV|
|[**authlanceLicensePaymentsApiV1ReportsPaymentsGet**](#authlancelicensepaymentsapiv1reportspaymentsget) | **GET** /authlance/license/payments/api/v1/reports/payments | List captured payments|
|[**authlanceLicensePaymentsApiV1SessionIdPost**](#authlancelicensepaymentsapiv1sessionidpost) | **POST** /authlance/license/payments/api/v1/session-id | Get subscription from session|
|[**authlanceLicensePaymentsApiV1VerifyPaymentLicenseIdGet**](#authlancelicensepaymentsapiv1verifypaymentlicenseidget) | **GET** /authlance/license/payments/api/v1/verify-payment/{licenseId} | Verify license payment|
|[**authlanceLicensePaymentsProductDetailsPost**](#authlancelicensepaymentsproductdetailspost) | **POST** /authlance/license/payments/product-details | Get checkout product details|

# **authlanceLicensePaymentsApiV1CheckoutSessionPost**
> GithubComAuthlanceLicenseoperatorPkgPaymentsStripeCheckoutSessionResponse authlanceLicensePaymentsApiV1CheckoutSessionPost(request)

Starts a hosted Stripe checkout session for purchasing a license tier.

### Example

```typescript
import {
    PaymentsApi,
    Configuration,
    GithubComAuthlanceLicenseoperatorPkgPaymentsCreateCheckoutSessionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let request: GithubComAuthlanceLicenseoperatorPkgPaymentsCreateCheckoutSessionRequest; //Checkout session request

const { status, data } = await apiInstance.authlanceLicensePaymentsApiV1CheckoutSessionPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **GithubComAuthlanceLicenseoperatorPkgPaymentsCreateCheckoutSessionRequest**| Checkout session request | |


### Return type

**GithubComAuthlanceLicenseoperatorPkgPaymentsStripeCheckoutSessionResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | invalid request |  -  |
|**401** | unauthorized |  -  |
|**409** | non-subscription quota exceeded |  -  |
|**500** | failed to create checkout session |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicensePaymentsApiV1CustomerPortalPost**
> GithubComAuthlanceLicenseoperatorPkgPaymentsCreateCustomerPortalSessionResponse authlanceLicensePaymentsApiV1CustomerPortalPost(request)

Creates a Stripe billing portal session using the provided customer identifier.

### Example

```typescript
import {
    PaymentsApi,
    Configuration,
    GithubComAuthlanceLicenseoperatorPkgPaymentsCreateCustomerPortalSessionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let request: GithubComAuthlanceLicenseoperatorPkgPaymentsCreateCustomerPortalSessionRequest; //Customer portal request

const { status, data } = await apiInstance.authlanceLicensePaymentsApiV1CustomerPortalPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **GithubComAuthlanceLicenseoperatorPkgPaymentsCreateCustomerPortalSessionRequest**| Customer portal request | |


### Return type

**GithubComAuthlanceLicenseoperatorPkgPaymentsCreateCustomerPortalSessionResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | customerId required |  -  |
|**401** | unauthorized |  -  |
|**500** | failed to create customer portal session |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicensePaymentsApiV1MaintenanceCheckoutPost**
> GithubComAuthlanceLicenseoperatorPkgPaymentsMaintenanceCheckoutResponse authlanceLicensePaymentsApiV1MaintenanceCheckoutPost(request)

Creates a one-time Stripe checkout for renewing maintenance on a perpetual manual license.

### Example

```typescript
import {
    PaymentsApi,
    Configuration,
    GithubComAuthlanceLicenseoperatorPkgPaymentsCreateMaintenanceCheckoutRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let request: GithubComAuthlanceLicenseoperatorPkgPaymentsCreateMaintenanceCheckoutRequest; //Maintenance checkout request

const { status, data } = await apiInstance.authlanceLicensePaymentsApiV1MaintenanceCheckoutPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **GithubComAuthlanceLicenseoperatorPkgPaymentsCreateMaintenanceCheckoutRequest**| Maintenance checkout request | |


### Return type

**GithubComAuthlanceLicenseoperatorPkgPaymentsMaintenanceCheckoutResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | invalid request |  -  |
|**401** | unauthorized |  -  |
|**403** | license is not a perpetual manual license |  -  |
|**500** | failed to create maintenance checkout |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicensePaymentsApiV1ReportsPaymentsExportGet**
> File authlanceLicensePaymentsApiV1ReportsPaymentsExportGet()

Exports captured payments matching the filters as a CSV file.

### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let from: string; //Inclusive paid at lower bound (RFC3339 or YYYY-MM-DD) (optional) (default to undefined)
let to: string; //Inclusive paid at upper bound (RFC3339 or YYYY-MM-DD) (optional) (default to undefined)
let productId: string; //Filter by Stripe product id (optional) (default to undefined)
let organizationName: string; //Filter by organization name (optional) (default to undefined)
let name: string; //Filter by customer name (optional) (default to undefined)

const { status, data } = await apiInstance.authlanceLicensePaymentsApiV1ReportsPaymentsExportGet(
    from,
    to,
    productId,
    organizationName,
    name
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **from** | [**string**] | Inclusive paid at lower bound (RFC3339 or YYYY-MM-DD) | (optional) defaults to undefined|
| **to** | [**string**] | Inclusive paid at upper bound (RFC3339 or YYYY-MM-DD) | (optional) defaults to undefined|
| **productId** | [**string**] | Filter by Stripe product id | (optional) defaults to undefined|
| **organizationName** | [**string**] | Filter by organization name | (optional) defaults to undefined|
| **name** | [**string**] | Filter by customer name | (optional) defaults to undefined|


### Return type

**File**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/csv


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | invalid filter |  -  |
|**401** | unauthorized |  -  |
|**500** | failed to export payments |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicensePaymentsApiV1ReportsPaymentsGet**
> GithubComAuthlanceLicenseoperatorPkgPaymentsPaymentsPage authlanceLicensePaymentsApiV1ReportsPaymentsGet()

Returns a paginated collection of captured payments with optional filters.

### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let from: string; //Inclusive paid at lower bound (RFC3339 or YYYY-MM-DD) (optional) (default to undefined)
let to: string; //Inclusive paid at upper bound (RFC3339 or YYYY-MM-DD) (optional) (default to undefined)
let productId: string; //Filter by Stripe product id (optional) (default to undefined)
let organizationName: string; //Filter by organization name (optional) (default to undefined)
let name: string; //Filter by customer name (optional) (default to undefined)
let page: number; //Page number (default 1) (optional) (default to undefined)
let pageSize: number; //Page size (default 50, max 500) (optional) (default to undefined)

const { status, data } = await apiInstance.authlanceLicensePaymentsApiV1ReportsPaymentsGet(
    from,
    to,
    productId,
    organizationName,
    name,
    page,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **from** | [**string**] | Inclusive paid at lower bound (RFC3339 or YYYY-MM-DD) | (optional) defaults to undefined|
| **to** | [**string**] | Inclusive paid at upper bound (RFC3339 or YYYY-MM-DD) | (optional) defaults to undefined|
| **productId** | [**string**] | Filter by Stripe product id | (optional) defaults to undefined|
| **organizationName** | [**string**] | Filter by organization name | (optional) defaults to undefined|
| **name** | [**string**] | Filter by customer name | (optional) defaults to undefined|
| **page** | [**number**] | Page number (default 1) | (optional) defaults to undefined|
| **pageSize** | [**number**] | Page size (default 50, max 500) | (optional) defaults to undefined|


### Return type

**GithubComAuthlanceLicenseoperatorPkgPaymentsPaymentsPage**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | invalid filter |  -  |
|**401** | unauthorized |  -  |
|**500** | failed to list payments |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicensePaymentsApiV1SessionIdPost**
> GithubComAuthlanceLicenseoperatorPkgPaymentsGetSubscriptionSessionResponse authlanceLicensePaymentsApiV1SessionIdPost(request)

Resolves a subscription identifier using a Stripe checkout session ID.

### Example

```typescript
import {
    PaymentsApi,
    Configuration,
    GithubComAuthlanceLicenseoperatorPkgPaymentsGetSubscriptionSessionRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let request: GithubComAuthlanceLicenseoperatorPkgPaymentsGetSubscriptionSessionRequest; //Session lookup request

const { status, data } = await apiInstance.authlanceLicensePaymentsApiV1SessionIdPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **GithubComAuthlanceLicenseoperatorPkgPaymentsGetSubscriptionSessionRequest**| Session lookup request | |


### Return type

**GithubComAuthlanceLicenseoperatorPkgPaymentsGetSubscriptionSessionResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | sessionId required |  -  |
|**401** | unauthorized |  -  |
|**404** | subscription not found |  -  |
|**500** | failed to resolve subscription |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicensePaymentsApiV1VerifyPaymentLicenseIdGet**
> GithubComAuthlanceLicenseoperatorPkgPaymentsPaymentVerificationResponse authlanceLicensePaymentsApiV1VerifyPaymentLicenseIdGet()

Retrieves the Stripe invoice, payment intent, and internal records for the given license.

### Example

```typescript
import {
    PaymentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let licenseId: string; //License identifier (default to undefined)

const { status, data } = await apiInstance.authlanceLicensePaymentsApiV1VerifyPaymentLicenseIdGet(
    licenseId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **licenseId** | [**string**] | License identifier | defaults to undefined|


### Return type

**GithubComAuthlanceLicenseoperatorPkgPaymentsPaymentVerificationResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | licenseId required |  -  |
|**404** | resource not found |  -  |
|**500** | failed to verify payment |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicensePaymentsProductDetailsPost**
> GithubComAuthlanceLicenseoperatorPkgPaymentsGetProductDetailsResponse authlanceLicensePaymentsProductDetailsPost(request)

Returns Stripe price/product metadata for the provided lookup key.

### Example

```typescript
import {
    PaymentsApi,
    Configuration,
    GithubComAuthlanceLicenseoperatorPkgPaymentsGetProductDetailsRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new PaymentsApi(configuration);

let request: GithubComAuthlanceLicenseoperatorPkgPaymentsGetProductDetailsRequest; //Product details request

const { status, data } = await apiInstance.authlanceLicensePaymentsProductDetailsPost(
    request
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **request** | **GithubComAuthlanceLicenseoperatorPkgPaymentsGetProductDetailsRequest**| Product details request | |


### Return type

**GithubComAuthlanceLicenseoperatorPkgPaymentsGetProductDetailsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | lookup_key required |  -  |
|**404** | product not found |  -  |
|**500** | failed to load product |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

