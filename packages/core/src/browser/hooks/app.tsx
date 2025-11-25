import React, { PropsWithChildren, createContext, useEffect, useState } from "react"

interface ApplicationContext {
    mobile: boolean
}

export const AppContext = createContext<ApplicationContext>({
    mobile: false,
})

export default function ApplicationContextProvider({
    children,
}: PropsWithChildren<Record<string, unknown>>) {
    const [mobile, setMobile] = useState<boolean>(false)
    useEffect(() => {
        if (window.innerWidth < 768) {
            setMobile(true)
        }
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setMobile(true)
            } else {
                setMobile(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [setMobile])
    return (
        <AppContext.Provider
            value={{
                mobile: mobile,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}
