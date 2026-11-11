import { useEffect, useState } from 'react'
import { todayISO } from './format.js'

// Today's date ('YYYY-MM-DD'), kept current so scheduled entries start
// counting at midnight even if the app stays open.
export function useToday() {
  const [today, setToday] = useState(todayISO)

  useEffect(() => {
    const id = setInterval(() => setToday(todayISO()), 60_000)
    return () => clearInterval(id)
  }, [])

  return today
}
