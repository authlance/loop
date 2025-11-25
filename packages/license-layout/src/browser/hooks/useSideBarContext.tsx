import React, { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react'

export interface SideBarContext {
    state: 'collapsed' | 'expanded'
    setState: (state: 'collapsed' | 'expanded') => void
}

const SideBarContext = createContext<SideBarContext>({
    state: 'expanded',
    setState: () => {},
})

export const SideBarContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [state, setState] = useState<'collapsed' | 'expanded'>('expanded')

    const contextValue = useMemo(
        () => ({
            state,
            setState,
        }),
        [state, setState],
    )

    return <SideBarContext.Provider value={contextValue}>{children}</SideBarContext.Provider>
}

export const useSideBarContext = (): SideBarContext => {
    return useContext(SideBarContext)
}
