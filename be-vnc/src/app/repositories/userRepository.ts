import prisma, { DbClient } from '../../lib/prisma'

export function findLoginUsers(db: DbClient = prisma) {
  return db.user.findMany({
    where: { allow_login: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

export function findLoginUserById(id: number, db: DbClient = prisma) {
  return db.user.findFirst({
    where: { id, allow_login: true },
    include: { role: true },
  })
}

export function countUsers(db: DbClient = prisma) {
  return db.user.count()
}
