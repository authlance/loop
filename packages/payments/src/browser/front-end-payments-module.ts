import { ContainerModule } from 'inversify'
import { ActivateBusinessAccountPageContribution, BusinessAccountActivateSuccessPageContribution } from './pages/ActivateBusinessAccount';
import { ManagePaymentPageContribution } from './pages/ManagePayment';
import { PlanUpdatedPageContribution } from './pages/PlanUpdated';
import { ChangePlanPageContribution } from './pages/ChangePlan';
import { RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes';

export default new ContainerModule((bind) => {
    bind(ActivateBusinessAccountPageContribution).toSelf()
    bind(BusinessAccountActivateSuccessPageContribution).toSelf()
    bind(ManagePaymentPageContribution).toSelf()
    bind(PlanUpdatedPageContribution).toSelf()
    bind(ChangePlanPageContribution).toSelf()

    bind(RoutesApplicationContribution).toService(ActivateBusinessAccountPageContribution)
    bind(RoutesApplicationContribution).toService(BusinessAccountActivateSuccessPageContribution)
    bind(RoutesApplicationContribution).toService(ManagePaymentPageContribution)
    bind(RoutesApplicationContribution).toService(PlanUpdatedPageContribution)
    bind(RoutesApplicationContribution).toService(ChangePlanPageContribution)
});
