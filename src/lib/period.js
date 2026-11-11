import { daysToAverage, fromISO, monthKey, monthLabel, shiftMonth, toISO } from './format.js'

// The span of time the app is showing: one day ('YYYY-MM-DD') or one month ('YYYY-MM').
export const dayPeriod = (date) => ({ kind: 'day', key: date })
export const monthPeriod = (month) => ({ kind: 'month', key: month })

export function inPeriod(period, date) {
  return period.kind === 'day' ? date === period.key : monthKey(date) === period.key
}

export function shiftDay(iso, delta) {
  const d = fromISO(iso)
  d.setDate(d.getDate() + delta)
  return toISO(d)
}

export function shiftPeriod(period, delta) {
  return period.kind === 'day'
    ? dayPeriod(shiftDay(period.key, delta))
    : monthPeriod(shiftMonth(period.key, delta))
}

// The month a period falls in (the budget is always monthly).
export function periodMonth(period) {
  return period.kind === 'day' ? monthKey(period.key) : period.key
}

export function isCurrentPeriod(period, today) {
  return period.kind === 'day' ? period.key === today : period.key === monthKey(today)
}

export function periodLabel(period) {
  if (period.kind === 'month') return monthLabel(period.key)
  return fromISO(period.key).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// How the period reads in a sentence: "in November 2026" / "on Tue, November 10, 2026".
export function periodPhrase(period) {
  return `${period.kind === 'day' ? 'on' : 'in'} ${periodLabel(period)}`
}

export function daysInPeriod(period) {
  return period.kind === 'day' ? 1 : daysToAverage(period.key)
}

// Switch between day and month views, keeping the place you were looking at.
export function withKind(period, kind, today) {
  if (kind === period.kind) return period
  if (kind === 'month') return monthPeriod(periodMonth(period))
  return dayPeriod(period.key === monthKey(today) ? today : `${period.key}-01`)
}
