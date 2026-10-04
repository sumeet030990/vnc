import { Prisma } from '../../generated/prisma/client'
import prisma, { DbClient } from '../../lib/prisma'

export function createBillItems(
  data: Prisma.Bill_itemsCreateManyInput[],
  db: DbClient = prisma,
) {
  return db.bill_items.createMany({ data })
}

export function deleteBillItemsByBillId(billId: number, db: DbClient = prisma) {
  return db.bill_items.deleteMany({ where: { bill_id: billId } })
}

// Every item one seller sold in the date range, with the bill and buyer it went to.
export function findSellerReportItems(
  sellerId: number,
  from: Date,
  to: Date,
  db: DbClient = prisma,
) {
  return db.bill_items.findMany({
    where: { sellerId, bill: { bill_date: { gte: from, lte: to } } },
    select: {
      id: true,
      seller_bill_no: true,
      quantity_bags: true,
      packaging: true,
      weight: true,
      souda_rate: true,
      amount: true,
      seller_commision_amount: true,
      item: { select: { id: true, name: true } },
      bill: {
        select: {
          id: true,
          bill_date: true,
          lorry_number: true,
          buyer: {
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
          },
        },
      },
    },
    orderBy: [
      { bill: { bill_date: 'asc' } },
      { bill_id: 'asc' },
      { id: 'asc' },
    ],
  })
}
