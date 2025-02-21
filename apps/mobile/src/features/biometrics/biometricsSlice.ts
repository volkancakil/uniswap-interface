import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { AuthenticationType } from 'expo-local-authentication'
import { BiometricAuthenticationStatus } from 'src/features/biometrics/biometrics-utils'

//------------------------------------------------------------------------------------------------
// Biometrics State
//------------------------------------------------------------------------------------------------

export interface BiometricsState {
  authenticationStatus: BiometricAuthenticationStatus
  deviceSupportsBiometrics: boolean | undefined
  lastAuthenticationTime: number | undefined
  isEnrolled: boolean | undefined
  supportedAuthenticationTypes: AuthenticationType[] | undefined
}

const initialState: BiometricsState = {
  authenticationStatus: BiometricAuthenticationStatus.Invalid,
  deviceSupportsBiometrics: undefined,
  lastAuthenticationTime: undefined,
  isEnrolled: undefined,
  supportedAuthenticationTypes: undefined,
}

export interface TriggerAuthenticationPayload<T = unknown> {
  onSuccess?: (params?: T) => void
  onFailure?: () => void
  params?: T
  // if true, show an alert when authentication fails
  // useful for when the user is trying to unlock the app
  showAlert?: boolean
}

export const biometricsSlice = createSlice({
  name: 'biometrics',
  initialState,
  reducers: {
    setAuthenticationStatus: (state, action: PayloadAction<BiometricAuthenticationStatus>) => {
      state.authenticationStatus = action.payload
      if (action.payload === BiometricAuthenticationStatus.Authenticated) {
        state.lastAuthenticationTime = Date.now()
      }
    },
    setDeviceSupportsBiometrics: (state, action: PayloadAction<boolean>) => {
      state.deviceSupportsBiometrics = action.payload
    },
    setIsEnrolled: (state, action: PayloadAction<boolean>) => {
      state.isEnrolled = action.payload
    },
    setSupportedAuthenticationTypes: (state, action: PayloadAction<AuthenticationType[]>) => {
      state.supportedAuthenticationTypes = action.payload
    },
    invalidateAuthentication: (state) => {
      state.authenticationStatus = BiometricAuthenticationStatus.Invalid
    },
    triggerAuthentication: (_state, _action: PayloadAction<TriggerAuthenticationPayload>) => {
      // handled by saga
    },
  },
})

export const {
  setAuthenticationStatus,
  setDeviceSupportsBiometrics,
  setIsEnrolled,
  setSupportedAuthenticationTypes,
  invalidateAuthentication,
  triggerAuthentication,
} = biometricsSlice.actions

export const biometricsReducer = biometricsSlice.reducer

//------------------------------
// Biometrics Selectors
//------------------------------

export const selectDeviceSupportsBiometrics = (state: { biometrics: BiometricsState }): boolean | undefined =>
  state.biometrics.deviceSupportsBiometrics

export const selectIsEnrolled = (state: { biometrics: BiometricsState }): boolean | undefined =>
  state.biometrics.isEnrolled

export const selectSupportedAuthenticationTypes = (state: {
  biometrics: BiometricsState
}): AuthenticationType[] | undefined => state.biometrics.supportedAuthenticationTypes

export const selectAuthenticationStatus = (state: { biometrics: BiometricsState }): BiometricAuthenticationStatus =>
  state.biometrics.authenticationStatus

export const selectLastAuthenticationTime = (state: { biometrics: BiometricsState }): number | undefined =>
  state.biometrics.lastAuthenticationTime

export const selectAuthenticationStatusIsAuthenticated = (state: { biometrics: BiometricsState }): boolean =>
  selectAuthenticationStatus(state) === BiometricAuthenticationStatus.Authenticated

export const selectOsBiometricAuthEnabled = createSelector(
  [selectDeviceSupportsBiometrics, selectIsEnrolled],
  (deviceSupportsBiometrics, isEnrolled) => deviceSupportsBiometrics && isEnrolled,
)

export const selectOsBiometricAuthSupported = createSelector(
  [selectSupportedAuthenticationTypes],
  (supportedAuthenticationTypes) => ({
    touchId: supportedAuthenticationTypes?.includes(AuthenticationType.FINGERPRINT) ?? false,
    faceId: supportedAuthenticationTypes?.includes(AuthenticationType.FACIAL_RECOGNITION) ?? false,
  }),
)
