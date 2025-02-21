import { Image, ImageResizeMode } from 'react-native'
import { ColorTokens, Flex } from 'ui/src'
import { isSVGUri, uriToHttpUrls } from 'utilities/src/format/urls'
import { logger } from 'utilities/src/logger/logger'
import { WebSvgUri } from 'wallet/src/features/images/WebSvgUri'

type Props = {
  aspectRatio?: number
  backgroundColor?: string
  borderRadius?: number
  uri: string
  height: number
  width: number
  resizeMode?: ImageResizeMode
  fallback?: JSX.Element
  testID?: string
}

const RESIZE_MODE_CONTAIN: ImageResizeMode = 'contain'

/**
 * @deprecated Please use `UniversalImage` for all added cases
 *
 *  If it doesn't fit you use case, modify it to fit or consult with the universe team for help!
 */
export function RemoteImage({
  aspectRatio,
  backgroundColor,
  borderRadius = 0,
  uri,
  height,
  width,
  resizeMode = RESIZE_MODE_CONTAIN,
  fallback,
  testID,
}: Props): JSX.Element | null {
  const imageHttpUrl = uriToHttpUrls(uri)[0]

  if (!imageHttpUrl) {
    logger.warn('RemoteImage', '', 'Could not retrieve and format remote image for uri', {
      data: uri,
    })
    return fallback ?? null
  }

  if (isSVGUri(imageHttpUrl)) {
    return (
      <Flex
        alignItems="center"
        backgroundColor={backgroundColor as ColorTokens}
        borderRadius={borderRadius}
        height={height}
        overflow="hidden"
        testID={testID}
        width={width}
      >
        <WebSvgUri autoplay={true} maxHeight={height} uri={imageHttpUrl} />
      </Flex>
    )
  }

  const style = {
    aspectRatio,
    flex: aspectRatio ? 1 : undefined,
    backgroundColor,
    borderRadius,
    resizeMode,
    width: !aspectRatio ? width : undefined,
    height: !aspectRatio ? height : undefined,
  }

  return <Image source={{ uri: imageHttpUrl }} style={style} testID={testID} />
}
