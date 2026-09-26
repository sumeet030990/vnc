import prisma, { DbClient } from '../../lib/prisma'

export function countRoles(db: DbClient = prisma) {
  return db.role.count()
}

export function findRoleById(id: number, db: DbClient = prisma) {
  return db.role.findUnique({ where: { id }, select: { id: true } })
}

export function findRoles(db: DbClient = prisma) {
  return db.role.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  })
}
