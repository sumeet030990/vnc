import { z } from 'zod'

// Text columns are VARCHAR(191) in the database.
const MAX_TEXT = 191

const optionalText = (label: string) =>
  z
    .string({ error: `${label} must be text` })
    .trim()
    .max(MAX_TEXT, { error: `${label} must be at most ${MAX_TEXT} characters` })
    .nullable()

const id = (label: string) =>
  z
    .int({ error: `${label} is required` })
    .positive({ error: `${label} is invalid` })

const count = (label: string) =>
  z
    .int({ error: `${label} must be a whole number` })
    .min(0, { error: `${label} cannot be negative` })

const money = (label: string) =>
  z
    .number({ error: `${label} must be a number` })
    .min(0, { error: `${label} cannot be negative` })

const queryId = (label: string) =>
  z.coerce
    .number({ error: `${label} must be a number` })
    .int({ error: `${label} must be a whole number` })
    .positive({ error: `${label} is invalid` })

// The bill date arrives as 'YYYY-MM-DD' and is saved as a date-only column.
const billDate = () =>
  z.iso
    .date({ error: 'Bill date must be a date like 2026-10-04' })
    .transform((value) => new Date(value))

const billItemSchema = z.object({
  sellerId: id('Seller'),
  itemId: id('Item'),
  seller_bill_no: optionalText('Seller bill number').optional(),
  quantity_bags: count('Quantity (bags)'),
  packaging: count('Packaging'),
  weight: money('Weight'),
  souda_rate: money('Souda rate'),
  amount: money('Amount'),
  // Left out, the database saves 0.
  seller_commision_amount: money('Seller commission amount').optional(),
})

const billItems = z
  .array(billItemSchema, { error: 'Bill items must be a list' })
  .min(1, { error: 'Add at least one bill item' })

export const billIdParamsSchema = z.object({
  id: queryId('Bill id'),
})

export const listBillsQuerySchema = z.object({
  page: z.coerce
    .number({ error: 'Page must be a number' })
    .int({ error: 'Page must be a whole number' })
    .min(1, { error: 'Page must be 1 or more' })
    .default(1),
  pageSize: z.coerce
    .number({ error: 'Page size must be a number' })
    .int({ error: 'Page size must be a whole number' })
    .min(1, { error: 'Page size must be 1 or more' })
    .max(100, { error: 'Page size must be 100 or less' })
    .default(20),
  buyerId: queryId('Buyer').optional(),
  transporter_id: queryId('Transporter').optional(),
})

export const createBillSchema = z.object({
  buyerId: id('Buyer'),
  transporter_id: id('Transporter'),
  // Left out, the database uses today's date.
  bill_date: billDate().optional(),
  total_amount: money('Total amount'),
  // Left out, the database saves 0 for these amounts.
  buyer_commision_amount: money('Buyer commission amount').optional(),
  lorry_number: optionalText('Lorry number').optional(),
  lorry_driver_contact: optionalText('Lorry driver contact').optional(),
  freight: money('Freight').optional(),
  advance_freight: money('Advance freight').optional(),
  lorry_brokerage: money('Lorry brokerage').optional(),
  bill_items: billItems,
})

// PUT replaces the whole bill, including its full list of items.
export const replaceBillSchema = z.object({
  buyerId: id('Buyer'),
  transporter_id: id('Transporter'),
  bill_date: billDate(),
  total_amount: money('Total amount'),
  buyer_commision_amount: money('Buyer commission amount'),
  lorry_number: optionalText('Lorry number'),
  lorry_driver_contact: optionalText('Lorry driver contact'),
  freight: money('Freight'),
  advance_freight: money('Advance freight'),
  lorry_brokerage: money('Lorry brokerage'),
  bill_items: billItems,
})

// PATCH: send only what changes. If bill_items is sent, it replaces the whole list.
export const updateBillSchema = replaceBillSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: 'Send at least one field to update',
  })

export type BillIdParams = z.infer<typeof billIdParamsSchema>
export type ListBillsQuery = z.infer<typeof listBillsQuerySchema>
export type BillItemInput = z.infer<typeof billItemSchema>
export type CreateBillInput = z.infer<typeof createBillSchema>
export type ReplaceBillInput = z.infer<typeof replaceBillSchema>
export type UpdateBillInput = z.infer<typeof updateBillSchema>
