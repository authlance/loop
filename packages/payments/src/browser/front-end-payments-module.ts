import { ContainerModule } from 'inversify'
import { ActivateBusinessAccountPageContribution, BusinessAccountActivateSuccessPageContribution } from './pages/ActivateBusinessAccount';
import { RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes';

export default new ContainerModule((bind) => {
    bind(ActivateBusinessAccountPageContribution).toSelf()
    bind(BusinessAccountActivateSuccessPageContribution).toSelf()

    bind(RoutesApplicationContribution).toService(ActivateBusinessAccountPageContribution)
    bind(RoutesApplicationContribution).toService(BusinessAccountActivateSuccessPageContribution)
});
