import { Prisma } from '../../generated/prisma/client'
import { toDateOnly } from '../../lib/financialYear'
import { round2 } from '../../lib/round'
import { HttpError } from '../../lib/httpError'
import prisma, { DbClient } from '../../lib/prisma'
import * as billItemsRepository from '../repositories/billItemsRepository'
import * as billRepository from '../repositories/billRepository'
import {
  BillItemInput,
  CreateBillInput,
  ListBillsQuery,
  ReplaceBillInput,
  UpdateBillInput,
} from '../validations/billValidation'
import { ReportRangeQuery } from '../validations/reportValidation'

// Reads a typed date like 2026-10-04, 04-10-2026 or 4/10/2026 (day first).
// Returns null when the text isn't a real date.
function parseSearchDate(text: string) {
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text)
  const dayFirst = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(text)
  let parts: number[]
  if (iso) parts = [iso[1], iso[2], iso[3]].map(Number)
  else if (dayFirst) parts = [dayFirst[3], dayFirst[2], dayFirst[1]].map(Number)
  else return null

  const [year, month, day] = parts as [number, number, number]
  const date = new Date(Date.UTC(year, month - 1, day))
  // Rejects dates like 31-02-2026, which Date would roll into March.
  return date.getUTCDate() === day && date.getUTCMonth() === month - 1
    ? date
    : null
}

// One search box looks at party names, the bill id, seller bill numbers and the bill date.
function billSearchFilter(search: string): Prisma.BillsWhereInput {
  const name = { name: { contains: search } }
  const or: Prisma.BillsWhereInput[] = [
    { buyer: name },
    { transporter: name },
    {
      bill_items: {
        some: {
          OR: [{ seller: name }, { seller_bill_no: { contains: search } }],
        },
      },
    },
  ]

  const billId = Number(search.replace(/^#/, ''))
  if (Number.isSafeInteger(billId) && billId > 0) or.push({ id: billId })

  const date = parseSearchDate(search)
  if (date) or.push({ bill_date: date })

  return { OR: or }
}

export async function listBills({
  page,
  pageSize,
  userId,
  search,
  from,
  to,
}: ListBillsQuery) {
  const filters: Prisma.BillsWhereInput[] = []
  if (userId) {
    filters.push({
      OR: [{ buyerId: userId }, { bill_items: { some: { sellerId: userId } } }],
    })
  }
  if (search) filters.push(billSearchFilter(search))
  if (from || to) filters.push({ bill_date: { gte: from, lte: to } })
  const where: Prisma.BillsWhereInput = { AND: filters }

  const [bills, total] = await Promise.all([
    billRepository.findBills(where, (page - 1) * pageSize, pageSize),
    billRepository.countBills(where),
  ])

  return { bills, total, page, pageSize }
}

export async function getBillById(id: number) {
  const bill = await billRepository.findBillById(id)
  if (!bill) {
    throw new HttpError(404, 'Bill not found')
  }
  return bill
}

async function ensureBillExists(id: number, db: DbClient = prisma) {
  const bill = await billRepository.findBillIdById(id, db)
  if (!bill) {
    throw new HttpError(404, 'Bill not found')
  }
}

function addBillItems(billId: number, items: BillItemInput[], db: DbClient) {
  return billItemsRepository.createBillItems(
    items.map((item) => ({ ...item, bill_id: billId })),
    db,
  )
}

// The bill and its items are saved together, so a failed item never leaves a half-made bill.
export function createBill({ bill_items, ...bill }: CreateBillInput) {
  return prisma.$transaction(async (tx) => {
    const { id } = await billRepository.createBill(bill, tx)
    await addBillItems(id, bill_items, tx)
    if (!bill_items || bill_items.length === 0) {
      throw new HttpError(400, 'Bill must have at least one item')
    }
    const createdBill = await billRepository.findBillById(id, tx)
    if (!createdBill) {
      throw new HttpError(500, 'Failed to create bill')
    }
    return createdBill
  })
}

// Used by both PUT and PATCH. When bill_items is sent, it replaces the whole
// list; when it's left out (PATCH), the current items stay as they are.
export function updateBill(
  id: number,
  { bill_items, ...bill }: ReplaceBillInput | UpdateBillInput,
) {
  return prisma.$transaction(async (tx) => {
    await ensureBillExists(id, tx)
    await billRepository.updateBill(id, bill, tx)

    if (bill_items) {
      await billItemsRepository.deleteBillItemsByBillId(id, tx)
      await addBillItems(id, bill_items, tx)
    }

    return billRepository.findBillById(id, tx)
  })
}

// Bill items are removed by the database (onDelete: Cascade).
export async function deleteBill(id: number) {
  await ensureBillExists(id)
  await billRepository.deleteBill(id)
}

// Every bill of one buyer in the date range, each with its sellers, plus grand totals.
export async function getBuyerReport(
  buyerId: number,
  { from, to }: ReportRangeQuery,
) {
  const bills = await billRepository.findBuyerReportBills(buyerId, from, to)

  const totals = {
    bills: bills.length,
    quantity_bags: 0,
    weight: 0,
    amount: 0,
    total_amount: 0,
    buyer_commision_amount: 0,
  }
  for (const bill of bills) {
    totals.total_amount += bill.total_amount
    totals.buyer_commision_amount += bill.buyer_commision_amount
    for (const item of bill.bill_items) {
      totals.quantity_bags += item.quantity_bags
      totals.weight += item.weight
      totals.amount += item.amount
    }
  }

  return {
    from: toDateOnly(from),
    to: toDateOnly(to),
    bills: bills.map((bill) => ({
      ...bill,
      bill_date: toDateOnly(bill.bill_date),
    })),
    totals: {
      ...totals,
      weight: round2(totals.weight),
      amount: round2(totals.amount),
      total_amount: round2(totals.total_amount),
      buyer_commision_amount: round2(totals.buyer_commision_amount),
    },
  }
}
