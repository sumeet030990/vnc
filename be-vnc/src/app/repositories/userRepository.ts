import { Prisma } from '../../generated/prisma/client'
import prisma, { DbClient } from '../../lib/prisma'

// Fields sent back to the client — never includes the password.
const userSelect = {
  id: true,
  name: true,
  primary_mobile_no: true,
  secondary_mobile_no: true,
  address: true,
  city: true,
  state: true,
  state_code: true,
  pin_code: true,
  gst_number: true,
  pan_number: true,
  allow_login: true,
  user_name: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.UsersSelect

export function findLoginUsers(db: DbClient = prisma) {
  return db.users.findMany({
    where: { allow_login: true },
    select: { id: true, name: true, user_name: true },
    orderBy: { name: 'asc' },
  })
}

export function findLoginUserByUserName(
  userName: string,
  db: DbClient = prisma,
) {
  return db.users.findFirst({
    where: { user_name: userName, allow_login: true },
    include: { role: true },
  })
}

export function countUsers(
  where: Prisma.UsersWhereInput = {},
  db: DbClient = prisma,
) {
  return db.users.count({ where })
}

export function findUsers(
  where: Prisma.UsersWhereInput,
  skip: number,
  take: number,
  db: DbClient = prisma,
) {
  return db.users.findMany({
    where,
    skip,
    take,
    select: userSelect,
    orderBy: { id: 'desc' },
  })
}

export function findUserById(id: number, db: DbClient = prisma) {
  return db.users.findUnique({ where: { id }, select: userSelect })
}

// Only what the service needs to check login rules on update.
export function findUserLoginStateById(id: number, db: DbClient = prisma) {
  return db.users.findUnique({
    where: { id },
    select: { id: true, allow_login: true, user_name: true, password: true },
  })
}

export function findUserIdByUserName(userName: string, db: DbClient = prisma) {
  return db.users.findUnique({
    where: { user_name: userName },
    select: { id: true },
  })
}

export function createUser(
  data: Prisma.UsersUncheckedCreateInput,
  db: DbClient = prisma,
) {
  return db.users.create({ data, select: userSelect })
}

export function updateUser(
  id: number,
  data: Prisma.UsersUncheckedUpdateInput,
  db: DbClient = prisma,
) {
  return db.users.update({ where: { id }, data, select: userSelect })
}

export function deleteUser(id: number, db: DbClient = prisma) {
  return db.users.delete({ where: { id }, select: { id: true } })
}

// Contact and tax details shown at the top of a buyer or seller report.
export function findReportUserById(id: number, db: DbClient = prisma) {
  return db.users.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      primary_mobile_no: true,
      address: true,
      city: true,
      state: true,
      state_code: true,
      pin_code: true,
      gst_number: true,
      pan_number: true,
      role: { select: { name: true, slug: true } },
    },
  })
}
