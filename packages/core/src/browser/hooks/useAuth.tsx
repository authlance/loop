import React, { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Session } from '@ory/client'
import { useAppDispatch, useAppSelector } from '../store'
import { ProjectContext } from '../common/kratos'
import { setLogoutUrl, setSession, setToken } from '../store/slices/auth-slice'
import { NavigateHandler, PathProvider } from '../common/common'
import { User } from '../common/auth'
import useRoutesProvider from './user-routes-provider'
import { authlanceFactory, AdminApi, GroupsApi, UsersApi } from '../common/authlance-sdk'
import type { DunaAuthCommonUser, AuthApi, SubscriptionsApi, PersonalAccessTokensApi, CommonIdentityState, PaymentsApi, LicenseApi } from '@authlance/common/lib/common/authlance-client/api'
import { Debouncer } from '../common/utils'
import { setGroup } from '../store/slices/group-slice'
import cookie from 'cookie'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'

const mapUser = (u?: DunaAuthCommonUser | null): User | undefined => {
    if (!u) {
        return undefined
    }
    return {
        identity: u.identity || '',
        firstName: u.firstName,
        lastName: u.lastName,
        avatar: u.avatar,
        birthDate: u.birthDate,
        gender: (u.gender as any) || undefined,
        email: u.email || '',
        roles: u.roles || [],
        groups: u.groups || [],
        groupRoles: (u.groupRoles || []).map((gr) => ({ group: gr.group || '', role: gr.role || '', user: u.identity || '' })),
        state: u.state as CommonIdentityState | undefined,
        verified: u.verified === true,
    }
}

const createAuthlanceClients = (personalAccessToken?: string) => {
    const bearerToken = personalAccessToken ? personalAccessToken : undefined
    return {
        adminApi: authlanceFactory.adminApi(bearerToken),
        authApi: authlanceFactory.authApi(bearerToken),
        groupsApi: authlanceFactory.groupsApi(bearerToken),
        subscriptionsApi: authlanceFactory.subscriptionsApi(bearerToken),
        usersApi: authlanceFactory.usersApi(bearerToken),
        personalAccessTokensApi: authlanceFactory.personalAccessTokensApi(bearerToken),
        paymentsApi: authlanceFactory.paymentsApi(bearerToken),
        licenseApi: authlanceFactory.licenseApi(bearerToken),
    }
}

const defaultAuthlanceClients = createAuthlanceClients()

const getUser = async (
    adminApi: AdminApi,
    groupsApi: GroupsApi,
    isSysAdmin: boolean,
    targetGroup: string,
    identity: string
): Promise<{ user?: User }> => {
    try {
        if (isSysAdmin) {
            const response = await adminApi.authlanceIdentityApiV1AdminUserIdentityGet(identity)
            return { user: mapUser(response.data) }
        }
        // No direct endpoint for a single member in realm context; fallback to list and find
        const members = await groupsApi.authlanceIdentityApiV1RealmGroupGroupMembersGet(targetGroup)
        const found = (members.data || []).find((m: DunaAuthCommonUser) => m.identity === identity)
        return { user: mapUser(found) }
    } catch (error) {
        console.error('Error fetching user:', error)
        return { user: undefined }
    }
}

export interface AuthSession {
    session: Session | undefined
    logoutUrl: string | undefined
    token: string | undefined
    personalAccessToken: string | undefined
    loading: boolean
    user: User | undefined
    targetGroup?: string
    isSysAdmin: boolean
    identityUser?: User
    pathProvider?: PathProvider
    debouncer: Debouncer
    navigateHandler: NavigateHandler
    clearSession: () => Promise<void>,
    sidebarToggle: () => void
    setSessionNavigate: (handler: NavigateHandler, pathProvider: PathProvider) => void
    changeTargetGroup: (group?: string) => void
    setSidebarToggle: (cb: () => void) => void
    setIdentity: (identity: string | undefined) => void
    forceChallenge: () => void
    verifySession: () => void
    // Expose configured OpenAPI SDK clients on the session context
    authApi: AuthApi
    usersApi: UsersApi
    groupsApi: GroupsApi
    adminApi: AdminApi
    paymentsApi: PaymentsApi
    subscriptionsApi: SubscriptionsApi
    personalAccessTokensApi: PersonalAccessTokensApi
    licenseApi: LicenseApi
}

const emptyNavigateHandler: NavigateHandler = {
    navigate: (path: string, options?: any) => {
        // no-op
    }
}

export const SessionContext = createContext<AuthSession>({
    session: undefined,
    token: undefined,
    personalAccessToken: undefined,
    logoutUrl: undefined,
    loading: true,
    isSysAdmin: false,
    user: undefined,
    pathProvider: undefined,
    targetGroup: undefined,
    debouncer: new Debouncer(() => {}, 750),
    navigateHandler: emptyNavigateHandler,
    sidebarToggle: () => {},
    clearSession: () => Promise.resolve(),
    changeTargetGroup: (group?: string) => {},
    setSessionNavigate: (handler: NavigateHandler, pathProvider: PathProvider) => {},
    forceChallenge: () => {},
    verifySession: () => Promise.resolve(),
    setSidebarToggle: (cb: () => void) => {},
    setIdentity: (identity: string | undefined) => {},
    authApi: defaultAuthlanceClients.authApi,
    usersApi: defaultAuthlanceClients.usersApi,
    groupsApi: defaultAuthlanceClients.groupsApi,
    adminApi: defaultAuthlanceClients.adminApi,
    subscriptionsApi: defaultAuthlanceClients.subscriptionsApi,
    personalAccessTokensApi: defaultAuthlanceClients.personalAccessTokensApi,
    paymentsApi: defaultAuthlanceClients.paymentsApi,
    licenseApi: defaultAuthlanceClients.licenseApi,
})

export default function AuthContextProvider({
    children,
}: PropsWithChildren<{}>) {
    const dispatch = useAppDispatch()
    const session = useAppSelector((state) => state.auth.session)
    const token = useAppSelector((state) => state.auth.token)
    const personalAccessToken = useAppSelector((state) => state.auth.personalAccessToken)
    const isLoading = useAppSelector((state) => state.auth.loading)
    const logoutUrl = useAppSelector((state) => state.auth.logoutUrl)
    const contextGroup = useAppSelector((state) => state.groupContext.group)
    const [ navigateHandler, setNavigateHandler ] = useState<NavigateHandler>(emptyNavigateHandler)
    const [ internalSidebarToggle, setInternalSidebarToggle ] = useState<(() => void)>(() => {})
    const [ pathProvider, setPathProvider ] = useState<PathProvider | undefined>(undefined)
    const [ oryLoading, setOryLoading ] = useState<boolean>(true)
    const [ currentUser, setCurrentUser ] = useState<User | undefined>(undefined)
    const routeProvider = useRoutesProvider()
    const { orySDK } = useContext(ProjectContext)
    const debouncer = useMemo(() => new Debouncer(() => {}, 750), [])
    const [ isSysAdmin, setSysAdmin ] = useState(false)
    const [ targetGroup, setTargetGroup ] = useState<string | undefined>(contextGroup)
    const [ identity, setIdentity] = useState<string | undefined>(undefined)
    const [identityUser, setIdentityUser] = useState<User | undefined>(undefined)
    const clients = useMemo(() => createAuthlanceClients(currentUser ? undefined : personalAccessToken), [currentUser, personalAccessToken])
    const licenseApi = clients.licenseApi
    const { toast: pushToast } = useToast()
    const licenseStatusChecked = useRef(false)

    const changeTargetGroup = useCallback((group?: string) => {
        if (!group) {
            setTargetGroup(undefined)
            dispatch(setGroup(undefined))
            if (navigateHandler && currentUser && currentUser.groups && currentUser.groups.length > 0) {
                navigateHandler.navigate('/group/selection', { replace: true })
            }
            return
        }
        if (currentUser && currentUser.groups && currentUser.groups.length > 0) {
            const foundGroup = currentUser.groups.find((g) => g === group)
            if (foundGroup) {
                setTargetGroup(foundGroup)
                dispatch(setGroup(foundGroup))
            }
        }
    }, [currentUser, setTargetGroup, dispatch, navigateHandler])

    const setInternalNavigate = useCallback((handler: NavigateHandler, pathProvider: PathProvider) => {
        setNavigateHandler(handler)
        setPathProvider(pathProvider)
    }, [setNavigateHandler, setPathProvider])

    const setSidebarToggle = useCallback((cb: () => void) => {
        setInternalSidebarToggle(() => cb)
    }, [setInternalSidebarToggle])

    const doAuthenticate = useCallback(async (session: Session) => {
        try {
            // Use OpenAPI SDK AuthApi to exchange session for JWT
            const response = await clients.authApi.authlanceIdentityMePost({ session: session.id })
            if (response.status === 200) {
                dispatch(setToken(response.data.token))
                dispatch(setSession(session))
                return true
            }
        } catch (e) {
            // best effort
        }
        dispatch(setToken(undefined))
        dispatch(setSession(session))
        return false
    }, [dispatch, navigateHandler, setToken, setSession, clients])

    const shouldChallenge = useCallback(() => {
        if (!pathProvider) {
            return false
        }
        const path = pathProvider.getCurrentPath()
        const currentRouteContribution = routeProvider.getRoute(path)
        if (!currentRouteContribution) {
            return false
        }
        if (currentRouteContribution.authRequired) {
            return true
        }
        return false
    }, [pathProvider, routeProvider])

    const challenge = useCallback(async (force: boolean) => {
        orySDK
            .toSession()
            .then(({ data }) => {
                const doWork = async () => {
                    const logoutData = await orySDK.createBrowserLogoutFlow()
                    dispatch(setLogoutUrl(logoutData.data.logout_url))
                    const authenticated = await doAuthenticate(data)
                    if (authenticated) {
                        setOryLoading(false)
                        return
                    }
                }
                doWork()
            })
            .catch(async (_err) => {
                setOryLoading(false)
                dispatch(setSession(undefined))
                dispatch(setToken(undefined))
                try {
                    await clients.authApi.authlanceIdentityMeLogoutGet()
                } catch (error) {
                    console.error('Error logging out:', error)
                }
                if (navigateHandler && (shouldChallenge() || force)) {
                    navigateHandler.navigate('/login', { replace: true })
                }
            })
    }, [dispatch, navigateHandler, orySDK, setOryLoading, doAuthenticate, setSession, setToken, setLogoutUrl, shouldChallenge])

    const verifySession = useCallback(async () => {
        if (!orySDK) {
            return
        }
        try {
            const session = await orySDK.toSession()
            if (session) {
                challenge(false)
            } else {
                try {
                    // if loopToken cookie exists call logout to remove it server-side
                    if (typeof window !== 'undefined') {
                        if (window && window.document) {
                            const cookies = cookie.parse(document.cookie)
                            if (cookies['loopToken']) {
                                await clients.authApi.authlanceIdentityMeLogoutGet() // remove cookie server-side
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error logging out:', error)
                }
            }
        } catch (error) {
            try {
                // if loopToken cookie exists call logout to remove it server-side
                if (typeof window !== 'undefined') {
                    if (window && window.document) {
                        const cookies = cookie.parse(document.cookie)
                        if (cookies['loopToken']) {
                            await clients.authApi.authlanceIdentityMeLogoutGet() // remove cookie server-side
                        }
                    }
                }
            } catch (error) {
                console.error('Error logging out:', error)
            }
        }
    }, [orySDK, challenge])

    const clearSession = useCallback(async () => {
        dispatch(setSession(undefined))
        dispatch(setToken(undefined))
        dispatch(setLogoutUrl(undefined))
        setOryLoading(false)
        challenge(false)
    }, [dispatch, challenge, setOryLoading, setSession, setToken, setLogoutUrl, clients])

    useEffect(() => {
        if (!currentUser) {
            return
        }
        if (currentUser.roles?.includes('sysadmin')) {
            setSysAdmin(true)
        }
        if (currentUser.groups && (!contextGroup || !targetGroup)) {
            if (currentUser.groups.length > 0) {
                if (contextGroup) {
                    const found = currentUser.groups.find((g) => g === contextGroup)
                    if (found) {
                        changeTargetGroup(found)
                        return
                    }
                }
                changeTargetGroup(currentUser.groups[0])
            } else {
                changeTargetGroup(undefined)
            }
        }
        
    }, [currentUser, contextGroup, changeTargetGroup])

    useEffect(() => {
        if (!token) {
            return
        }
        // get jwt payload
        try {
            const payload = token.split('.')[1]
            const decoded = atob(payload)
            const json = JSON.parse(decoded)
            if (json.user && json.user.roles) {
                setCurrentUser(json.user)
            }
        } catch (e) {
            console.error(e)
        }

    }, [token, dispatch])

    useEffect(() => {
        if (!navigateHandler || !pathProvider) {
            return
        }
        if (session && session.id) {
            return
        }
        if (!shouldChallenge()) {
            return
        }
        challenge(false)
    }, [navigateHandler, session, pathProvider, shouldChallenge, challenge])

    useEffect(() => {
        if (!identity || !targetGroup) {
            setIdentityUser(undefined)
            return
        }
        getUser(clients.adminApi, clients.groupsApi, isSysAdmin, targetGroup, identity).then(({ user }) => {
            setIdentityUser(user)
        }).catch((error) => {
            console.error('Error fetching identity user:', error)
        })
    }, [identity, setIdentityUser, isSysAdmin, targetGroup, clients])

    useEffect(() => {
        if (!currentUser) {
            verifySession()
        }
    }, [currentUser, verifySession])

    useEffect(() => {
        if (!token || !isSysAdmin) {
            licenseStatusChecked.current = false
            return
        }
        if (licenseStatusChecked.current) {
            return
        }
        licenseStatusChecked.current = true
        licenseApi
            .authlanceIdentityApiV1AdminLicenseStatusGet()
            .then(({ data }) => {
                const state = (data?.state || '').toLowerCase()
                if (!state || state === 'valid') {
                    return
                }
                const status = data?.status
                const variant = state === 'invalid' || state === 'error' ? 'destructive' : 'default'
                const expDate = status?.exp ? new Date(status.exp) : undefined
                const formatDate = (date?: Date) => (date && !isNaN(date.getTime()) ? date.toLocaleString() : undefined)
                let description = data?.lastError

                if (!description) {
                    if (state === 'grace') {
                        const days = Math.abs(status?.daysRemaining ?? 0)
                        const formattedDate = formatDate(expDate)
                        description = `License expired${formattedDate ? ` on ${formattedDate}` : ''} and is operating within the grace period${days ? ` (${days} day${days === 1 ? '' : 's'} remaining)` : ''}.`
                    } else if (state === 'invalid') {
                        const formattedDate = formatDate(expDate)
                        description = `License${formattedDate ? ` expired on ${formattedDate}` : ' has expired'} and the grace period has ended. Please upload a new license to restore full access.`
                    } else if (state === 'error') {
                        description = 'Unable to verify the license. Please check the configured license file or contact support.'
                    } else {
                        description = 'License status requires attention. Please review the configured license.'
                    }
                }

                pushToast({
                    title:
                        state === 'grace'
                            ? 'License grace period'
                            : state === 'invalid'
                                ? 'License expired'
                                : 'License verification issue',
                    description,
                    variant,
                })
            })
            .catch((error) => {
                console.error('Error fetching license status:', error)
                licenseStatusChecked.current = false
            })
    }, [token, isSysAdmin, licenseApi, pushToast])

    return (
        <SessionContext.Provider
            value={{
                session: session,
                logoutUrl: logoutUrl,
                loading: isLoading || oryLoading,
                token: token,
                personalAccessToken: personalAccessToken,
                isSysAdmin: isSysAdmin,
                user: currentUser,
                identityUser: identityUser,
                clearSession: clearSession,
                setSessionNavigate: setInternalNavigate,
                targetGroup: targetGroup,
                changeTargetGroup: changeTargetGroup,
                pathProvider: pathProvider,
                debouncer: debouncer,
                navigateHandler: navigateHandler,
                forceChallenge: () => challenge(true),
                sidebarToggle: internalSidebarToggle,
                setSidebarToggle: setSidebarToggle,
                setIdentity: setIdentity,
                verifySession: verifySession,
                // SDK clients
                authApi: clients.authApi,
                usersApi: clients.usersApi,
                groupsApi: clients.groupsApi,
                adminApi: clients.adminApi,
                subscriptionsApi: clients.subscriptionsApi,
                personalAccessTokensApi: clients.personalAccessTokensApi,
                paymentsApi: clients.paymentsApi,
                licenseApi: clients.licenseApi,
            }}
        >
            {children}
        </SessionContext.Provider>
    )
}
