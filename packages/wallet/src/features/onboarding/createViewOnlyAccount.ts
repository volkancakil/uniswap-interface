import dayjs from 'dayjs'
import { AccountType } from 'uniswap/src/features/accounts/types'
import { getValidAddress } from 'uniswap/src/utils/addresses'
import { ReadOnlyAccount } from 'wallet/src/features/wallet/accounts/types'

export const createViewOnlyAccount = (address: string): ReadOnlyAccount => {
  const formattedAddress = getValidAddress(address, true)
  if (!formattedAddress) {
    throw new Error('Cannot import invalid view-only address')
  }

  const account: ReadOnlyAccount = {
    type: AccountType.Readonly,
    address: formattedAddress,
    timeImportedMs: dayjs().valueOf(),
    pushNotificationsEnabled: true,
  }
  return account
}
