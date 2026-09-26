import prisma, { DbClient } from '../../lib/prisma'

export function countRoles(db: DbClient = prisma) {
  return db.role.count()
}

export function findRoleById(id: number, db: DbClient = prisma) {
  return db.role.findUnique({ where: { id }, select: { id: true } })
}
