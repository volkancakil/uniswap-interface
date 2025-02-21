import { useTranslation } from 'react-i18next'
import { Flex, Text, TouchableArea } from 'ui/src'
import { TestID } from 'uniswap/src/test/fixtures/testIDs'
import { AddressDisplay } from 'wallet/src/components/accounts/AddressDisplay'
import { useAllTransactionsBetweenAddresses } from 'wallet/src/features/transactions/hooks/useAllTransactionsBetweenAddresses'
import { useActiveAccountAddressWithThrow } from 'wallet/src/features/wallet/hooks'

interface RecipientInputPanelProps {
  recipientAddress: string
  onShowRecipientSelector: () => void
}

/**
 * Panel displaying currently selected recipient metadata as well as a toggle
 * to open the recipient selector modal.
 */
export function RecipientInputPanel({
  recipientAddress,
  onShowRecipientSelector,
}: RecipientInputPanelProps): JSX.Element {
  return (
    <TouchableArea px="$spacing32" py="$spacing16" testID={TestID.SelectRecipient} onPress={onShowRecipientSelector}>
      <Flex centered gap="$spacing4" py="$spacing12">
        <AddressDisplay hideAddressInSubtitle address={recipientAddress} variant="heading3" />
        {recipientAddress && <RecipientPrevTransfers recipient={recipientAddress} />}
      </Flex>
    </TouchableArea>
  )
}

export function RecipientPrevTransfers({ recipient }: { recipient: string }): JSX.Element {
  const { t } = useTranslation()
  const activeAddress = useActiveAccountAddressWithThrow()
  const previousTransactions = useAllTransactionsBetweenAddresses(activeAddress, recipient)
  const prevTxnsCount = previousTransactions?.length ?? 0

  return (
    <Text color="$neutral2" textAlign="center" variant="subheading2">
      {t('send.recipient.previous', { count: prevTxnsCount })}
    </Text>
  )
}
