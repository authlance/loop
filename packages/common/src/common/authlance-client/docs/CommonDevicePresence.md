# CommonDevicePresence


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**deviceId** | **string** |  | [optional] [default to undefined]
**deviceName** | **string** |  | [optional] [default to undefined]
**deviceType** | **string** |  | [optional] [default to undefined]
**hasPushToken** | **boolean** |  | [optional] [default to undefined]
**lastSeenAt** | **string** |  | [optional] [default to undefined]
**online** | **boolean** |  | [optional] [default to undefined]
**pushPlatform** | [**CommonPushPlatform**](CommonPushPlatform.md) |  | [optional] [default to undefined]
**reachable** | **boolean** |  | [optional] [default to undefined]
**status** | [**CommonPresenceStatus**](CommonPresenceStatus.md) |  | [optional] [default to undefined]
**userId** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CommonDevicePresence } from './api';

const instance: CommonDevicePresence = {
    deviceId,
    deviceName,
    deviceType,
    hasPushToken,
    lastSeenAt,
    online,
    pushPlatform,
    reachable,
    status,
    userId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
