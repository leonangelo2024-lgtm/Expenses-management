import { useEffect, useMemo, useState } from 'react'
import CategoryBreakdown from './components/CategoryBreakdown.jsx'
import EntryForm from './components/EntryForm.jsx'
import PeriodNav from './components/PeriodNav.jsx'
import Summary from './components/Summary.jsx'
import TransactionList from './components/TransactionList.jsx'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, isIncome } from './lib/categories.js'
import { CURRENCIES, monthKey, monthLabel, toCSV, todayISO } from './lib/format.js'
import {
  dayPeriod,
  daysInPeriod,
  inPeriod,
  monthPeriod,
  periodMonth,
  periodPhrase,
  shiftPeriod,
} from './lib/period.js'
import { displayName, userKey } from './lib/auth.js'
import { useLocalStorage } from './lib/useLocalStorage.js'
import { useToday } from './lib/useToday.js'

const sum = (list) => list.reduce((acc, e) => acc + e.amount, 0)

export default function App({ user, onSignOut }) {
  // Holds both expenses and income; the storage key predates income.
  const [expenses, setExpenses] = useLocalStorage(userKey(user, 'expenses.v1'), [])
  const [settings, setSettings] = useLocalStorage(userKey(user, 'expenses.settings.v1'), {
    currency: 'LKR',
    budget: 0,
  })
  const [period, setPeriod] = useState(() => monthPeriod(monthKey(todayISO())))
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [deleted, setDeleted] = useState(null)
  const today = useToday()

  const periodEntries = useMemo(
    () =>
      expenses
        .filter((e) => inPeriod(period, e.date))
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt),
    [expenses, period],
  )
  // Entries dated after today are scheduled: listed, but not counted until their day comes.
  const counts = (e) => e.date <= today
  const posted = periodEntries.filter(counts)
  const scheduled = periodEntries.filter((e) => !counts(e))
  const periodExpenses = posted.filter((e) => !isIncome(e))
  const periodIncome = posted.filter(isIncome)
  const total = sum(periodExpenses)
  const scheduledNet = sum(scheduled.filter(isIncome)) - sum(scheduled.filter((e) => !isIncome(e)))

  const prevPeriod = shiftPeriod(period, -1)
  const prevTotal = sum(expenses.filter((e) => !isIncome(e) && counts(e) && inPeriod(prevPeriod, e.date)))
  // The budget is monthly, even when looking at a single day.
  const budgetMonth = periodMonth(period)
  const budgetSpent = sum(expenses.filter((e) => !isIncome(e) && counts(e) && monthKey(e.date) === budgetMonth))
  const markedDates = useMemo(() => new Set(expenses.map((e) => e.date)), [expenses])
  const prev =
    period.kind === 'day'
      ? { when: 'the day before', name: 'the day before' }
      : { when: `in ${monthLabel(prevPeriod.key, { month: 'long' })}`, name: monthLabel(prevPeriod.key, { month: 'long' }) }
  // New entries default to the day on show, or to today when looking at a month.
  const defaultDate = period.kind === 'day' ? period.key : today

  const needle = query.trim().toLowerCase()
  const visible = periodEntries.filter(
    (e) =>
      (categoryFilter === 'all' || e.category === categoryFilter) &&
      (!needle || e.description.toLowerCase().includes(needle)),
  )
  const filtering = needle !== '' || categoryFilter !== 'all'

  // The undo offer expires on its own.
  useEffect(() => {
    if (!deleted) return
    const timer = setTimeout(() => setDeleted(null), 6000)
    return () => clearTimeout(timer)
  }, [deleted])

  function saveExpense(fields) {
    if (editing) {
      setExpenses((list) => list.map((e) => (e.id === editing.id ? { ...e, ...fields } : e)))
      setEditing(null)
    } else {
      setExpenses((list) => [...list, { ...fields, id: crypto.randomUUID(), createdAt: Date.now() }])
    }
    // Follow the entry so it is visible after saving.
    if (!inPeriod(period, fields.date)) {
      setPeriod(period.kind === 'day' ? dayPeriod(fields.date) : monthPeriod(monthKey(fields.date)))
    }
  }

  function deleteExpense(expense) {
    setExpenses((list) => list.filter((e) => e.id !== expense.id))
    setDeleted(expense)
    if (editing?.id === expense.id) setEditing(null)
  }

  function undoDelete() {
    setExpenses((list) => [...list, deleted])
    setDeleted(null)
  }

  function exportCSV() {
    const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date))
    const url = URL.createObjectURL(new Blob([toCSV(sorted)], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'expenses.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>Expenses</h1>
        <div className="topbar-actions">
          <label className="sr-only" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            value={settings.currency}
            onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
          >
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button type="button" className="btn" onClick={exportCSV} disabled={expenses.length === 0}>
            Export CSV
          </button>
        </div>
      </header>

      <PeriodNav period={period} today={today} markedDates={markedDates} onChange={setPeriod} />

      <Summary
        kind={period.kind}
        prev={prev}
        days={daysInPeriod(period)}
        income={sum(periodIncome)}
        incomeCount={periodIncome.length}
        scheduledNet={scheduledNet}
        scheduledCount={scheduled.length}
        total={total}
        prevTotal={prevTotal}
        budgetMonth={budgetMonth}
        budgetSpent={budgetSpent}
        budget={settings.budget}
        onBudgetChange={(budget) => setSettings((s) => ({ ...s, budget }))}
        currency={settings.currency}
      />

      <div className="columns">
        <aside className="side">
          <EntryForm
            key={editing?.id ?? `new-${defaultDate}`}
            entry={editing}
            defaultDate={defaultDate}
            markedDates={markedDates}
            onSubmit={saveExpense}
            onCancel={() => setEditing(null)}
          />
          <CategoryBreakdown expenses={periodExpenses} total={total} currency={settings.currency} />
        </aside>

        <main className="card list">
          <div className="list-head">
            <h2>Transactions</h2>
            <div className="filters">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                aria-label="Search transactions"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="all">All categories</option>
                <optgroup label="Expenses">
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Income">
                  {INCOME_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
          <TransactionList
            entries={visible}
            emptyMessage={
              filtering && periodEntries.length > 0
                ? 'Nothing matches your search or filter.'
                : `Nothing recorded ${periodPhrase(period)} yet. Add an expense or income to get started.`
            }
            currency={settings.currency}
            today={today}
            editingId={editing?.id}
            onEdit={setEditing}
            onDelete={deleteExpense}
          />
        </main>
      </div>

      <footer className="account" aria-label="Account">
        <span className="avatar" aria-hidden="true">
          {displayName(user).charAt(0).toUpperCase()}
        </span>
        <span className="user-name" title={`Signed in as ${displayName(user)}`}>
          {displayName(user)}
        </span>
        <button type="button" className="btn" onClick={onSignOut}>
          Sign out
        </button>
      </footer>

      {deleted && (
        <div className="toast" role="status">
          <span>Deleted “{deleted.description}”</span>
          <button type="button" className="link" onClick={undoDelete}>
            Undo
          </button>
        </div>
      )}
    </div>
  )
}
