// Indian financial year: 1 April to 31 March. Dates are date-only (UTC midnight),
// to match the date-only `bill_date` column.
export function financialYearOf(date: Date) {
  const startYear =
    date.getUTCMonth() >= 3 ? date.getUTCFullYear() : date.getUTCFullYear() - 1
  return {
    from: new Date(Date.UTC(startYear, 3, 1)),
    to: new Date(Date.UTC(startYear + 1, 2, 31)),
  }
}

// Today's date as a date-only value, using the server's local calendar day.
export function today() {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

// 'YYYY-MM-DD', for sending date-only values back to the client.
export function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10)
}
