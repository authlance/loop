import React, { useEffect, useMemo } from 'react'
import { Provider } from 'react-redux'
import { AppStore, getOrCreateStore, setStoreInstance } from './index'
import { persistStore } from 'redux-persist'

const hydratedStores = new WeakSet<AppStore>()

const ensurePersistence = (targetStore: AppStore) => {
  if (typeof window === 'undefined') {
    return
  }
  if (hydratedStores.has(targetStore)) {
    return
  }
  persistStore(targetStore)
  hydratedStores.add(targetStore)
}

const defaultStore = getOrCreateStore()

interface ReduxProviderProps {
  children: React.ReactNode
  store?: AppStore
}

export default function ReduxProvider({ children, store }: ReduxProviderProps): React.ReactElement {
  const resolvedStore = useMemo(() => store ?? defaultStore, [store])

  useEffect(() => {
    if (store) {
      setStoreInstance(store)
    }
    ensurePersistence(resolvedStore)
  }, [resolvedStore, store])

  return <Provider store={resolvedStore}>{children}</Provider>
}
