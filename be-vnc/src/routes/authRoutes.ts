import { Router } from 'express'
import * as authController from '../app/controllers/authController'
import { validateBody } from '../app/middlewares/validate'
import { loginSchema } from '../app/validations/authValidation'

const router = Router()

router.get('/users', authController.getLoginUsers)
router.post('/login', validateBody(loginSchema), authController.login)

export default router
