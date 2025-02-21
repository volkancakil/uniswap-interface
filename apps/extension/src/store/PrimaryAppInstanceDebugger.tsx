import { useIsPrimaryAppInstance } from 'src/store/storeSynchronization'

// This is a dev-only component that renders a small green/red dot in the bottom right corner of the screen
// to indicate whether the current app instance is the primary one.
export default function PrimaryAppInstanceDebugger(): JSX.Element | null {
  const isPrimaryAppInstance = useIsPrimaryAppInstance()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        borderRadius: '5px',
        width: '5px',
        height: '5px',
        zIndex: 999999999999999,
        background: isPrimaryAppInstance ? 'green' : 'red',
        color: 'white',
      }}
      title={`IsPrimaryAppInstance: ${isPrimaryAppInstance}`}
    />
  )
}
