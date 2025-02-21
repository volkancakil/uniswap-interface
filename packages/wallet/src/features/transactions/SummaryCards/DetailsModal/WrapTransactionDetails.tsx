import { useCurrencyInfo } from 'uniswap/src/features/tokens/useCurrencyInfo'
import { TransactionDetails, WrapTransactionInfo } from 'uniswap/src/features/transactions/types/transactionDetails'
import { SwapTransactionContent } from 'wallet/src/features/transactions/SummaryCards/DetailsModal/SwapTransactionDetails'
import { buildNativeCurrencyId, buildWrappedNativeCurrencyId } from 'wallet/src/utils/currencyId'

export function WrapTransactionDetails({
  transactionDetails,
  typeInfo,
  onClose,
}: {
  transactionDetails: TransactionDetails
  typeInfo: WrapTransactionInfo
  onClose: () => void
}): JSX.Element {
  const nativeCurrency = useCurrencyInfo(buildNativeCurrencyId(transactionDetails.chainId))
  const wrappedNativeCurrency = useCurrencyInfo(buildWrappedNativeCurrencyId(transactionDetails.chainId))

  const inputCurrency = typeInfo.unwrapped ? wrappedNativeCurrency : nativeCurrency
  const outputCurrency = typeInfo.unwrapped ? nativeCurrency : wrappedNativeCurrency

  return (
    <SwapTransactionContent
      isConfirmed
      inputCurrency={inputCurrency}
      inputCurrencyAmountRaw={typeInfo.currencyAmountRaw}
      outputCurrency={outputCurrency}
      outputCurrencyAmountRaw={typeInfo.currencyAmountRaw}
      onClose={onClose}
    />
  )
}
