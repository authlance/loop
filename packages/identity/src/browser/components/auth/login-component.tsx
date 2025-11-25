import React, { useCallback, useContext, useEffect, useState } from 'react'
import { SinglePage } from '@authlance/core/lib/browser/components/layout/Page'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAppSelector } from '@authlance/core/lib/browser/store'
import { LoginFlow } from '@ory/client'
import { useSdkError } from '@authlance/core/lib/browser/common/kratos-sdk'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import { OryWrapper } from '@authlance/core/lib/browser/components/layout/OryWrapper'
import { projectConfig } from '@authlance/core/lib/browser/ory/projectConfig'
import { Login } from '@ory/elements-react/theme'
import { ProjectContext } from '@authlance/core/lib/browser/common/kratos'
import { useBrandIcon } from '@authlance/core/lib/browser/hooks/useBrand'

export const LoginComponent: React.FC = () => {
    const {} = useContext(SessionContext)
    const brandicon = useBrandIcon()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [flow, setFlow] = useState<LoginFlow | undefined>(undefined)
    const { orySDK } = useContext(ProjectContext)
    const { loading } = useAppSelector((state) => state.auth)
    const { user } = useContext(SessionContext)
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        if (!user) {
            setAuthenticated(false)
        } else {
            setAuthenticated(true)
        }
    }, [user])

    const getFlow = useCallback(
        (flowId: string) =>
            orySDK
                .getLoginFlow({ id: flowId })
                .then(({ data: flow }) => setFlow(flow))
                .catch((e) => console.error(e)),
        [orySDK]
    )

    const sdkErrorHandler = useSdkError(getFlow, setFlow, navigate, '/login', true)

    const createFlow = useCallback(() => {
        const loginChallenge = () => searchParams.get('login_challenge') || undefined
        const returnTo = () => searchParams.get('return_to') || undefined
        const aalParam = () => {
            const aal = searchParams.get('aal2')
            if (aal) {
                return aal
            }
            return 'aal1'
        }
        const work = async () => {
            try {
                const flow = await orySDK.createBrowserLoginFlow({
                    refresh: true,
                    aal: aalParam(),
                    loginChallenge: loginChallenge(),
                    returnTo: returnTo(),
                })
                setSearchParams({ flow: flow.data.id })
                setFlow(flow.data)
                return
            } catch (e) {
                sdkErrorHandler(e)
            }
        }
        work()
    }, [orySDK, setSearchParams, setFlow, sdkErrorHandler, searchParams])

    useEffect(() => {
        const flowId = searchParams.get('flow')
        if (flowId) {
            getFlow(flowId).catch(createFlow)
            return
        }

        createFlow()
    }, [createFlow, getFlow, searchParams])

    if (authenticated) {
        return <></>
    }

    if (!flow || loading) {
        return <DefaultDashboardContent loading={true} />
    }

    return (
        <SinglePage>
            <div className={'flex justify-center items-center'}>
                <OryWrapper>
                    <Login
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
                        flow={flow as any}
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
            </div>
        </SinglePage>
    )
}
