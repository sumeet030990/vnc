import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// Names for the login dropdown — only users who are allowed to log in.
router.get('/users', async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { allow_login: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
  res.json(users)
})

router.post('/login', async (req: Request, res: Response) => {
  const { userId, password } = req.body ?? {}

  if (!Number.isInteger(userId) || typeof password !== 'string' || !password) {
    res.status(400).json({ message: 'User and password are required' })
    return
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, allow_login: true },
    include: { role: true },
  })

  // TODO: passwords are stored as plain text for now — hash them before going live.
  if (!user || user.password !== password) {
    res.status(401).json({ message: 'Invalid user or password' })
    return
  }

  res.json({
    id: user.id,
    name: user.name,
    role: { name: user.role.name, slug: user.role.slug },
  })
})

export default router
