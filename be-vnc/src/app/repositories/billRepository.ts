import { Prisma } from '../../generated/prisma/client'
import prisma, { DbClient } from '../../lib/prisma'

const personSelect = { select: { id: true, name: true } }

// Bill fields shared by the list and the detail view.
const billFields = {
  id: true,
  total_amount: true,
  buyer_commision_amount: true,
  lorry_number: true,
  lorry_driver_name: true,
  lorry_driver_contact: true,
  freight: true,
  advance_freight: true,
  lorry_brokerage: true,
  createdAt: true,
  updatedAt: true,
  buyer: personSelect,
  transporter: personSelect,
} satisfies Prisma.BillSelect

// List rows only show how many items a bill has, not the items themselves.
const billListSelect = {
  ...billFields,
  _count: { select: { bill_items: true } },
} satisfies Prisma.BillSelect

// The detail view also sends back every item on the bill.
const billSelect = {
  ...billFields,
  bill_items: {
    select: {
      id: true,
      seller_bill_no: true,
      quantity_bags: true,
      packaging: true,
      weight: true,
      souda_rate: true,
      amount: true,
      seller_commision_amount: true,
      seller: personSelect,
      item: { select: { id: true, name: true } },
    },
    orderBy: { id: 'asc' },
  },
} satisfies Prisma.BillSelect

export function countBills(
  where: Prisma.BillWhereInput = {},
  db: DbClient = prisma,
) {
  return db.bill.count({ where })
}

export function findBills(
  where: Prisma.BillWhereInput,
  skip: number,
  take: number,
  db: DbClient = prisma,
) {
  return db.bill.findMany({
    where,
    skip,
    take,
    select: billListSelect,
    orderBy: { createdAt: 'desc' },
  })
}

export function findBillById(id: number, db: DbClient = prisma) {
  return db.bill.findUnique({ where: { id }, select: billSelect })
}

export function findBillIdById(id: number, db: DbClient = prisma) {
  return db.bill.findUnique({ where: { id }, select: { id: true } })
}

export function createBill(
  data: Prisma.BillUncheckedCreateInput,
  db: DbClient = prisma,
) {
  return db.bill.create({ data, select: { id: true } })
}

export function updateBill(
  id: number,
  data: Prisma.BillUncheckedUpdateInput,
  db: DbClient = prisma,
) {
  return db.bill.update({ where: { id }, data, select: { id: true } })
}

export function deleteBill(id: number, db: DbClient = prisma) {
  return db.bill.delete({ where: { id }, select: { id: true } })
}
