import { getCategory } from '../lib/categories.js'
import { formatMoney } from '../lib/format.js'

export default function CategoryBreakdown({ expenses, total, currency }) {
  const totals = new Map()
  for (const e of expenses) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
  const rows = [...totals].sort((a, b) => b[1] - a[1])

  return (
    <section className="card">
      <h2>Spending by category</h2>
      {rows.length === 0 ? (
        <p className="empty">Your spending by category will show up here.</p>
      ) : (
        <ul className="breakdown">
          {rows.map(([id, amount]) => {
            const category = getCategory(id)
            const share = amount / total
            return (
              <li key={id}>
                <div className="breakdown-head">
                  <span>{category.name}</span>
                  <span className="num">
                    {formatMoney(amount, currency)}
                    <small>{Math.round(share * 100)}%</small>
                  </span>
                </div>
                <div className="bar">
                  <div style={{ width: `${share * 100}%`, background: category.color }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
