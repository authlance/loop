# ControllersDevicesRotateKeyRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**deviceKeys** | [**Array&lt;DunaAuthCommonDeviceKeyUpdate&gt;**](DunaAuthCommonDeviceKeyUpdate.md) |  | [optional] [default to undefined]
**newEncryptedSecrets** | **string** |  | [optional] [default to undefined]
**reason** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { ControllersDevicesRotateKeyRequest } from './api';

const instance: ControllersDevicesRotateKeyRequest = {
    deviceKeys,
    newEncryptedSecrets,
    reason,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
