# Profile Page Configurability Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add per-deployment visibility flags for profile gender/birthdate fields and the change-password button, and fix the silent password-change error bug.

**Architecture:** Flags flow from `package.json → ApplicationPackage getters → FrontendGenerator → baked boolean literals in runtimeConfig → component reads getRuntimeConfig()`. No env var overrides — package.json only. Password fix converts the native HTML form POST to an Ory SDK programmatic call so Kratos validation errors are surfaced inside the Dialog.

**Tech Stack:** TypeScript, React, `@ory/client` FrontendApi, existing `getRuntimeConfig()`/`setRuntimeConfig()` pattern.

---

### Task 1: Add three flags to RuntimeConfig

**Files:**
- Modify: `packages/core/src/browser/runtime-config.ts`

**Step 1: Add the three optional boolean fields**

Open the file. The `RuntimeConfig` interface currently ends with `homeUrl?: string`. Add three lines immediately after it:

```ts
export interface RuntimeConfig {
    basePath?: string
    backendBasePath?: string
    googleAnalyticsMeasurementId?: string
    homeUrl?: string
    showProfileGender?: boolean
    showProfileBirthdate?: boolean
    showChangePassword?: boolean
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd /Users/nacho/git/nmorenor/duna/loop
yarn --cwd packages/core build 2>&1 | tail -5
```

Expected: exits cleanly, no TypeScript errors.

**Step 3: Commit**

```bash
git add packages/core/src/browser/runtime-config.ts
git commit -m "feat(core): add showProfileGender, showProfileBirthdate, showChangePassword to RuntimeConfig"
```

---

### Task 2: Add flags to FrontendApplicationConfig and ApplicationProps.DEFAULT

**Files:**
- Modify: `dev-packages/application-package/src/application-props.ts`

**Step 1: Add three fields to `FrontendApplicationConfig`**

The `FrontendApplicationConfig` interface (around line 109) has `homeUrl: string | undefined;` near the bottom. Add the three new fields after `homeUrl`:

```ts
    homeUrl: string | undefined;

    showProfileGender: boolean | undefined;
    showProfileBirthdate: boolean | undefined;
    showChangePassword: boolean | undefined;

    frontEndStylesheets?: string | string[];
```

**Step 2: Set defaults in `ApplicationProps.DEFAULT`**

The `DEFAULT` object (around line 69) sets `homeUrl: undefined`. Add three lines after it:

```ts
                homeUrl: undefined,
                showProfileGender: true,
                showProfileBirthdate: true,
                showChangePassword: true,
```

**Step 3: Verify TypeScript compiles**

```bash
yarn --cwd dev-packages/application-package build 2>&1 | tail -5
```

Expected: exits cleanly.

**Step 4: Commit**

```bash
git add dev-packages/application-package/src/application-props.ts
git commit -m "feat(application-package): add profile visibility flags to FrontendApplicationConfig"
```

---

### Task 3: Add getters and props-propagation to ApplicationPackage

**Files:**
- Modify: `dev-packages/application-package/src/application-package.ts`

**Step 1: Add three getters**

The `homeUrl` getter (around line 81) looks like this:

```ts
get homeUrl(): string | undefined {
    const { homeUrl } = this.props.frontend.config;
    return homeUrl;
}
```

Add three more getters immediately after it:

```ts
get showProfileGender(): boolean {
    const { showProfileGender } = this.props.frontend.config;
    return showProfileGender ?? true
}

get showProfileBirthdate(): boolean {
    const { showProfileBirthdate } = this.props.frontend.config;
    return showProfileBirthdate ?? true
}

get showChangePassword(): boolean {
    const { showChangePassword } = this.props.frontend.config;
    return showChangePassword ?? true
}
```

**Step 2: Propagate flags from loopConfig in the `props` getter**

The `props` getter (around line 91) has a block that propagates `loopConfig` fields into `this._props.frontend.config`. The block that handles `homeUrl` looks like:

```ts
if (loopConfig && loopConfig.homeUrl !== undefined && this._props.frontend.config) {
    this._props.frontend.config.homeUrl = loopConfig.homeUrl;
}
```

This block appears **twice** — once in the `if (this._props)` branch and once outside it. Add the three new flags to **both** locations, immediately after the `homeUrl` block each time:

```ts
if (loopConfig && loopConfig.showProfileGender !== undefined && this._props.frontend.config) {
    this._props.frontend.config.showProfileGender = loopConfig.showProfileGender;
}
if (loopConfig && loopConfig.showProfileBirthdate !== undefined && this._props.frontend.config) {
    this._props.frontend.config.showProfileBirthdate = loopConfig.showProfileBirthdate;
}
if (loopConfig && loopConfig.showChangePassword !== undefined && this._props.frontend.config) {
    this._props.frontend.config.showChangePassword = loopConfig.showChangePassword;
}
```

**Step 3: Verify TypeScript compiles**

```bash
yarn --cwd dev-packages/application-package build 2>&1 | tail -5
```

Expected: exits cleanly.

**Step 4: Commit**

```bash
git add dev-packages/application-package/src/application-package.ts
git commit -m "feat(application-package): add getters and props propagation for profile visibility flags"
```

---

### Task 4: Bake flags into generated index.js

**Files:**
- Modify: `dev-packages/application-manager/src/generator/frontend-generator.ts`

**Step 1: Read the flag values at the top of `compileIndexJs()`**

The `compileIndexJs()` method (around line 138) reads values like this:

```ts
let homeUrl = '';
if (this.pck && this.pck.homeUrl) {
    homeUrl = this.pck.homeUrl;
}
```

Add three boolean variable reads immediately after the `homeUrl` block:

```ts
const showProfileGender = this.pck ? this.pck.showProfileGender : true
const showProfileBirthdate = this.pck ? this.pck.showProfileBirthdate : true
const showChangePassword = this.pck ? this.pck.showChangePassword : true
```

**Step 2: Add the three fields to the generated `runtimeConfig` object**

The generated `runtimeConfig` object in the template string (around line 161) currently ends with `homeUrl`:

```ts
const runtimeConfig = {
    basePath: process.env.REACT_APP_BASE_PATH ?? '${basePath}',
    backendBasePath: process.env.REACT_APP_BACKEND_BASE_PATH ?? '${backendBasePath}',
    googleAnalyticsMeasurementId: process.env.REACT_APP_GOOGLE_ANALYTICS_MEASUREMENT_ID ?? '${googleAnalyticsMeasurementId}',
    homeUrl: process.env.REACT_APP_HOME_URL ?? '${homeUrl}',
};
```

Change it to:

```ts
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

Note: `${showProfileGender}` etc. inside the template string are **TypeScript template literal interpolations**, not JS runtime expressions. They will be baked in as the boolean literal `true` or `false` at code-gen time.

**Step 3: Verify TypeScript compiles and regenerate**

```bash
yarn --cwd dev-packages/application-manager build 2>&1 | tail -5
```

Then trigger code generation (this writes `examples/browser/src-gen/frontend/index.js`):

```bash
yarn --cwd examples/browser build 2>&1 | grep -E "error|warning|done" | tail -10
```

Open `examples/browser/src-gen/frontend/index.js` and confirm you see:
```js
showProfileGender: true,
showProfileBirthdate: true,
showChangePassword: true,
```

**Step 4: Commit**

```bash
git add dev-packages/application-manager/src/generator/frontend-generator.ts
git commit -m "feat(application-manager): bake profile visibility flags into generated runtimeConfig"
```

---

### Task 5: Apply visibility flags in ProfileSettings component

**Files:**
- Modify: `packages/identity/src/browser/components/profile-settings-component.tsx`

**Step 1: Import `getRuntimeConfig`**

At the top of the file, the imports from `@authlance/core` include `ProjectContext` and `useSdkError`. Add `getRuntimeConfig` to the existing import or add a new one:

```ts
import { getRuntimeConfig } from '@authlance/core/lib/browser/runtime-config'
```

**Step 2: Read flags at the top of `ProfileSettings`**

Inside `ProfileSettings` (the component that starts around line 189), immediately after the `useState` declarations, add:

```ts
const {
    showProfileGender = true,
    showProfileBirthdate = true,
    showChangePassword = true,
} = getRuntimeConfig()
```

**Step 3: Update `validateForm` to make gender conditional**

The `validateForm` callback (around line 229) has this block:

```ts
if (!gender) {
    setGenderError('Gender is required.')
    valid = false
} else {
    setGenderError('')
}
```

Replace it with:

```ts
if (showProfileGender && !gender) {
    setGenderError('Gender is required.')
    valid = false
} else {
    setGenderError('')
}
```

**Step 4: Update the `validateForm` dependency array**

The `useCallback` for `validateForm` (around line 254) has `[name, lastName, gender]` as its dependency array. Add `showProfileGender` to it:

```ts
}, [name, lastName, gender, showProfileGender])
```

**Step 5: Update the Save button `disabled` guard**

The Save button (around line 432) is:

```tsx
<Button
    onClick={...}
    disabled={!name || !lastName || !gender}
>
```

Change the disabled condition to:

```tsx
disabled={!name || !lastName || (showProfileGender && !gender)}
```

**Step 6: Conditionally render the birthdate field**

The birthdate `<div>` block (around line 405):

```tsx
<div>
    <Label htmlFor="birthDate">Birth Date</Label>
    <DatePicker date={birthDate} onChange={setBirthDate} />
</div>
```

Wrap it:

```tsx
{showProfileBirthdate && (
    <div>
        <Label htmlFor="birthDate">Birth Date</Label>
        <DatePicker date={birthDate} onChange={setBirthDate} />
    </div>
)}
```

**Step 7: Conditionally render the gender field**

The gender `<div>` block (around line 411):

```tsx
<div>
    <Label htmlFor="gender">Gender</Label>
    <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female' | 'other')}>
        <SelectTrigger id="gender" className={genderError ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select gender" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
        </SelectContent>
    </Select>
    {genderError && <p className="text-sm text-destructive">{genderError}</p>}
</div>
```

Wrap it:

```tsx
{showProfileGender && (
    <div>
        <Label htmlFor="gender">Gender</Label>
        <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female' | 'other')}>
            <SelectTrigger id="gender" className={genderError ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
            </SelectContent>
        </Select>
        {genderError && <p className="text-sm text-destructive">{genderError}</p>}
    </div>
)}
```

**Step 8: Gate the PasswordComponent on `showChangePassword`**

The `<PasswordComponent>` is rendered inside a `<RenderIf>` (around line 441):

```tsx
<RenderIf isTrue={requestor?.identity === user.identity}>
    <PasswordComponent />
</RenderIf>
```

Change it to:

```tsx
<RenderIf isTrue={requestor?.identity === user.identity && showChangePassword}>
    <PasswordComponent />
</RenderIf>
```

**Step 9: Verify TypeScript compiles**

```bash
yarn --cwd packages/identity build 2>&1 | tail -5
```

Expected: exits cleanly.

**Step 10: Manual smoke test (with dev server running)**

1. Open the profile page with default config — all three fields and the Change Password button should be visible.
2. Try saving with no gender selected — should be blocked (button disabled or validation error).

**Step 11: Commit**

```bash
git add packages/identity/src/browser/components/profile-settings-component.tsx
git commit -m "feat(identity): apply profile visibility flags from runtimeConfig"
```

---

### Task 6: Fix password-change error handling — convert to SDK submission

**Files:**
- Modify: `packages/identity/src/browser/components/profile-settings-component.tsx`

**Step 1: Update `PasswordOnlySettings` props interface**

The function signature (around line 45) is currently:

```ts
export function PasswordOnlySettings({ flow }: { flow: SettingsFlow }) {
```

Change to:

```ts
export function PasswordOnlySettings({
    flow,
    orySDK,
    onSuccess,
}: {
    flow: SettingsFlow
    orySDK: import('@ory/client').FrontendApi
    onSuccess: () => void
}) {
```

**Step 2: Add password state and flow state inside `PasswordOnlySettings`**

At the top of the function body, add after the existing `nodes` / `csrf` / `method` declarations:

```ts
const [password, setPassword] = useState('')
const [submitting, setSubmitting] = useState(false)
const [localFlow, setLocalFlow] = useState(flow)
const nodes = getPasswordNodes(localFlow.ui.nodes)
const csrf = getAttr(nodes, 'csrf_token')
```

Remove the original `const nodes = getPasswordNodes(flow.ui.nodes)` and `const csrf = getAttr(nodes, 'csrf_token')` lines — they are now replaced by the ones above that use `localFlow`.

**Step 3: Add a submit handler**

After the state declarations, add:

```ts
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
        await orySDK.updateSettingsFlow({
            flow: localFlow.id,
            updateSettingsFlowBody: {
                method: 'password',
                password,
                csrf_token: csrf,
            },
        })
        onSuccess()
    } catch (err: any) {
        const updatedFlow = err?.response?.data
        if (updatedFlow?.ui) {
            setLocalFlow(updatedFlow)
        }
    } finally {
        setSubmitting(false)
    }
}
```

**Step 4: Rewrite the JSX**

Replace the current `return (...)` block entirely:

```tsx
// Helper: extract messages from a specific node group
const passwordNode = findNode(localFlow.ui.nodes, 'password') as any
const fieldMessages: string[] = passwordNode?.messages?.map((m: any) => m.text) ?? []
const flowMessages: string[] = localFlow.ui.messages?.map((m: any) => m.text) ?? []
const allErrors = [...flowMessages, ...fieldMessages]

return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <Label className="block text-sm mb-1">New password</Label>
            <Input
                name="password"
                type="password"
                autoComplete="new-password"
                className={`w-full border p-2 rounded${allErrors.length ? ' border-destructive' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
        </div>

        {allErrors.length > 0 && (
            <div className="space-y-1">
                {allErrors.map((msg, i) => (
                    <p key={i} className="text-sm text-destructive">{msg}</p>
                ))}
            </div>
        )}

        <Button type="submit" className="px-4 py-2 rounded border" disabled={submitting || !password}>
            {submitting ? 'Changing…' : 'Change password'}
        </Button>
    </form>
)
```

**Step 5: Update `PasswordComponent` to pass new props**

In `PasswordComponent` (around line 103), `orySDK` is already available from `useContext(ProjectContext)` (line 108). The `PasswordOnlySettings` is rendered around line 166:

```tsx
<PasswordOnlySettings
    flow={flow as any}
/>
```

Change to:

```tsx
<PasswordOnlySettings
    flow={flow as any}
    orySDK={orySDK}
    onSuccess={() => {
        setOpen(false)
        toast.toast({
            title: 'Password changed',
            description: 'Your password was updated successfully.',
            variant: 'default',
            duration: 5000,
        })
    }}
/>
```

`toast` is not currently in `PasswordComponent` — add it at the top of `PasswordComponent`:

```ts
const toast = useToast()
```

`useToast` is already imported at line 11 of the file.

**Step 6: Verify TypeScript compiles**

```bash
yarn --cwd packages/identity build 2>&1 | tail -5
```

Expected: exits cleanly, no TypeScript errors.

**Step 7: Manual smoke test (with dev server running)**

1. Open the profile page and click **Change Password**.
2. Enter a weak password like `secret123` and submit.
3. Confirm an error message appears **inside the dialog** (e.g., "The password can not be used because the password is too weak...").
4. Enter a strong password and submit.
5. Confirm the dialog closes and a success toast appears.

**Step 8: Commit**

```bash
git add packages/identity/src/browser/components/profile-settings-component.tsx
git commit -m "fix(identity): surface Kratos password validation errors in change-password dialog"
```

---

## Full build verification

After all tasks are complete, do a clean build of the full workspace:

```bash
cd /Users/nacho/git/nmorenor/duna/loop
yarn build 2>&1 | grep -E "ERROR|error TS" | head -20
```

Expected: no TypeScript errors.

## Testing the config flags end-to-end

In `examples/browser/package.json`, under `loop.frontend.config`, add:

```json
"showProfileGender": false,
"showProfileBirthdate": false,
"showChangePassword": false
```

Rebuild and start the dev server:

```bash
yarn --cwd examples/browser build && yarn start:dev
```

Navigate to the profile page. Confirm:
- Gender field is gone
- Birth date field is gone
- Change Password button is gone
- Save Profile works without gender (button is not disabled, submit succeeds)

Restore the `package.json` to the defaults (remove the three flags or set back to `true`) and verify everything reappears.
