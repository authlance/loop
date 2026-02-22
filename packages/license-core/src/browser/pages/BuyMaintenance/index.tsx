import React, { useEffect, useState } from 'react'
import { injectable } from 'inversify'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getOrCreateQueryClient } from '@authlance/core/lib/browser/query-client'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DefaultDashboardContent } from '@authlance/core/lib/browser/components/layout/default-dashboard-content'
import Page, { PageContent } from '@authlance/core/lib/browser/components/layout/Page'
import { Toaster } from '@authlance/ui/lib/browser/components/toaster'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import { LicensesProvider, useLicensesSdk } from '../../common/licenses-sdk'

function BuyMaintenanceContent() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const groupName = searchParams.get('group')
    const licenseId = searchParams.get('license')
    const { paymentsApi } = useLicensesSdk()
    const toast = useToast()
    const [isRedirecting, setIsRedirecting] = useState(false)

    useEffect(() => {
        if (!groupName || !licenseId) {
            toast.toast({
                title: 'Error',
                description: 'Group and license are required.',
                variant: 'destructive',
                duration: 5000,
            })
            navigate('/')
            return
        }

        if (isRedirecting || !paymentsApi) { return }

        const redirect = async () => {
            setIsRedirecting(true)
            try {
                const response = await paymentsApi.authlanceLicensePaymentsApiV1MaintenanceCheckoutPost({
                    licenseId,
                    groupName,
                })
                if (response.status !== 200 || !response.data?.url) {
                    toast.toast({
                        title: 'Error',
                        description: 'Could not create maintenance checkout session.',
                        variant: 'destructive',
                        duration: 5000,
                    })
                    navigate('/licenses/group')
                    return
                }
                window.location.href = response.data.url
            } catch (error) {
                console.error('Error creating maintenance checkout:', error)
                toast.toast({
                    title: 'Error',
                    description: 'An error occurred while creating the checkout session.',
                    variant: 'destructive',
                    duration: 5000,
                })
                navigate('/licenses/group')
            }
        }

        redirect()
    }, [groupName, licenseId, paymentsApi, navigate, toast, isRedirecting])

    return <DefaultDashboardContent loading={true} />
}

interface BuyMaintenancePageProps {
    queryClient?: QueryClient
}

function BuyMaintenancePage({ queryClient }: BuyMaintenancePageProps) {
    const resolvedQueryClient = queryClient ?? getOrCreateQueryClient()
    return (
        <QueryClientProvider client={resolvedQueryClient}>
            <LicensesProvider>
                <Page>
                    <PageContent>
                        <BuyMaintenanceContent />
                    </PageContent>
                </Page>
                <Toaster />
            </LicensesProvider>
        </QueryClientProvider>
    )
}

@injectable()
export class BuyMaintenancePageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/subscription/buy-maintenance',
            component: BuyMaintenancePage,
            name: 'Buy Maintenance',
            navBar: false,
            exact: true,
            root: true,
            authRequired: true,
        }
    }
}
