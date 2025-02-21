import { useTranslation } from 'react-i18next'
import { Linking } from 'react-native'
import { DeprecatedButton, Flex, Text } from 'ui/src'
import { Language } from 'ui/src/components/icons'
import { colors, opacify } from 'ui/src/theme'
import { Modal } from 'uniswap/src/components/modals/Modal'
import { ModalName } from 'uniswap/src/features/telemetry/constants'
import { TestID } from 'uniswap/src/test/fixtures/testIDs'
import { isAndroid } from 'utilities/src/platform'
import { SettingsLanguageModalProps } from 'wallet/src/components/settings/language/SettingsLanguageModalProps'

const openLanguageSettings = async (): Promise<void> => {
  if (isAndroid) {
    await Linking.openSettings()
  } else {
    await Linking.openURL('app-settings:')
  }
}

export function SettingsLanguageModal({ onClose }: SettingsLanguageModalProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <Modal name={ModalName.LanguageSelector} onClose={onClose}>
      <Flex centered mt="$spacing16">
        <Flex backgroundColor={opacify(10, colors.bluePastel)} borderRadius="$rounded12" p="$spacing12">
          <Language color="$bluePastel" size="$icon.24" strokeWidth={1.5} />
        </Flex>
      </Flex>
      <Flex gap="$spacing24" pt="$spacing24" px="$spacing24">
        <Flex gap="$spacing8">
          <Text textAlign="center" variant="subheading1">
            {t('settings.setting.language.title')}
          </Text>
          <Text color="$neutral2" textAlign="center" variant="body3">
            {t('settings.setting.language.description.mobile')}
          </Text>
        </Flex>
        <DeprecatedButton testID={TestID.OpenDeviceLanguageSettings} theme="tertiary" onPress={openLanguageSettings}>
          {t('settings.setting.language.button.navigate')}
        </DeprecatedButton>
      </Flex>
    </Modal>
  )
}
