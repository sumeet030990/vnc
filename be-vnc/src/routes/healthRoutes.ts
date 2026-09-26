import { Router, Request, Response } from 'express'
import { sendSuccess } from '../lib/apiResponse'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  sendSuccess(res, { status: 'ok' })
})

export default router
