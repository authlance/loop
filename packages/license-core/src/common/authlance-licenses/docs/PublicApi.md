# PublicApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authlanceLicenseProductGet**](#authlancelicenseproductget) | **GET** /authlance/license/product | Get product details|
|[**authlanceLicenseProductsGet**](#authlancelicenseproductsget) | **GET** /authlance/license/products | List public products|

# **authlanceLicenseProductGet**
> InternalHttpControllerProductDetailsResponse authlanceLicenseProductGet()


### Example

```typescript
import {
    PublicApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicApi(configuration);

const { status, data } = await apiInstance.authlanceLicenseProductGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**InternalHttpControllerProductDetailsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**500** | failed to load product |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authlanceLicenseProductsGet**
> Array<InternalHttpControllerPublicProductResponse> authlanceLicenseProductsGet()

Returns active, non-internal products including marketing-friendly coupon metadata.

### Example

```typescript
import {
    PublicApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicApi(configuration);

const { status, data } = await apiInstance.authlanceLicenseProductsGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<InternalHttpControllerPublicProductResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**500** | failed to load products |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

