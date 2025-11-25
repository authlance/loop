import { createSlice } from '@reduxjs/toolkit'

export interface GroupContextState {
    group: string | undefined
    refreshTick: number
}

const initialState: GroupContextState = {
    group: undefined,
    refreshTick: 0
}

export const groupSlice = createSlice({
    name: 'group',
    initialState,
    reducers: {
        setGroup: (state, action) => {
            state.group = action.payload
        },
        setRefreshTick: (state) => {
            state.refreshTick += 1
        }
    },
    extraReducers: (builder) => {
        // empty handler
    },
})

export const { setGroup, setRefreshTick } =
    groupSlice.actions
export const groupReducer = groupSlice.reducer
