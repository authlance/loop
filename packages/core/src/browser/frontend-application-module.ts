import { ContainerModule, interfaces } from 'inversify'
import { FrontendApplication } from './frontend-application'
import { DefaultFrontendApplicationContribution, FrontendApplicationContribution } from './frontend-contribution'
import { MessageClient, messageServicePath } from '../common/message-service-protocol'
import { bindContributionProvider, Emitter, MessageService, MessageServiceFactory } from '../common'
import { WebSocketConnectionProvider } from './messaging'
import { ConnectionStatusService, FrontendConnectionStatusService, PingService } from './connection-status-service'
import { EnvVariable, envVariablesPath, EnvVariablesServer } from '../common/env-variables'
import { RoutesApplicationContribution, RoutesProvider } from '../common/routes/routes'
import { FrontEndRoutesProvider } from './routes-provider'
import { FrontEndServiceProvider } from './frontend-service-provider'
import { User, UserEventEmitter } from '../browser/common/auth'
import { ServiceProvider } from '../common/services/service-provider'
import { DefaultDashboardContentContributor, SecondaryItemContribution, SecondaryItemProvider, SecondaryItemProviderImpl, MainActionContribution, MainActionProvider, MainActionProviderImpl, HomeContentPreloadContribution, HomeContentPreloadProvider, HomeContentPreloadProviderImpl } from './common/ui-contributions'

export function bindMessageService(bind: interfaces.Bind): interfaces.BindingWhenOnSyntax<MessageService> {
    bind(MessageClient).toSelf().inSingletonScope()
    bind(MessageServiceFactory).toFactory(
        ({ container }) =>
            () =>
                container.get(MessageService)
    )
    return bind(MessageService).toSelf().inSingletonScope()
}

export const frontendApplicationModule = new ContainerModule((bind) => {
    bind(FrontendApplication)
        .toSelf()
        .inSingletonScope()
        .onActivation((ctx, app) => {
            app.container = ctx.container
            return app
        })
    bind(DefaultFrontendApplicationContribution).toSelf()
    bindContributionProvider(bind, FrontendApplicationContribution)

    bind(FrontendConnectionStatusService).toSelf().inSingletonScope()
    bind(ConnectionStatusService).toService(FrontendConnectionStatusService)
    bind(FrontendApplicationContribution).toService(FrontendConnectionStatusService)

    bindMessageService(bind).onActivation(({ container }, messages) => {
        const client = container.get(MessageClient)
        WebSocketConnectionProvider.createProxy(container, messageServicePath, client)
        return messages
    })

    bind(EnvVariablesServer)
        .toDynamicValue((ctx) => {
            const connection = ctx.container.get(WebSocketConnectionProvider)
            return connection.createProxy<EnvVariablesServer>(envVariablesPath)
        })
        .inSingletonScope()
    bind(PingService).toDynamicValue((ctx) => {
        // let's reuse a simple and cheap service from this package
        const envServer: EnvVariablesServer = ctx.container.get(EnvVariablesServer)
        return {
            ping(): Promise<EnvVariable | undefined> {
                return envServer.getValue('does_not_matter')
            },
        }
    })
    bindContributionProvider(bind, RoutesApplicationContribution)
    bind(FrontEndRoutesProvider).toSelf().inSingletonScope()
    bind(RoutesProvider).toService(FrontEndRoutesProvider)

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
