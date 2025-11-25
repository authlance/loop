import { ContainerModule } from 'inversify'
import { DefaultFrontendApplicationContribution } from './frontend-contribution'
import { bindContributionProvider, Emitter } from '../common'
import { FrontEndServiceProvider } from './frontend-service-provider'
import { User, UserEventEmitter } from '../browser/common/auth'
import { ServiceProvider } from '../common/services/service-provider'
import { DefaultDashboardContentContributor, SecondaryItemContribution, SecondaryItemProvider, SecondaryItemProviderImpl, MainActionContribution, MainActionProvider, MainActionProviderImpl, HomeContentPreloadContribution, HomeContentPreloadProvider, HomeContentPreloadProviderImpl } from './common/ui-contributions'

export const frontendPrerenderedModule = new ContainerModule((bind) => {
    bind(DefaultFrontendApplicationContribution).toSelf()

    bind(FrontEndServiceProvider).toSelf().inSingletonScope()
    bind(ServiceProvider).toService(FrontEndServiceProvider)
    bind(UserEventEmitter)
        .toDynamicValue((_ctx) => {
            const emitter = new Emitter<User | undefined>()
            return emitter
        })
        .inSingletonScope()

    bindContributionProvider(bind, SecondaryItemContribution)
    bindContributionProvider(bind, DefaultDashboardContentContributor)
    bindContributionProvider(bind, HomeContentPreloadContribution)

    bindContributionProvider(bind, MainActionContribution)
    bindContributionProvider(bind, MainActionProvider)

    bind(SecondaryItemProviderImpl).toSelf().inSingletonScope()
    bind(SecondaryItemProvider).toService(SecondaryItemProviderImpl)

    bind(MainActionProviderImpl).toSelf().inRequestScope()
    bind(MainActionProvider).toService(MainActionProviderImpl)

    bind(HomeContentPreloadProviderImpl).toSelf().inSingletonScope()
    bind(HomeContentPreloadProvider).toService(HomeContentPreloadProviderImpl)
})
