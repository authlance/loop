import React from 'react'
import { injectable } from 'inversify'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { Verification } from '../../components/auth/verify-component'

function VerificationPage() {

    return (
        <>
          <Verification />
        </>
    )
}

@injectable()
export class VerificationPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/verify',
            component: VerificationPage,
            navBar: false,
            name: 'Verification',
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

export default VerificationPage
