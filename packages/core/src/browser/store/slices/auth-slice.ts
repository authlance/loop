import { Session } from '@ory/client'
import { createSlice } from '@reduxjs/toolkit'

export interface AuthState {
    loading: boolean
    session: Session | undefined
    logoutUrl: string | undefined
    token: string | undefined
    personalAccessToken: string | undefined
    logout: boolean
}

const initialState: AuthState = {
    session: undefined,
    loading: false,
    logoutUrl: undefined,
    token: undefined,
    personalAccessToken: undefined,
    logout: false,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.logout = false
            state.session = undefined
            state.token = undefined
            state.personalAccessToken = undefined
            state.logoutUrl = undefined
        },
        setLogout: (state, action) => {
            state.logout = action.payload
        },
        setSession: (state, action) => {
            state.session = action.payload
        },
        setToken: (state, action) => {
            state.token = action.payload
        },
        setPersonalAccessToken: (state, action) => {
            state.personalAccessToken = action.payload
        },
        setLogoutUrl: (state, action) => {
            state.logoutUrl = action.payload
        },
    },
    extraReducers: (builder) => {
        // empty handler
    },
})

export const { reset, setLogout, setToken, setSession, setLogoutUrl, setPersonalAccessToken } =
    authSlice.actions
export const authReducer = authSlice.reducer
