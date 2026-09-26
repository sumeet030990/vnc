import { Router } from 'express'
import * as statsController from '../controllers/statsController'

const router = Router()

// TODO: open to anyone for now — protect once login issues a token.
router.get('/', statsController.getStats)

export default router
