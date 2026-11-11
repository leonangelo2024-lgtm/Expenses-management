import { useEffect, useState } from 'react'

// useState that persists to localStorage. Falls back to in-memory state
// if storage is unavailable (private mode, quota exceeded).
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initialValue : JSON.parse(raw)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Nothing useful to do; the app keeps working for this session.
    }
  }, [key, value])

  return [value, setValue]
}
