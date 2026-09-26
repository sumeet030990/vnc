import { Router } from 'express'
import { requireAuth } from '../app/middlewares/auth'
import * as statsController from '../app/controllers/statsController'

const router = Router()

// Every route below needs a logged-in user.
router.use(requireAuth)

router.get('/', statsController.getStats)

export default router
