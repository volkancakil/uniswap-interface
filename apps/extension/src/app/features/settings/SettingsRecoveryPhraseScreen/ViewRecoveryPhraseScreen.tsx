import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScreenHeader } from 'src/app/components/layout/ScreenHeader'
import { SeedPhraseDisplay } from 'src/app/features/settings/SettingsRecoveryPhraseScreen/SeedPhraseDisplay'
import { SettingsRecoveryPhrase } from 'src/app/features/settings/SettingsRecoveryPhraseScreen/SettingsRecoveryPhrase'
import { EnterPasswordModal } from 'src/app/features/settings/password/EnterPasswordModal'
import { AppRoutes, RemoveRecoveryPhraseRoutes, SettingsRoutes } from 'src/app/navigation/constants'
import { navigate } from 'src/app/navigation/state'
import { DeprecatedButton, Flex, Text } from 'ui/src'
import { AlertTriangleFilled, Eye, Key, Laptop } from 'ui/src/components/icons'
import { WalletEventName } from 'uniswap/src/features/telemetry/constants'
import { sendAnalyticsEvent } from 'uniswap/src/features/telemetry/send'
import { logger } from 'utilities/src/logger/logger'
import { useSignerAccounts } from 'wallet/src/features/wallet/hooks'

const enum ViewStep {
  Warning,
  Password,
  Reveal,
}

export function SettingsViewRecoveryPhraseScreen(): JSX.Element {
  const { t } = useTranslation()

  const [viewStep, setViewStep] = useState(ViewStep.Warning)

  const mnemonicAccounts = useSignerAccounts()
  const mnemonicAccount = mnemonicAccounts[0]
  if (!mnemonicAccount) {
    throw new Error('Screen should not be accessed unless mnemonic account exists')
  }

  const showPasswordModal = (): void => {
    setViewStep(ViewStep.Password)
  }

  useEffect(() => {
    sendAnalyticsEvent(WalletEventName.ViewRecoveryPhrase)

    // Clear clipboard when the component unmounts
    return () => {
      navigator.clipboard.writeText('').catch((error) => {
        logger.error(error, {
          tags: { file: 'SettingsViewRecoveryPhraseScreen.tsx', function: 'maybeClearClipboard' },
        })
      })
    }
  }, [])

  return (
    <Flex grow backgroundColor="$surface1">
      <ScreenHeader title={t('settings.setting.recoveryPhrase.title')} />
      {viewStep !== ViewStep.Reveal ? (
        <SettingsRecoveryPhrase
          icon={<AlertTriangleFilled color="$statusCritical" size="$icon.24" />}
          nextButtonEnabled={true}
          nextButtonText={t('common.button.continue')}
          nextButtonTheme="secondary_Button"
          subtitle={t('setting.recoveryPhrase.view.warning.message1')}
          title={t('setting.recoveryPhrase.view.warning.title')}
          onNextPressed={showPasswordModal}
        >
          <EnterPasswordModal
            isOpen={viewStep === ViewStep.Password}
            onClose={() => setViewStep(ViewStep.Warning)}
            onNext={() => setViewStep(ViewStep.Reveal)}
          />
          <Flex
            alignItems="flex-start"
            borderColor="$surface3"
            borderRadius="$rounded20"
            borderWidth="$spacing1"
            gap="$spacing24"
            p="$spacing12"
          >
            <Flex row alignItems="center" gap="$spacing12">
              <Flex p={6}>
                <Eye color="$statusCritical" size="$icon.24" />
              </Flex>
              <Text textAlign="left" variant="body2">
                {t('setting.recoveryPhrase.view.warning.message2')}
              </Text>
            </Flex>
            <Flex row alignItems="center" gap="$spacing12" width="100%">
              <Flex p={6}>
                <Key color="$statusCritical" size="$icon.24" />
              </Flex>
              <Text textAlign="left" variant="body2">
                {t('setting.recoveryPhrase.view.warning.message3')}
              </Text>
            </Flex>
            <Flex row alignItems="center" gap="$spacing12">
              <Flex p={6}>
                <Laptop color="$statusCritical" size="$icon.24" />
              </Flex>
              <Text textAlign="left" variant="body2">
                {t('setting.recoveryPhrase.view.warning.message4')}
              </Text>
            </Flex>
          </Flex>
        </SettingsRecoveryPhrase>
      ) : (
        <Flex fill gap="$spacing24" pt="$spacing36">
          <SeedPhraseDisplay mnemonicId={mnemonicAccount.mnemonicId} />
          <Flex alignItems="center" gap="$spacing8">
            <Text color="$neutral2" textAlign="center" variant="body3">
              {t('setting.recoveryPhrase.warning.view.message')}
            </Text>
          </Flex>
          <Flex fill justifyContent="flex-end">
            <DeprecatedButton
              theme="detrimental"
              onPress={(): void =>
                navigate(
                  `${AppRoutes.Settings}/${SettingsRoutes.RemoveRecoveryPhrase}/${RemoveRecoveryPhraseRoutes.Wallets}`,
                  { replace: true },
                )
              }
            >
              {t('setting.recoveryPhrase.remove')}
            </DeprecatedButton>
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}
