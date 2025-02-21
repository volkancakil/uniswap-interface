import { AuthTrigger } from 'uniswap/src/features/auth/types'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { TransactionDetails } from 'uniswap/src/features/transactions/types/transactionDetails'
import { TransactionState } from 'uniswap/src/features/transactions/types/transactionState'

export interface TransactionSummaryLayoutProps {
  authTrigger?: AuthTrigger
  transaction: TransactionDetails
  title?: string
  caption: string | JSX.Element
  icon?: JSX.Element
  index?: number
  onRetry?: () => void
}

export interface SummaryItemProps {
  authTrigger?: AuthTrigger
  transaction: TransactionDetails
  swapCallbacks?: SwapSummaryCallbacks
  index?: number
}

export interface SwapSummaryCallbacks {
  useLatestSwapTransaction: (address: string) => TransactionDetails | undefined
  useSwapFormTransactionState: (
    address: Address | undefined,
    chainId: UniverseChainId | undefined,
    txId: string | undefined,
  ) => TransactionState | undefined
  onRetryGenerator?: (swapFormState: TransactionState | undefined) => () => void
}
