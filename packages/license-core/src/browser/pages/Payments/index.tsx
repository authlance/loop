import React, { useMemo } from 'react'
import { inject, injectable } from 'inversify'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { GroupAction, GroupActionContribution } from '@authlance/identity/lib/browser/common/contributions'
import { HeaderAction, MainActionContribution } from '@authlance/core/lib/browser/common/ui-contributions'
import { CreditCard, Download } from 'lucide-react'
import { LicensesProvider } from '../../common/licenses-sdk'
import { PaymentsContent } from '../../components/payments/PaymentsContent'
import type { AuthSession } from '@authlance/core/lib/browser/hooks/useAuth'
import { QueryClientProvider } from '@tanstack/react-query'
import { getOrCreateQueryClient } from '@authlance/core/lib/browser/query-client'
import { LICENSES_CATEGORY } from '../../common/categories'
import { PaymentsReportContext } from '../../common/types'

const PaymentsPageShell: React.FC<{ scope: 'global' | 'group' }> = ({ scope }) => {
    const queryClient = useMemo(() => getOrCreateQueryClient(), [])

    return (
        <QueryClientProvider client={queryClient}>
            <LicensesProvider>
                <PaymentsContent scope={scope} />
            </LicensesProvider>
        </QueryClientProvider>
    )
}

const PaymentsGlobalPage: React.FC = () => <PaymentsPageShell scope="global" />

const PaymentsGroupPage: React.FC = () => <PaymentsPageShell scope="group" />

@injectable()
export class PaymentsPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/license/payments',
            component: PaymentsGlobalPage,
            category: LICENSES_CATEGORY,
            icon: <CreditCard />,
            navBar: true,
            canGoBack: false,
            name: 'Payments',
            exact: true,
            root: true,
            forceParent: '/',
            authRequired: true,
            roles: ['sysadmin'],
        }
    }
}

@injectable()
export class PaymentsPaginatedPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/license/payments/page/:page',
            component: PaymentsGlobalPage,
            navBar: false,
            canGoBack: true,
            name: 'Payments',
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: true,
            roles: ['sysadmin'],
        }
    }
}

@injectable()
export class GroupPaymentsPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/license/payments/groups/:groupName',
            component: PaymentsGroupPage,
            navBar: false,
            canGoBack: true,
            name: 'Group payments',
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: true,
            roles: ['sysadmin'],
        }
    }
}

@injectable()
export class GroupPaymentsPaginatedPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/license/payments/groups/:groupName/page/:page',
            component: PaymentsGroupPage,
            navBar: false,
            canGoBack: true,
            name: 'Group payments',
            exact: true,
            root: false,
            forceParent: '/',
            authRequired: true,
            roles: ['sysadmin'],
        }
    }
}

@injectable()
export class GroupPaymentsGroupActionContribution implements GroupActionContribution {
    getAction(): GroupAction {
        return {
            label: 'Payments',
            icon: <CreditCard />,
            action(authContext: AuthSession, group) {
                const isSysadmin = authContext.user?.roles?.includes('sysadmin') ?? false
                if (!isSysadmin || !group?.name) {
                    return
                }
                if (authContext.navigateHandler) {
                    authContext.navigateHandler.navigate(`/license/payments/groups/${group.name}`)
                }
            },
        }
    }
}

@injectable()
export class DownloadPaymentsMainActionContribution implements MainActionContribution {
    constructor(@inject(PaymentsReportContext) private readonly reportContext: PaymentsReportContext) {}

    getAction(authContext: AuthSession, path: string): HeaderAction | undefined {
        if (!authContext.user || !path.startsWith('/license/payments')) {
            return undefined
        }
        const isSysadmin = authContext.user.roles?.includes('sysadmin') ?? false
        if (!isSysadmin) {
            return undefined
        }
        const handler = this.reportContext.getExportHandler()
        if (!handler) {
            return undefined
        }

        const context = this.reportContext

        return {
            label: context.isExporting() ? 'Exporting…' : 'Export CSV',
            icon: <Download />,
            id: 'export-payments-csv',
            action(_authContext: AuthSession) {
                const currentHandler = context.getExportHandler()
                if (!currentHandler || context.isExporting()) {
                    return
                }
                currentHandler().catch((error) => {
                    console.error('Failed to export payments report', error)
                })
            },
        }
    }
}
