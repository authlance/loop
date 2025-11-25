import React from 'react'
import { injectable } from 'inversify'
import { RouteContribution, RoutesApplicationContribution } from '@authlance/core/lib/common/routes/routes'
import { LoginComponent } from '../../components/auth/login-component'

function LoginPage() {

    return (
        <LoginComponent />
    )
}

@injectable()
export class LoginPageContribution implements RoutesApplicationContribution {
    getRoute(): RouteContribution {
        return {
            path: '/login',
            component: LoginPage,
            name: 'Login',
            navBar: false,
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

export default LoginPage
