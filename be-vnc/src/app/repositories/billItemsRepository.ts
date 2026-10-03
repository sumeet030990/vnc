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
