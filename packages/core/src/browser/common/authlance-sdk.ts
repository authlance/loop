import { Configuration } from '@authlance/common/lib/common/authlance-client/configuration'
import {
    AdminGroupsApi,
    AdminRolesApi,
    AdminUsersApi,
    AuthApi,
    LicenseApi,
    PaymentsApi,
    PersonalAccessTokensApi,
    ProfileApi,
    RealmAdminGroupsApi,
    RealmGroupsApi,
    SubscriptionsApi,
} from '@authlance/common/lib/common/authlance-client/api'
import { authlanceApiClient } from './fetcher'

export type AdminApi = AdminGroupsApi & AdminRolesApi & AdminUsersApi & RealmAdminGroupsApi
export type GroupsApi = RealmGroupsApi
export type UsersApi = ProfileApi

const createAdminApiProxy = (instances: [AdminGroupsApi, AdminRolesApi, AdminUsersApi, RealmAdminGroupsApi]): AdminApi => {
    const [primary, ...rest] = instances
    const sources = [primary, ...rest]
    return new Proxy(primary, {
        get(target, prop, receiver) {
            for (const source of sources) {
                if (prop in source) {
                    const value = Reflect.get(source, prop, receiver)
                    if (typeof value === 'function') {
                        return value.bind(source)
                    }
                    return value
                }
            }
            return Reflect.get(target, prop, receiver)
        },
        set(target, prop, value, receiver) {
            for (const source of sources) {
                if (prop in source) {
                    return Reflect.set(source, prop, value, receiver)
                }
            }
            return Reflect.set(target, prop, value, receiver)
        },
        has(target, prop) {
            if (Reflect.has(target, prop)) {
                return true
            }
            return rest.some((source) => Reflect.has(source, prop))
        },
        ownKeys() {
            const keys = new Set<string | symbol>()
            sources.forEach((source) => {
                Reflect.ownKeys(source).forEach((key) => keys.add(key as string | symbol))
            })
            return Array.from(keys)
        },
        getOwnPropertyDescriptor(target, prop) {
            for (const source of sources) {
                const descriptor = Reflect.getOwnPropertyDescriptor(source, prop)
                if (descriptor) {
                    return descriptor
                }
            }
            return Reflect.getOwnPropertyDescriptor(target, prop)
        },
    }) as AdminApi
}

// Build a Configuration that optionally injects a Bearer token and uses the shared axios instance
export const getAuthlanceConfiguration = (token?: string) => {
    const basePath = process.env.AUTH_URL || 'http://localhost:8000'
    return new Configuration({
        basePath,
        baseOptions: {
            withCredentials: true,
            timeout: 10000,
            ...(token
                ? {
                      headers: {
                          Authorization: `Bearer ${token}`,
                      },
                  }
                : {}),
        }
    })
}

const createAdminApiInstances = (token?: string): [AdminGroupsApi, AdminRolesApi, AdminUsersApi, RealmAdminGroupsApi] => {
    const configuration = getAuthlanceConfiguration(token)
    return [
        new AdminGroupsApi(configuration, '', authlanceApiClient),
        new AdminRolesApi(configuration, '', authlanceApiClient),
        new AdminUsersApi(configuration, '', authlanceApiClient),
        new RealmAdminGroupsApi(configuration, '', authlanceApiClient),
    ]
}

export const newAdminApi: (token?: string) => AdminApi = (token) => createAdminApiProxy(createAdminApiInstances(token))
export const newAuthApi: (token?: string) => AuthApi = (token) => new AuthApi(getAuthlanceConfiguration(token), '', authlanceApiClient)
export const newGroupsApi: (token?: string) => GroupsApi = (token) => new RealmGroupsApi(getAuthlanceConfiguration(token), '', authlanceApiClient)
export const newSubscriptionsApi: (token?: string) => SubscriptionsApi = (token) => new SubscriptionsApi(getAuthlanceConfiguration(token), '', authlanceApiClient)
export const newUsersApi: (token?: string) => UsersApi = (token) => new ProfileApi(getAuthlanceConfiguration(token), '', authlanceApiClient)
export const newPaymentsApi: (token?: string) => PaymentsApi = (token) => new PaymentsApi(getAuthlanceConfiguration(token), '', authlanceApiClient)
export const newPersonalAccessTokensApi: (token?: string) => PersonalAccessTokensApi = (token) =>
    new PersonalAccessTokensApi(getAuthlanceConfiguration(token), '', authlanceApiClient)
export const newLicenseApi: (token?: string) => LicenseApi = (token) =>
    new LicenseApi(getAuthlanceConfiguration(token), '', authlanceApiClient)

export interface AuthlanceFactory {
    adminApi: (token?: string) => AdminApi
    authApi: (token?: string) => AuthApi
    groupsApi: (token?: string) => GroupsApi
    subscriptionsApi: (token?: string) => SubscriptionsApi
    usersApi: (token?: string) => UsersApi
    personalAccessTokensApi: (token?: string) => PersonalAccessTokensApi
    paymentsApi: (token?: string) => PaymentsApi
    licenseApi: (token?: string) => LicenseApi
}

export const authlanceFactory: AuthlanceFactory = {
    adminApi: newAdminApi,
    authApi: newAuthApi,
    groupsApi: newGroupsApi,
    subscriptionsApi: newSubscriptionsApi,
    usersApi: newUsersApi,
    personalAccessTokensApi: newPersonalAccessTokensApi,
    paymentsApi: newPaymentsApi,
    licenseApi: newLicenseApi,
}
