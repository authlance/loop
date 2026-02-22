import { ContainerModule } from 'inversify'
import { RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { MainActionContribution } from '@authlance/core/lib/browser/common/ui-contributions'
import {
    LicensesAdminProductsPageContribution,
    LicensesAdminProductCreatePageContribution,
    LicensesAdminProductEditPageContribution,
    LicensesAdminProductCouponsPageContribution,
    LicensesGroupPageContribution,
    LicensesGroupAdminPageContribution,
    LicensesTrialRequestPageContribution,
    LicensesPricingPageContribution,
    NewLicenseMainActionContribution,
    LicensesTrialRequestMainActionContribution,
    GroupLicensesGroupActionContribution,
    AddProductLicenseCouponseMainActionContribution,
    LicensesAdminProductCouponCreatePageContribution,
    LicensesAdminProductCouponEditPageContribution,
} from './pages/Licenses'
import { BuyMaintenancePageContribution } from './pages/BuyMaintenance'
import {
    PaymentsPageContribution,
    PaymentsPaginatedPageContribution,
    GroupPaymentsPageContribution,
    GroupPaymentsPaginatedPageContribution,
    GroupPaymentsGroupActionContribution,
    DownloadPaymentsMainActionContribution,
} from './pages/Payments'

import { GroupActionContribution } from '@authlance/identity/lib/browser/common/contributions'
import { LicenseProductContext, PaymentsReportContext } from './common/types'

export default new ContainerModule((bind) => {
    bind(RoutesApplicationContribution).to(BuyMaintenancePageContribution)
    bind(RoutesApplicationContribution).to(LicensesPricingPageContribution)
    bind(RoutesApplicationContribution).to(LicensesAdminProductsPageContribution)
    bind(RoutesApplicationContribution).to(LicensesAdminProductCreatePageContribution)
    bind(RoutesApplicationContribution).to(LicensesAdminProductEditPageContribution)
    bind(RoutesApplicationContribution).to(LicensesAdminProductCouponsPageContribution)
    bind(RoutesApplicationContribution).to(LicensesGroupPageContribution)
    bind(RoutesApplicationContribution).to(LicensesGroupAdminPageContribution)
    bind(RoutesApplicationContribution).to(LicensesTrialRequestPageContribution)
    bind(RoutesApplicationContribution).to(LicensesAdminProductCouponCreatePageContribution)
    bind(RoutesApplicationContribution).to(LicensesAdminProductCouponEditPageContribution)
    bind(RoutesApplicationContribution).to(PaymentsPageContribution)
    bind(RoutesApplicationContribution).to(PaymentsPaginatedPageContribution)
    bind(RoutesApplicationContribution).to(GroupPaymentsPageContribution)
    bind(RoutesApplicationContribution).to(GroupPaymentsPaginatedPageContribution)
    bind(MainActionContribution).to(NewLicenseMainActionContribution)
    bind(MainActionContribution).to(LicensesTrialRequestMainActionContribution)
    bind(MainActionContribution).to(AddProductLicenseCouponseMainActionContribution)
    bind(MainActionContribution).to(DownloadPaymentsMainActionContribution)
    bind(GroupActionContribution).to(GroupLicensesGroupActionContribution)
    bind(GroupActionContribution).to(GroupPaymentsGroupActionContribution)
    bind(LicenseProductContext).toSelf().inSingletonScope()
    bind(PaymentsReportContext).toSelf().inSingletonScope()
})
