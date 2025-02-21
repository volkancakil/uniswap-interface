import { useEffect, useRef, useState } from 'react'

export function useIsOffline(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const isOnlineRef = useRef(isOnline)

  const handleCheck = (): void => {
    const newStatus = navigator.onLine
    isOnlineRef.current = newStatus
    setIsOnline(newStatus)
  }

  useEffect(() => {
    window.addEventListener('online', handleCheck)
    window.addEventListener('offline', handleCheck)

    return () => {
      window.removeEventListener('online', handleCheck)
      window.removeEventListener('offline', handleCheck)
    }
  }, [])

  return !isOnline
}
