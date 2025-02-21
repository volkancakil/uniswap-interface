import ReactDOM from 'react-dom'
import { NetworkFilter } from 'uniswap/src/components/network/NetworkFilter'
import { SUPPORTED_CHAIN_IDS } from 'uniswap/src/features/chains/types'
import { renderWithProviders } from 'uniswap/src/test/render'
import { act } from 'uniswap/src/test/test-utils'

ReactDOM.createPortal = jest.fn((element) => {
  return element as React.ReactPortal
})

jest.mock('uniswap/src/features/unichain/hooks/useUnichainTooltipVisibility', () => {
  return {
    useUnichainTooltipVisibility: (): { shouldShowUnichainNetworkSelectorTooltip: boolean } => {
      return { shouldShowUnichainNetworkSelectorTooltip: true }
    },
  }
})

describe(NetworkFilter, () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders a NetworkFilter', async () => {
    const tree = renderWithProviders(
      <NetworkFilter chainIds={SUPPORTED_CHAIN_IDS} selectedChain={null} onPressChain={() => null} />,
    )

    await act(async () => {
      jest.runAllTimers()
    })

    expect(tree).toMatchSnapshot()
  })
})
