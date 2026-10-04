import 'dotenv/config'
import { hashPassword } from '../src/lib/password'
import prisma from '../src/lib/prisma'

const roles = [
  { name: 'Admin', slug: 'admin' },
  { name: 'Buyer', slug: 'buyer' },
  { name: 'Seller', slug: 'seller' },
  { name: 'Transporter', slug: 'transporter' },
]

const items = [{ name: 'Toor Dal', slug: 'toor_dal' }]

// Dummy data only — fill real company details through the app, not the seed.
const companies = [
  {
    name: 'Venkateshwara Canvassers',
    primary_mobile_no: '9000000100',
    primary_email: 'demo@example.com',
    address: '1 Sample Street',
    pin_code: '440001',
    city: 'Nagpur',
    state: 'Maharashtra',
    seller_commision_percentage: 1,
    buyer_commision_percentage: 1,
    tds_percentage: 0.1,
  },
]

// Dummy data only — never seed real people here.
const users = [
  {
    roleSlug: 'admin',
    name: 'Sumeet',
    primary_mobile_no: '9000000000',
    address: '',
    city: 'Nagpur',
    allow_login: true,
    user_name: 'sumeet',
    password: 'password',
  },
  {
    roleSlug: 'admin',
    name: 'Deepak',
    primary_mobile_no: '9000000001',
    address: '',
    city: 'Nagpur',
    allow_login: true,
    user_name: 'deepak',
    password: 'password',
  },
  {
    roleSlug: 'admin',
    name: 'Swapnil',
    primary_mobile_no: '9000000002',
    address: '',
    city: 'Nagpur',
    allow_login: true,
    user_name: 'swapnil',
    password: 'password',
  },
  {
    roleSlug: 'admin',
    name: 'Ayush',
    primary_mobile_no: '9000000003',
    address: '',
    city: 'Nagpur',
    allow_login: true,
    user_name: 'ayush',
    password: 'password',
  },
  {
    roleSlug: 'buyer',
    name: 'Demo Buyer',
    primary_mobile_no: '9000000004',
    address: '2 Sample Street',
    city: 'Nagpur',
    allow_login: false,
  },
  {
    roleSlug: 'seller',
    name: 'Dayalu Dall Mill',
    primary_mobile_no: '9000000005',
    address: '',
    city: 'Nagpur',
    allow_login: false,
  },
  {
    roleSlug: 'transporter',
    name: 'Pathak',
    primary_mobile_no: '9000000006',
    address: '',
    city: 'Nagpur',
    allow_login: false,
  },
]

async function main() {
  // Upsert on unique slugs so the seed can be re-run safely.
  for (const role of roles) {
    await prisma.roles.upsert({
      where: { slug: role.slug },
      update: { name: role.name },
      create: role,
    })
  }

  for (const item of items) {
    await prisma.items.upsert({
      where: { slug: item.slug },
      update: { name: item.name },
      create: item,
    })
  }

  for (const { name, ...company } of companies) {
    await prisma.company.upsert({
      where: { name },
      update: company,
      create: { name, ...company },
    })
  }

  // primary_mobile_no isn't unique in the schema, so upsert isn't available — skip existing rows instead.
  for (const { roleSlug, ...user } of users) {
    const existing = await prisma.users.findFirst({
      where: { primary_mobile_no: user.primary_mobile_no },
    })
    if (existing) continue

    await prisma.users.create({
      data: {
        ...user,
        password: user.password && (await hashPassword(user.password)),
        role: { connect: { slug: roleSlug } },
      },
    })
  }

  console.log(
    `Seeded ${roles.length} roles, ${items.length} items, ${companies.length} companies, ${users.length} users`,
  )
}

main()
  .catch((error) => {
    console.error(error)

    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
