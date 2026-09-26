import { Prisma } from '../../generated/prisma/client'
import prisma, { DbClient } from '../../lib/prisma'

// Fields sent back to the client — never includes the password.
const userSelect = {
  id: true,
  name: true,
  mobile_no: true,
  address: true,
  city: true,
  allow_login: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.UserSelect

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

export function countUsers(
  where: Prisma.UserWhereInput = {},
  db: DbClient = prisma,
) {
  return db.user.count({ where })
}

export function findUsers(
  where: Prisma.UserWhereInput,
  skip: number,
  take: number,
  db: DbClient = prisma,
) {
  return db.user.findMany({
    where,
    skip,
    take,
    select: userSelect,
    orderBy: { id: 'asc' },
  })
}

export function findUserById(id: number, db: DbClient = prisma) {
  return db.user.findUnique({ where: { id }, select: userSelect })
}

// Only what the service needs to check login rules on update.
export function findUserLoginStateById(id: number, db: DbClient = prisma) {
  return db.user.findUnique({
    where: { id },
    select: { id: true, allow_login: true, password: true },
  })
}

export function createUser(
  data: Prisma.UserUncheckedCreateInput,
  db: DbClient = prisma,
) {
  return db.user.create({ data, select: userSelect })
}

export function updateUser(
  id: number,
  data: Prisma.UserUncheckedUpdateInput,
  db: DbClient = prisma,
) {
  return db.user.update({ where: { id }, data, select: userSelect })
}

export function deleteUser(id: number, db: DbClient = prisma) {
  return db.user.delete({ where: { id }, select: { id: true } })
}
