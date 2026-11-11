import { useId, useRef, useState } from 'react'
import { fromISO, todayISO } from '../lib/format.js'
import { useDismiss } from '../lib/useDismiss.js'
import Calendar, { CalendarIcon } from './Calendar.jsx'

const shortDate = (iso) =>
  fromISO(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

// A form field that picks a date ('YYYY-MM-DD') with the app's calendar.
export default function DateField({ label, value, onChange, markedDates }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef(null)
  const labelId = useId()
  useDismiss(open, anchor, () => setOpen(false))

  return (
    <div className="field date-field" ref={anchor}>
      <span id={labelId}>{label}</span>
      <button
        type="button"
        className="date-trigger"
        aria-labelledby={`${labelId} ${labelId}-value`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span id={`${labelId}-value`}>{shortDate(value)}</span>
        <CalendarIcon />
      </button>
      {open && (
        <div className="card popover align-end" role="dialog" aria-label={`Choose ${label.toLowerCase()}`}>
          <Calendar
            selectedDay={value}
            today={todayISO()}
            markedDates={markedDates}
            onPickDay={(iso) => {
              onChange(iso)
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
