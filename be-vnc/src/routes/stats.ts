import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// Totals for the dashboard cards.
// TODO: open to anyone for now — protect once login issues a token.
router.get('/', async (_req: Request, res: Response) => {
  const [users, roles, items] = await Promise.all([
    prisma.user.count(),
    prisma.role.count(),
    prisma.item.count(),
  ])
  res.json({ users, roles, items })
})

export default router
