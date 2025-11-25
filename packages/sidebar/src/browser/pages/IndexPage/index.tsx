import React from 'react'
import { inject, injectable } from 'inversify'
import { HomeComponent } from '../../components/home-components'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { Home } from 'lucide-react'
import { DefaultDashboardContentContributor, HomeContentPreloadProvider } from '@authlance/core/lib/browser/common/ui-contributions'

function IndexPage() {

    return (
        <HomeComponent />
    )
}

@injectable()
export class HomePageContribution implements RoutesApplicationContribution {

    constructor(
        @inject(HomeContentPreloadProvider)
        protected readonly homeContentPreloadProvider: HomeContentPreloadProvider,
        @inject(DefaultDashboardContentContributor)
        protected readonly defaultDashboardContentContributor: DefaultDashboardContentContributor
    ) { }

    getRoute(): RouteContribution {
        return {
            path: '/',
            component: IndexPage,
            icon: <Home />,
            navBar: true,
            name: 'Home',
            exact: true,
            root: true,
            authRequired: false,
            prerender: {
                enabled: true,
                preload: async (context) => {
                    if (!context) {
                        return
                    }
                    await this.homeContentPreloadProvider.preload(context)
                },
                document: (context) => {
                    if (!context) {
                        return Promise.resolve(undefined)
                    }
                    if (this.defaultDashboardContentContributor.getDocumentProvider) {
                        const targetProvider = this.defaultDashboardContentContributor.getDocumentProvider()
                        if (targetProvider) {
                            return targetProvider(context)
                        }
                    }
                    return Promise.resolve(undefined)
                }
            }
        }
    }
}

export default IndexPage
