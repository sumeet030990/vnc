import { Prisma } from '../../generated/prisma/client'
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

export async function listBills({
  page,
  pageSize,
  buyerId,
  transporter_id,
}: ListBillsQuery) {
  const where: Prisma.BillWhereInput = { buyerId, transporter_id }

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
