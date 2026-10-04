export { formatCount, formatMoney } from '../bills/billForm.js'

// Indian financial year (1 April to 31 March) that today falls in, as 'YYYY-MM-DD'.
// Matches the backend default, so the page and the API agree on the range.
export function currentFinancialYear() {
  const now = new Date()
  const startYear =
    now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  return { from: `${startYear}-04-01`, to: `${startYear + 1}-03-31` }
}

// Dates are date-only values (UTC midnight), so show them in UTC.
const dateFormat = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeZone: 'UTC',
})
export const formatDate = (value) => dateFormat.format(new Date(value))

const weightFormat = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
export const formatWeight = (value) => weightFormat.format(value)

// "GSTIN 27ABCDE1234F1Z5", or '' when there is none. City has its own column.
export const partyMeta = (party) =>
  party?.gst_number ? `GSTIN ${party.gst_number}` : ''

// Numbers line up in columns and never wrap.
export const numericCell = {
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
}
