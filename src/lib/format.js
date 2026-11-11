// Amounts are stored as integer cents, so only two-decimal currencies are offered.
export const CURRENCIES = ['LKR', 'USD', 'EUR', 'GBP', 'INR', 'PHP', 'AUD', 'CAD', 'SGD']

const pad = (n) => String(n).padStart(2, '0')

export function formatMoney(cents, currency) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(cents / 100)
}

// Always shows + or − (except for zero), for values where direction matters.
export function formatSigned(cents, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    signDisplay: 'exceptZero',
  }).format(cents / 100)
}

// Dates are 'YYYY-MM-DD' strings in local time; months are 'YYYY-MM'.
export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayISO() {
  return toISO(new Date())
}

// 'YYYY-MM-DD' → local Date at midnight.
export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function monthKey(iso) {
  return iso.slice(0, 7)
}

export function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

export function monthLabel(key, options = { month: 'long', year: 'numeric' }) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, options)
}

export function dayLabel(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// Days to average over: days so far for the current month, the full month otherwise.
export function daysToAverage(key) {
  const today = todayISO()
  if (key === monthKey(today)) return Number(today.slice(8))
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export function toCSV(entries) {
  const cell = (v) => `"${String(v).replaceAll('"', '""')}"`
  const rows = entries.map((e) =>
    [
      e.date,
      e.type === 'income' ? 'income' : 'expense',
      cell(e.description),
      cell(e.category),
      (e.amount / 100).toFixed(2),
    ].join(','),
  )
  return ['date,type,description,category,amount', ...rows].join('\n')
}
