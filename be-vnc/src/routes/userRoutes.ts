import { Router } from 'express'
import * as userController from '../app/controllers/userController'
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../app/middlewares/validate'
import {
  createUserSchema,
  listUsersQuerySchema,
  replaceUserSchema,
  updateUserSchema,
  userIdParamsSchema,
} from '../app/validations/userValidation'

const router = Router()

// TODO: open to anyone for now — protect once login issues a token.
router.get('/', validateQuery(listUsersQuerySchema), userController.listUsers)
router.get('/:id', validateParams(userIdParamsSchema), userController.getUser)
router.post('/', validateBody(createUserSchema), userController.createUser)
router.put(
  '/:id',
  validateParams(userIdParamsSchema),
  validateBody(replaceUserSchema),
  userController.updateUser,
)
router.patch(
  '/:id',
  validateParams(userIdParamsSchema),
  validateBody(updateUserSchema),
  userController.updateUser,
)
router.delete(
  '/:id',
  validateParams(userIdParamsSchema),
  userController.deleteUser,
)

export default router
