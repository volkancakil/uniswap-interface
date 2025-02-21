// eslint-disable-next-line no-restricted-imports
import { ProtocolVersion } from '@uniswap/client-pools/dist/pools/v1/types_pb'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { getCurrencyForProtocol } from 'pages/Pool/Positions/create/utils'
import { Flex, Text } from 'ui/src'
import { iconSizes } from 'ui/src/theme'
import { useLocalizationContext } from 'uniswap/src/features/language/LocalizationContext'
import { getSymbolDisplayText } from 'uniswap/src/utils/currency'
import { NumberType } from 'utilities/src/format/types'

export function TokenInfo({
  currencyAmount,
  currencyUSDAmount,
  isMigrating = false,
}: {
  currencyAmount?: CurrencyAmount<Currency>
  currencyUSDAmount?: CurrencyAmount<Currency>
  isMigrating?: boolean
}) {
  const { formatCurrencyAmount } = useLocalizationContext()
  const currency = isMigrating
    ? getCurrencyForProtocol(currencyAmount?.currency, ProtocolVersion.V4)
    : currencyAmount?.currency

  return (
    <Flex row alignItems="center">
      <Flex grow>
        <Text variant="heading2">
          {formatCurrencyAmount({
            value: currencyAmount,
            type: NumberType.TokenNonTx,
          })}{' '}
          {getSymbolDisplayText(currency?.symbol)}
        </Text>
        <Text variant="body3" color="$neutral2">
          {formatCurrencyAmount({
            value: currencyUSDAmount,
            type: NumberType.FiatStandard,
          })}
        </Text>
      </Flex>
      <CurrencyLogo currency={currency} size={iconSizes.icon36} />
    </Flex>
  )
}
