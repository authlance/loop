import React from 'react'
import { inject, injectable } from 'inversify'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { GroupContextComponent } from '../../components/groups/group-context'
import { SecondaryItem, SecondaryItemContribution } from '@authlance/core/lib/browser/common/ui-contributions'
import { AuthSession } from '@authlance/core/lib/browser/hooks/useAuth'
import { GroupContext } from '../../common/common'

function GroupContextPage() {
    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto min-h-0">
                <GroupContextComponent />
            </div>
        </div>
    )
}

@injectable()
export class GroupContextPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/group/selection',
            component: GroupContextPage,
            name: 'Group Context',
            navBar: false,
            exact: true,
            root: true,
            authRequired: true,
        }
    }
}

@injectable()
export class SelectGroupContextSidebarSecondaryItem implements SecondaryItemContribution {

    constructor(
        @inject(GroupContext)
        private readonly groupContext: GroupContext,
    ) {}

    getItem(authContext: AuthSession): SecondaryItem | undefined {
        if (!authContext || !authContext.user || !authContext.targetGroup) {
            return undefined
        }
        if (authContext.user.groups.length < 1) {
            return undefined
        }

        if (!this.groupContext.isShowSwitchOrganization()) {
            return undefined
        }
        const suffix = this.groupContext.getSecondaryActionLabel()
        return {
            id: 'select-group',
            label:  `Switch${suffix ? ` (${suffix})` : ' Business Account'}`,
            action: () => {
                authContext.changeTargetGroup(undefined)
            },
        }
    }
}

export default GroupContextPage
