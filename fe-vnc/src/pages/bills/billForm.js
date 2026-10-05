import * as yup from 'yup'

// Same limits as the backend (src/app/validations/billValidation.ts).
const MAX_TEXT = 191

const optionalText = (label) =>
  yup
    .string()
    .trim()
    .max(MAX_TEXT, `${label} must be at most ${MAX_TEXT} characters`)

// Inputs are plain text boxes, so '' means "not filled in".
const number = (label) =>
  yup
    .number()
    .transform((value, original) => (original === '' ? undefined : value))
    .typeError(`${label} must be a number`)
    .min(0, `${label} cannot be negative`)

const wholeNumber = (label) =>
  number(label).integer(`${label} must be a whole number`)

const picked = (message) => yup.object().nullable().required(message)

// Today's date as 'YYYY-MM-DD' in local time (toISOString would use UTC).
export const todayText = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

const billItemSchema = yup.object({
  seller: picked('Pick a seller'),
  item: picked('Pick an item'),
  seller_bill_no: optionalText('Seller bill number'),
  quantity_bags: wholeNumber('Bags').required('Required'),
  packaging: wholeNumber('Packaging').required('Required'),
  weight: number('Weight').required('Required'),
  souda_rate: number('Rate').required('Required'),
  amount: number('Amount').required('Required'),
  seller_commision_amount: number('Commission'),
})

export const billSchema = yup.object({
  bill_date: yup.string().required('Please pick a bill date'),
  buyer: picked('Please pick a buyer'),
  transporter: picked('Please pick a transporter'),
  lorry_number: optionalText('Lorry number'),
  lorry_driver_contact: optionalText('Driver contact'),
  freight: number('Freight'),
  advance_freight: number('Advance freight'),
  lorry_brokerage: number('Lorry brokerage'),
  buyer_commision_amount: number('Buyer commission'),
  bill_items: yup.array(billItemSchema).min(1, 'Add at least one item'),
})

// Each row needs a steady React key, even before it's saved.
let nextRowKey = 1
const rowKey = () => nextRowKey++

const asText = (value) => (value == null ? '' : String(value))

export const emptyBillItem = () => ({
  key: rowKey(),
  seller: null,
  item: null,
  seller_bill_no: '',
  quantity_bags: '',
  packaging: '',
  weight: '',
  souda_rate: '',
  amount: '',
  seller_commision_amount: '',
})

export const toFormValues = (bill) => ({
  // The API sends a full timestamp; the date box only wants 'YYYY-MM-DD'.
  bill_date: bill?.bill_date ? bill.bill_date.slice(0, 10) : todayText(),
  buyer: bill?.buyer ?? null,
  transporter: bill?.transporter ?? null,
  lorry_number: asText(bill?.lorry_number),
  lorry_driver_contact: asText(bill?.lorry_driver_contact),
  freight: asText(bill?.freight),
  advance_freight: asText(bill?.advance_freight),
  lorry_brokerage: asText(bill?.lorry_brokerage),
  buyer_commision_amount: asText(bill?.buyer_commision_amount),
  bill_items: bill?.bill_items?.length
    ? bill.bill_items.map((row) => ({
        key: rowKey(),
        seller: row.seller,
        item: row.item,
        seller_bill_no: asText(row.seller_bill_no),
        quantity_bags: asText(row.quantity_bags),
        packaging: asText(row.packaging),
        weight: asText(row.weight),
        souda_rate: asText(row.souda_rate),
        amount: asText(row.amount),
        seller_commision_amount: asText(row.seller_commision_amount),
      }))
    : [emptyBillItem()],
})

// Turns a typed value into a number; blank or junk counts as 0 for totals.
export const toNumber = (value) => {
  const parsed = Number(value)
  return value === '' || Number.isNaN(parsed) ? 0 : parsed
}

// The API wants null (not '') for empty optional text.
const textOrNull = (value) => value.trim() || null

export const sumBy = (rows, field) =>
  rows.reduce((total, row) => total + toNumber(row[field]), 0)

// A typed value as a number, or null when blank or not a number.
const filled = (value) => {
  const parsed = Number(value)
  return value === '' || Number.isNaN(parsed) ? null : parsed
}

// Rounds to paise and turns it back into text for the input box.
const toMoneyText = (value) =>
  value == null ? '' : String(Math.round(value * 100) / 100)

const product = (a, b) => (a == null || b == null ? null : a * b)

// Fills in the worked-out values after `field` changes on a row.
// Amount and commission are only recalculated when their inputs change,
// so a hand-typed amount stays until bags, packing, weight or rate change.
// `sellerRate` is the company's seller commission in rupees per quintal.
export const recalcBillItem = (row, field, sellerRate) => {
  const next = { ...row }
  if (field === 'quantity_bags' || field === 'packaging') {
    // Weight in quintals: bags × packing (kg per bag) / 100.
    const kg = product(filled(next.quantity_bags), filled(next.packaging))
    next.weight = toMoneyText(kg == null ? null : kg / 100)
  }
  if (['quantity_bags', 'packaging', 'weight', 'souda_rate'].includes(field)) {
    const weight = filled(next.weight)
    next.amount = toMoneyText(product(weight, filled(next.souda_rate)))
    next.seller_commision_amount = toMoneyText(product(weight, sellerRate))
  }
  return next
}

// Buyer commission comes from the total weight of all rows.
// `buyerRate` is the company's buyer commission in rupees per quintal.
export const buyerCommissionFor = (rows, buyerRate) =>
  buyerRate != null && rows.some((row) => filled(row.weight) != null)
    ? toMoneyText(sumBy(rows, 'weight') * buyerRate)
    : ''

// Every field is sent, so the same body works for POST and PUT.
// Blank amounts are sent as 0, since the API doesn't accept null for them.
export const toRequestBody = (values) => ({
  buyerId: values.buyer.id,
  transporter_id: values.transporter.id,
  bill_date: values.bill_date,
  // The bill total is the sum of its item amounts.
  total_amount: sumBy(values.bill_items, 'amount'),
  buyer_commision_amount: toNumber(values.buyer_commision_amount),
  lorry_number: textOrNull(values.lorry_number),
  lorry_driver_contact: textOrNull(values.lorry_driver_contact),
  freight: toNumber(values.freight),
  advance_freight: toNumber(values.advance_freight),
  lorry_brokerage: toNumber(values.lorry_brokerage),
  bill_items: values.bill_items.map((row) => ({
    sellerId: row.seller.id,
    itemId: row.item.id,
    seller_bill_no: textOrNull(row.seller_bill_no),
    quantity_bags: Number(row.quantity_bags),
    packaging: Number(row.packaging),
    weight: Number(row.weight),
    souda_rate: Number(row.souda_rate),
    amount: Number(row.amount),
    seller_commision_amount: toNumber(row.seller_commision_amount),
  })),
})

const moneyFormat = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})
const countFormat = new Intl.NumberFormat('en-IN')

export const formatMoney = (value) =>
  value == null ? '—' : moneyFormat.format(value)
export const formatCount = (value) => countFormat.format(value)
