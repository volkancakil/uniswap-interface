import { TamaguiProvider as OGTamaguiProvider, TamaguiProviderProps } from 'tamagui'
import { useIsDarkMode } from 'theme/components/ThemeToggle'
import config from 'ui/src/tamagui.config'

export function TamaguiProvider({ children, ...rest }: Omit<TamaguiProviderProps, 'config'>): JSX.Element {
  const darkMode = useIsDarkMode()
  return (
    <OGTamaguiProvider config={config} defaultTheme={darkMode ? 'dark' : 'light'} {...rest}>
      {children}
    </OGTamaguiProvider>
  )
}
