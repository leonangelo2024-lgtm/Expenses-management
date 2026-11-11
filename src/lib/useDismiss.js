import { useEffect } from 'react'

// Closes a popover on a pointer press outside `anchor` or on Escape.
export function useDismiss(open, anchor, close) {
  useEffect(() => {
    if (!open) return
    const onPointer = (e) => {
      if (!anchor.current?.contains(e.target)) close()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, anchor, close])
}
