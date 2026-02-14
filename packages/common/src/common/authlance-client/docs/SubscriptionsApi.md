# SubscriptionsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceIdentityApiV1ProfileSubscriptionsUserAppStoreVerifyPost**](#authlanceidentityapiv1profilesubscriptionsuserappstoreverifypost) | **POST** /authlance/identity/api/v1/profile/subscriptions/{user}/app-store/verify | Verify App Store subscription|
|[**authlanceIdentityApiV1ProfileSubscriptionsUserBillingBillingSubscriptionIDGet**](#authlanceidentityapiv1profilesubscriptionsuserbillingbillingsubscriptionidget) | **GET** /authlance/identity/api/v1/profile/subscriptions/{user}/billing/{billingSubscriptionID} | Get subscription by billing subscription ID|
|[**authlanceIdentityApiV1ProfileSubscriptionsUserGroupActiveGet**](#authlanceidentityapiv1profilesubscriptionsusergroupactiveget) | **GET** /authlance/identity/api/v1/profile/subscriptions/{user}/{group}/active | Get active or latest subscription for group|
|[**authlanceIdentityApiV1ProfileSubscriptionsUserTiersGet**](#authlanceidentityapiv1profilesubscriptionsusertiersget) | **GET** /authlance/identity/api/v1/profile/subscriptions/{user}/tiers | List subscription tiers|
|[**authlanceIdentityApiV1SubscriptionsAppStoreNotificationsPost**](#authlanceidentityapiv1subscriptionsappstorenotificationspost) | **POST** /authlance/identity/api/v1/subscriptions/app-store/notifications | Handle App Store Server Notifications|
|[**authlanceIdentityApiV1SubscriptionsTiersGet**](#authlanceidentityapiv1subscriptionstiersget) | **GET** /authlance/identity/api/v1/subscriptions/tiers | List subscription tiers (public)|

# **authlanceIdentityApiV1ProfileSubscriptionsUserAppStoreVerifyPost**
> ControllersSubscriptionsAppStoreVerifyResponse authlanceIdentityApiV1ProfileSubscriptionsUserAppStoreVerifyPost(payload)

Verifies a StoreKit transaction and records the group subscription.

### Example

```typescript
import {
    SubscriptionsApi,
    Configuration,
    ControllersSubscriptionsAppStoreVerifyRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionsApi(configuration);

let user: string; //User identity (default to undefined)
let payload: ControllersSubscriptionsAppStoreVerifyRequest; //App Store verification payload

const { status, data } = await apiInstance.authlanceIdentityApiV1ProfileSubscriptionsUserAppStoreVerifyPost(
    user,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersSubscriptionsAppStoreVerifyRequest**| App Store verification payload | |
| **user** | [**string**] | User identity | defaults to undefined|


### Return type

**ControllersSubscriptionsAppStoreVerifyResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Invalid payload |  -  |
|**401** | Unauthorized |  -  |
|**404** | Group or subscription tier not found |  -  |
|**500** | Internal error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1ProfileSubscriptionsUserBillingBillingSubscriptionIDGet**
> DunaAuthCommonGroupSubscriptionsDto authlanceIdentityApiV1ProfileSubscriptionsUserBillingBillingSubscriptionIDGet()

Looks up a group subscription using the external billing subscription ID.

### Example

```typescript
import {
    SubscriptionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionsApi(configuration);

let user: string; //User identity (default to undefined)
let billingSubscriptionID: string; //Billing subscription ID (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1ProfileSubscriptionsUserBillingBillingSubscriptionIDGet(
    user,
    billingSubscriptionID
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **user** | [**string**] | User identity | defaults to undefined|
| **billingSubscriptionID** | [**string**] | Billing subscription ID | defaults to undefined|


### Return type

**DunaAuthCommonGroupSubscriptionsDto**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Subscription not found |  -  |
|**500** | Internal error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1ProfileSubscriptionsUserGroupActiveGet**
> DunaAuthCommonGroupSubscriptionsDto authlanceIdentityApiV1ProfileSubscriptionsUserGroupActiveGet()

Returns the active subscription for a group. If no active subscription, returns the most recent.

### Example

```typescript
import {
    SubscriptionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionsApi(configuration);

let user: string; //User identity (default to undefined)
let group: string; //Group name (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1ProfileSubscriptionsUserGroupActiveGet(
    user,
    group
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **user** | [**string**] | User identity | defaults to undefined|
| **group** | [**string**] | Group name | defaults to undefined|


### Return type

**DunaAuthCommonGroupSubscriptionsDto**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**404** | Group or subscription not found |  -  |
|**500** | Internal error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1ProfileSubscriptionsUserTiersGet**
> Array<DunaAuthCommonPaymentTierDto> authlanceIdentityApiV1ProfileSubscriptionsUserTiersGet()

Returns all available payment tiers.

### Example

```typescript
import {
    SubscriptionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionsApi(configuration);

let user: string; //User identity (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1ProfileSubscriptionsUserTiersGet(
    user
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **user** | [**string**] | User identity | defaults to undefined|


### Return type

**Array<DunaAuthCommonPaymentTierDto>**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | No subscription tiers found |  -  |
|**500** | Failed to list subscription tiers |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1SubscriptionsAppStoreNotificationsPost**
> { [key: string]: any; } authlanceIdentityApiV1SubscriptionsAppStoreNotificationsPost(payload)

Processes App Store Server Notifications v2 payloads.

### Example

```typescript
import {
    SubscriptionsApi,
    Configuration,
    ControllersSubscriptionsAppStoreServerNotificationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionsApi(configuration);

let payload: ControllersSubscriptionsAppStoreServerNotificationRequest; //Server notification payload

const { status, data } = await apiInstance.authlanceIdentityApiV1SubscriptionsAppStoreNotificationsPost(
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **ControllersSubscriptionsAppStoreServerNotificationRequest**| Server notification payload | |


### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Invalid payload |  -  |
|**500** | Internal error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceIdentityApiV1SubscriptionsTiersGet**
> Array<DunaAuthCommonPaymentTierDto> authlanceIdentityApiV1SubscriptionsTiersGet()

Returns all available payment tiers. No authentication required.

### Example

```typescript
import {
    SubscriptionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SubscriptionsApi(configuration);

let platform: string; //Filter by platform (ios, android, web) (optional) (default to undefined)

const { status, data } = await apiInstance.authlanceIdentityApiV1SubscriptionsTiersGet(
    platform
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **platform** | [**string**] | Filter by platform (ios, android, web) | (optional) defaults to undefined|


### Return type

**Array<DunaAuthCommonPaymentTierDto>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | No subscription tiers found |  -  |
|**500** | Failed to list subscription tiers |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

