import React, { createContext, PropsWithChildren, useMemo } from 'react'
import { Configuration, FrontendApi } from '@ory/client'
import { authApiClient } from './fetcher'

const newOrySDK = () => {
    const basePath = process.env.REACT_APP_ORY_URL || 'http://localhost:8000/authlance/identity'
    const ory = new FrontendApi(
        new Configuration({
            basePath,
            baseOptions: {
                withCredentials: true,
                timeout: 10000,
            },
        }),
        '',
        authApiClient
    )
    return ory
}

interface Context {
    orySDK: FrontendApi
}

export const ProjectContext = createContext<Context>({
    orySDK: newOrySDK(),
})

export default function ProjectContextProvider({ children }: PropsWithChildren<unknown>) {
    const orySDK = useMemo(() => {
        return newOrySDK()
    }, [])

    return (
        <ProjectContext.Provider
            value={{
                orySDK,
            }}
        >
            {children}
        </ProjectContext.Provider>
    )
}
