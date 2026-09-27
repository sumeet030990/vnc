import { Prisma } from '../../generated/prisma/client'
import prisma, { DbClient } from '../../lib/prisma'

// Fields sent back to the client.
const roleSelect = {
  id: true,
  name: true,
  slug: true,
} satisfies Prisma.RoleSelect

export function countRoles(db: DbClient = prisma) {
  return db.role.count()
}

export function findRoleById(id: number, db: DbClient = prisma) {
  return db.role.findUnique({ where: { id }, select: roleSelect })
}

export function findRoleIdByName(name: string, db: DbClient = prisma) {
  return db.role.findUnique({ where: { name }, select: { id: true } })
}

export function findRoleIdBySlug(slug: string, db: DbClient = prisma) {
  return db.role.findUnique({ where: { slug }, select: { id: true } })
}

export function findRoles(db: DbClient = prisma) {
  return db.role.findMany({
    select: roleSelect,
    orderBy: { name: 'asc' },
  })
}

export function createRole(
  data: Prisma.RoleCreateInput,
  db: DbClient = prisma,
) {
  return db.role.create({ data, select: roleSelect })
}

export function updateRole(
  id: number,
  data: Prisma.RoleUpdateInput,
  db: DbClient = prisma,
) {
  return db.role.update({ where: { id }, data, select: roleSelect })
}

export function deleteRole(id: number, db: DbClient = prisma) {
  return db.role.delete({ where: { id }, select: { id: true } })
}
