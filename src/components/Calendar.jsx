import { useMemo, useState } from 'react'
import { fromISO, monthKey, monthLabel, shiftMonth, toISO } from '../lib/format.js'

// Weekday headings, Monday first (1 Jan 2024 was a Monday).
const WEEKDAYS = Array.from({ length: 7 }, (_, i) =>
  new Date(2024, 0, 1 + i).toLocaleDateString(undefined, { weekday: 'short' }),
)

const fullDate = (iso) =>
  fromISO(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })

export function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 8.5h14M7 2.75v3.5M13 2.75v3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/**
 * A month grid for picking a day, with a 12-month view behind the title.
 * - selectedDay / selectedMonth: what to highlight ('YYYY-MM-DD' / 'YYYY-MM')
 * - onPickDay(iso): a day was chosen
 * - onPickMonth(key): optional; when given, months can be chosen as a whole.
 *   Without it, choosing a month just opens that month's days.
 */
export default function Calendar({
  selectedDay = null,
  selectedMonth = null,
  startMonths = false,
  today,
  markedDates = new Set(),
  onPickDay,
  onPickMonth,
}) {
  const [mode, setMode] = useState(startMonths ? 'months' : 'days')
  const [view, setView] = useState(selectedMonth ?? monthKey(selectedDay ?? today)) // the 'YYYY-MM' on show
  const markedMonths = useMemo(() => new Set([...markedDates].map(monthKey)), [markedDates])

  if (mode === 'months') {
    const year = view.slice(0, 4)
    return (
      <div className="calendar">
        <div className="cal-head">
          <button type="button" className="btn icon" onClick={() => setView(shiftMonth(view, -12))} aria-label="Previous year">
            ‹
          </button>
          <span className="cal-title">{year}</span>
          <button type="button" className="btn icon" onClick={() => setView(shiftMonth(view, 12))} aria-label="Next year">
            ›
          </button>
        </div>
        <div className="cal-months">
          {Array.from({ length: 12 }, (_, i) => {
            const key = `${year}-${String(i + 1).padStart(2, '0')}`
            const selected = selectedMonth === key
            return (
              <button
                key={key}
                type="button"
                className={`cal-cell${selected ? ' selected' : ''}${key === monthKey(today) ? ' today' : ''}`}
                aria-pressed={selected}
                aria-label={monthLabel(key)}
                onClick={() => {
                  if (onPickMonth) return onPickMonth(key)
                  setView(key)
                  setMode('days')
                }}
              >
                {monthLabel(key, { month: 'short' })}
                {markedMonths.has(key) && <span className="cal-dot" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        <div className="cal-foot">
          <button type="button" className="link" onClick={() => setMode('days')}>
            {onPickMonth ? 'Pick a day instead' : 'Back to days'}
          </button>
        </div>
      </div>
    )
  }

  const first = fromISO(`${view}-01`)
  const blanks = (first.getDay() + 6) % 7 // Monday-first grid
  const length = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()

  return (
    <div className="calendar">
      <div className="cal-head">
        <button type="button" className="btn icon" onClick={() => setView(shiftMonth(view, -1))} aria-label="Previous month">
          ‹
        </button>
        <button type="button" className="cal-title link" onClick={() => setMode('months')} title="Choose a month">
          {monthLabel(view)}
        </button>
        <button type="button" className="btn icon" onClick={() => setView(shiftMonth(view, 1))} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="cal-grid">
        {WEEKDAYS.map((w) => (
          <span key={w} className="cal-weekday" aria-hidden="true">
            {w}
          </span>
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length }, (_, i) => {
          const iso = toISO(new Date(first.getFullYear(), first.getMonth(), i + 1))
          const selected = selectedDay === iso
          return (
            <button
              key={iso}
              type="button"
              className={`cal-cell${selected ? ' selected' : ''}${iso === today ? ' today' : ''}`}
              aria-pressed={selected}
              aria-label={fullDate(iso)}
              onClick={() => onPickDay(iso)}
            >
              {i + 1}
              {markedDates.has(iso) && <span className="cal-dot" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
      <div className="cal-foot">
        {onPickMonth && (
          <button type="button" className="link" onClick={() => onPickMonth(view)}>
            Show all of {monthLabel(view, { month: 'long' })}
          </button>
        )}
        <button type="button" className="link cal-today" onClick={() => onPickDay(today)}>
          Today
        </button>
      </div>
    </div>
  )
}
