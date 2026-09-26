import prisma, { DbClient } from '../lib/prisma'

export function countRoles(db: DbClient = prisma) {
  return db.role.count()
}
