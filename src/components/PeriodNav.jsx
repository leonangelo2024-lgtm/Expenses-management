import { useRef, useState } from 'react'
import { monthKey } from '../lib/format.js'
import { dayPeriod, isCurrentPeriod, monthPeriod, periodLabel, shiftPeriod, withKind } from '../lib/period.js'
import { useDismiss } from '../lib/useDismiss.js'
import Calendar, { CalendarIcon } from './Calendar.jsx'

const KINDS = [
  { id: 'day', label: 'Day' },
  { id: 'month', label: 'Month' },
]

export default function PeriodNav({ period, today, markedDates, onChange }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef(null)
  const unit = period.kind === 'day' ? 'day' : 'month'
  useDismiss(open, anchor, () => setOpen(false))

  function pick(next) {
    onChange(next)
    setOpen(false)
  }

  return (
    <nav className="period-nav" aria-label="Date">
      <div className="period-step" ref={anchor}>
        <button
          type="button"
          className="btn icon"
          onClick={() => onChange(shiftPeriod(period, -1))}
          aria-label={`Previous ${unit}`}
        >
          ‹
        </button>
        <button
          type="button"
          className="btn period-label"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <CalendarIcon />
          <span aria-live="polite">{periodLabel(period)}</span>
        </button>
        <button
          type="button"
          className="btn icon"
          onClick={() => onChange(shiftPeriod(period, 1))}
          aria-label={`Next ${unit}`}
        >
          ›
        </button>
        {open && (
          <div className="card popover" role="dialog" aria-label="Choose a date or month">
            <Calendar
              selectedDay={period.kind === 'day' ? period.key : null}
              selectedMonth={period.kind === 'month' ? period.key : null}
              startMonths={period.kind === 'month'}
              today={today}
              markedDates={markedDates}
              onPickDay={(iso) => pick(dayPeriod(iso))}
              onPickMonth={(key) => pick(monthPeriod(key))}
            />
          </div>
        )}
      </div>

      <div className="tabs compact" role="tablist" aria-label="View by">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            role="tab"
            aria-selected={k.id === period.kind}
            className="tab"
            onClick={() => onChange(withKind(period, k.id, today))}
          >
            {k.label}
          </button>
        ))}
      </div>

      {!isCurrentPeriod(period, today) && (
        <button
          type="button"
          className="link"
          onClick={() => onChange(period.kind === 'day' ? dayPeriod(today) : monthPeriod(monthKey(today)))}
        >
          {period.kind === 'day' ? 'Today' : 'This month'}
        </button>
      )}
    </nav>
  )
}
