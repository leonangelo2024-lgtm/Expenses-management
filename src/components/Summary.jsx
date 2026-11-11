import { formatMoney, formatSigned, monthLabel } from '../lib/format.js'

function comparison(total, prevTotal, prev) {
  if (prevTotal === 0) return `Nothing recorded ${prev.when}`
  if (total === prevTotal) return `Same as ${prev.name}`
  const pct = Math.round((Math.abs(total - prevTotal) / prevTotal) * 100)
  return `${pct}% ${total > prevTotal ? 'more' : 'less'} than ${prev.name}`
}

export default function Summary({
  kind,
  prev,
  days,
  income,
  incomeCount,
  scheduledNet,
  scheduledCount,
  total,
  prevTotal,
  budgetMonth,
  budgetSpent,
  budget,
  onBudgetChange,
  currency,
}) {
  const money = (cents) => formatMoney(cents, currency)
  const balance = income - total
  const remaining = budget - budgetSpent
  const used = budget > 0 ? Math.min(budgetSpent / budget, 1) : 0

  return (
    <section className="summary" aria-label="Summary">
      <div className="card stat">
        <span className="stat-label">Income</span>
        <strong className="stat-value">{money(income)}</strong>
        <span className="stat-note">
          {incomeCount} {incomeCount === 1 ? 'entry' : 'entries'}
          {kind === 'month' ? ' this month' : ' this day'}
        </span>
      </div>

      <div className="card stat">
        <span className="stat-label">Spent</span>
        <strong className="stat-value">{money(total)}</strong>
        <span className="stat-note">{comparison(total, prevTotal, prev)}</span>
      </div>

      <div className="card stat">
        <span className="stat-label">Balance</span>
        <strong className={`stat-value${balance < 0 ? ' over' : ''}`}>{formatSigned(balance, currency)}</strong>
        {kind === 'month' && (
          <span className="stat-note">Spending {money(Math.round(total / days))} a day on average</span>
        )}
        {scheduledCount > 0 && (
          <span className="stat-note scheduled-note">
            {formatSigned(balance + scheduledNet, currency)} after {scheduledCount} scheduled{' '}
            {scheduledCount === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      <div className="card stat">
        <span className="stat-label">
          {budget > 0 && remaining < 0 ? 'Over budget' : 'Budget left'}
          {kind === 'day' && ` in ${monthLabel(budgetMonth, { month: 'long' })}`}
        </span>
        <strong className={`stat-value${budget > 0 && remaining < 0 ? ' over' : ''}`}>
          {budget > 0 ? money(Math.abs(remaining)) : '—'}
        </strong>
        {budget > 0 && (
          <div
            className={`meter${remaining < 0 ? ' over' : ''}`}
            role="progressbar"
            aria-label="Budget used"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(used * 100)}
          >
            <div style={{ width: `${used * 100}%` }} />
          </div>
        )}
        <label className="budget-input">
          <span>Monthly budget</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            placeholder="Not set"
            value={budget > 0 ? budget / 100 : ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value)
              onBudgetChange(value > 0 ? Math.round(value * 100) : 0)
            }}
          />
        </label>
      </div>
    </section>
  )
}
