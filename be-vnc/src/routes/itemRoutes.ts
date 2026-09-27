import { Router } from 'express'
import { requireAuth } from '../app/middlewares/auth'
import * as itemController from '../app/controllers/itemController'
import { validateBody, validateParams } from '../app/middlewares/validate'
import {
  createItemSchema,
  itemIdParamsSchema,
  replaceItemSchema,
  updateItemSchema,
} from '../app/validations/itemValidation'

const router = Router()

// Every route below needs a logged-in user.
router.use(requireAuth)

router.get('/', itemController.listItems)
router.get('/:id', validateParams(itemIdParamsSchema), itemController.getItem)
router.post('/', validateBody(createItemSchema), itemController.createItem)
router.put(
  '/:id',
  validateParams(itemIdParamsSchema),
  validateBody(replaceItemSchema),
  itemController.updateItem,
)
router.patch(
  '/:id',
  validateParams(itemIdParamsSchema),
  validateBody(updateItemSchema),
  itemController.updateItem,
)
router.delete(
  '/:id',
  validateParams(itemIdParamsSchema),
  itemController.deleteItem,
)

export default router
