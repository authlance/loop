import React, { useCallback, useContext, useState, useEffect } from 'react'
import { VerificationFlow } from '@ory/client'
import { Verification as AuthVerification } from '@ory/elements-react/theme'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ProjectContext } from '@authlance/core/lib/browser/common/kratos'
import { useSdkError } from '@authlance/core/lib/browser/common/kratos-sdk'
import { useAppSelector } from '@authlance/core/lib/browser/store'
import { getRuntimeConfig } from '@authlance/core/lib/browser/runtime-config'
import { SinglePage, PageContent } from '@authlance/core/lib/browser/components/layout/Page'
import { useBrandIcon } from '@authlance/core/lib/browser/hooks/useBrand'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { projectConfig } from '@authlance/core/lib/browser/ory/projectConfig'
import { OryWrapper } from '@authlance/core/lib/browser/components/layout/OryWrapper'

export const Verification = (): JSX.Element => {
    const navigate = useNavigate()
    const brandicon = useBrandIcon()
    const runtimeConfig = getRuntimeConfig()
    const [flow, setFlow] = useState<VerificationFlow | null>(null)
    const [searchParams, setSearchParams] = useSearchParams()
    const { orySDK } = useContext(ProjectContext)
    const { loading } = useAppSelector((state) => state.auth)

    const returnTo = searchParams.get('return_to') || undefined

    const flowId = searchParams.get('flow')

    // Get the flow based on the flowId in the URL (.e.g redirect to this page after flow initialized)
    const getFlow = useCallback(
        (flowId: string) =>
            orySDK
                // the flow data contains the form fields, error messages and csrf token
                .getVerificationFlow({ id: flowId })
                .then((flow) => setFlow(flow.data))
                .catch(sdkErrorHandler),
        [orySDK]
    )

    const sdkErrorHandler = useSdkError(getFlow, setFlow, navigate, '/verify')

    // create a new verification flow
    const createFlow = useCallback(() => {
        orySDK
            .createBrowserVerificationFlow({ returnTo })
            .then((flow) => {
                const nextParams = new URLSearchParams()
                nextParams.set('flow', flow.data.id)
                if (returnTo) {
                    nextParams.set('return_to', returnTo)
                }
                setSearchParams(nextParams)
                setFlow(flow.data)
            })
            .catch(sdkErrorHandler)
    }, [orySDK, setSearchParams, setFlow, sdkErrorHandler, returnTo])

    useEffect(() => {
        // it could happen that we are redirected here with an existing flow
        if (flowId) {
            // if the flow failed to get since it could be expired or invalid, we create a new one
            getFlow(flowId).catch(createFlow)
            return
        }
        createFlow()
    }, [flowId, getFlow, createFlow])

    if (!flow || loading) {
        return <DefaultDashboardContent loading={true} />
    }

    return (
        <SinglePage>
            <div className={'flex justify-center items-center h-full'}>
                <PageContent>
                    <OryWrapper>
                        <AuthVerification
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
                                }
                            }}
                            components={{
                                Card: {
                                    Logo: () => (
                                        <div className="flex items-center justify-center py-4">
                                            <Link to={runtimeConfig.homeUrl || runtimeConfig.basePath || '/'} className='custom-logo inline-flex items-center justify-center relative h-10'>
                                                <img src={brandicon} className="h-10 w-auto" />
                                            </Link>
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
