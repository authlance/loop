import React from 'react'
import { inject, injectable, named } from 'inversify'
import { ContributionProvider } from '../../common/contribution-provider'
import { AuthSession } from '..//hooks/useAuth'
import { MaybePromise } from '../../common/types'
import { RoutePrerenderContext, RoutePrerenderDocumentProvider } from '../../common/routes/routes'

export const DefaultDashboardContentContributor = Symbol('DefaultDashboardContentContributor')

export interface DefaultDashboardContentContributor {
    getContent(authContext: AuthSession): React.ReactElement
    getDocumentProvider?(): RoutePrerenderDocumentProvider
    getWeight(): number
}

export const DashboardContentProvider = Symbol('DashboardContentProvider')
export interface DashboardContentProvider {
    getHomeDashboard(): DefaultDashboardContentContributor
}

export const HomeContentPreloadContribution = Symbol('HomeContentPreloadContribution')

export interface HomeContentPreloadContribution {
    preload(context: RoutePrerenderContext): MaybePromise<void>
}

export const HomeContentPreloadProvider = Symbol('HomeContentPreloadProvider')
export interface HomeContentPreloadProvider {
    preload(context: RoutePrerenderContext): MaybePromise<void>
}

export const SecondaryItemContribution = Symbol('SecondaryItemContribution')

export interface SecondaryItem {
    id: string
    label: string
    action: () => void
    condition?: () => Promise<boolean>
}

export interface SecondaryItemContribution {
    getItem(authContext: AuthSession): SecondaryItem | undefined
}

export const SecondaryItemProvider = Symbol('SecondaryItemProvider');
export interface SecondaryItemProvider {
    getSecondaryItems(authContext: AuthSession): SecondaryItem[]
}

@injectable()
export class SecondaryItemProviderImpl implements SecondaryItemProvider {
    
    @inject(ContributionProvider) @named(SecondaryItemContribution)
    protected readonly contributions: ContributionProvider<SecondaryItemContribution>

    getSecondaryItems(authContext: AuthSession): SecondaryItem[] {
        if (!this.contributions || this.contributions.getContributions() === undefined) {
            return [];
        }
        const actions = this.contributions.getContributions().filter((contribution) => contribution.getItem(authContext) !== undefined).map((next) => next.getItem(authContext));
        return actions as SecondaryItem[];
    }
}

export interface HeaderAction {
    id: string
    label: string
    variant?: "link" | "outline" | "default" | "destructive" | "secondary" | "ghost"
    icon: React.ReactElement
    action: (authContext: AuthSession) => void    
}

export const MainActionContribution = Symbol('MainActionContribution')

export interface MainActionContribution {
    getAction(authContext: AuthSession, path: string): HeaderAction | undefined
}

export const MainActionProvider = Symbol('MainActionProvider');
export interface MainActionProvider {
    getMainActions(authContext: AuthSession, path: string): HeaderAction[]
}

@injectable()
export class MainActionProviderImpl implements MainActionProvider {
    
    @inject(ContributionProvider) @named(MainActionContribution)
    protected readonly contributions: ContributionProvider<MainActionContribution>

    getMainActions(authContext: AuthSession, path: string): HeaderAction[] {
        if (!this.contributions || this.contributions.getContributions() === undefined) {
            return []
        }
        const actions = this.contributions.getContributions()
            .filter((contribution) => contribution.getAction(authContext, path) !== undefined)
            .map((contribution) => contribution.getAction(authContext, path))
        if (!actions) {
            return []
        }
        return actions as HeaderAction[]
    }
}

@injectable()
export class HomeContentPreloadProviderImpl implements HomeContentPreloadProvider {

    @inject(ContributionProvider) @named(HomeContentPreloadContribution)
    protected readonly contributions: ContributionProvider<HomeContentPreloadContribution>

    async preload(context: RoutePrerenderContext): Promise<void> {
        if (!this.contributions) {
            return
        }
        const entries = this.contributions.getContributions() || []
        for (const contribution of entries) {
            await contribution.preload(context)
        }
    }
}
