import { ContainerModule } from 'inversify'
import { RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { HomePageContribution } from './pages/IndexPage/index'
import { FrontendSideBarApplication } from './front-end-sidebar-application'
import { FrontendApplicationContribution } from '@authlance/core/lib/browser/frontend-contribution'
import {
    DashboardContentProvider,
    DefaultDashboardContentContributor,
} from '@authlance/core/lib/browser/common/ui-contributions'
import { DashboardContentProviderImpl, NoContentContentContributor } from './hooks/useDashboardContent'

export default new ContainerModule((bind) => {
    bind(FrontendSideBarApplication).toSelf().inSingletonScope()
    bind(FrontendApplicationContribution).toDynamicValue((ctx) => {
        const result = ctx.container.get(FrontendSideBarApplication)
        return result
    })

    bind(HomePageContribution).toSelf()
    bind(RoutesApplicationContribution).toService(HomePageContribution)

    bind(DashboardContentProviderImpl).toSelf().inSingletonScope()
    bind(DashboardContentProvider).toService(DashboardContentProviderImpl)

    bind(NoContentContentContributor).toSelf()
    bind(DefaultDashboardContentContributor).toService(NoContentContentContributor)
})
