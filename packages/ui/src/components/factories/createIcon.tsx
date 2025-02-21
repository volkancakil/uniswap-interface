import type { IconProps as TamaguiIconProps } from '@tamagui/helpers-icon'
import { createElement, forwardRef, useState } from 'react'
import { Svg, SvgProps } from 'react-native-svg'
import { ColorTokens, SpecificTokens, Stack, ThemeKeys, View, isWeb, styled, usePropsAndStyle } from 'tamagui'
import { withAnimated } from 'ui/src/components/factories/animated'
import { DynamicColor } from 'ui/src/hooks/useSporeColors'
import { IconSizeTokens } from 'ui/src/theme'

type SvgPropsWithRef = SvgProps & { ref: React.ForwardedRef<Svg>; style?: { color?: string } }

export type IconProps = Omit<Omit<TamaguiIconProps, 'size' | 'width' | 'height'>, 'color'> & {
  size?: IconSizeTokens | number | { width: number; height: number }
  // we need the string & {} to allow strings but not lose the intellisense autocomplete
  // eslint-disable-next-line @typescript-eslint/ban-types
  color?: (ColorTokens | ThemeKeys | (string & {})) | DynamicColor | null
  Component?: React.FunctionComponent<SvgPropsWithRef>
}

const getSize = <Val extends SpecificTokens | number>(val: Val): { width: Val; height: Val } => ({
  width: val,
  height: val,
})

// used by our usePropsAndStyle to resolve a variant
const IconFrame = styled(Stack, {
  variants: {
    size: {
      '...': getSize,
    },
  },
})

export type GeneratedIconProps = IconProps & { hoverColor?: IconProps['color'] }
export type GeneratedIcon = React.ForwardRefExoticComponent<GeneratedIconProps & React.RefAttributes<Svg>>

export function createIcon({
  name,
  getIcon,
  defaultFill,
}: {
  name: string
  getIcon: (props: SvgPropsWithRef) => JSX.Element
  defaultFill?: string
}): readonly [GeneratedIcon, GeneratedIcon] {
  const Icon = forwardRef<Svg, GeneratedIconProps>(({ color, hoverColor: hoverColorProp, ...propsIn }, ref) => {
    const [hover, setHover] = useState(false)
    const renderColor = color ?? defaultFill ?? (isWeb ? 'currentColor' : undefined)
    const hoverColor = hoverColorProp ?? renderColor

    const [props, style] = usePropsAndStyle(
      {
        size: '$icon.8',
        strokeWidth: 8,
        ...propsIn,
        color: hover ? hoverColor : renderColor,
      },
      {
        resolveValues: 'value',
        forComponent: IconFrame,
      },
    )

    const svgProps: SvgPropsWithRef = {
      ref,
      ...props,
      // @ts-expect-error this type is hard to map but its right
      style,
    }

    const comp = props.Component ? createElement(props.Component, svgProps) : getIcon(svgProps)

    // Only enabled on web because mobile doesn't support hover events
    // It is also optional because it breaks some layouts
    if (isWeb && hoverColorProp) {
      return (
        <View onHoverIn={() => setHover(true)} onHoverOut={() => setHover(false)}>
          {comp}
        </View>
      )
    }

    return comp
  })

  Icon.displayName = name

  const IconPlain = forwardRef<Svg, IconProps>((props, ref) => {
    return getIcon({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(props as any as SvgPropsWithRef),
      ref,
    })
  })

  IconPlain.displayName = name

  const AnimatedIconPlain = withAnimated(IconPlain)

  const AnimatedIcon = forwardRef<Svg, IconProps>((props: IconProps, ref) => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Icon ref={ref} {...props} Component={AnimatedIconPlain as any} />
  ))

  AnimatedIcon.displayName = `Animated${name}`

  return [Icon, AnimatedIcon] as const
}
