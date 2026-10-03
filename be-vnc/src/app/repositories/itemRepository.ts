import { Prisma } from '../../generated/prisma/client'
import prisma, { DbClient } from '../../lib/prisma'

// Fields sent back to the client.
const itemSelect = {
  id: true,
  name: true,
  slug: true,
} satisfies Prisma.ItemsSelect

export function countItems(
  where: Prisma.ItemsWhereInput = {},
  db: DbClient = prisma,
) {
  return db.items.count({ where })
}

export function findItemById(id: number, db: DbClient = prisma) {
  return db.items.findUnique({ where: { id }, select: itemSelect })
}

export function findItemIdByName(name: string, db: DbClient = prisma) {
  return db.items.findUnique({ where: { name }, select: { id: true } })
}

export function findItemIdBySlug(slug: string, db: DbClient = prisma) {
  return db.items.findUnique({ where: { slug }, select: { id: true } })
}

export function findItems(db: DbClient = prisma) {
  return db.items.findMany({
    select: itemSelect,
    orderBy: { name: 'asc' },
  })
}

export function createItem(
  data: Prisma.ItemsCreateInput,
  db: DbClient = prisma,
) {
  return db.items.create({ data, select: itemSelect })
}

export function updateItem(
  id: number,
  data: Prisma.ItemsUpdateInput,
  db: DbClient = prisma,
) {
  return db.items.update({ where: { id }, data, select: itemSelect })
}

export function deleteItem(id: number, db: DbClient = prisma) {
  return db.items.delete({ where: { id }, select: { id: true } })
}
