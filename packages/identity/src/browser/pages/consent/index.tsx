import React from 'react'
import { injectable } from 'inversify'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import HydraContextProvider from '@authlance/core/lib/browser/common/hydra-sdk';
import AutoConsent from '../../components/auth/consent-component';

function ConsentPage() {

    return (
        <HydraContextProvider>
          <AutoConsent />
        </HydraContextProvider>
    )
}

@injectable()
export class ConsentPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/consent',
            component: ConsentPage,
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
