import React, { useCallback, useContext, useEffect, useState } from 'react'
import { RegistrationFlow } from '@ory/client'
import { Registration } from '@ory/elements-react/theme'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useSdkError } from '@authlance/core/lib/browser/common/kratos-sdk'
import { ProjectContext } from '@authlance/core/lib/browser/common/kratos'
import { PageContent, SinglePage } from '@authlance/core/lib/browser/components/layout/Page'
import { useAppSelector } from '@authlance/core/lib/browser/store'
import { useBrandIcon } from '@authlance/core/lib/browser/hooks/useBrand'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { projectConfig } from '@authlance/core/lib/browser/ory/projectConfig'
import { OryWrapper } from '@authlance/core/lib/browser/components/layout/OryWrapper'
import useRegistrationFooterProvider from '../../hooks/useRegistrationFooterProvider'

export const RegistrationComponent = () => {
    const { orySDK } = useContext(ProjectContext)
    const brandicon = useBrandIcon()
    const { loading } = useAppSelector((state) => state.auth)
    const [flow, setFlow] = useState<RegistrationFlow | null>(null)
    const [searchParams, setSearchParams] = useSearchParams()
    const returnTo = searchParams.get('return_to')

    const loginChallenge = searchParams.get('login_challenge')

    const navigate = useNavigate()
    const registrationFooterProvider = useRegistrationFooterProvider()

    const getFlow = useCallback(
        (flowId: string) =>
            orySDK
                // the flow data contains the form fields, error messages and csrf token
                .getRegistrationFlow({ id: flowId })
                .then((flow) => setFlow(flow.data))
                .catch(sdkErrorHandler),
        []
    )

    const sdkErrorHandler = useSdkError(getFlow, setFlow, navigate, '/register', true)

    // create a new registration flow
    const createFlow = () => {
        orySDK
            .createBrowserRegistrationFlow({
                ...(returnTo && { returnTo: returnTo }),
                ...(loginChallenge && { loginChallenge: loginChallenge }),
            })
            .then((flow) => {
                setSearchParams({ ['flow']: flow.data.id })
                setFlow(flow.data)
            })
            .catch((e) => {
                sdkErrorHandler(e)
            })
    }

    useEffect(() => {
        // we might redirect to this page after the flow is initialized, so we check for the flowId in the URL
        const flowId = searchParams.get('flow')
        // the flow already exists
        if (flowId) {
            getFlow(flowId).catch(createFlow) // if for some reason the flow has expired, we need to get a new one
            return
        }
        // we assume there was no flow, so we create a new one
        createFlow()
    }, [navigate])

    if (!flow || loading) {
        return <DefaultDashboardContent loading={true} />
    }

    // the flow is not set yet, so we show a loading indicator
    return (
        <SinglePage>
            <div className={'flex justify-center items-center h-full'}>
                <PageContent>
                    <OryWrapper>
                        <Registration
                            flow={flow as any}
                            config={{
                                project: {
                                    ...projectConfig,
                                    logo_light_url: brandicon,
                                    logo_dark_url: brandicon,
                                },
                                sdk: {
                                    url: process.env.REACT_APP_ORY_URL || 'http://localhost:8000/authlance/identity',
                                    options: { credentials: 'include' },
                                },
                            }}
                            components={{
                                Card: {
                                    Logo: () => (
                                        <div className="flex items-center justify-center py-4">
                                            <Link
                                                to="/"
                                                className="custom-logo inline-flex items-center justify-center relative h-10"
                                            >
                                                <img src={brandicon} className="h-10 w-auto" />
                                            </Link>
                                        </div>
                                    ),
                                    Footer: () => (
                                        <div>
                                            <span className="leading-normal font-normal text-interface-foreground-default-primary antialiased">
                                                Already have an account?{' '}
                                                <Link
                                                    className="text-button-link-brand-brand underline transition-colors hover:text-button-link-brand-brand-hover"
                                                    to="/login"
                                                    data-testid="ory/screen/registration/action/login"
                                                >
                                                    Sign in
                                                </Link>
                                            </span>
                                            <div className="mt-2">
                                                {registrationFooterProvider?.getFooter() ?? <></>}
                                            </div>
                                        </div>
                                    ),
                                },
                            }}
                        />
                    </OryWrapper>
                </PageContent>
            </div>
        </SinglePage>
    )
}
