import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * Used to store persisted info about a users interactions with UI.
 * We use this to show conditional UI, usually only for the first time a user views a new feature.
 */
export interface UniswapBehaviorHistoryState {
  hasViewedBridgingBanner?: boolean
  hasDismissedBridgingWarning?: boolean
  hasDismissedLowNetworkTokenWarning?: boolean
  unichainPromotion?: {
    coldBannerDismissed?: boolean
    warmBannerDismissed?: boolean
    networkSelectorAnimationSeen?: boolean
    networkSelectorTooltipSeen?: boolean
    bridgingTooltipSeen?: boolean
    bridgingAnimationSeen?: boolean
    isFirstUnichainBridgeSelection?: boolean
  }
}

export const initialUniswapBehaviorHistoryState: UniswapBehaviorHistoryState = {
  hasViewedBridgingBanner: false,
  hasDismissedBridgingWarning: false,
  hasDismissedLowNetworkTokenWarning: false,
  unichainPromotion: {
    coldBannerDismissed: false,
    warmBannerDismissed: false,
    networkSelectorAnimationSeen: false,
    networkSelectorTooltipSeen: false,
    bridgingTooltipSeen: false,
    bridgingAnimationSeen: false,
    isFirstUnichainBridgeSelection: true,
  },
}

const slice = createSlice({
  name: 'uniswapBehaviorHistory',
  initialState: initialUniswapBehaviorHistoryState,
  reducers: {
    setHasViewedBridgingBanner: (state, action: PayloadAction<boolean>) => {
      state.hasViewedBridgingBanner = action.payload
    },
    setHasDismissedBridgingWarning: (state, action: PayloadAction<boolean>) => {
      state.hasDismissedBridgingWarning = action.payload
    },
    setHasDismissedLowNetworkTokenWarning: (state, action: PayloadAction<boolean>) => {
      state.hasDismissedLowNetworkTokenWarning = action.payload
    },
    setHasDismissedUnichainColdBanner: (state, action: PayloadAction<boolean>) => {
      state.unichainPromotion ??= {}
      state.unichainPromotion.coldBannerDismissed = action.payload
    },
    setHasDismissedUnichainWarmBanner: (state, action: PayloadAction<boolean>) => {
      state.unichainPromotion ??= {}
      state.unichainPromotion.warmBannerDismissed = action.payload
    },
    setHasSeenNetworkSelectorAnimation: (state, action: PayloadAction<boolean>) => {
      state.unichainPromotion ??= {}
      state.unichainPromotion.networkSelectorAnimationSeen = action.payload
    },
    setHasSeenNetworkSelectorTooltip: (state, action: PayloadAction<boolean>) => {
      state.unichainPromotion ??= {}
      state.unichainPromotion.networkSelectorTooltipSeen = action.payload
    },
    setHasSeenBridgingTooltip: (state, action: PayloadAction<boolean>) => {
      state.unichainPromotion ??= {}
      state.unichainPromotion.bridgingTooltipSeen = action.payload
    },
    setIsFirstUnichainBridgeSelection: (state, action: PayloadAction<boolean>) => {
      state.unichainPromotion ??= {}
      state.unichainPromotion.isFirstUnichainBridgeSelection = action.payload
    },
    setHasSeenBridgingAnimation: (state, action: PayloadAction<boolean>) => {
      state.unichainPromotion ??= {}
      state.unichainPromotion.bridgingAnimationSeen = action.payload
    },
    // Should only be used for testing
    resetUniswapBehaviorHistory: (_state, _action: PayloadAction) => {
      return initialUniswapBehaviorHistoryState
    },
  },
})

export const {
  setHasViewedBridgingBanner,
  setHasDismissedBridgingWarning,
  setHasDismissedLowNetworkTokenWarning,
  setHasDismissedUnichainColdBanner,
  setHasDismissedUnichainWarmBanner,
  setHasSeenNetworkSelectorAnimation,
  setHasSeenNetworkSelectorTooltip,
  setHasSeenBridgingTooltip,
  setIsFirstUnichainBridgeSelection,
  setHasSeenBridgingAnimation,
  resetUniswapBehaviorHistory,
} = slice.actions

export const uniswapBehaviorHistoryReducer = slice.reducer
