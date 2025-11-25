/* eslint-disable import/no-extraneous-dependencies */
import { ContainerModule } from 'inversify';
import { bindContributionProvider } from '../common/contribution-provider';
import { CliContribution, CliManager } from './cli';
import { ApplicationPackage } from '@authlance/application-package';
import { ApplicationConfigProvider, BackendApplication, BackendApplicationCliContribution, BackendApplicationContribution, RawBackendApplicationContribution } from './backend-application';
import { ConnectionContainerModule } from './messaging/connection-container-module';
import { ConnectionHandler, JsonRpcConnectionHandler, MessageClient, MessageService, messageServicePath } from '../common';
import { WsRequestValidator, WsRequestValidatorContribution } from './ws-request-validators';
import { envVariablesPath, EnvVariablesServer } from '../common/env-variables';
import { EnvVariablesServerImpl } from './env-variables';
import { AuthenticatedRoleMiddlewareService } from './middlewares/authenticated-role-middleware-service';
import { PortalAdminMiddlewareService } from './middlewares/portal-admin-middleware.service';
import { PortalUserMiddlewareService } from './middlewares/portal-user-middleware.service';
import { AuthenticatedMiddlewareService } from './middlewares/authenticated-middleware-service';
import { DefaultHtmlRenderer, HtmlRenderer } from './html-renderer';
import { PrerenderCacheContribution, RoutePrerenderContextContribution } from '../common/routes/routes';

const messageConnectionModule = ConnectionContainerModule.create(({ bind, bindFrontendService }) => {
    bindFrontendService(messageServicePath, MessageClient);
    bind(MessageService).toSelf().inSingletonScope();
});

export const backendApplicationModule = new ContainerModule(bind => {
    bind(ConnectionContainerModule).toConstantValue(messageConnectionModule);
    bind(CliManager).toSelf().inSingletonScope();
    bindContributionProvider(bind, CliContribution);

    bind(BackendApplicationCliContribution).toSelf().inSingletonScope();
    bind(CliContribution).toService(BackendApplicationCliContribution);

    bind(BackendApplication).toSelf().inSingletonScope();
    bindContributionProvider(bind, BackendApplicationContribution);
    bindContributionProvider(bind, RawBackendApplicationContribution)

    bind(ApplicationConfigProvider).toSelf().inSingletonScope();
    bind(ApplicationPackage).toDynamicValue(({ container }) => {
        const { projectPath } = container.get(BackendApplicationCliContribution);
        return new ApplicationPackage({ projectPath });
    }).inSingletonScope();
    bind(WsRequestValidator).toSelf().inSingletonScope();
    bindContributionProvider(bind, WsRequestValidatorContribution);

    bind(EnvVariablesServer).to(EnvVariablesServerImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(envVariablesPath, () => {
            const envVariablesServer = ctx.container.get<EnvVariablesServer>(EnvVariablesServer);
            return envVariablesServer;
        })
    ).inSingletonScope();

    bind(AuthenticatedRoleMiddlewareService).toSelf().inSingletonScope()
    bind(PortalAdminMiddlewareService).toSelf().inSingletonScope()
    bind(PortalUserMiddlewareService).toSelf().inSingletonScope()
    bind(AuthenticatedMiddlewareService).toSelf().inSingletonScope()

    bindContributionProvider(bind, PrerenderCacheContribution)

    bindContributionProvider(bind, RoutePrerenderContextContribution)
    bind(HtmlRenderer).to(DefaultHtmlRenderer).inSingletonScope()
});
