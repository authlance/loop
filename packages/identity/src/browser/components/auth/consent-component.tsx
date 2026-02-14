import React, { useContext, useEffect, useState } from 'react'
import { HydraContext } from '@authlance/core/lib/browser/common/hydra-sdk'
import { Link, useSearchParams } from 'react-router-dom'
import { OAuth2ConsentRequest } from '@ory/client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@authlance/ui/lib/browser/components/card'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { SinglePage } from '@authlance/core/lib/browser/components/layout/Page'
import { OryWrapper } from '@authlance/core/lib/browser/components/layout/OryWrapper'
import { useBrandIcon } from '@authlance/core/lib/browser/hooks/useBrand'
import { getRuntimeConfig } from '@authlance/core/lib/browser/runtime-config'
import { ShieldCheck } from 'lucide-react'

// Module-level guard: survives component unmount/remount caused by router
// recreation when the user/targetGroup context changes in AppRouter.
const processedChallenges = new Set<string>()

const AutoConsent: React.FC = () => {
    const [consent, setConsent] = useState<OAuth2ConsentRequest | undefined>(undefined)
    const [acceptedScopes, setAcceptedScopes] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams] = useSearchParams()
    const consentChallenge = searchParams.get('consent_challenge')
    const [error, setError] = useState<string | undefined>(undefined)
    const { oauthSDK } = useContext(HydraContext)
    const { session } = useContext(SessionContext)
    const brandicon = useBrandIcon()
    const runtimeConfig = getRuntimeConfig()

    useEffect(() => {
        if (!session || !session.id) {
            return
        }

        if (!consentChallenge) {
            setError('No consent challenge found.')
            return
        }

        if (processedChallenges.has(consentChallenge)) {
            return
        }
        processedChallenges.add(consentChallenge)

        // Step 1: Get the OAuth2 Consent Request
        oauthSDK
            .getOAuth2ConsentRequest({ consentChallenge })
            .then((response) => {
                const { data } = response
                if (data.skip) {
                    return oauthSDK.acceptOAuth2ConsentRequest({
                        consentChallenge,
                        acceptOAuth2ConsentRequest: {
                            grant_scope: data.requested_scope,
                            session: {},
                            remember: true,
                            remember_for: 3600,
                        },
                    })
                } else {
                    setConsent(data)
                    setAcceptedScopes(data.requested_scope || [])
                    setLoading(false)
                }
            })
            .then((response) => {
                if (response?.data?.redirect_to) {
                    window.location.href = response.data.redirect_to
                }
            })
            .catch((err) => {
                setError(err.message)
                setLoading(false)
            })
    }, [consentChallenge, session, oauthSDK, setError, setLoading, setConsent, setAcceptedScopes])

    const handleConsent = (accept: boolean) => {
        if (!consentChallenge) {
            return
        }

        if (accept) {
            oauthSDK
                .acceptOAuth2ConsentRequest({
                    consentChallenge,
                    acceptOAuth2ConsentRequest: {
                        grant_scope: acceptedScopes,
                        session: {},
                        remember: true,
                        remember_for: 3600,
                    },
                })
                .then((response) => {
                    if (response.data.redirect_to) {
                        window.location.href = response.data.redirect_to
                    }
                })
                .catch((err) => setError(err.message))
        } else {
            oauthSDK
                .rejectOAuth2ConsentRequest({
                    consentChallenge,
                })
                .then((response) => {
                    if (response.data.redirect_to) {
                        window.location.href = response.data.redirect_to
                    }
                })
                .catch((err) => setError(err.message))
        }
    }

    if (loading) {
        return (
            <DefaultDashboardContent loading={true} />
        )
    }

    if (error) {
        return (
            <SinglePage>
                <div className="flex justify-center items-center">
                    <OryWrapper>
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <div className="flex items-center justify-center py-4">
                                    <Link to={runtimeConfig.homeUrl || runtimeConfig.basePath || '/'} className="custom-logo inline-flex items-center justify-center relative h-10">
                                        <img src={brandicon} className="h-10 w-auto" />
                                    </Link>
                                </div>
                                <CardTitle className="text-center">Something went wrong</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-destructive text-center">{error}</p>
                            </CardContent>
                        </Card>
                    </OryWrapper>
                </div>
            </SinglePage>
        )
    }

    if (!consent) {
        return <></>
    }

    const clientName = consent.client?.client_name || consent.client?.client_id || 'An application'

    return (
        <SinglePage>
            <div className="flex justify-center items-center">
                <OryWrapper>
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center justify-center py-4">
                                <Link to={runtimeConfig.homeUrl || runtimeConfig.basePath || '/'} className="custom-logo inline-flex items-center justify-center relative h-10">
                                    <img src={brandicon} className="h-10 w-auto" />
                                </Link>
                            </div>
                            <CardTitle className="text-center">Permission Request</CardTitle>
                            <p className="text-sm text-muted-foreground text-center mt-2">
                                <strong>{clientName}</strong> wants to access the following permissions on your account:
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {(consent.requested_scope || []).map((scope) => (
                                    <div key={scope} className="flex items-center gap-3 rounded-md border px-3 py-2">
                                        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                                        <span className="text-sm">{scope}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-4">
                            <Button className="w-full" variant="outline" onClick={() => handleConsent(false)}>
                                Deny
                            </Button>
                            <Button className="w-full" onClick={() => handleConsent(true)}>
                                Allow Access
                            </Button>
                        </CardFooter>
                    </Card>
                </OryWrapper>
            </div>
        </SinglePage>
    )
}

export default AutoConsent
