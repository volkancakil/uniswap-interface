import { Signer, providers as ethersProviders } from 'ethers'
import { Task } from 'redux-saga'
import { RPCType, UniverseChainId } from 'uniswap/src/features/chains/types'
import { createEthersProvider } from 'uniswap/src/features/providers/createEthersProvider'
import { logger } from 'utilities/src/logger/logger'

enum ProviderStatus {
  Disconnected,
  Connected,
  Error,
}

interface ProviderDetails {
  provider: ethersProviders.JsonRpcProvider
  status: ProviderStatus
  blockWatcher?: Task
}

// A private provider can be authenticated and thus tied to a specific address
interface PrivateProviderDetails extends ProviderDetails {
  address?: Address
}

type ProviderInfo = Partial<{
  public: ProviderDetails
  private: PrivateProviderDetails
}>

type ChainIdToProvider = Partial<Record<UniverseChainId, ProviderInfo>>

export class ProviderManager {
  private readonly _providers: ChainIdToProvider = {}

  private onUpdate: (() => void) | null = null

  setOnUpdate(onUpdate: () => void): void {
    this.onUpdate = onUpdate
  }

  tryGetProvider(chainId: UniverseChainId): ethersProviders.JsonRpcProvider | null {
    try {
      return this.getProvider(chainId)
    } catch (error) {
      return null
    }
  }

  getProvider(chainId: UniverseChainId): ethersProviders.JsonRpcProvider {
    const cachedProviderDetails = this._providers[chainId]?.public
    if (!cachedProviderDetails || cachedProviderDetails.status !== ProviderStatus.Connected) {
      this.createProvider(chainId)
    }

    const providerDetails = this._providers[chainId]?.public

    if (providerDetails?.status !== ProviderStatus.Connected) {
      throw new Error(`Public provider not connected for chain: ${chainId}`)
    }

    return providerDetails.provider
  }

  async getPrivateProvider(chainId: UniverseChainId, signer?: Signer): Promise<ethersProviders.JsonRpcProvider> {
    const signerAddress = await signer?.getAddress()
    const cachedProviderDetails = this._providers[chainId]?.private
    if (
      !cachedProviderDetails ||
      cachedProviderDetails.address !== signerAddress ||
      cachedProviderDetails.status !== ProviderStatus.Connected
    ) {
      this.createPrivateProvider(chainId, signer, signerAddress)
    }

    const providerDetails = this._providers[chainId]?.private
    if (providerDetails?.status !== ProviderStatus.Connected || providerDetails.address !== signerAddress) {
      throw new Error(`Private provider not connected for chain ${chainId}, address ${signerAddress}`)
    }

    return providerDetails.provider
  }

  createProvider(chainId: UniverseChainId): undefined {
    const provider = createEthersProvider(chainId)
    if (!provider) {
      return
    }

    this._providers[chainId] = {
      ...this._providers[chainId],
      public: { provider, status: ProviderStatus.Connected },
    }
    this.onUpdate?.()
  }

  createPrivateProvider(chainId: UniverseChainId, signer?: Signer, address?: Address): undefined {
    const provider = createEthersProvider(chainId, RPCType.Private, signer)
    if (!provider) {
      return
    }

    this._providers[chainId] = {
      ...this._providers[chainId],
      private: { provider, status: ProviderStatus.Connected, address },
    }
    this.onUpdate?.()
  }

  removeProviders(chainId: UniverseChainId): void {
    const providersInfo = this._providers[chainId]
    if (!providersInfo) {
      logger.warn('ProviderManager', 'removeProviders', `Attempting to remove non-existent provider: ${chainId}`)
      return
    }

    Object.values(providersInfo).forEach((providerInfo) => {
      providerInfo.provider.removeAllListeners()
    })

    delete this._providers[chainId]
    this.onUpdate?.()
  }
}
