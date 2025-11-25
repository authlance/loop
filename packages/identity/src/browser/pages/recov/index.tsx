import React from 'react'
import { injectable } from 'inversify'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes';
import Recovery from '../../components/auth/recovery-component'

function RecoveryPage() {

    return (
        <>
          <Recovery />
        </>
    )
}

@injectable()
export class RecoveryPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/recovery',
            component: RecoveryPage,
            navBar: false,
            name: 'Recovery',
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

export default RecoveryPage
