import { Prisma } from '../../generated/prisma/client'
import prisma, { DbClient } from '../../lib/prisma'

// Fields sent back to the client.
const companySelect = {
  id: true,
  name: true,
  primary_mobile_no: true,
  secondary_mobile_no: true,
  primary_email: true,
  secondary_email: true,
  address: true,
  pin_code: true,
  city: true,
  state: true,
  gst_number: true,
  pan_number: true,
  seller_commision_percentage: true,
  buyer_commision_percentage: true,
  tds_percentage: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CompanySelect

export function findCompanyById(id: number, db: DbClient = prisma) {
  return db.company.findUnique({ where: { id }, select: companySelect })
}

export function findCompanyIdByName(name: string, db: DbClient = prisma) {
  return db.company.findUnique({ where: { name }, select: { id: true } })
}

export function findCompanies(db: DbClient = prisma) {
  return db.company.findMany({
    select: companySelect,
    orderBy: { name: 'asc' },
  })
}

export function createCompany(
  data: Prisma.CompanyCreateInput,
  db: DbClient = prisma,
) {
  return db.company.create({ data, select: companySelect })
}

export function updateCompany(
  id: number,
  data: Prisma.CompanyUpdateInput,
  db: DbClient = prisma,
) {
  return db.company.update({ where: { id }, data, select: companySelect })
}
