# AdminApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceLicenseAdminProductsGet**](#authlancelicenseadminproductsget) | **GET** /authlance/license/admin/products | List products|
|[**authlanceLicenseAdminProductsPost**](#authlancelicenseadminproductspost) | **POST** /authlance/license/admin/products | Create product|
|[**authlanceLicenseAdminProductsSeatUsageGet**](#authlancelicenseadminproductsseatusageget) | **GET** /authlance/license/admin/products/seat-usage | Get seat usage|
|[**authlanceLicenseAdminProductsSlugCouponsCouponIdDelete**](#authlancelicenseadminproductsslugcouponscouponiddelete) | **DELETE** /authlance/license/admin/products/{slug}/coupons/{couponId} | Delete coupon|
|[**authlanceLicenseAdminProductsSlugCouponsCouponIdPut**](#authlancelicenseadminproductsslugcouponscouponidput) | **PUT** /authlance/license/admin/products/{slug}/coupons/{couponId} | Update coupon|
|[**authlanceLicenseAdminProductsSlugCouponsGet**](#authlancelicenseadminproductsslugcouponsget) | **GET** /authlance/license/admin/products/{slug}/coupons | List coupons|
|[**authlanceLicenseAdminProductsSlugCouponsPost**](#authlancelicenseadminproductsslugcouponspost) | **POST** /authlance/license/admin/products/{slug}/coupons | Create coupon|
|[**authlanceLicenseAdminProductsSlugPut**](#authlancelicenseadminproductsslugput) | **PUT** /authlance/license/admin/products/{slug} | Update product|
|[**authlanceLicenseProductKeysGet**](#authlancelicenseproductkeysget) | **GET** /authlance/license/product-keys | List product keys|

# **authlanceLicenseAdminProductsGet**
> InternalHttpControllerProductListResponse authlanceLicenseAdminProductsGet()

Returns configured products with coupon metadata.

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let includeInactive: boolean; //Include inactive products (optional) (default to undefined)
let includeInternal: boolean; //Include internal products (sysadmin only) (optional) (default to undefined)
let page: number; //Page number (default 1) (optional) (default to undefined)
let pageSize: number; //Page size (default 20, max 100) (optional) (default to undefined)

const { status, data } = await apiInstance.authlanceLicenseAdminProductsGet(
    includeInactive,
    includeInternal,
    page,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **includeInactive** | [**boolean**] | Include inactive products | (optional) defaults to undefined|
| **includeInternal** | [**boolean**] | Include internal products (sysadmin only) | (optional) defaults to undefined|
| **page** | [**number**] | Page number (default 1) | (optional) defaults to undefined|
| **pageSize** | [**number**] | Page size (default 20, max 100) | (optional) defaults to undefined|


### Return type

**InternalHttpControllerProductListResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | unauthorized |  -  |
|**500** | failed to list products |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseAdminProductsPost**
> InternalHttpControllerProductResponse authlanceLicenseAdminProductsPost(payload)

Registers a product and optionally creates coupons.

### Example

```typescript
import {
    AdminApi,
    Configuration,
    InternalHttpControllerProductRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let payload: InternalHttpControllerProductRequest; //Product definition

const { status, data } = await apiInstance.authlanceLicenseAdminProductsPost(
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **InternalHttpControllerProductRequest**| Product definition | |


### Return type

**InternalHttpControllerProductResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | invalid payload |  -  |
|**401** | unauthorized |  -  |
|**409** | seat limit exceeded |  -  |
|**500** | failed to create product |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseAdminProductsSeatUsageGet**
> InternalHttpControllerSeatUsageResponse authlanceLicenseAdminProductsSeatUsageGet()

Returns the current product seat utilization and remaining capacity.

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.authlanceLicenseAdminProductsSeatUsageGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**InternalHttpControllerSeatUsageResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | unauthorized |  -  |
|**500** | failed to load seat usage |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseAdminProductsSlugCouponsCouponIdDelete**
> string authlanceLicenseAdminProductsSlugCouponsCouponIdDelete()

Removes the specified coupon from the product.

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let slug: string; //Product slug (default to undefined)
let couponId: number; //Coupon identifier (default to undefined)

const { status, data } = await apiInstance.authlanceLicenseAdminProductsSlugCouponsCouponIdDelete(
    slug,
    couponId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **slug** | [**string**] | Product slug | defaults to undefined|
| **couponId** | [**number**] | Coupon identifier | defaults to undefined|


### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No Content |  -  |
|**400** | invalid coupon identifier |  -  |
|**401** | unauthorized |  -  |
|**404** | not found |  -  |
|**500** | failed to delete coupon |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseAdminProductsSlugCouponsCouponIdPut**
> InternalHttpControllerCouponResponse authlanceLicenseAdminProductsSlugCouponsCouponIdPut(payload)

Modifies coupon metadata for the given product.

### Example

```typescript
import {
    AdminApi,
    Configuration,
    InternalHttpControllerCouponRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let slug: string; //Product slug (default to undefined)
let couponId: number; //Coupon identifier (default to undefined)
let payload: InternalHttpControllerCouponRequest; //Coupon definition

const { status, data } = await apiInstance.authlanceLicenseAdminProductsSlugCouponsCouponIdPut(
    slug,
    couponId,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **InternalHttpControllerCouponRequest**| Coupon definition | |
| **slug** | [**string**] | Product slug | defaults to undefined|
| **couponId** | [**number**] | Coupon identifier | defaults to undefined|


### Return type

**InternalHttpControllerCouponResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | invalid payload |  -  |
|**401** | unauthorized |  -  |
|**404** | not found |  -  |
|**500** | failed to update coupon |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseAdminProductsSlugCouponsGet**
> InternalHttpControllerCouponListResponse authlanceLicenseAdminProductsSlugCouponsGet()

Lists coupons configured for the specified product.

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let slug: string; //Product slug (default to undefined)
let includeInactive: boolean; //Include inactive coupons (optional) (default to undefined)
let page: number; //Page number (default 1) (optional) (default to undefined)
let pageSize: number; //Page size (default 20, max 100) (optional) (default to undefined)

const { status, data } = await apiInstance.authlanceLicenseAdminProductsSlugCouponsGet(
    slug,
    includeInactive,
    page,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **slug** | [**string**] | Product slug | defaults to undefined|
| **includeInactive** | [**boolean**] | Include inactive coupons | (optional) defaults to undefined|
| **page** | [**number**] | Page number (default 1) | (optional) defaults to undefined|
| **pageSize** | [**number**] | Page size (default 20, max 100) | (optional) defaults to undefined|


### Return type

**InternalHttpControllerCouponListResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | unauthorized |  -  |
|**404** | product not found |  -  |
|**500** | failed to list coupons |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseAdminProductsSlugCouponsPost**
> InternalHttpControllerCouponResponse authlanceLicenseAdminProductsSlugCouponsPost(payload)

Adds a coupon to the specified product.

### Example

```typescript
import {
    AdminApi,
    Configuration,
    InternalHttpControllerCouponRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let slug: string; //Product slug (default to undefined)
let payload: InternalHttpControllerCouponRequest; //Coupon definition

const { status, data } = await apiInstance.authlanceLicenseAdminProductsSlugCouponsPost(
    slug,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **InternalHttpControllerCouponRequest**| Coupon definition | |
| **slug** | [**string**] | Product slug | defaults to undefined|


### Return type

**InternalHttpControllerCouponResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | invalid payload |  -  |
|**401** | unauthorized |  -  |
|**404** | not found |  -  |
|**500** | failed to create coupon |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseAdminProductsSlugPut**
> InternalHttpControllerProductResponse authlanceLicenseAdminProductsSlugPut(payload)

Modifies a product and optionally registers additional coupons.

### Example

```typescript
import {
    AdminApi,
    Configuration,
    InternalHttpControllerProductRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

let slug: string; //Product slug (default to undefined)
let payload: InternalHttpControllerProductRequest; //Product definition

const { status, data } = await apiInstance.authlanceLicenseAdminProductsSlugPut(
    slug,
    payload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payload** | **InternalHttpControllerProductRequest**| Product definition | |
| **slug** | [**string**] | Product slug | defaults to undefined|


### Return type

**InternalHttpControllerProductResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | invalid payload |  -  |
|**401** | unauthorized |  -  |
|**404** | not found |  -  |
|**409** | seat limit exceeded |  -  |
|**500** | failed to update product |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseProductKeysGet**
> InternalHttpControllerProductKeyListResponse authlanceLicenseProductKeysGet()

Returns the set of configured security product keys that can be associated with products.

### Example

```typescript
import {
    AdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AdminApi(configuration);

const { status, data } = await apiInstance.authlanceLicenseProductKeysGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**InternalHttpControllerProductKeyListResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | unauthorized |  -  |
|**403** | forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

