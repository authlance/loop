import { injectable, inject } from 'inversify'
import { AuthenticatedRoleMiddlewareService } from './authenticated-role-middleware-service'
import { ApplicationConfigProvider } from '../backend-application'


@injectable()
export class PortalAdminMiddlewareService extends AuthenticatedRoleMiddlewareService {
    constructor(
        @inject(ApplicationConfigProvider) appConfig: ApplicationConfigProvider
    ) {
        super(appConfig)
    }

    protected getRequiredRole(): string {
        return 'portal-admin'
    }
}

