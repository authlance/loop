import React from 'react'
import { inject, injectable, named } from 'inversify'
import { ContributionProvider } from '@authlance/core/lib/common/contribution-provider'
import { Group, User } from '@authlance/core/lib/browser/common/auth'
import { AuthSession } from '@authlance/core/lib/browser/hooks/useAuth'

export const UserActionContribution = Symbol('UserActionContribution')

export interface UserAction {
    label: string
    icon?: React.ReactElement
    action: (user: User) => void
    getLabel?: (user: User) => string
    isVisible?: (authContext: AuthSession, user: User) => boolean
    setNavigate: (navigate: (path: string) => void) => void
}

export interface UserActionContribution {
    getAction(): UserAction
}

export const UserActionsProvider = Symbol('UserActionsProvider')

export interface UserActionsProvider {
    getActions(): UserAction[]
}

@injectable()
export class UserActionsProviderImpl implements UserActionsProvider {
    
    @inject(ContributionProvider) @named(UserActionContribution)
    protected readonly contributions: ContributionProvider<UserActionContribution>

    getActions(): UserAction[] {
        if (!this.contributions || this.contributions.getContributions() === undefined) {
            return [];
        }
        const actions = this.contributions.getContributions().filter((contribution) => contribution.getAction() !== undefined).map((next) => next.getAction());
        return actions;
    }
}

export const GroupActionContribution = Symbol('GroupActionContribution')

export interface GroupAction {
    label: string
    icon?: React.ReactElement
    action: (authContext: AuthSession, group: Group) => void
}

export interface GroupActionContribution {
    getAction(): GroupAction
}

export const GroupActionsProvider = Symbol('GroupActionsProvider')

export interface GroupActionsProvider {
    getActions(): GroupAction[]
}

@injectable()
export class GroupActionsProviderImpl implements GroupActionsProvider {

    @inject(ContributionProvider) @named(GroupActionContribution)
    protected readonly contributions: ContributionProvider<GroupActionContribution>

    getActions(): GroupAction[] {
        if (!this.contributions || this.contributions.getContributions() === undefined) {
            return [];
        }
        const actions = this.contributions.getContributions().filter((contribution) => contribution.getAction() !== undefined).map((next) => next.getAction());
        return actions;
    }
}

export const RegistrationFooterContribution = Symbol('RegistrationFooterContribution')

export interface RegistrationFooterContribution {
    getFooter(): React.ReactElement
    getWeight(): number
}

export const RegistrationFooterProvider = Symbol('RegistrationFooterProvider')

export interface RegistrationFooterProvider {
    getFooter(): React.ReactElement
}

@injectable()
export class RegistrationFooterProviderImpl implements RegistrationFooterProvider {

    @inject(ContributionProvider) @named(RegistrationFooterContribution)
    protected readonly contributions: ContributionProvider<RegistrationFooterContribution>

    getFooter(): React.ReactElement {
        const defaultFooter = React.createElement(React.Fragment, {})
        if (!this.contributions || this.contributions.getContributions() === undefined) {
            return defaultFooter
        }
        let maxWeight = -Infinity
        let footer: React.ReactElement = defaultFooter
        this.contributions.getContributions().forEach((contribution) => {
            const weight = contribution.getWeight()
            if (weight > maxWeight) {
                maxWeight = weight
                footer = contribution.getFooter()
            }
        })
        return footer
    }
}
