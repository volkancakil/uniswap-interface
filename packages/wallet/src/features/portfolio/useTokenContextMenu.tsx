import { SharedEventName } from '@uniswap/analytics-events'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { NativeSyntheticEvent } from 'react-native'
import type { ContextMenuAction, ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view'
import { useDispatch } from 'react-redux'
import { GeneratedIcon, isWeb } from 'ui/src'
import { CoinConvert, ExternalLink, Eye, EyeOff, ReceiveAlt, SendAction } from 'ui/src/components/icons'
import { useEnabledChains } from 'uniswap/src/features/chains/hooks/useEnabledChains'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { usePortfolioCacheUpdater } from 'uniswap/src/features/dataApi/balances'
import { PortfolioBalance } from 'uniswap/src/features/dataApi/types'
import { pushNotification } from 'uniswap/src/features/notifications/slice'
import { AppNotificationType } from 'uniswap/src/features/notifications/types'
import { ElementName, SectionName, WalletEventName } from 'uniswap/src/features/telemetry/constants'
import { sendAnalyticsEvent } from 'uniswap/src/features/telemetry/send'
import { setTokenVisibility } from 'uniswap/src/features/visibility/slice'
import { CurrencyField, CurrencyId } from 'uniswap/src/types/currency'
import { areCurrencyIdsEqual, currencyIdToAddress, currencyIdToChain } from 'uniswap/src/utils/currencyId'
import { isExtension } from 'utilities/src/platform'
import { ONE_SECOND_MS } from 'utilities/src/time/time'
import { useWalletNavigation } from 'wallet/src/contexts/WalletNavigationContext'
import { useActiveAccountAddressWithThrow } from 'wallet/src/features/wallet/hooks'

export enum TokenMenuActionType {
  Swap = 'swap',
  Send = 'send',
  Receive = 'receive',
  Share = 'share',
  ViewDetails = 'viewDetails',
  ToggleVisibility = 'toggleVisibility',
}

interface TokenMenuParams {
  currencyId: CurrencyId
  isBlocked: boolean
  tokenSymbolForNotification?: Nullable<string>
  portfolioBalance?: Nullable<PortfolioBalance>
  excludedActions?: TokenMenuActionType[]
}

type MenuAction = ContextMenuAction & { onPress: () => void; Icon?: GeneratedIcon; name: TokenMenuActionType }

export function useTokenContextMenu({
  currencyId,
  isBlocked,
  tokenSymbolForNotification,
  portfolioBalance,
  excludedActions,
}: TokenMenuParams): {
  menuActions: Array<MenuAction>
  onContextMenuPress: (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => void
} {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const activeAccountAddress = useActiveAccountAddressWithThrow()
  const { defaultChainId } = useEnabledChains()

  const { navigateToSwapFlow, navigateToReceive, navigateToSend, handleShareToken } = useWalletNavigation()

  const activeAccountHoldsToken =
    portfolioBalance && areCurrencyIdsEqual(currencyId, portfolioBalance?.currencyInfo.currencyId)
  const isVisible = !portfolioBalance?.isHidden

  const currencyAddress = currencyIdToAddress(currencyId)
  const currencyChainId = (currencyIdToChain(currencyId) as UniverseChainId) ?? defaultChainId
  const { navigateToTokenDetails } = useWalletNavigation()
  const { isTestnetModeEnabled } = useEnabledChains()

  const onPressSend = useCallback(() => {
    // Do not show warning modal speed-bump if user is trying to send tokens they own
    navigateToSend({ currencyAddress, chainId: currencyChainId })
  }, [currencyAddress, currencyChainId, navigateToSend])

  const onPressSwap = useCallback(
    (currencyField: CurrencyField) => {
      // Do not show warning modal speed-bump if user is trying to swap tokens they own
      navigateToSwapFlow({ currencyField, currencyAddress, currencyChainId })
    },
    [currencyAddress, currencyChainId, navigateToSwapFlow],
  )

  const onPressViewDetails = useCallback(() => {
    sendAnalyticsEvent(SharedEventName.ELEMENT_CLICKED, {
      element: ElementName.TokenItem,
      section: SectionName.HomeTokensTab,
    })
    navigateToTokenDetails(currencyId)
  }, [navigateToTokenDetails, currencyId])

  const onPressShare = useCallback(async () => {
    handleShareToken({ currencyId })
  }, [currencyId, handleShareToken])

  const updateCache = usePortfolioCacheUpdater(activeAccountAddress)

  const onPressHiddenStatus = useCallback(() => {
    /**
     * This update changes the parameters sent in the call to `portfolios`,
     * resulting in a full reload of the portfolio from the server.
     * To avoid the empty state while fetching the new portfolio, we manually
     * modify the current one in the cache.
     */

    updateCache(isVisible, portfolioBalance ?? undefined)

    sendAnalyticsEvent(WalletEventName.TokenVisibilityChanged, {
      currencyId,
      // we log the state to which it's transitioning
      visible: !isVisible,
    })
    dispatch(setTokenVisibility({ currencyId: currencyId.toLowerCase(), isVisible: !isVisible }))

    if (tokenSymbolForNotification) {
      dispatch(
        pushNotification({
          type: AppNotificationType.AssetVisibility,
          visible: isVisible,
          hideDelay: 2 * ONE_SECOND_MS,
          assetName: t('walletConnect.request.details.label.token'),
        }),
      )
    }
  }, [updateCache, isVisible, portfolioBalance, currencyId, dispatch, tokenSymbolForNotification, t])

  const menuActions = useMemo(() => {
    const allMenuActions: MenuAction[] = [
      {
        name: TokenMenuActionType.Swap,
        title: t('common.button.swap'),
        disabled: isBlocked,
        onPress: () => onPressSwap(CurrencyField.INPUT),
        ...(isWeb ? { Icon: CoinConvert } : { systemIcon: 'rectangle.2.swap' }),
      },
      {
        name: TokenMenuActionType.Send,
        title: t('common.button.send'),
        onPress: onPressSend,
        ...(isWeb ? { Icon: SendAction } : { systemIcon: 'paperplane' }),
      },
      {
        name: TokenMenuActionType.Receive,
        title: t('common.button.receive'),
        onPress: navigateToReceive,
        ...(isWeb ? { Icon: ReceiveAlt } : { systemIcon: 'qrcode' }),
      },
      ...(isWeb
        ? []
        : [
            {
              name: TokenMenuActionType.Share,
              title: t('common.button.share'),
              onPress: onPressShare,
              systemIcon: 'square.and.arrow.up',
            },
          ]),
      ...(isExtension && !isTestnetModeEnabled
        ? [
            {
              name: TokenMenuActionType.ViewDetails,
              title: t('common.button.viewDetails'),
              onPress: onPressViewDetails,
              Icon: ExternalLink,
            },
          ]
        : []),
      ...(activeAccountHoldsToken && !isTestnetModeEnabled
        ? [
            {
              name: TokenMenuActionType.ToggleVisibility,
              title: isVisible ? t('tokens.action.hide') : t('tokens.action.unhide'),
              destructive: isVisible,
              onPress: onPressHiddenStatus,
              ...(isWeb ? { Icon: isVisible ? EyeOff : Eye } : { systemIcon: isVisible ? 'eye.slash' : 'eye' }),
            },
          ]
        : []),
    ]

    return allMenuActions.filter((action) => !excludedActions?.includes(action.name))
  }, [
    t,
    isBlocked,
    onPressSend,
    navigateToReceive,
    onPressShare,
    onPressViewDetails,
    activeAccountHoldsToken,
    isVisible,
    onPressHiddenStatus,
    onPressSwap,
    excludedActions,
    isTestnetModeEnabled,
  ])

  const onContextMenuPress = useCallback(
    (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>): void => {
      menuActions[e.nativeEvent.index]?.onPress?.()
    },
    [menuActions],
  )

  return { menuActions, onContextMenuPress }
}
