import { Router } from 'express'
import { requireAuth } from '../app/middlewares/auth'
import * as roleController from '../app/controllers/roleController'

const router = Router()

// Every route below needs a logged-in user.
router.use(requireAuth)

router.get('/', roleController.listRoles)

export default router
