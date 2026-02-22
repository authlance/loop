import React from 'react'
import { inject, injectable, named } from 'inversify'
import { ContributionProvider } from '@authlance/core/lib/common/contribution-provider'
import { Group, User } from '@authlance/core/lib/browser/common/auth'
import { AuthSession } from '@authlance/core/lib/browser/hooks/useAuth'
import { NavigateFunction } from 'react-router-dom'
import { PaymentTierDto } from '@authlance/common/lib/common/types/subscriptions'
import { TierSelectionStepProps } from '../components/groups/TierSelectionStep'

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

export const GroupSelectionContribution = Symbol('GroupSelectionContribution')

export interface GroupSelectionHandler {
    onGroupSelected(group: Group, authSession: AuthSession, navigate: NavigateFunction): void
    getWeight(): number
}

export interface GroupSelectionContribution {
    getHandler(): GroupSelectionHandler
}

export const GroupSelectionProvider = Symbol('GroupSelectionProvider')

export interface GroupSelectionProvider {
    getHandler(): GroupSelectionHandler
}

@injectable()
export class GroupSelectionProviderImpl implements GroupSelectionProvider {

    @inject(ContributionProvider) @named(GroupSelectionContribution)
    protected readonly contributions: ContributionProvider<GroupSelectionContribution>

    private readonly defaultHandler: GroupSelectionHandler = {
        onGroupSelected(group: Group, authSession: AuthSession, navigate: NavigateFunction): void {
            authSession.changeTargetGroup(group.name)
            navigate('/')
        },
        getWeight(): number {
            return -1
        },
    }

    getHandler(): GroupSelectionHandler {
        if (!this.contributions || this.contributions.getContributions() === undefined) {
            return this.defaultHandler
        }
        let maxWeight = -Infinity
        let handler: GroupSelectionHandler = this.defaultHandler
        this.contributions.getContributions().forEach((contribution) => {
            const h = contribution.getHandler()
            if (h.getWeight() > maxWeight) {
                maxWeight = h.getWeight()
                handler = h
            }
        })
        return handler
    }
}

export const GroupSelectionUIContribution = Symbol('GroupSelectionUIContribution')

export interface GroupSelectionUIContribution {
    getContent(authContext: AuthSession): React.ReactElement
    getWeight(): number
}

export const GroupSelectionUIProvider = Symbol('GroupSelectionUIProvider')

export interface GroupSelectionUIProvider {
    getGroupSelectionUI(): GroupSelectionUIContribution | undefined
}

@injectable()
export class GroupSelectionUIProviderImpl implements GroupSelectionUIProvider {

    @inject(ContributionProvider) @named(GroupSelectionUIContribution)
    protected readonly contributions: ContributionProvider<GroupSelectionUIContribution>

    getGroupSelectionUI(): GroupSelectionUIContribution | undefined {
        if (!this.contributions || this.contributions.getContributions() === undefined) {
            return undefined
        }
        let maxWeight = -Infinity
        let result: GroupSelectionUIContribution | undefined = undefined
        this.contributions.getContributions().forEach((contribution) => {
            const weight = contribution.getWeight()
            if (weight > maxWeight) {
                maxWeight = weight
                result = contribution
            }
        })
        return result
    }
}

export const TierSelectionUIContribution = Symbol('TierSelectionUIContribution')

export interface TierSelectionUIContribution {
    getContent(props: TierSelectionStepProps): React.ReactElement
    getWeight(): number
}

export const TierSelectionUIProvider = Symbol('TierSelectionUIProvider')

export interface TierSelectionUIProvider {
    getTierSelectionUI(): TierSelectionUIContribution | undefined
}

@injectable()
export class TierSelectionUIProviderImpl implements TierSelectionUIProvider {

    @inject(ContributionProvider) @named(TierSelectionUIContribution)
    protected readonly contributions: ContributionProvider<TierSelectionUIContribution>

    getTierSelectionUI(): TierSelectionUIContribution | undefined {
        if (!this.contributions || this.contributions.getContributions() === undefined) {
            return undefined
        }
        let maxWeight = -Infinity
        let result: TierSelectionUIContribution | undefined = undefined
        this.contributions.getContributions().forEach((contribution) => {
            const weight = contribution.getWeight()
            if (weight > maxWeight) {
                maxWeight = weight
                result = contribution
            }
        })
        return result
    }
}

export const TierSelectionVisibilityContribution = Symbol('TierSelectionVisibilityContribution')

export interface TierSelectionVisibilityContribution {
    shouldShowTierSelection(tiers: PaymentTierDto[]): boolean
    getWeight(): number
}

export const TierSelectionVisibilityProvider = Symbol('TierSelectionVisibilityProvider')

export interface TierSelectionVisibilityProvider {
    shouldShowTierSelection(tiers: PaymentTierDto[]): boolean
}

@injectable()
export class TierSelectionVisibilityProviderImpl implements TierSelectionVisibilityProvider {

    @inject(ContributionProvider) @named(TierSelectionVisibilityContribution)
    protected readonly contributions: ContributionProvider<TierSelectionVisibilityContribution>

    shouldShowTierSelection(tiers: PaymentTierDto[]): boolean {
        const all = this.contributions?.getContributions()
        if (!all || all.length === 0) {
            return tiers.length > 1
        }
        let maxWeight = -Infinity
        let winner: TierSelectionVisibilityContribution | undefined
        for (const contribution of all) {
            const weight = contribution.getWeight()
            if (weight > maxWeight) {
                maxWeight = weight
                winner = contribution
            }
        }
        return winner ? winner.shouldShowTierSelection(tiers) : tiers.length > 1
    }
}

export const ActivateGroupTextContribution = Symbol('ActivateGroupTextContribution')

export interface ActivateGroupTextContribution {
    getTitle(paymentTier: PaymentTierDto): string
    getDescription(paymentTier: PaymentTierDto): React.ReactElement
    getWeight(): number
}

export const ActivateGroupTextProvider = Symbol('ActivateGroupTextProvider')

export interface ActivateGroupTextProvider {
    getTextOverride(): ActivateGroupTextContribution | undefined
}

@injectable()
export class ActivateGroupTextProviderImpl implements ActivateGroupTextProvider {

    @inject(ContributionProvider) @named(ActivateGroupTextContribution)
    protected readonly contributions: ContributionProvider<ActivateGroupTextContribution>

    getTextOverride(): ActivateGroupTextContribution | undefined {
        if (!this.contributions || this.contributions.getContributions() === undefined) {
            return undefined
        }
        let maxWeight = -Infinity
        let result: ActivateGroupTextContribution | undefined = undefined
        this.contributions.getContributions().forEach((contribution) => {
            const weight = contribution.getWeight()
            if (weight > maxWeight) {
                maxWeight = weight
                result = contribution
            }
        })
        return result
    }
}
