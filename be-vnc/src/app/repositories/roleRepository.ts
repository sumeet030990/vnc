import { Prisma } from '../../generated/prisma/client'
import prisma, { DbClient } from '../../lib/prisma'

// Fields sent back to the client.
const roleSelect = {
  id: true,
  name: true,
  slug: true,
} satisfies Prisma.RolesSelect

export function countRoles(db: DbClient = prisma) {
  return db.roles.count()
}

export function findRoleById(id: number, db: DbClient = prisma) {
  return db.roles.findUnique({ where: { id }, select: roleSelect })
}

export function findRoleIdByName(name: string, db: DbClient = prisma) {
  return db.roles.findUnique({ where: { name }, select: { id: true } })
}

export function findRoleIdBySlug(slug: string, db: DbClient = prisma) {
  return db.roles.findUnique({ where: { slug }, select: { id: true } })
}

export function findRoles(db: DbClient = prisma) {
  return db.roles.findMany({
    select: roleSelect,
    orderBy: { name: 'asc' },
  })
}

export function createRole(
  data: Prisma.RolesCreateInput,
  db: DbClient = prisma,
) {
  return db.roles.create({ data, select: roleSelect })
}

export function updateRole(
  id: number,
  data: Prisma.RolesUpdateInput,
  db: DbClient = prisma,
) {
  return db.roles.update({ where: { id }, data, select: roleSelect })
}

export function deleteRole(id: number, db: DbClient = prisma) {
  return db.roles.delete({ where: { id }, select: { id: true } })
}
