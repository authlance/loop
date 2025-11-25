import { injectable, interfaces } from 'inversify'
import { ContributionProvider } from '../common'
import { ServiceProvider } from '../common/services/service-provider'
import { AppStore, getOrCreateStore } from './store'

@injectable()
export class FrontEndServiceProvider implements ServiceProvider {
    private get store(): AppStore {
        return getOrCreateStore()
    }

    private get container(): interfaces.Container | undefined {
        return this.store.getState().app.container
    }

    getService<T>(identifier: interfaces.ServiceIdentifier<T>): T | undefined {
        const container = this.container
        if (container) {
            return container.get<T>(identifier)
        }
    }
    getContribution<T extends object>(named: string | number | symbol): T | undefined {
        const container = this.container
        if (container) {
            const contributions = container.getNamed<ContributionProvider<T>>(ContributionProvider, named)
            if (
                contributions &&
                contributions.getContributions() &&
                contributions.getContributions().length > 0 &&
                contributions.getContributions()[0] !== undefined
            ) {
                return contributions.getContributions()[0]
            }
        }
    }
    getContributions<T extends object>(named: string | number | symbol): T[] {
        const container = this.container
        if (container) {
            const contributions = container.getNamed<ContributionProvider<T>>(ContributionProvider, named)
            if (
                contributions &&
                contributions.getContributions() &&
                contributions.getContributions().length > 0 &&
                contributions.getContributions()[0] !== undefined
            ) {
                return contributions.getContributions()
            }
        }
        return []
    }
}
