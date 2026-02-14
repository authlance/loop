import React, { useContext, useEffect, useState } from 'react'
import { injectable } from 'inversify'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getOrCreateQueryClient } from '@authlance/core/lib/browser/query-client'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import Page, { PageContent } from '@authlance/core/lib/browser/components/layout/Page'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import { Toaster } from '@authlance/ui/lib/browser/components/toaster'
import { useSubscriptionTiers } from '@authlance/identity/lib/browser/hooks/useSubscriptionTiers'
import { useActiveSubscription } from '@authlance/identity/lib/browser/hooks/useActiveSubscription'
import { TierSelectionStep } from '@authlance/identity/lib/browser/components/groups/TierSelectionStep'
import { PaymentTierDto } from '@authlance/common/lib/common/types/subscriptions'

function ChangePlanContent() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const groupName = searchParams.get('group')
    const { user, paymentsApi } = useContext(SessionContext)
    const toast = useToast()
    const [selectedTier, setSelectedTier] = useState<PaymentTierDto | null>(null)
    const [isRedirecting, setIsRedirecting] = useState(false)

    const { isLoading: tiersLoading, data: subscriptionTiers } = useSubscriptionTiers()
    const { isLoading: subscriptionLoading, data: currentSubscription } = useActiveSubscription(
        groupName || ''
    )

    useEffect(() => {
        if (!user || !user.identity) {
            navigate('/')
            return
        }
        if (!user.verified) {
            const returnTo = `${window.location.pathname}${window.location.search}`
            navigate(`/verify?return_to=${encodeURIComponent(returnTo)}`, { replace: true })
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
    }, [user, groupName, navigate, toast])

    const handleSelectTier = (tier: PaymentTierDto) => {
        setSelectedTier(tier)
    }

    const handleChangePlan = async () => {
        if (!selectedTier || !currentSubscription || isRedirecting) {
            return
        }
        if (!user?.verified) {
            toast.toast({
                title: 'Verification required',
                description: 'Verify your account before managing subscriptions.',
                variant: 'destructive',
                duration: 5000,
            })
            const returnTo = `${window.location.pathname}${window.location.search}`
            navigate(`/verify?return_to=${encodeURIComponent(returnTo)}`)
            return
        }

        if (selectedTier.tierName === currentSubscription.tierName) {
            toast.toast({
                title: 'Same Plan',
                description: 'You are already on this plan.',
                variant: 'default',
                duration: 3000,
            })
            return
        }

        setIsRedirecting(true)
        try {
            const portalResponse = await paymentsApi.authlancePaymentsApiV1CustomerPortalPost({
                customerId: currentSubscription.billingCustomerId,
            })

            if (portalResponse.status !== 200 || !portalResponse.data?.url) {
                toast.toast({
                    title: 'Error',
                    description: 'Could not create payment portal session.',
                    variant: 'destructive',
                    duration: 5000,
                })
                setIsRedirecting(false)
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
            setIsRedirecting(false)
        }
    }

    if (tiersLoading || subscriptionLoading) {
        return <DefaultDashboardContent loading={true} />
    }

    if (!subscriptionTiers || subscriptionTiers.length === 0) {
        return (
            <div className="p-4 text-center">
                <p>No subscription tiers available.</p>
            </div>
        )
    }

    if (!currentSubscription) {
        return (
            <div className="p-4 text-center">
                <p>No active subscription found for this group.</p>
            </div>
        )
    }

    return (
        <TierSelectionStep
            tiers={subscriptionTiers}
            selectedTier={selectedTier}
            onSelectTier={handleSelectTier}
            onContinue={handleChangePlan}
            currentSubscription={currentSubscription}
            title="Change Plan"
            continueLabel="Change Plan"
        />
    )
}

interface ChangePlanPageProps {
    queryClient?: QueryClient
}

function ChangePlanPage({ queryClient }: ChangePlanPageProps) {
    const resolvedQueryClient = queryClient ?? getOrCreateQueryClient()
    return (
        <QueryClientProvider client={resolvedQueryClient}>
            <Page>
                <PageContent>
                    <ChangePlanContent />
                </PageContent>
            </Page>
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}

@injectable()
export class ChangePlanPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/subscription/change-plan',
            component: ChangePlanPage,
            name: 'Change Plan',
            navBar: false,
            exact: true,
            root: true,
            authRequired: true,
        }
    }
}
