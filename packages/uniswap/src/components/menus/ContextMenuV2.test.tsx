import { act, fireEvent } from '@testing-library/react-native'
// eslint-disable-next-line no-restricted-imports
import { View } from 'react-native'
import { ContextMenu, MenuOptionItem } from 'uniswap/src/components/menus/ContextMenuV2'
import { renderWithProviders } from 'uniswap/src/test/render'

describe('ContextMenu', () => {
  const mockMenuItems: MenuOptionItem[] = [
    {
      label: 'Option 1',
      onPress: jest.fn(),
    },
    {
      label: 'Option 2',
      onPress: jest.fn(),
      showDivider: true,
    },
  ]

  it('renders without error', () => {
    const tree = renderWithProviders(
      <ContextMenu menuItems={mockMenuItems}>
        <div>Trigger</div>
      </ContextMenu>,
    )

    expect(tree).toMatchSnapshot()
  })

  describe('opens the menu', () => {
    it('on right-click by default', () => {
      const { getByTestId, queryByText } = renderWithProviders(
        <ContextMenu menuItems={mockMenuItems}>
          <View testID="trigger">
            <div>Trigger</div>
          </View>
        </ContextMenu>,
      )

      const trigger = getByTestId('trigger')

      act(() => {
        fireEvent(trigger, 'contextMenu', {
          preventDefault: jest.fn(),
          stopPropagation: jest.fn(),
          clientX: 100,
          clientY: 150,
        })
      })

      expect(queryByText('Option 1')).toBeTruthy()
      expect(queryByText('Option 2')).toBeTruthy()
    })

    it('on left-click if onLeftClick is true', () => {
      const { getByTestId, queryByText } = renderWithProviders(
        <ContextMenu menuItems={mockMenuItems} onLeftClick>
          <View testID="trigger">
            <div>Trigger</div>
          </View>
        </ContextMenu>,
      )

      const trigger = getByTestId('trigger')

      act(() => {
        fireEvent(trigger, 'onMouseDown', {
          preventDefault: jest.fn(),
          stopPropagation: jest.fn(),
          clientX: 100,
          clientY: 150,
        })
      })
      expect(queryByText('Option 1')).toBeTruthy()
      expect(queryByText('Option 2')).toBeTruthy()
    })
  })

  describe('handles edge cases', () => {
    it('does not open the menu if no menuItems are provided', () => {
      const { getByTestId, queryByRole } = renderWithProviders(
        <ContextMenu menuItems={[]}>
          <View testID="trigger">
            <div>Trigger</div>
          </View>
        </ContextMenu>,
      )

      const trigger = getByTestId('trigger')

      act(() => {
        fireEvent.press(trigger)
      })

      const menu = queryByRole('menu')
      expect(menu).toBeFalsy()
    })

    it('does not crash if trigger element is not found', () => {
      const { queryByRole } = renderWithProviders(
        <ContextMenu menuItems={mockMenuItems}>
          <View testID="trigger">
            <div>Trigger</div>
          </View>
        </ContextMenu>,
      )

      const menu = queryByRole('menu')
      expect(menu).toBeFalsy()
    })
  })
})
