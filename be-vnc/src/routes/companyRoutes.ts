import { Router } from 'express'
import { requireAuth } from '../app/middlewares/auth'
import * as companyController from '../app/controllers/companyController'
import { validateBody, validateParams } from '../app/middlewares/validate'
import {
  companyIdParamsSchema,
  createCompanySchema,
  replaceCompanySchema,
  updateCompanySchema,
} from '../app/validations/companyValidation'

const router = Router()

// Every route below needs a logged-in user.
router.use(requireAuth)

// No delete route on purpose — companies are only created and edited.
router.get('/', companyController.listCompanies)
router.get(
  '/:id',
  validateParams(companyIdParamsSchema),
  companyController.getCompany,
)
router.post(
  '/',
  validateBody(createCompanySchema),
  companyController.createCompany,
)
router.put(
  '/:id',
  validateParams(companyIdParamsSchema),
  validateBody(replaceCompanySchema),
  companyController.updateCompany,
)
router.patch(
  '/:id',
  validateParams(companyIdParamsSchema),
  validateBody(updateCompanySchema),
  companyController.updateCompany,
)

export default router
