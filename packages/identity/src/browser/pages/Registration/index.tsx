import React from 'react'
import { injectable } from 'inversify'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { RegistrationComponent } from '../../components/auth/registration-component'

function RegistrationPage() {

    return (
        <RegistrationComponent />
    )
}

@injectable()
export class RegistrationPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/register',
            component: RegistrationPage,
            navBar: false,
            name: 'Register',
            exact: true,
            root: true,
            authRequired: false,
            prerender: {
                enabled: false,
                preload: async () => undefined,
            }
        }
    }
}

export default RegistrationPage
