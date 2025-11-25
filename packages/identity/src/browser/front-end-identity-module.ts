import { ContainerModule } from 'inversify'
import { UserRolesPageContribution, UsersPageContribution, UsersPaginationPageContribution } from './pages/Users'
import { BanUserActionContribution } from './pages/Users/ban-user-action-contribution'
import { RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { MyUserProfilePageContribution, UserProfilePageContribution } from './pages/User'
import { AddOauthClientActionContribution, OauthClientCreatePageContribution, OauthClientsPageContribution, OauthClientUpdatePageContribution } from './pages/OidcClients'
import { bindContributionProvider } from '@authlance/core/lib/common/contribution-provider'
import { GroupActionContribution, GroupActionsProvider, GroupActionsProviderImpl, RegistrationFooterContribution, RegistrationFooterProvider, RegistrationFooterProviderImpl, UserActionContribution, UserActionsProvider, UserActionsProviderImpl } from './common/contributions'
import { AddGroupMainActionContribution, BusinessAccountGroupSidebarSecondaryItem, GroupBillingDetailsSidebarSecondaryItem, GroupsAddMemberPageContribution, GroupsCreatePageContribution, GroupsEditMemberPageContribution, GroupsEditPageContribution, GroupsPageContribution, GroupsPaginationPageContribution, MyGroupsEditPageContribution, UserGroupsPageContribution } from './pages/Groups'
import { SecondaryItemContribution, MainActionContribution } from '@authlance/core/lib/browser/common/ui-contributions'
import { GroupContextPageContribution, SelectGroupContextSidebarSecondaryItem } from './pages/GroupContext'
import { AddGroupMemberMainActionContribution, GroupsMembersPageContribution, MyGroupsMembersPageContribution } from './pages/GroupMembers'
import { GroupContext, GroupContextImpl } from './common/common'
import { LoginPageContribution } from './pages/Login'
import { RecoveryPageContribution } from './pages/recov'
import { VerificationPageContribution } from './pages/Verification/intex'
import { RegistrationPageContribution } from './pages/Registration'
import { ConsentPageContribution } from './pages/consent'
import { DeniedPageContribution } from './pages/Denied/intex'
import { CreatePersonalAccessTokenMainActionContribution, CreatePersonalAccessTokenPageContribution, GroupPersonalAccessTokensPageContribution, MyGroupCreatePersonalAccessTokenPageContribution, MyGroupPersonalAccessTokensPageContribution, PersonalAccessTokensGroupActionContribution } from './pages/PersonalAccessTokens'

export default new ContainerModule((bind) => {
    bind(UsersPageContribution).toSelf()
    bind(UsersPaginationPageContribution).toSelf()
    bind(MyUserProfilePageContribution).toSelf()
    bind(UserProfilePageContribution).toSelf()
    bind(OauthClientsPageContribution).toSelf()
    bind(OauthClientCreatePageContribution).toSelf()
    bind(OauthClientUpdatePageContribution).toSelf()
    bind(GroupsPageContribution).toSelf()
    bind(GroupsPaginationPageContribution).toSelf()
    bind(GroupsCreatePageContribution).toSelf()
    bind(GroupsEditPageContribution).toSelf()
    bind(GroupsMembersPageContribution).toSelf().inSingletonScope()
    bind(GroupsAddMemberPageContribution).toSelf()
    bind(GroupsEditMemberPageContribution).toSelf()
    bind(UserRolesPageContribution).toSelf()
    bind(UserGroupsPageContribution).toSelf()
    bind(MyGroupsMembersPageContribution).toSelf()
    bind(MyGroupsEditPageContribution).toSelf()
    bind(GroupPersonalAccessTokensPageContribution).toSelf()
    bind(MyGroupPersonalAccessTokensPageContribution).toSelf()
    bind(CreatePersonalAccessTokenPageContribution).toSelf()
    bind(MyGroupCreatePersonalAccessTokenPageContribution).toSelf()
    bind(PersonalAccessTokensGroupActionContribution).toSelf().inSingletonScope()
    bind(CreatePersonalAccessTokenMainActionContribution).toSelf().inRequestScope()

    bind(LoginPageContribution).toSelf()
    bind(RecoveryPageContribution).toSelf()
    bind(VerificationPageContribution).toSelf()
    bind(RegistrationPageContribution).toSelf()
    bind(ConsentPageContribution).toSelf()
    bind(DeniedPageContribution).toSelf()

    bind(RoutesApplicationContribution).toService(UsersPageContribution)
    bind(RoutesApplicationContribution).toService(UsersPaginationPageContribution)
    bind(RoutesApplicationContribution).toService(MyUserProfilePageContribution)
    bind(RoutesApplicationContribution).toService(UserProfilePageContribution)
    bind(RoutesApplicationContribution).toService(OauthClientsPageContribution)
    bind(RoutesApplicationContribution).toService(OauthClientCreatePageContribution)
    bind(RoutesApplicationContribution).toService(OauthClientUpdatePageContribution)
    bind(RoutesApplicationContribution).toService(GroupsPageContribution)
    bind(RoutesApplicationContribution).toService(GroupsPaginationPageContribution)
    bind(RoutesApplicationContribution).toService(GroupsCreatePageContribution)
    bind(RoutesApplicationContribution).toService(GroupsEditPageContribution)
    bind(RoutesApplicationContribution).toService(GroupsMembersPageContribution)
    bind(RoutesApplicationContribution).toService(GroupsAddMemberPageContribution)
    bind(RoutesApplicationContribution).toService(GroupsEditMemberPageContribution)
    bind(RoutesApplicationContribution).toService(UserRolesPageContribution)
    bind(RoutesApplicationContribution).toService(UserGroupsPageContribution)
    bind(RoutesApplicationContribution).toService(MyGroupsMembersPageContribution)
    bind(RoutesApplicationContribution).toService(MyGroupsEditPageContribution)
    bind(RoutesApplicationContribution).toService(GroupPersonalAccessTokensPageContribution)
    bind(RoutesApplicationContribution).toService(MyGroupPersonalAccessTokensPageContribution)
    bind(RoutesApplicationContribution).toService(CreatePersonalAccessTokenPageContribution)
    bind(RoutesApplicationContribution).toService(MyGroupCreatePersonalAccessTokenPageContribution)

    bind(RoutesApplicationContribution).toService(RecoveryPageContribution)
    bind(RoutesApplicationContribution).toService(VerificationPageContribution)
    bind(RoutesApplicationContribution).toService(LoginPageContribution)
    bind(RoutesApplicationContribution).toService(RegistrationPageContribution)
    bind(RoutesApplicationContribution).toService(ConsentPageContribution)
    bind(RoutesApplicationContribution).toService(DeniedPageContribution)

    bind(GroupContext).to(GroupContextImpl).inSingletonScope()

    bind(GroupContextPageContribution).toSelf()
    bind(RoutesApplicationContribution).toService(GroupContextPageContribution)

    bindContributionProvider(bind, UserActionContribution)
    bind(UserActionsProviderImpl).toSelf().inSingletonScope()
    bind(UserActionsProvider).toService(UserActionsProviderImpl)
    bind(BanUserActionContribution).toSelf().inSingletonScope()
    bind(UserActionContribution).toService(BanUserActionContribution)

    bindContributionProvider(bind, GroupActionContribution)
    bind(GroupActionsProviderImpl).toSelf().inSingletonScope()
    bind(GroupActionsProvider).toService(GroupActionsProviderImpl)
    bind(GroupActionContribution).toService(PersonalAccessTokensGroupActionContribution)

    bindContributionProvider(bind, RegistrationFooterContribution)
    bind(RegistrationFooterProviderImpl).toSelf().inSingletonScope()
    bind(RegistrationFooterProvider).toService(RegistrationFooterProviderImpl)

    bind(BusinessAccountGroupSidebarSecondaryItem).toSelf().inSingletonScope()
    bind(SelectGroupContextSidebarSecondaryItem).toSelf().inSingletonScope()
    bind(GroupBillingDetailsSidebarSecondaryItem).toSelf().inSingletonScope()
    bind(SecondaryItemContribution).toService(BusinessAccountGroupSidebarSecondaryItem)
    bind(SecondaryItemContribution).toService(SelectGroupContextSidebarSecondaryItem)
    bind(SecondaryItemContribution).toService(GroupBillingDetailsSidebarSecondaryItem)

    bind(AddGroupMainActionContribution).toSelf().inRequestScope()
    bind(MainActionContribution).toService(AddGroupMainActionContribution)
    bind(AddGroupMemberMainActionContribution).toSelf().inRequestScope()
    bind(MainActionContribution).toService(AddGroupMemberMainActionContribution)
    bind(AddOauthClientActionContribution).toSelf().inRequestScope()
    bind(MainActionContribution).toService(AddOauthClientActionContribution)
    bind(MainActionContribution).toService(CreatePersonalAccessTokenMainActionContribution)
})
