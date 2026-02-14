import React, { useEffect } from 'react'
import { injectable } from 'inversify'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getOrCreateQueryClient } from '@authlance/core/lib/browser/query-client'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { useNavigate } from 'react-router-dom'
import Page, { PageContent } from '@authlance/core/lib/browser/components/layout/Page'
import { Card, CardContent, CardHeader } from '@authlance/ui/lib/browser/components/card'
import { CheckCircle } from 'lucide-react'

function PlanUpdatedContent() {
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/', { replace: true })
        }, 3000)

        return () => clearTimeout(timer)
    }, [navigate])

    return (
        <div className="p-4">
            <div className="flex justify-center">
                <div className="w-full max-w-md">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <CheckCircle className="h-16 w-16 text-green-500" />
                            </div>
                            <h2 className="text-xl font-semibold">Plan Updated</h2>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-muted-foreground">
                                Your subscription plan has been updated successfully.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Redirecting you to the home page...
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

interface PlanUpdatedPageProps {
    queryClient?: QueryClient
}

function PlanUpdatedPage({ queryClient }: PlanUpdatedPageProps) {
    const resolvedQueryClient = queryClient ?? getOrCreateQueryClient()
    return (
        <QueryClientProvider client={resolvedQueryClient}>
            <Page>
                <PageContent>
                    <PlanUpdatedContent />
                </PageContent>
            </Page>
        </QueryClientProvider>
    )
}

@injectable()
export class PlanUpdatedPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/subscription/plan-updated',
            component: PlanUpdatedPage,
            name: 'Plan Updated',
            navBar: false,
            exact: true,
            root: true,
            authRequired: true,
        }
    }
}
