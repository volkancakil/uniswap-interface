import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { AppState, AppStateStatus } from 'react-native'

//------------------------------------------------------------------------------------------------
// App State
//------------------------------------------------------------------------------------------------

export interface AppStateState {
  current: AppStateStatus
  previous: AppStateStatus | null
}

const initialState: AppStateState = {
  current: AppState.currentState,
  previous: null,
}

export const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    transitionAppState: (state, action: PayloadAction<AppStateStatus>) => {
      state.previous = state.current
      state.current = action.payload
    },
  },
})

export const { transitionAppState } = appStateSlice.actions
export const appStateReducer = appStateSlice.reducer

//------------------------------
// AppState selectors
//------------------------------

export const selectAppState = (state: { appState: AppStateState }): AppStateState => state.appState

export const selectCurrentAppState = (state: { appState: AppStateState }): AppStateState['current'] =>
  selectAppState(state).current

export const selectPreviousAppState = (state: { appState: AppStateState }): AppStateState['previous'] =>
  selectAppState(state).previous

export const selectAppStateIsVisible = (state: { appState: AppStateState }): boolean =>
  selectCurrentAppState(state) === 'active'
