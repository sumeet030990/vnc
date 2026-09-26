import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { Prisma, PrismaClient } from '../generated/prisma/client'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

// The mariadb driver only accepts `mariadb://` URLs, while the Prisma CLI expects
// `mysql://`, so parse the shared DATABASE_URL into a pool config.
const url = new URL(databaseUrl)

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  connectionLimit: 10,
})

const prisma = new PrismaClient({ adapter })

export default prisma

// Repositories accept either the shared client or a transaction client, so
// services can run several repository calls inside one `prisma.$transaction`.
export type DbClient = PrismaClient | Prisma.TransactionClient
