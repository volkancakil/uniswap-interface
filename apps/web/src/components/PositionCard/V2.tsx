import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { ButtonEmpty, ButtonPrimary, ButtonSecondary } from 'components/Button/buttons'
import { LightCard } from 'components/Card/cards'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { DoubleCurrencyLogo } from 'components/Logo/DoubleLogo'
import { CardNoise } from 'components/earn/styled'
import { Dots } from 'components/swap/styled'
import { BIG_INT_ZERO } from 'constants/misc'
import { useAccount } from 'hooks/useAccount'
import { useColor } from 'hooks/useColor'
import { useTotalSupply } from 'hooks/useTotalSupply'
import JSBI from 'jsbi'
import styled from 'lib/styled-components'
import { transparentize } from 'polished'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Trans } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useTokenBalance } from 'state/connection/hooks'
import { Flex, Text } from 'ui/src'
import { currencyId } from 'utils/currencyId'
import { unwrappedToken } from 'utils/unwrappedToken'
import { FixedHeightRow } from '.'

const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  border: none;
  background: ${({ theme, bgColor }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${transparentize(0.8, bgColor)} 0%, ${theme.surface2} 100%) `};
  position: relative;
  overflow: hidden;
`

interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: CurrencyAmount<Token> // optional balance to indicate that liquidity is deposited in mining pool
}

export default function MigrateV2PositionCard({ pair, border, stakedBalance }: PositionCardProps) {
  const account = useAccount()

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userDefaultPoolBalance = useTokenBalance(account.address, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  // if staked balance balance provided, add to standard liquidity amount
  const userPoolBalance = stakedBalance ? userDefaultPoolBalance?.add(stakedBalance) : userDefaultPoolBalance

  const poolTokenPercentage =
    !!userPoolBalance &&
    !!totalPoolTokens &&
    JSBI.greaterThanOrEqual(totalPoolTokens.quotient, userPoolBalance.quotient)
      ? new Percent(userPoolBalance.quotient, totalPoolTokens.quotient)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.quotient, userPoolBalance.quotient)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
        ]
      : [undefined, undefined]

  const backgroundColor = useColor(pair?.token0)

  return (
    <StyledPositionCard border={border} bgColor={backgroundColor}>
      <CardNoise />
      <Flex gap="$spacing6">
        <Flex row alignItems="center" justifyContent="space-between">
          <Flex row gap="$spacing8">
            <DoubleCurrencyLogo currencies={[currency0, currency1]} size={20} />
            <Text variant="body1">
              {!currency0 || !currency1 ? (
                <Dots>
                  <Trans i18nKey="common.loading" />
                </Dots>
              ) : (
                `${currency0.symbol}/${currency1.symbol}`
              )}
            </Text>
          </Flex>
          <Flex row gap="$spacing8">
            <ButtonEmpty
              padding="6px 8px"
              $borderRadius="12px"
              width="fit-content"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? (
                <>
                  <Trans i18nKey="common.manage" />
                  <ChevronUp size="20" style={{ marginLeft: '10px' }} />
                </>
              ) : (
                <>
                  <Trans i18nKey="common.manage" />
                  <ChevronDown size="20" style={{ marginLeft: '10px' }} />
                </>
              )}
            </ButtonEmpty>
          </Flex>
        </Flex>

        {showMore && (
          <Flex gap="$spacing6">
            <Flex row alignItems="center" justifyContent="space-between">
              <Text variant="body2">
                <Trans i18nKey="pool.totalTokens" />
              </Text>
              <Text variant="body2">{userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}</Text>
            </Flex>
            {stakedBalance && (
              <Flex row alignItems="center" justifyContent="space-between">
                <Text variant="body2">
                  <Trans i18nKey="pool.rewardsPool.label" />
                </Text>
                <Text variant="body2">{stakedBalance.toSignificant(4)}</Text>
              </Flex>
            )}
            <Flex row alignItems="center" justifyContent="space-between">
              <Text variant="body2">
                <Trans i18nKey="removeLiquidity.pooled" values={{ symbol: currency0.symbol }} />
              </Text>
              {token0Deposited ? (
                <Flex row centered>
                  <Text variant="body2" mr="$spacing4">
                    {token0Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo size={20} currency={currency0} />
                </Flex>
              ) : (
                '-'
              )}
            </Flex>

            <Flex row alignItems="center" justifyContent="space-between">
              <Text variant="body2">
                <Trans i18nKey="pool.pooled" values={{ sym: currency1.symbol }} />
              </Text>
              {token1Deposited ? (
                <Flex row centered>
                  <Text variant="body2" mr="$spacing4">
                    {token1Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo size={20} currency={currency1} />
                </Flex>
              ) : (
                '-'
              )}
            </Flex>

            <FixedHeightRow>
              <Text variant="body2">
                <Trans i18nKey="pool.share.label" />
              </Text>
              <Text variant="body2">
                {poolTokenPercentage
                  ? (poolTokenPercentage.toFixed(2) === '0.00' ? '<0.01' : poolTokenPercentage.toFixed(2)) + '%'
                  : '-'}
              </Text>
            </FixedHeightRow>

            {userDefaultPoolBalance && JSBI.greaterThan(userDefaultPoolBalance.quotient, BIG_INT_ZERO) && (
              <Flex row justifyContent="space-between" mt="$spacing16">
                <ButtonPrimary
                  padding="8px"
                  $borderRadius="8px"
                  as={Link}
                  to={`/migrate/v2/${pair.liquidityToken.address}`}
                  width="64%"
                >
                  <Trans i18nKey="common.migrate" />
                </ButtonPrimary>
                <ButtonSecondary
                  padding="8px"
                  $borderRadius="8px"
                  as={Link}
                  width="32%"
                  to={`/remove/v2/${currencyId(currency0)}/${currencyId(currency1)}`}
                >
                  <Trans i18nKey="common.remove.label" />
                </ButtonSecondary>
              </Flex>
            )}
          </Flex>
        )}
      </Flex>
    </StyledPositionCard>
  )
}
