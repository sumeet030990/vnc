import { Router } from 'express'
import { requireAuth } from '../app/middlewares/auth'
import * as reportController from '../app/controllers/reportController'
import { validateParams, validateQuery } from '../app/middlewares/validate'
import {
  reportRangeQuerySchema,
  reportUserParamsSchema,
} from '../app/validations/reportValidation'

const router = Router()

// Every route below needs a logged-in user.
router.use(requireAuth)

router.get(
  '/buyers/:id',
  validateParams(reportUserParamsSchema),
  validateQuery(reportRangeQuerySchema),
  reportController.getBuyerReport,
)
router.get(
  '/sellers/:id',
  validateParams(reportUserParamsSchema),
  validateQuery(reportRangeQuerySchema),
  reportController.getSellerReport,
)

export default router
