import { Router } from 'express'
import { requireAuth } from '../app/middlewares/auth'
import * as billController from '../app/controllers/billController'
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../app/middlewares/validate'
import {
  billIdParamsSchema,
  createBillSchema,
  listBillsQuerySchema,
  replaceBillSchema,
  updateBillSchema,
} from '../app/validations/billValidation'

const router = Router()

// Every route below needs a logged-in user.
router.use(requireAuth)

router.get('/', validateQuery(listBillsQuerySchema), billController.listBills)
router.get('/:id', validateParams(billIdParamsSchema), billController.getBill)
router.post('/', validateBody(createBillSchema), billController.createBill)
router.put(
  '/:id',
  validateParams(billIdParamsSchema),
  validateBody(replaceBillSchema),
  billController.updateBill,
)
router.patch(
  '/:id',
  validateParams(billIdParamsSchema),
  validateBody(updateBillSchema),
  billController.updateBill,
)
router.delete(
  '/:id',
  validateParams(billIdParamsSchema),
  billController.deleteBill,
)

export default router
