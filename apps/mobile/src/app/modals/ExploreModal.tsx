import React from 'react'
import { useDispatch } from 'react-redux'
import { ExploreStackNavigator } from 'src/app/navigation/navigation'
import { closeModal } from 'src/features/modals/modalSlice'
import { useSporeColors } from 'ui/src'
import { Modal } from 'uniswap/src/components/modals/Modal'
import { ModalName } from 'uniswap/src/features/telemetry/constants'

export function ExploreModal(): JSX.Element {
  const colors = useSporeColors()
  const appDispatch = useDispatch()

  const onClose = (): void => {
    appDispatch(closeModal({ name: ModalName.Explore }))
  }

  return (
    <Modal
      blurredBackground
      fullScreen
      hideKeyboardOnDismiss
      renderBehindBottomInset
      renderBehindTopInset
      backgroundColor={colors.transparent.val}
      hideHandlebar={true}
      name={ModalName.Explore}
      onClose={onClose}
    >
      <ExploreStackNavigator />
    </Modal>
  )
}
