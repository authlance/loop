import React, { useEffect } from 'react'
import AppRouter from './routes'
import LayoutContainer from './containers/LayoutContainer'
import ReduxProvider from './store/redux-provider'
import { AppStore } from './store'
import AuthContextProvider from './hooks/useAuth'
import ApplicationContextProvider from './hooks/app'
import KratosProvider from './common/kratos'

export interface MainProps {
    store?: AppStore
}

// Create an intersection type of the component props and our Redux props.
const Main: React.FC<MainProps> = ({ store }) => {

    useEffect(() => {
        const rootApp = document.getElementById('loop-preload')
        if (rootApp) {
            const firstChild = rootApp.firstChild as HTMLElement
            if (!firstChild) {
                return
            }
            if (!firstChild.classList.contains('h-full')) {
                firstChild.setAttribute('class', 'h-full min-h-screen')
            }
        }
    }, [])

    return (
        <ReduxProvider store={store}>
            <KratosProvider>
                <ApplicationContextProvider>
                    <AuthContextProvider>
                        <LayoutContainer>
                            {({ theme }) => (
                                <div id="theme-wrapper" className={ theme === 'dark' ? 'h-full dark' : 'h-full'}>
                                    <AppRouter />
                                </div>
                            )}
                        </LayoutContainer>
                    </AuthContextProvider>
                </ApplicationContextProvider>
            </KratosProvider>
        </ReduxProvider>
    )
}

export default Main
