import { Router } from 'express'
import * as authController from '../controllers/authController'
import { validateBody } from '../middlewares/validate'
import { loginSchema } from '../validations/authValidation'

const router = Router()

router.get('/users', authController.getLoginUsers)
router.post('/login', validateBody(loginSchema), authController.login)

export default router
