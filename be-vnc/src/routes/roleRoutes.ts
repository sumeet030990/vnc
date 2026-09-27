import { Router } from 'express'
import { requireAuth } from '../app/middlewares/auth'
import * as roleController from '../app/controllers/roleController'
import { validateBody, validateParams } from '../app/middlewares/validate'
import {
  createRoleSchema,
  replaceRoleSchema,
  roleIdParamsSchema,
  updateRoleSchema,
} from '../app/validations/roleValidation'

const router = Router()

// Every route below needs a logged-in user.
router.use(requireAuth)

router.get('/', roleController.listRoles)
router.get('/:id', validateParams(roleIdParamsSchema), roleController.getRole)
router.post('/', validateBody(createRoleSchema), roleController.createRole)
router.put(
  '/:id',
  validateParams(roleIdParamsSchema),
  validateBody(replaceRoleSchema),
  roleController.updateRole,
)
router.patch(
  '/:id',
  validateParams(roleIdParamsSchema),
  validateBody(updateRoleSchema),
  roleController.updateRole,
)
router.delete(
  '/:id',
  validateParams(roleIdParamsSchema),
  roleController.deleteRole,
)

export default router
