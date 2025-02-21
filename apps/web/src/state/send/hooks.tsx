import { TransactionRequest } from '@ethersproject/abstract-provider'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { NATIVE_CHAIN_ID } from 'constants/tokens'
import { useCurrency } from 'hooks/Tokens'
import { useAccount } from 'hooks/useAccount'
import { GasFeeResult, GasSpeed, useTransactionGasFee } from 'hooks/useTransactionGasFee'
import { useUSDTokenUpdater } from 'hooks/useUSDTokenUpdater'
import { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useMemo } from 'react'
import { useMultichainContext } from 'state/multichain/useMultichainContext'
import { SendState } from 'state/send/SendContext'
import { nativeOnChain } from 'uniswap/src/constants/tokens'
import { useAddressFromEns, useENSName } from 'uniswap/src/features/ens/api'
import { useUnitagByAddress, useUnitagByName } from 'uniswap/src/features/unitags/hooks'
import { isAddress } from 'utilities/src/addresses'
import { useCreateTransferTransaction } from 'utils/transfer'

export interface RecipientData {
  address: string
  ensName?: string
  unitag?: string
}

export enum SendInputError {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INSUFFICIENT_FUNDS_FOR_GAS = 'INSUFFICIENT_FUNDS_FOR_GAS',
}

export type SendInfo = {
  currencyBalance?: CurrencyAmount<Currency>
  parsedTokenAmount?: CurrencyAmount<Currency>
  exactAmountOut?: string
  recipientData?: RecipientData
  transaction?: TransactionRequest
  gasFee?: GasFeeResult
  gasFeeCurrencyAmount?: CurrencyAmount<Currency>
  inputError?: SendInputError
}

export function useDerivedSendInfo(state: SendState): SendInfo {
  const account = useAccount()
  const { provider } = useWeb3React()
  const { chainId } = useMultichainContext()
  const { exactAmountToken, exactAmountFiat, inputInFiat, inputCurrency, recipient, validatedRecipientData } = state

  // If we have validatedRecipientData, skip custom lookups
  // Otherwise, use raw `recipient` input from the user.
  const userInput = validatedRecipientData ? undefined : recipient

  const isRecipientAnAddress = isAddress(userInput ?? '')

  // If userInput is an address, do a reverse ENS lookup
  // (address → ENS). Otherwise skip.
  const reverseLookupInput = isRecipientAnAddress ? userInput : undefined
  const { data: reverseLookupName } = useENSName(reverseLookupInput)

  // If userInput is *not* an address, do a forward lookup
  // (ENS → address). Otherwise skip.
  const forwardLookupInput = !isRecipientAnAddress ? userInput ?? null : null
  const { data: forwardLookupAddress } = useAddressFromEns(forwardLookupInput)

  // Check Unitag by name and see if it yields an address
  const { unitag: recipientInputUnitag } = useUnitagByName(userInput)
  const recipientInputUnitagAddress = recipientInputUnitag?.address?.address
  const recipientInputUnitagUsername = validatedRecipientData?.unitag ?? recipientInputUnitag?.username

  const validatedRecipientAddress = useMemo(() => {
    return (
      validatedRecipientData?.address ??
      (isAddress(userInput) || isAddress(forwardLookupAddress) || isAddress(recipientInputUnitagAddress) || undefined)
    )
  }, [validatedRecipientData?.address, userInput, forwardLookupAddress, recipientInputUnitagAddress])

  // Unitag fallback: If there's no known username from input or validated data,
  // try to look up a unitag by the final address.
  const { unitag: fallbackUnitag } = useUnitagByAddress(
    recipientInputUnitagUsername ? undefined : validatedRecipientAddress,
  )

  // If forward lookup succeeded, use the original user input as ENS name.
  const finalEnsName = useMemo(() => {
    if (isAddress(forwardLookupAddress)) {
      return userInput
    }
    return validatedRecipientData?.ensName ?? reverseLookupName ?? undefined
  }, [forwardLookupAddress, validatedRecipientData?.ensName, reverseLookupName, userInput])

  const finalUnitag = useMemo(() => {
    if (validatedRecipientData?.unitag) {
      return validatedRecipientData.unitag
    }
    return recipientInputUnitagUsername ?? fallbackUnitag?.username
  }, [validatedRecipientData?.unitag, recipientInputUnitagUsername, fallbackUnitag?.username])

  const recipientData = useMemo(() => {
    if (!validatedRecipientAddress) {
      return undefined
    }
    return {
      address: validatedRecipientAddress,
      ensName: finalEnsName,
      unitag: finalUnitag,
    }
  }, [validatedRecipientAddress, finalEnsName, finalUnitag])

  const nativeCurrency = useCurrency(NATIVE_CHAIN_ID, chainId)
  const [inputCurrencyBalance, nativeCurrencyBalance] = useCurrencyBalances(
    account.address,
    useMemo(() => [inputCurrency, nativeCurrency], [inputCurrency, nativeCurrency]),
  )

  const { formattedAmount: exactAmountOut } = useUSDTokenUpdater(
    inputInFiat,
    exactAmountToken ?? exactAmountFiat,
    inputCurrency,
  )
  const parsedTokenAmount = useMemo(() => {
    return tryParseCurrencyAmount(inputInFiat ? exactAmountOut : exactAmountToken, inputCurrency)
  }, [exactAmountOut, exactAmountToken, inputCurrency, inputInFiat])

  const transferInfo = useMemo(() => {
    return {
      provider,
      account: account.address,
      chainId,
      currencyAmount: parsedTokenAmount,
      toAddress: recipientData?.address,
    }
  }, [account.address, chainId, parsedTokenAmount, provider, recipientData?.address])
  const transferTransaction = useCreateTransferTransaction(transferInfo)
  const gasFee = useTransactionGasFee(transferTransaction, GasSpeed.Normal, !transferTransaction)
  const gasFeeCurrencyAmount = useMemo(() => {
    if (!chainId || !gasFee?.value) {
      return undefined
    }

    return CurrencyAmount.fromRawAmount(nativeOnChain(chainId), gasFee.value)
  }, [chainId, gasFee?.value])

  const inputError = useMemo(() => {
    const insufficientBalance = parsedTokenAmount && inputCurrencyBalance?.lessThan(parsedTokenAmount)
    if (insufficientBalance) {
      return SendInputError.INSUFFICIENT_FUNDS
    }

    if (!gasFee.value || !nativeCurrency || !nativeCurrencyBalance) {
      return undefined
    }

    let totalAmount = CurrencyAmount.fromRawAmount(nativeCurrency, gasFee?.value)
    if (parsedTokenAmount && inputCurrency && nativeCurrency?.equals(inputCurrency)) {
      totalAmount = totalAmount?.add(parsedTokenAmount)
    }

    if (!totalAmount || nativeCurrencyBalance?.lessThan(totalAmount)) {
      return SendInputError.INSUFFICIENT_FUNDS_FOR_GAS
    }

    return undefined
  }, [gasFee.value, inputCurrency, inputCurrencyBalance, nativeCurrencyBalance, nativeCurrency, parsedTokenAmount])

  return useMemo(
    () => ({
      currencyBalance: inputCurrencyBalance,
      exactAmountOut,
      parsedTokenAmount,
      recipientData,
      transaction: transferTransaction,
      gasFeeCurrencyAmount,
      gasFee,
      inputError,
    }),
    [
      exactAmountOut,
      gasFeeCurrencyAmount,
      gasFee,
      inputCurrencyBalance,
      inputError,
      parsedTokenAmount,
      recipientData,
      transferTransaction,
    ],
  )
}
