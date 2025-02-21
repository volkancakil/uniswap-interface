import ContextMenu from 'react-native-context-menu-view'
import { Flex } from 'ui/src'
import { borderRadii } from 'ui/src/theme'
import { fromGraphQLChain } from 'uniswap/src/features/chains/utils'
import { NftView } from 'wallet/src/components/nfts/NftView'
import { NftViewWithContextMenuProps } from 'wallet/src/components/nfts/NftViewProps'
import { useNFTContextMenu } from 'wallet/src/features/nfts/useNftContextMenu'

// WALL-4875 TODO try to combine web and mobile versions
export function NftViewWithContextMenu(props: NftViewWithContextMenuProps): JSX.Element {
  const { item, owner } = props
  const { menuActions, onContextMenuPress } = useNFTContextMenu({
    contractAddress: item.contractAddress,
    tokenId: item.tokenId,
    owner,
    isSpam: item.isSpam,
    showNotification: true,
    chainId: fromGraphQLChain(item.chain) ?? undefined,
  })

  return (
    <Flex>
      <ContextMenu
        actions={menuActions}
        disabled={menuActions.length === 0}
        style={{ borderRadius: borderRadii.rounded16 }}
        onPress={onContextMenuPress}
      >
        <NftView {...props} />
      </ContextMenu>
    </Flex>
  )
}
