# DunaAuthCommonPaymentTierDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**billingCycle** | **string** |  | [optional] [default to undefined]
**iosProductId** | **string** |  | [optional] [default to undefined]
**lookupKey** | **string** |  | [optional] [default to undefined]
**maxMembers** | **number** |  | [optional] [default to undefined]
**platforms** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**price** | **number** |  | [optional] [default to undefined]
**pricingTiers** | [**Array&lt;CommonPricingTierDto&gt;**](CommonPricingTierDto.md) |  | [optional] [default to undefined]
**tierDescription** | **string** |  | [optional] [default to undefined]
**tierName** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { DunaAuthCommonPaymentTierDto } from './api';

const instance: DunaAuthCommonPaymentTierDto = {
    billingCycle,
    iosProductId,
    lookupKey,
    maxMembers,
    platforms,
    price,
    pricingTiers,
    tierDescription,
    tierName,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
