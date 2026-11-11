import { useRef, useState } from 'react'
import { categoriesFor } from '../lib/categories.js'
import { dayLabel, todayISO } from '../lib/format.js'
import DateField from './DateField.jsx'

const TYPES = [
  { id: 'expense', label: 'Expense', placeholder: 'Groceries, bus fare, rent…' },
  { id: 'income', label: 'Income', placeholder: 'Salary, freelance job, refund…' },
]

// Parent passes a `key` that changes when `entry` changes, so initial state is enough.
export default function EntryForm({ entry, defaultDate, markedDates, onSubmit, onCancel }) {
  const [type, setType] = useState(entry?.type ?? 'expense')
  const [description, setDescription] = useState(entry?.description ?? '')
  const [amount, setAmount] = useState(entry ? (entry.amount / 100).toFixed(2) : '')
  const [category, setCategory] = useState(entry?.category ?? categoriesFor(type)[0].id)
  const [date, setDate] = useState(entry?.date ?? defaultDate ?? todayISO())
  const descriptionRef = useRef(null)

  const current = TYPES.find((t) => t.id === type)
  const noun = current.label.toLowerCase()

  function switchType(next) {
    if (next === type) return
    setType(next)
    // Each type has its own category list.
    setCategory(categoriesFor(next)[0].id)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const cents = Math.round(parseFloat(amount) * 100)
    if (!description.trim() || !date || !(cents > 0)) return
    onSubmit({ type, description: description.trim(), amount: cents, category, date })
    if (!entry) {
      setDescription('')
      setAmount('')
      // Ready for the next entry without reaching for the mouse.
      descriptionRef.current?.focus()
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      {entry ? (
        <h2>Edit {noun}</h2>
      ) : (
        <div className="tabs" role="tablist" aria-label="Entry type">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === type}
              className="tab"
              onClick={() => switchType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <label className="field">
        <span>Description</span>
        <input
          type="text"
          ref={descriptionRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={current.placeholder}
          maxLength={80}
          required
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Amount</span>
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </label>
        <DateField label="Date" value={date} onChange={setDate} markedDates={markedDates} />
      </div>

      {date > todayISO() && (
        <p className="form-hint">
          Scheduled: this {noun} won't count toward your balance until {dayLabel(date)}.
        </p>
      )}

      <label className="field">
        <span>Category</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categoriesFor(type).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="form-actions">
        <button type="submit" className="btn primary">
          {entry ? 'Save changes' : `Add ${noun}`}
        </button>
        {entry && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
