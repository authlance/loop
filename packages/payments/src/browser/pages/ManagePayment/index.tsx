import React, { useContext, useEffect, useState } from 'react'
import { injectable } from 'inversify'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getOrCreateQueryClient } from '@authlance/core/lib/browser/query-client'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import Page, { PageContent } from '@authlance/core/lib/browser/components/layout/Page'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import { Toaster } from '@authlance/ui/lib/browser/components/toaster'

function ManagePaymentContent() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const groupName = searchParams.get('group')
    const { user, subscriptionsApi, paymentsApi } = useContext(SessionContext)
    const toast = useToast()
    const [isRedirecting, setIsRedirecting] = useState(false)

    useEffect(() => {
        if (!user || !user.identity) {
            navigate('/')
            return
        }

        if (!groupName) {
            toast.toast({
                title: 'Error',
                description: 'Group name is required.',
                variant: 'destructive',
                duration: 5000,
            })
            navigate('/')
            return
        }

        if (isRedirecting) {
            return
        }

        const redirectToPortal = async () => {
            setIsRedirecting(true)
            try {
                const response = await subscriptionsApi.authlanceIdentityApiV1ProfileSubscriptionsUserGroupActiveGet(
                    user.identity,
                    groupName
                )

                if (response.status !== 200 || !response.data) {
                    toast.toast({
                        title: 'Error',
                        description: 'Could not find subscription for this group.',
                        variant: 'destructive',
                        duration: 5000,
                    })
                    navigate('/')
                    return
                }

                const subscription = response.data
                const portalResponse = await paymentsApi.authlancePaymentsApiV1CustomerPortalPost({
                    customerId: subscription.billingCustomerId,
                })

                if (portalResponse.status !== 200 || !portalResponse.data?.url) {
                    toast.toast({
                        title: 'Error',
                        description: 'Could not create payment portal session.',
                        variant: 'destructive',
                        duration: 5000,
                    })
                    navigate('/')
                    return
                }

                window.location.href = portalResponse.data.url
            } catch (error) {
                console.error('Error redirecting to payment portal:', error)
                toast.toast({
                    title: 'Error',
                    description: 'An error occurred while redirecting to the payment portal.',
                    variant: 'destructive',
                    duration: 5000,
                })
                navigate('/')
            }
        }

        redirectToPortal()
    }, [user, groupName, navigate, subscriptionsApi, paymentsApi, toast, isRedirecting])

    return <DefaultDashboardContent loading={true} />
}

interface ManagePaymentPageProps {
    queryClient?: QueryClient
}

function ManagePaymentPage({ queryClient }: ManagePaymentPageProps) {
    const resolvedQueryClient = queryClient ?? getOrCreateQueryClient()
    return (
        <QueryClientProvider client={resolvedQueryClient}>
            <Page>
                <PageContent>
                    <ManagePaymentContent />
                </PageContent>
            </Page>
            <Toaster />
        </QueryClientProvider>
    )
}

@injectable()
export class ManagePaymentPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/subscription/manage-payment',
            component: ManagePaymentPage,
            name: 'Manage Payment',
            navBar: false,
            exact: true,
            root: true,
            authRequired: true,
        }
    }
}
