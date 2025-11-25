import React, { useContext, useEffect } from 'react'
import { injectable } from 'inversify'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getOrCreateQueryClient } from '@authlance/core/lib/browser/query-client'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { ActivateGroupComponent } from '@authlance/identity/lib/browser/components/groups/group'
import { useBaseDashboardPath } from '@authlance/core/lib/browser/hooks/useBrand'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import Page, { PageContent } from '@authlance/core/lib/browser/components/layout/Page'
import { wait } from '@authlance/core/lib/common/promise-util'
import { Toaster } from '@authlance/ui/lib/browser/components/toaster'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'

interface ActivateBusinessAccountPageProps {
    queryClient?: QueryClient
}

function ActivateBusinessAccountPage({ queryClient }: ActivateBusinessAccountPageProps) {
    const resolvedQueryClient = queryClient ?? getOrCreateQueryClient()
    return (
        <QueryClientProvider client={resolvedQueryClient}>
            <Page>
                <PageContent>
                    <ActivateGroupComponent />
                </PageContent>
            </Page>
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}

function BusinessAccountActivateSuccessPage() {
    const basePath = useBaseDashboardPath()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [subscriptionId, setSubscriptionId] = React.useState<string | undefined>(undefined)
    const sessionId = searchParams.get('session_id')
    const { user, forceChallenge, subscriptionsApi, paymentsApi } = useContext(SessionContext)

    useEffect(() => {
        if (!user || !user.identity) {
            navigate('/')
            return
        }
        if (!subscriptionId) {
            return
        }
        const work = async () => {
            try {
                await wait(1500)
                const response = await subscriptionsApi!.authlanceIdentityApiV1ProfileSubscriptionsUserBillingBillingSubscriptionIDGet(user.identity, subscriptionId)
                if (response.status === 200) {
                    const subscription = response.data
                    if (subscription) {
                        forceChallenge()
                        navigate('/group/selection', { replace: true })
                        return
                    }
                }
            } catch (error) {
                console.error('Error fetching subscription:', error)
            }
        }
        work()
    }, [subscriptionId, user, navigate, forceChallenge])

    useEffect(() => {
        if (!user || !user.identity) {
            navigate('/')
            return
        }
        if (subscriptionId) {
            return
        }
        const timer = setTimeout(() => {
            if (basePath) {
                window.location.href = basePath
            } else {
                navigate('/')
            }
        }, 8000)
        const work = async () => {
            try {
                await wait(1500)
                const response = await paymentsApi.authlancePaymentsApiV1SessionIdPost({
                    sessionId: sessionId || '',
                })
                if (response.status === 200) {
                    const { subscriptionId: targetSubscriptionId } = response.data
                    if (targetSubscriptionId) {
                        clearTimeout(timer)
                        setSubscriptionId(targetSubscriptionId)
                        return
                    }
                }
            } catch (error) {
                console.error('Error fetching subscription ID:', error)
            }
        }
        work()
        return () => clearTimeout(timer)
    }, [sessionId, user, basePath, navigate, subscriptionId, setSubscriptionId, paymentsApi])

    return <DefaultDashboardContent loading={true} />
}

@injectable()
export class ActivateBusinessAccountPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/activate-business-account',
            component: ActivateBusinessAccountPage,
            name: 'Group Context',
            navBar: false,
            exact: true,
            root: true,
            authRequired: true,
        }
    }
}

@injectable()
export class BusinessAccountActivateSuccessPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/subscription/payment/success',
            component: BusinessAccountActivateSuccessPage,
            name: 'Group Context',
            navBar: false,
            exact: true,
            root: true,
            authRequired: true,
        }
    }
}
