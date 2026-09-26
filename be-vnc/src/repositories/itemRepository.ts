import prisma, { DbClient } from '../lib/prisma'

export function countItems(db: DbClient = prisma) {
  return db.item.count()
}
