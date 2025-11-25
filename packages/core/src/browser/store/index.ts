import { AnyAction, PreloadedState, combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux'
import { persistReducer } from 'redux-persist'
import logger from 'redux-logger'
import thunk, { ThunkDispatch } from 'redux-thunk'
import { appReducer } from './slices/app-slice'
import storage from './custom-storage'
import { authReducer } from './slices/auth-slice'
import { groupReducer } from './slices/group-slice'

const appPersistConfig = {
  key: 'app',
  storage,
  whitelist: ['cart'],
}

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['logoutUrl'],
}

const groupPersistConfig = {
  key: 'groupContext',
  storage,
  whitelist: ['group'],
}

export const rootReducer = combineReducers({
  app: persistReducer(appPersistConfig, appReducer),
  auth: persistReducer(authPersistConfig, authReducer),
  groupContext: persistReducer(groupPersistConfig, groupReducer),
})

export type RootState = ReturnType<typeof rootReducer>

const isBrowser = typeof window !== 'undefined'

const createStoreInternal = (preloadedState?: PreloadedState<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        thunk: true,
      }).concat(isBrowser && process.env.NODE_ENV === 'development' ? [logger as any, thunk] : [thunk]),
    enhancers: [],
  })

export type AppStore = ReturnType<typeof createStoreInternal>
export type AppDispatch = ThunkDispatch<RootState, void, AnyAction>

let storeRef: AppStore | undefined

export const initializeStore = (preloadedState?: PreloadedState<RootState>): AppStore => {
  storeRef = createStoreInternal(preloadedState)
  return storeRef
}

export const getOrCreateStore = (): AppStore => {
  if (!storeRef) {
    if (typeof window === 'undefined') {
      return createStoreInternal()
    }
    storeRef = createStoreInternal((window as any).__PRERENDER_STORE__)
  }
  return storeRef
}

export const setStoreInstance = (nextStore: AppStore): void => {
  storeRef = nextStore
}

export const store = getOrCreateStore()

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
