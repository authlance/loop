# Profile Page Configurability Design

**Date:** 2026-02-19
**Status:** Approved

## Summary

Three related improvements to the Authlance profile page:

1. Allow deployments to hide the gender and birthdate fields via `package.json` config.
2. Allow deployments to hide the Change Password button (for external-IdP-only scenarios).
3. Fix a bug where Kratos password-change validation errors are silently swallowed.

The backend already supports `gender` and `birthDate` as nullable optional fields (`*string` with `omitempty`) — no Go changes needed.

---

## Workstream 1: Config pipeline for profile field visibility

### Files touched

| File | Change |
|------|--------|
| `packages/core/src/browser/runtime-config.ts` | Add 3 optional boolean fields |
| `dev-packages/application-package/src/application-props.ts` | Add 3 fields to `FrontendApplicationConfig`; default `true` in `ApplicationProps.DEFAULT` |
| `dev-packages/application-package/src/application-package.ts` | Add 3 getters (same pattern as `homeUrl`) |
| `dev-packages/application-manager/src/generator/frontend-generator.ts` | Bake 3 boolean literals into generated `index.js` `runtimeConfig` |

### RuntimeConfig additions

```ts
export interface RuntimeConfig {
    basePath?: string
    backendBasePath?: string
    googleAnalyticsMeasurementId?: string
    homeUrl?: string
    showProfileGender?: boolean      // default: true
    showProfileBirthdate?: boolean   // default: true
    showChangePassword?: boolean     // default: true
}
```

### FrontendApplicationConfig additions

```ts
showProfileGender?: boolean      // default: true in ApplicationProps.DEFAULT
showProfileBirthdate?: boolean   // default: true in ApplicationProps.DEFAULT
showChangePassword?: boolean     // default: true in ApplicationProps.DEFAULT
```

### ApplicationPackage getters

```ts
get showProfileGender(): boolean {
    return this.props.frontend.config.showProfileGender ?? true
}
get showProfileBirthdate(): boolean {
    return this.props.frontend.config.showProfileBirthdate ?? true
}
get showChangePassword(): boolean {
    return this.props.frontend.config.showChangePassword ?? true
}
```

The `props` getter must also propagate these three fields from `loopConfig` into `this._props.frontend.config`, following the same pattern used for `homeUrl`, `googleAnalyticsMeasurementId`, etc.

### Generated index.js (FrontendGenerator)

```js
const runtimeConfig = {
    basePath: process.env.REACT_APP_BASE_PATH ?? '${basePath}',
    backendBasePath: process.env.REACT_APP_BACKEND_BASE_PATH ?? '${backendBasePath}',
    googleAnalyticsMeasurementId: process.env.REACT_APP_GOOGLE_ANALYTICS_MEASUREMENT_ID ?? '${googleAnalyticsMeasurementId}',
    homeUrl: process.env.REACT_APP_HOME_URL ?? '${homeUrl}',
    showProfileGender: ${showProfileGender},
    showProfileBirthdate: ${showProfileBirthdate},
    showChangePassword: ${showChangePassword},
};
```

Values are baked as JS boolean literals (`true`/`false`) at code-gen time. No env var override — configuration is exclusively via `package.json`.

### Deployer configuration

In the deployer's `package.json` (e.g., `examples/browser/package.json`):

```json
"loop": {
  "frontend": {
    "config": {
      "showProfileGender": false,
      "showProfileBirthdate": false,
      "showChangePassword": false
    }
  }
}
```

Fields not present default to `true` (visible).

---

## Workstream 2: Profile component changes

**File:** `packages/identity/src/browser/components/profile-settings-component.tsx`

### Visibility flags

At the top of `ProfileSettings`, read from `getRuntimeConfig()`:

```ts
const { showProfileGender = true, showProfileBirthdate = true, showChangePassword = true } = getRuntimeConfig()
```

### Gender field

- Conditionally render the field and its error `<p>` on `showProfileGender`.
- In `validateForm()`: only set `genderError` / mark invalid when `showProfileGender` is `true`.
- Save button `disabled` guard: `!name || !lastName || (showProfileGender && !gender)`.

### Birthdate field

- Conditionally render on `showProfileBirthdate`.
- No existing validation to remove (it was never required).
- `birthDateValue` is already `undefined`-safe in the submit handler — no change needed there.

### Change password button

`<PasswordComponent>` is already inside `<RenderIf isTrue={requestor?.identity === user.identity}>`. Add `&& showChangePassword` to the condition.

---

## Workstream 3: Password change error handling (bug fix)

**File:** `packages/identity/src/browser/components/profile-settings-component.tsx`

### Root cause

`PasswordOnlySettings` renders `<form method="post" action={flow.ui.action}>` — a native HTML form POST. When Kratos rejects a password (e.g., too weak), it redirects back to the settings URL with an updated flow containing error messages in `ui.messages` and the password node's `messages`. Inside a Dialog in an SPA, this redirect is never processed and errors are silently lost.

### Fix: programmatic SDK submission

`PasswordOnlySettings` gains two new props:

```ts
interface PasswordOnlySettingsProps {
    flow: SettingsFlow
    orySDK: FrontendApi        // passed down from PasswordComponent
    onSuccess: () => void      // called to close the Dialog on success
}
```

Behavior:

1. Controlled `<input>` for the password value (local `useState`).
2. `onSubmit` prevents default, calls:
   ```ts
   orySDK.updateSettingsFlow({
       flow: flow.id,
       updateSettingsFlowBody: { method: 'password', password, csrf_token: csrf }
   })
   ```
3. **Success** → `props.onSuccess()` closes the dialog; a success toast is shown by `PasswordComponent`.
4. **Kratos validation error** (axios error) → `error.response?.data` is the updated `SettingsFlow` with errors. Update local `flow` state; render `flow.ui.messages` and the password node's `messages` inline.

`PasswordComponent` passes `orySDK` (from `useContext(ProjectContext)`) and `onSuccess={() => { setOpen(false); toast(...) }}` to `PasswordOnlySettings`.

### Error rendering

Kratos error messages live in two places:
- `flow.ui.messages` — flow-level messages (e.g., "password too weak")
- `flow.ui.nodes[password-node].messages` — field-level messages

Both should be rendered in the form. A helper `getMessages(nodes, 'password')` extracts them from the password node, which already exists in the component as `findNode`.

---

## Files changed (complete list)

| Package | File | Type |
|---------|------|------|
| `core` | `src/browser/runtime-config.ts` | Config type |
| `application-package` | `src/application-props.ts` | Config type + defaults |
| `application-package` | `src/application-package.ts` | Getters + props propagation |
| `application-manager` | `src/generator/frontend-generator.ts` | Code generation |
| `identity` | `src/browser/components/profile-settings-component.tsx` | UI + bug fix |

No backend changes. No new packages or dependencies.
