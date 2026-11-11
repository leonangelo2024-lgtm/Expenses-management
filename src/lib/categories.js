export const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & dining', color: '#e07a3f' },
  { id: 'transport', name: 'Transport', color: '#3f8fd6' },
  { id: 'housing', name: 'Housing', color: '#8a6fd1' },
  { id: 'utilities', name: 'Utilities', color: '#d1a93a' },
  { id: 'shopping', name: 'Shopping', color: '#d65a8c' },
  { id: 'health', name: 'Health', color: '#3fae8a' },
  { id: 'entertainment', name: 'Entertainment', color: '#5b6fe0' },
  { id: 'other', name: 'Other', color: '#8b8b85' },
]

export const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary', color: '#4caf6e' },
  { id: 'freelance', name: 'Freelance', color: '#2fa3a3' },
  { id: 'investments', name: 'Investments', color: '#7fb23a' },
  { id: 'gifts', name: 'Gifts', color: '#c78ad6' },
  { id: 'other-income', name: 'Other income', color: '#8b8b85' },
]

const byId = new Map([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((c) => [c.id, c]))

export function categoriesFor(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

export function getCategory(id) {
  return byId.get(id) ?? byId.get('other')
}

// Entries saved before income existed have no `type`; they are expenses.
export function isIncome(entry) {
  return entry.type === 'income'
}
