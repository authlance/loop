import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageContent, SinglePage } from '@authlance/core/lib/browser/components/layout/Page'
import { RecoveryFlow } from '@ory/client'
import { Recovery as AuthRecovery } from '@ory/elements-react/theme'
import { useAppSelector } from '@authlance/core/lib/browser/store'
import { ProjectContext } from '@authlance/core/lib/browser/common/kratos'
import { useSdkError } from '@authlance/core/lib/browser/common/kratos-sdk'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { projectConfig } from '@authlance/core/lib/browser/ory/projectConfig'
import { useBrandIcon } from '@authlance/core/lib/browser/hooks/useBrand'
import { OryWrapper } from '@authlance/core/lib/browser/components/layout/OryWrapper'

const Recovery: React.FC = () => {
    const {} = useContext(SessionContext)
    const navigate = useNavigate()
    const brandicon = useBrandIcon()
    const [searchParams, setSearchParams] = useSearchParams()
    const token = useAppSelector((state) => state.auth.token)
    const [flow, setFlow] = useState<RecoveryFlow | undefined>(undefined)
    const { orySDK } = useContext(ProjectContext)
    const getFlow = useCallback(
        (flowId: string) =>
            orySDK
                // the flow data contains the form fields, error messages and csrf token
                .getRecoveryFlow({ id: flowId })
                .then((flow) => setFlow(flow.data))
                .catch((e) => console.error(e)),
        [orySDK]
    )
    const sdkErrorHandler = useSdkError(getFlow, setFlow, navigate, '/recovery')

    const createFlow = useCallback(() => {
        orySDK
            .createBrowserRecoveryFlow()
            .then((flow) => {
                setSearchParams({ flow: flow.data.id })
                setFlow(flow.data)
            })
            .catch(sdkErrorHandler)
    }, [orySDK, setSearchParams, setFlow, sdkErrorHandler])

    useEffect(() => {
        const flowId = searchParams.get('flow')
        if (flowId) {
            getFlow(flowId).catch(createFlow)
            return
        }

        createFlow()
    }, [createFlow, getFlow, searchParams, token])

    if (!flow) {
        return <DefaultDashboardContent loading={true} />
    }

    return (
        <SinglePage>
            <div className={'flex justify-center items-center h-full'}>
                <PageContent>
                    <OryWrapper>
                        <AuthRecovery
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
                                            <Link to="/" className='custom-logo inline-flex items-center justify-center relative h-10'>
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

export default Recovery
