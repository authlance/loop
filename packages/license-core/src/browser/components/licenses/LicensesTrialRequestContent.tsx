import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@authlance/ui/lib/browser/components/card'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { Input } from '@authlance/ui/lib/browser/components/input'
import { Label } from '@authlance/ui/lib/browser/components/label'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@authlance/ui/lib/browser/components/select'
import { Loader2 } from 'lucide-react'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import {
    triggerLicenseDownload,
    useLicensesSdk,
} from '../../common/licenses-sdk'
import { useAdminProductKeys } from '../../hooks/use-licenses'

const LicensesTrialRequestContent: React.FC = () => {
    const navigate = useNavigate()
    const { user, targetGroup } = useContext(SessionContext)
    const { licenseApi, adminApi } = useLicensesSdk()
    const { toast } = useToast()

    const normalizedGroup = (targetGroup ?? '').trim()

    const [email] = useState(user?.email ?? '')
    const [cookieDomain, setCookieDomain] = useState('')
    const [productKey, setProductKey] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const {
        data: productKeyEntries,
        isLoading: productKeysLoading,
        error: productKeysError,
    } = useAdminProductKeys(adminApi)

    const productKeyOptions = useMemo(() => {
        if (!Array.isArray(productKeyEntries)) {
            return []
        }
        return productKeyEntries
            .filter((entry) => {
                const productType =
                    typeof entry?.productType === 'string' ? entry.productType.trim().toLowerCase() : ''
                return productType === 'one_off'
            })
            .map((entry) => (typeof entry?.productKey === 'string' ? entry.productKey.trim().toLowerCase() : ''))
            .filter((key, index, self) => key !== '' && self.indexOf(key) === index)
    }, [productKeyEntries])

    useEffect(() => {
        if (!productKey && productKeyOptions.length > 0) {
            setProductKey(productKeyOptions[0])
        }
    }, [productKeyOptions, productKey])

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            if (!licenseApi) {
                toast({ title: 'Not ready', description: 'Authentication required to request a trial.', variant: 'destructive' })
                return
            }
            if (!normalizedGroup) {
                toast({ title: 'No group selected', description: 'Select a target group before requesting a trial.', variant: 'destructive' })
                return
            }
            const trimmedEmail = (user?.email ?? '').trim()
            const trimmedDomain = cookieDomain.trim()
            if (!trimmedEmail) {
                toast({ title: 'Email unavailable', description: 'Your account is missing an email address. Contact your administrator.', variant: 'destructive' })
                return
            }
            if (!trimmedDomain) {
                toast({ title: 'Missing cookie domain', description: 'Provide the cookie domain that Authlance should use for authentication cookies.', variant: 'destructive' })
                return
            }
            const normalizedDomain = trimmedDomain.startsWith('.') ? trimmedDomain : `.${trimmedDomain}`
            const normalizedProductKey = productKey.trim().toLowerCase()
            if (!normalizedProductKey) {
                toast({
                    title: 'Missing product key',
                    description: 'Select the product to issue a trial for.',
                    variant: 'destructive',
                })
                return
            }
            setSubmitting(true)
            try {
                const response = await licenseApi.authlanceLicenseTrialGroupIssuePost(normalizedGroup, {
                    email: trimmedEmail,
                    domain: normalizedDomain,
                    productKey: normalizedProductKey,
                })
                const fileName = normalizedGroup ? `authlance-${normalizedGroup}-trial-license` : 'authlance-trial-license'
                triggerLicenseDownload(response.data, { fileName })
                toast({
                    title: 'Trial issued',
                    description: 'Your trial license has been generated and downloaded.',
                })
                navigate('/licenses/group')
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unable to issue trial right now.'
                toast({ title: 'Trial failed', description: message, variant: 'destructive' })
            } finally {
                setSubmitting(false)
            }
        },
        [licenseApi, normalizedGroup, user?.email, cookieDomain, productKey, toast, navigate]
    )

    if (!licenseApi) {
        return <DefaultDashboardContent loading />
    }

    if (!normalizedGroup) {
        return (
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>No group selected</CardTitle>
                        <CardDescription>Select a group before requesting a trial license.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            Back
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Request a trial license</CardTitle>
                    <CardDescription>
                        Provide the cookie domain to issue a time-limited trial for <span className="font-medium">{normalizedGroup}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="trial-email">Admin email</Label>
                            <Input id="trial-email" type="email" value={email} readOnly autoComplete="email" />
                            <p className="text-xs text-muted-foreground">Trials use the currently logged-in administrator email.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="trial-product-key">Product key</Label>
                            {productKeyOptions.length > 0 && (
                                <Select
                                    value={productKey}
                                    onValueChange={(value) => setProductKey(value.trim().toLowerCase())}
                                    disabled={productKeysLoading || submitting}
                                >
                                    <SelectTrigger id="trial-product-key">
                                        <SelectValue
                                            placeholder={
                                                productKeysLoading ? 'Loading product keys...' : 'Select product key'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productKeyOptions.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <Input
                                id="trial-product-key-input"
                                value={productKey}
                                onChange={(event) => setProductKey(event.target.value.trim().toLowerCase())}
                                autoComplete="off"
                                placeholder="core"
                                disabled={submitting}
                            />
                            <p className="text-xs text-muted-foreground">
                                Only fixed-price products are listed; enter a key manually if you need a different target.
                            </p>
                            {productKeysError instanceof Error && (
                                <p className="text-xs text-destructive">
                                    Unable to load product keys: {productKeysError.message}.
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="trial-domain">Cookie domain</Label>
                            <Input
                                id="trial-domain"
                                value={cookieDomain}
                                onChange={(event) => setCookieDomain(event.target.value)}
                                autoComplete="off"
                                placeholder=".example.com"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Use the domain to attach to Authlance cookies (for subdomains start with a dot, e.g. <code>.example.com</code>).
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => navigate('/licenses/group')} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {submitting ? 'Issuing…' : 'Issue trial license'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                    Existing trials will be returned instead of creating new allocations when available.
                </CardFooter>
            </Card>
        </div>
    )
}

export default LicensesTrialRequestContent
