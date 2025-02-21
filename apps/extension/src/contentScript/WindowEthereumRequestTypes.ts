import { EthersTransactionRequestSchema } from 'src/app/features/dappRequests/types/EthersTypes'
import { HexadecimalNumberSchema } from 'src/app/features/dappRequests/types/utilityTypes'
import { HomeTabs } from 'src/app/navigation/constants'
import { ZodIssueCode, z } from 'zod'

/**
 * Schemas + types for requests that come via `window.ethereum.request`
 * e.g.: {"jsonrpc":"2.0","method":"personal_sign","params": ["0x295a70b2de5e3953354a6a8344e616ed314d7251", "0xasdfasdfasdfasdfasdfasdfa"],"id":1}'
 * @see https://eips.ethereum.org/EIPS/eip-1193
 * @see https://docs.metamask.io/guide/ethereum-provider.html#ethereum-request
 * @see https://docs.metamask.io/wallet/reference/json-rpc-api/
 *
 * Note: Our schemas include transformations to make it easier to work with the data
 */

export const BaseEthereumRequestSchema = z.object({
  method: z.string(),
  params: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]).optional(),
})

export const EthereumRequestWithIdSchema = BaseEthereumRequestSchema.extend({
  requestId: z.string().uuid(),
})
export type EthereumRequestWithId = z.infer<typeof EthereumRequestWithIdSchema>

export type BaseEthereumRequest = z.infer<typeof BaseEthereumRequestSchema>

export const EthChainIdRequestSchema = EthereumRequestWithIdSchema.extend({
  method: z.literal('eth_chainId'),
})
export type EthChainIdRequest = z.infer<typeof EthChainIdRequestSchema>

export const EthRequestAccountsRequestSchema = EthereumRequestWithIdSchema.extend({
  method: z.literal('eth_requestAccounts'),
})
export type EthRequestAccountsRequest = z.infer<typeof EthRequestAccountsRequestSchema>

export const EthAccountsRequestSchema = EthereumRequestWithIdSchema.extend({
  method: z.literal('eth_accounts'),
})
export type EthAccountsRequest = z.infer<typeof EthAccountsRequestSchema>
export const EthSendTransactionRequestSchema = EthereumRequestWithIdSchema.extend({
  requestId: z.string(),
  method: z.literal('eth_sendTransaction'),
  params: z.array(z.unknown()),
}).transform((data) => {
  const { requestId, method, params } = data
  if (params.length < 1) {
    throw new Error('Params array must contain at least one element')
  }

  const parseResult = EthersTransactionRequestSchema.safeParse(params[0])

  if (!parseResult.success) {
    throw new Error('First element of the array must match EthersTransactionRequestSchema')
  }

  const transaction = parseResult.data

  return {
    requestId,
    method,
    params,
    transaction,
  }
})
export type EthSendTransactionRequest = z.infer<typeof EthSendTransactionRequestSchema>

export const PersonalSignRequestSchema = EthereumRequestWithIdSchema.extend({
  method: z.literal('personal_sign'),
  params: z.array(z.unknown()),
}).transform((data) => {
  const { requestId, method, params } = data

  if (params.length < 2) {
    throw new z.ZodError([
      {
        message: 'Params array must contain at least two elements',
        path: ['params'],
        code: ZodIssueCode.custom,
      },
    ])
  }

  const messageHex = z.string().parse(params[0])
  const address = z.string().parse(params[1])

  return {
    requestId,
    method,
    params,
    messageHex,
    address,
  }
})

export type PersonalSignRequest = z.infer<typeof PersonalSignRequestSchema>

export const EthSignTransactionRequestSchema = EthereumRequestWithIdSchema.extend({
  method: z.literal('eth_signTransaction'),
  params: z.array(z.unknown()),
}).transform((data) => {
  const { requestId, method, params } = data

  if (params.length < 1) {
    throw new z.ZodError([
      {
        message: 'Params array must contain at least one element',
        path: ['params'],
        code: ZodIssueCode.custom,
      },
    ])
  }

  const parseResult = EthersTransactionRequestSchema.safeParse(params[0])
  if (!parseResult.success) {
    throw new z.ZodError([
      {
        message: 'First element of the array must match EthersTransactionRequestSchema',
        path: ['params', '0'],
        code: ZodIssueCode.custom,
      },
    ])
  }
  const transaction = parseResult.data

  return {
    requestId,
    method,
    params,
    transaction,
  }
})
export type EthSignTransactionRequest = z.infer<typeof EthSignTransactionRequestSchema>

export const EthSignTypedDataV4RequestSchema = EthereumRequestWithIdSchema.extend({
  method: z.literal('eth_signTypedData_v4'),
  params: z.array(z.unknown()),
}).transform((data) => {
  const { requestId, method, params } = data

  if (params.length < 2) {
    throw new z.ZodError([
      {
        message: 'Params array must contain at least two elements',
        path: ['params'],
        code: ZodIssueCode.custom,
      },
    ])
  }

  const address = z.string().parse(params[0])
  const typedData = z.string().parse(params[1])

  const chainId = JSON.parse(typedData)?.domain?.chainId
  const formattedChainId = HexadecimalNumberSchema.parse(chainId)
  if (!formattedChainId) {
    throw new z.ZodError([
      {
        message: 'Typed data must contain a chainId',
        path: ['params', '1'],
        code: ZodIssueCode.custom,
      },
    ])
  }
  return {
    requestId,
    method,
    params,
    address,
    typedData,
  }
})
export type EthSignTypedDataV4Request = z.infer<typeof EthSignTypedDataV4RequestSchema>

export const SwitchEthereumChainParameterSchema = z.object({
  chainId: z.string(),
})

export const WalletSwitchEthereumChainRequestSchema = EthereumRequestWithIdSchema.extend({
  method: z.literal('wallet_switchEthereumChain'),
  params: z.array(z.unknown()),
}).transform((data) => {
  const { requestId, method, params } = data
  if (params.length < 1) {
    throw new z.ZodError([
      {
        message: 'Params array must contain at least one element',
        path: ['params'],
        code: ZodIssueCode.custom,
      },
    ])
  }

  const parseResult = SwitchEthereumChainParameterSchema.safeParse(params[0])
  if (!parseResult.success) {
    throw new z.ZodError([
      {
        message: 'Chain id should be specified as a hexadecimal string within object',
        path: ['params', '0'],
        code: ZodIssueCode.custom,
      },
    ])
  }

  const { chainId } = parseResult.data

  return {
    requestId,
    method,
    params,
    chainId,
  }
})
export type WalletSwitchEthereumChainRequest = z.infer<typeof WalletSwitchEthereumChainRequestSchema>

// eslint-disable-next-line no-restricted-syntax
export const PermissionRequestSchema = z.record(z.record(z.any()))

export const RequestedPermissionSchema = z.object({
  parentCapability: z.string(), // name of the method for which the permission is requested
  date: z.number().optional(), // in UNIX time
})

export const CaveatSchema = z.object({
  type: z.string(),
  // eslint-disable-next-line no-restricted-syntax
  value: z.any(),
})
export type Caveat = z.infer<typeof CaveatSchema>

export const PermissionSchema = z.object({
  invoker: z.string(),
  parentCapability: z.string(),
  caveats: z.array(CaveatSchema),
})
export type Permission = z.infer<typeof PermissionSchema>

export const WalletRequestPermissionsRequestSchema = EthereumRequestWithIdSchema.extend({
  method: z.literal('wallet_requestPermissions'),
  params: z.array(z.unknown()),
}).transform((data) => {
  const { requestId, method, params } = data
  if (params.length < 1) {
    throw new z.ZodError([
      {
        message: 'Params array must contain at least one element',
        path: ['params'],
        code: ZodIssueCode.custom,
      },
    ])
  }

  const permissions = PermissionRequestSchema.parse(params[0])

  return {
    requestId,
    method,
    params,
    permissions,
  }
})

export type WalletRequestPermissionsRequest = z.infer<typeof WalletRequestPermissionsRequestSchema>

export const WalletRevokePermissionsRequestSchema = EthereumRequestWithIdSchema.extend({
  method: z.literal('wallet_revokePermissions'),
  params: z.array(z.unknown()),
}).transform((data) => {
  const { requestId, method, params } = data
  if (params.length < 1) {
    throw new z.ZodError([
      {
        message: 'Params array must contain at least one element',
        path: ['params'],
        code: ZodIssueCode.custom,
      },
    ])
  }

  const permissions = PermissionRequestSchema.parse(params[0])

  return {
    requestId,
    method,
    params,
    permissions,
  }
})

export type WalletRevokePermissionsRequest = z.infer<typeof WalletRevokePermissionsRequestSchema>

export const WalletGetPermissionsRequestSchema = EthereumRequestWithIdSchema.extend({
  method: z.literal('wallet_getPermissions'),
})
export type WalletGetPermissionsRequest = z.infer<typeof WalletGetPermissionsRequestSchema>

export const UniswapOpenSidebarRequestSchema = EthereumRequestWithIdSchema.extend({
  method: z.literal('uniswap_openSidebar'),
  params: z.array(z.unknown()),
}).transform((data) => {
  const tab = z.nativeEnum(HomeTabs).optional().parse(data.params[0])
  return {
    ...data,
    tab,
  }
})

export type UniswapOpenSidebarRequest = z.infer<typeof UniswapOpenSidebarRequestSchema>
