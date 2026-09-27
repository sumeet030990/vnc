import { Prisma } from '../../generated/prisma/client'
import prisma, { DbClient } from '../../lib/prisma'

// Fields sent back to the client.
const itemSelect = {
  id: true,
  name: true,
  slug: true,
} satisfies Prisma.ItemSelect

export function countItems(db: DbClient = prisma) {
  return db.item.count()
}

export function findItemById(id: number, db: DbClient = prisma) {
  return db.item.findUnique({ where: { id }, select: itemSelect })
}

export function findItemIdByName(name: string, db: DbClient = prisma) {
  return db.item.findUnique({ where: { name }, select: { id: true } })
}

export function findItemIdBySlug(slug: string, db: DbClient = prisma) {
  return db.item.findUnique({ where: { slug }, select: { id: true } })
}

export function findItems(db: DbClient = prisma) {
  return db.item.findMany({
    select: itemSelect,
    orderBy: { name: 'asc' },
  })
}

export function createItem(
  data: Prisma.ItemCreateInput,
  db: DbClient = prisma,
) {
  return db.item.create({ data, select: itemSelect })
}

export function updateItem(
  id: number,
  data: Prisma.ItemUpdateInput,
  db: DbClient = prisma,
) {
  return db.item.update({ where: { id }, data, select: itemSelect })
}

export function deleteItem(id: number, db: DbClient = prisma) {
  return db.item.delete({ where: { id }, select: { id: true } })
}
