import React from 'react'
import { useAppSelector } from '@authlance/core/lib/browser/store'
import { DashboardContentProvider, DefaultDashboardContentContributor } from '@authlance/core/lib/browser/common/ui-contributions'
import { inject, injectable, named } from 'inversify'
import { ContributionProvider } from '@authlance/core/lib/common/contribution-provider'
import { AuthSession } from '@authlance/core/lib/browser/hooks/useAuth'

const useDashboardContentProvider = (): DashboardContentProvider => {
    const container = useAppSelector((state) => state.app.container)
    return container.get(DashboardContentProvider) as DashboardContentProvider
}

@injectable()
export class NoContentContentContributor implements DefaultDashboardContentContributor {
    getContent(authContext: AuthSession): React.ReactElement {
        return (
            <>
                <section className="relative overflow-hidden bg-foreground text-background">
                </section>
            </>
        )
    }
    getWeight(): number {
        return 0
    }
}

@injectable()
export class DashboardContentProviderImpl implements DashboardContentProvider {
    
    @inject(ContributionProvider) @named(DefaultDashboardContentContributor)
    protected readonly contributions: ContributionProvider<DefaultDashboardContentContributor>

    getHomeDashboard(): DefaultDashboardContentContributor {
        let maxWeight = -1
        let selectedContributor: DefaultDashboardContentContributor = new NoContentContentContributor()
        if (this.contributions && this.contributions.getContributions() !== undefined) {
            this.contributions.getContributions().forEach((contribution) => {
                const weight = contribution.getWeight()
                if (weight > maxWeight) {
                    maxWeight = weight
                    selectedContributor = contribution
                }
            })
        }
        return selectedContributor
    }
}

export default useDashboardContentProvider
