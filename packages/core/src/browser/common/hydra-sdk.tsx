import React, {
    createContext,
    PropsWithChildren,
    useMemo,
} from 'react'
import {
    Configuration,
    OAuth2Api,
    OidcApi
} from '@ory/client'
import { hydraApiClient } from './fetcher'


const newOauthSDK = () => {
    const basePath =
        process.env.REACT_APP_HYDRA_URL || 'http://localhost:8000/authlance/openid'
    const ory = new OAuth2Api(
        new Configuration({
            basePath,
            baseOptions: {
                withCredentials: true,
                timeout: 10000,
            },
        }),
        '',
        hydraApiClient
    )
    return ory
}

const newOidcSDK = () => {
    const basePath =
        process.env.REACT_APP_HYDRA_URL || 'http://localhost:8000/authlance/openid'
    const ory = new OidcApi(
        new Configuration({
            basePath,
            baseOptions: {
                withCredentials: true,
                timeout: 10000,
            },
        }),
        '',
        hydraApiClient
    )
    return ory
}

interface Context {
    oauthSDK: OAuth2Api,
    oidcSDK: OidcApi
}

export const HydraContext = createContext<Context>({
    oauthSDK: newOauthSDK(),
    oidcSDK: newOidcSDK()
})

export default function HydraContextProvider({
    children,
}: PropsWithChildren<unknown>) {
    const oauthSDK = useMemo(() => {
        return newOauthSDK()
    }, [])

    const oidcSDK = useMemo(() => {
        return newOidcSDK()
    }, [])

    return (
        <HydraContext.Provider
            value={{
                oauthSDK,
                oidcSDK
            }}
        >
            {children}
        </HydraContext.Provider>
    )
}
