import { Prisma } from '../../generated/prisma/client'
import prisma, { DbClient } from '../../lib/prisma'

const personSelect = { select: { id: true, name: true } }

// Bill fields shared by the list and the detail view.
const billFields = {
  id: true,
  bill_date: true,
  total_amount: true,
  buyer_commision_amount: true,
  lorry_number: true,
  lorry_driver_contact: true,
  freight: true,
  advance_freight: true,
  lorry_brokerage: true,
  createdAt: true,
  updatedAt: true,
  buyer: personSelect,
  transporter: personSelect,
} satisfies Prisma.BillsSelect

// List rows only show how many items a bill has, not the items themselves.
const billListSelect = {
  ...billFields,
  _count: { select: { bill_items: true } },
} satisfies Prisma.BillsSelect

// Contact and tax details of a buyer or seller, for the printed bill and reports.
const partyDetailSelect = {
  select: {
    id: true,
    name: true,
    address: true,
    city: true,
    state: true,
    pin_code: true,
    primary_mobile_no: true,
    gst_number: true,
    pan_number: true,
  },
}

// The detail view also sends back every item on the bill.
const billSelect = {
  ...billFields,
  buyer: partyDetailSelect,
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
} satisfies Prisma.BillsSelect

export function countBills(
  where: Prisma.BillsWhereInput = {},
  db: DbClient = prisma,
) {
  return db.bills.count({ where })
}

export function findBills(
  where: Prisma.BillsWhereInput,
  skip: number,
  take: number,
  db: DbClient = prisma,
) {
  return db.bills.findMany({
    where,
    skip,
    take,
    select: billListSelect,
    orderBy: [{ bill_date: 'desc' }, { id: 'desc' }],
  })
}

export function findBillById(id: number, db: DbClient = prisma) {
  return db.bills.findUnique({ where: { id }, select: billSelect })
}

export function findBillIdById(id: number, db: DbClient = prisma) {
  return db.bills.findUnique({ where: { id }, select: { id: true } })
}

export function createBill(
  data: Prisma.BillsUncheckedCreateInput,
  db: DbClient = prisma,
) {
  return db.bills.create({ data, select: { id: true } })
}

export function updateBill(
  id: number,
  data: Prisma.BillsUncheckedUpdateInput,
  db: DbClient = prisma,
) {
  return db.bills.update({ where: { id }, data, select: { id: true } })
}

export function deleteBill(id: number, db: DbClient = prisma) {
  return db.bills.delete({ where: { id }, select: { id: true } })
}

// Every bill of one buyer in the date range, with its commission and the sellers on it.
export function findBuyerReportBills(
  buyerId: number,
  from: Date,
  to: Date,
  db: DbClient = prisma,
) {
  return db.bills.findMany({
    where: { buyerId, bill_date: { gte: from, lte: to } },
    select: {
      id: true,
      bill_date: true,
      total_amount: true,
      buyer_commision_amount: true,
      lorry_number: true,
      lorry_driver_contact: true,
      transporter: personSelect,
      bill_items: {
        select: {
          id: true,
          seller_bill_no: true,
          quantity_bags: true,
          packaging: true,
          weight: true,
          souda_rate: true,
          amount: true,
          seller: partyDetailSelect,
          item: { select: { id: true, name: true } },
        },
        orderBy: { id: 'asc' },
      },
    },
    orderBy: [{ bill_date: 'asc' }, { id: 'asc' }],
  })
}
