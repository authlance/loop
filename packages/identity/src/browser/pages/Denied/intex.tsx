import React from 'react'
import { injectable } from 'inversify'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import Denied from '../../components/auth/denied-component'

function DeniedPage() {

    return (
        <>
          <Denied />
        </>
    )
}

@injectable()
export class DeniedPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/denied',
            component: DeniedPage,
            navBar: false,
            name: 'Denied',
            exact: true,
            root: true,
            authRequired: false,
            prerender: {
                enabled: false,
                preload: async () => undefined,
            }
        };
    }
}

export default DeniedPage
