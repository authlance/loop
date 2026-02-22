# InternalHttpControllerCouponRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**active** | **boolean** |  | [optional] [default to undefined]
**behavior** | **string** |  | [optional] [default to undefined]
**code** | **string** |  | [optional] [default to undefined]
**maxManagedProducts** | **number** |  | [optional] [default to undefined]
**maxPerGroup** | **number** |  | [optional] [default to undefined]
**maxTotal** | **number** |  | [optional] [default to undefined]
**metadata** | **{ [key: string]: string; }** |  | [optional] [default to undefined]
**minManagedProducts** | **number** |  | [optional] [default to undefined]
**stripePromotion** | [**InternalHttpControllerStripePromotionPayload**](InternalHttpControllerStripePromotionPayload.md) |  | [optional] [default to undefined]

## Example

```typescript
import { InternalHttpControllerCouponRequest } from './api';

const instance: InternalHttpControllerCouponRequest = {
    active,
    behavior,
    code,
    maxManagedProducts,
    maxPerGroup,
    maxTotal,
    metadata,
    minManagedProducts,
    stripePromotion,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
