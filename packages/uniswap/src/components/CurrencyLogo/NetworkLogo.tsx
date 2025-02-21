import React from 'react'
// eslint-disable-next-line no-restricted-imports
import type { ImageSourcePropType } from 'react-native'
import { Flex, FlexProps, Image, useSporeColors } from 'ui/src'
import { ALL_NETWORKS_LOGO, ALL_NETWORKS_LOGO_UNICHAIN } from 'ui/src/assets'
import { iconSizes, zIndexes } from 'ui/src/theme'
import { getChainInfo } from 'uniswap/src/features/chains/chainInfo'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'
import { isMobileWeb } from 'utilities/src/platform'

export const SQUIRCLE_BORDER_RADIUS_RATIO = 0.3

type NetworkLogoProps = FlexProps & {
  chainId: UniverseChainId | null // null signifies this is the AllNetworks logo
  size?: number
  shape?: 'circle' | 'square'
  borderWidth?: number
  borderRadius?: number
}

export function TransactionSummaryNetworkLogo({
  chainId,
  size = iconSizes.icon20,
}: Pick<NetworkLogoProps, 'chainId' | 'size'>): JSX.Element {
  return <NetworkLogo borderWidth={1.5} chainId={chainId} shape="square" size={size} />
}

function _NetworkLogo({
  chainId,
  shape,
  size: sizeWithoutBorder = iconSizes.icon20,
  borderWidth = 0,
  borderRadius,
}: NetworkLogoProps): JSX.Element | null {
  const size = sizeWithoutBorder + 2 * borderWidth
  const shapeBorderRadius = shape === 'circle' ? size / 2 : size * SQUIRCLE_BORDER_RADIUS_RATIO
  const colors = useSporeColors()
  const unichainPromoEnabled = useFeatureFlag(FeatureFlags.UnichainPromo)

  const imageStyle = {
    width: size,
    height: size,
    borderRadius: borderRadius ?? shapeBorderRadius,
    borderWidth,
    borderColor: colors.surface1.val,
  }

  if (chainId === null) {
    const logo = unichainPromoEnabled ? ALL_NETWORKS_LOGO_UNICHAIN : ALL_NETWORKS_LOGO

    return (
      <Flex testID="all-networks-logo">
        <NetworkImage logo={logo} imageSize={size} />
      </Flex>
    )
  }

  const logo = getChainInfo(chainId).logo
  const imageSize = size - borderWidth * 2 // this prevents the border from cutting off the logo

  return logo ? (
    <Flex testID="network-logo" overflow="hidden" style={imageStyle} zIndex={zIndexes.mask}>
      <NetworkImage logo={logo} imageSize={imageSize} />
    </Flex>
  ) : null
}

function NetworkImage({ logo, imageSize }: { logo: ImageSourcePropType; imageSize: number }): JSX.Element {
  // As of iOS 18.3 network logos are no longer displaying because react-native-web-lite
  // adds z-index: -1 to the image. This is a workaround to display the logos on mobile web.
  return isMobileWeb && typeof logo === 'string' ? (
    <img src={logo} style={{ width: imageSize, height: imageSize }} />
  ) : (
    <Image resizeMode="contain" source={logo} width={imageSize} height={imageSize} />
  )
}

export const NetworkLogo = React.memo(_NetworkLogo)
