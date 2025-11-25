import React from 'react'
import { RouteCategory } from '@authlance/core/lib/common/routes/routes'
import { ShieldCheck } from 'lucide-react'
import { Group } from '@authlance/core/lib/browser/common/auth'
import { injectable } from 'inversify'

export const USER_MANAGEMENT_CATEGORY = new RouteCategory('User Management', <ShieldCheck/>)

export const GroupContext = Symbol('GroupContext')

export interface GroupContext {

    setGroup(group: Group | undefined): void

    getGroup(): Group | undefined

    getSecondaryActionLabel(): string | undefined

    setSecondaryActionLabel(label: string | undefined): void

    setShowSecondaryAction(show: boolean): void

    isShowSecondaryAction(): boolean

    setShowSwitchOrganization(show: boolean): void

    isShowSwitchOrganization(): boolean

    setShowGroupBillingDetails(show: boolean): void

    isShowGroupBillingDetails(): boolean
}
@injectable()
export class GroupContextImpl implements GroupContext {

    private currentGroup: Group | undefined
    private secondaryActionLabel: string | undefined
    private showSecondaryAction: boolean = true
    private showSwitchOrganization: boolean = true
    private showGroupBillingDetails: boolean = true

    setShowSwitchOrganization(show: boolean): void {
        this.showSwitchOrganization = show
    }
    
    isShowSwitchOrganization(): boolean {
        return this.showSwitchOrganization
    }

    setShowGroupBillingDetails(show: boolean): void {
        this.showGroupBillingDetails = show
    }

    isShowGroupBillingDetails(): boolean {
        return this.showGroupBillingDetails
    }

    setGroup(group: Group | undefined): void {
        this.currentGroup = group
    }

    getGroup(): Group | undefined {
        return this.currentGroup
    }

    getSecondaryActionLabel(): string | undefined {
        return this.secondaryActionLabel
    }
    setSecondaryActionLabel(label: string | undefined): void {
        this.secondaryActionLabel = label
    }
    setShowSecondaryAction(show: boolean): void {
        this.showSecondaryAction = show
    }
    isShowSecondaryAction(): boolean {
        return this.showSecondaryAction
    }
}
