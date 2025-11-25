import { ContainerModule } from 'inversify'
import { bindContributionProvider } from '../common/contribution-provider'
import { CliContribution } from './cli'
import { BackendPrerenderApplication, BackendPrerenderCliContribution } from './backend-prerender-application'
import { RoutesApplicationContribution, RoutesProvider, RoutePrerenderContextContribution } from '../common/routes/routes'
import { FrontEndRoutesProvider } from '../browser/routes-provider'

export const backendPrerendererModule = new ContainerModule((bind) => {
    bind(BackendPrerenderCliContribution).toSelf().inSingletonScope()
    bind(CliContribution).toService(BackendPrerenderCliContribution)

    bindContributionProvider(bind, RoutesApplicationContribution)
    bindContributionProvider(bind, RoutePrerenderContextContribution)
    bind(FrontEndRoutesProvider).toSelf().inSingletonScope()
    bind(RoutesProvider).toService(FrontEndRoutesProvider)

    bind(BackendPrerenderApplication).toSelf().inSingletonScope()
})
