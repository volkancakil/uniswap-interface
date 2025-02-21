import { useMemo } from 'react'
import { useTradingApiSwappableTokensQuery } from 'uniswap/src/data/apiClients/tradingApi/useTradingApiSwappableTokensQuery'
import { ChainId } from 'uniswap/src/data/tradingApi/__generated__'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { toSupportedChainId } from 'uniswap/src/features/chains/utils'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'
import {
  NATIVE_ADDRESS_FOR_TRADING_API,
  toTradingApiSupportedChainId,
} from 'uniswap/src/features/transactions/swap/utils/tradingApi'

const FALLBACK_NUM_CHAINS = 8

export function useNumBridgingChains(): number {
  const unichainEnabled = useFeatureFlag(FeatureFlags.Unichain)
  const { data: bridgingTokens } = useTradingApiSwappableTokensQuery({
    params: {
      tokenIn: NATIVE_ADDRESS_FOR_TRADING_API,
      tokenInChainId: ChainId._1,
      unichainEnabled,
    },
  })

  const chainSet = useMemo(() => new Set(bridgingTokens?.tokens.map((t) => t.chainId)), [bridgingTokens])
  const numChains = chainSet.size + 1

  return numChains > 4 ? numChains : FALLBACK_NUM_CHAINS
}

export function useIsBridgingChain(chainId: UniverseChainId): boolean {
  const unichainEnabled = useFeatureFlag(FeatureFlags.Unichain)
  const { data: bridgingTokens } = useTradingApiSwappableTokensQuery({
    params: {
      tokenIn: NATIVE_ADDRESS_FOR_TRADING_API,
      tokenInChainId: ChainId._1,
      unichainEnabled,
    },
  })

  const chainSet = useMemo(() => new Set(bridgingTokens?.tokens.map((t) => t.chainId)), [bridgingTokens])

  const chainIdForTradingApi = toTradingApiSupportedChainId(chainId)
  return chainIdForTradingApi !== undefined && chainSet.has(chainIdForTradingApi)
}

export function useBridgingSupportedChainIds(): UniverseChainId[] {
  const unichainEnabled = useFeatureFlag(FeatureFlags.Unichain)
  const { data: bridgingTokens } = useTradingApiSwappableTokensQuery({
    params: {
      tokenIn: NATIVE_ADDRESS_FOR_TRADING_API,
      tokenInChainId: ChainId._1,
      unichainEnabled,
    },
  })

  const chainSet = useMemo(
    () =>
      new Set(
        bridgingTokens?.tokens
          .map((t) => toSupportedChainId(t.chainId))
          .filter((chainId): chainId is UniverseChainId => chainId !== null),
      ),
    [bridgingTokens],
  )
  return Array.from(chainSet)
}
