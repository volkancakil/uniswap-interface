import { useTranslation } from 'react-i18next'
import { Flex, Text } from 'ui/src'
import { iconSizes } from 'ui/src/theme'
import { BridgeIcon, SplitLogo } from 'uniswap/src/components/CurrencyLogo/SplitLogo'
import { useLocalizationContext } from 'uniswap/src/features/language/LocalizationContext'
import { BridgeTxNotification } from 'uniswap/src/features/notifications/types'
import { useCurrencyInfo } from 'uniswap/src/features/tokens/useCurrencyInfo'
import { TransactionStatus } from 'uniswap/src/features/transactions/types/transactionDetails'
import { getFormattedCurrencyAmount } from 'uniswap/src/utils/currency'
import { useWalletNavigation } from 'wallet/src/contexts/WalletNavigationContext'
import { NotificationToast } from 'wallet/src/features/notifications/components/NotificationToast'
import { formBridgeNotificationTitle } from 'wallet/src/features/notifications/utils'
import { useCreateSwapFormState } from 'wallet/src/features/transactions/hooks'
import { BridgingCurrencyRow } from 'wallet/src/features/transactions/swap/BridgingCurrencyRow'

export function BridgeNotification({ notification }: { notification: BridgeTxNotification }): JSX.Element {
  const { t } = useTranslation()
  const formatter = useLocalizationContext()
  const { navigateToAccountActivityList, navigateToSwapFlow } = useWalletNavigation()

  const {
    chainId,
    txId,
    txStatus,
    inputCurrencyId,
    inputCurrencyAmountRaw,
    outputCurrencyId,
    outputCurrencyAmountRaw,
    address,
    hideDelay,
  } = notification

  const inputCurrencyInfo = useCurrencyInfo(inputCurrencyId)
  const outputCurrencyInfo = useCurrencyInfo(outputCurrencyId)

  const title = formBridgeNotificationTitle(txStatus)
  const swapFormState = useCreateSwapFormState(address, chainId, txId)

  const onRetry = (): void => {
    navigateToSwapFlow(swapFormState ? { initialState: swapFormState } : undefined)
  }

  const retryButton =
    txStatus === TransactionStatus.Failed
      ? {
          title: t('common.button.retry'),
          onPress: onRetry,
        }
      : undefined

  const formattedInputTokenAmount = getFormattedCurrencyAmount(
    inputCurrencyInfo?.currency,
    inputCurrencyAmountRaw,
    formatter,
  )

  const formattedOutputTokenAmount = getFormattedCurrencyAmount(
    outputCurrencyInfo?.currency,
    outputCurrencyAmountRaw,
    formatter,
  )

  const contentOverride = (
    <Flex grow row gap="$spacing12" alignItems="center" width="100%">
      <Flex centered>
        <SplitLogo
          chainId={chainId}
          inputCurrencyInfo={inputCurrencyInfo}
          outputCurrencyInfo={outputCurrencyInfo}
          size={iconSizes.icon40}
          customIcon={BridgeIcon}
        />
      </Flex>
      <Flex gap="$spacing4">
        <Text color="$neutral2" variant="body3">
          {title}
        </Text>
        <BridgingCurrencyRow
          inputCurrencyInfo={inputCurrencyInfo}
          outputCurrencyInfo={outputCurrencyInfo}
          formattedInputTokenAmount={formattedInputTokenAmount}
          formattedOutputTokenAmount={formattedOutputTokenAmount}
        />
      </Flex>
    </Flex>
  )

  return (
    <NotificationToast
      actionButton={retryButton}
      address={address}
      hideDelay={hideDelay}
      title={title}
      contentOverride={contentOverride}
      onPress={navigateToAccountActivityList}
    />
  )
}
