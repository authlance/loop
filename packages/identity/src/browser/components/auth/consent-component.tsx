import React, { useContext, useEffect, useState } from 'react'
import { HydraContext } from '@authlance/core/lib/browser/common/hydra-sdk'
import { useSearchParams } from 'react-router-dom'
import { OAuth2ConsentRequest } from '@ory/client'
import { Card, CardContent, CardHeader, CardTitle } from '@authlance/ui/lib/browser/components/card'
import { Checkbox } from '@authlance/ui/lib/browser/components/checkbox'
import { Label } from '@authlance/ui/lib/browser/components/label'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'

const AutoConsent: React.FC = () => {
    const [consent, setConsent] = useState<OAuth2ConsentRequest | undefined>(undefined)
    const [acceptedScopes, setAcceptedScopes] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams] = useSearchParams()
    const consentChallenge = searchParams.get('consent_challenge')
    const [error, setError] = useState<string | undefined>(undefined)
    const { oauthSDK } = useContext(HydraContext)
    const { session } = useContext(SessionContext)

    useEffect(() => {
        if (!session || !session.id) {
            setError('You must be logged in to provide consent.')
            setLoading(false)
            return
        }

        if (!consentChallenge) {
            setError('No consent challenge found.')
            return
        }

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
    }, [consentChallenge])

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
        return <div className="text-desctructive">{error}</div>
    }
    if (!consent) {
        return <></>
    }

    return (
        <Card className="w-full max-w-lg mx-auto mt-10">
            <CardHeader>
                <CardTitle>Consent Required</CardTitle>
            </CardHeader>
            <CardContent>
                <p>
                    The application <strong>{consent.client?.client_name || consent.client?.client_id || ''}</strong> wants to
                    access the following information:
                </p>
                <div className="mt-4">
                    {(consent.requested_scope || []).map((scope) => (
                        <div key={scope} className="flex items-center gap-2">
                            <Checkbox
                                checked={acceptedScopes.includes(scope)}
                                disabled={true}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setAcceptedScopes((prev) => [...prev, scope])
                                    } else {
                                        setAcceptedScopes((prev) => prev.filter((s) => s !== scope))
                                    }
                                }}
                            />
                            <Label>{scope}</Label>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="destructive" onClick={() => handleConsent(false)}>
                        Deny
                    </Button>
                    <Button onClick={() => handleConsent(true)}>Approve</Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default AutoConsent
