import { getCategory, isIncome } from '../lib/categories.js'
import { dayLabel, formatSigned } from '../lib/format.js'

const signed = (entry) => (isIncome(entry) ? entry.amount : -entry.amount)

// `entries` arrives sorted newest first; group consecutive rows by day.
function groupByDay(entries) {
  const groups = []
  for (const e of entries) {
    const last = groups[groups.length - 1]
    if (last && last.date === e.date) {
      last.items.push(e)
      last.net += signed(e)
    } else {
      groups.push({ date: e.date, items: [e], net: signed(e) })
    }
  }
  return groups
}

export default function TransactionList({ entries, emptyMessage, currency, today, editingId, onEdit, onDelete }) {
  if (entries.length === 0) return <p className="empty">{emptyMessage}</p>

  return (
    <div className="days">
      {groupByDay(entries).map((group) => (
        <section key={group.date} className={group.date > today ? 'scheduled' : undefined}>
          <header className="day-head">
            <h3>
              {dayLabel(group.date)}
              {group.date > today && <span className="tag">Scheduled</span>}
            </h3>
            <span className="num">{formatSigned(group.net, currency)}</span>
          </header>
          <ul className="rows">
            {group.items.map((e) => {
              const category = getCategory(e.category)
              return (
                <li key={e.id} className={`row${e.id === editingId ? ' editing' : ''}`}>
                  <span className="dot" style={{ background: category.color }} aria-hidden="true" />
                  <div className="row-text">
                    <span className="row-title">{e.description}</span>
                    <span className="row-meta">{category.name}</span>
                  </div>
                  <span className={`row-amount num${isIncome(e) ? ' income' : ''}`}>
                    {formatSigned(signed(e), currency)}
                  </span>
                  <div className="row-actions">
                    <button type="button" className="link" onClick={() => onEdit(e)}>
                      Edit<span className="sr-only"> {e.description}</span>
                    </button>
                    <button type="button" className="link danger" onClick={() => onDelete(e)}>
                      Delete<span className="sr-only"> {e.description}</span>
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
