import { Request, Response } from 'express'
import { sendSuccess } from '../../lib/apiResponse'
import * as companyService from '../services/companyService'
import { CompanyIdParams } from '../validations/companyValidation'

// Params are already parsed by the validate middleware, so the id is a number.
const getId = (req: Request) => (req.params as unknown as CompanyIdParams).id

export async function listCompanies(_req: Request, res: Response) {
  sendSuccess(res, await companyService.listCompanies())
}

export async function getCompany(req: Request, res: Response) {
  sendSuccess(res, await companyService.getCompanyById(getId(req)))
}

export async function createCompany(req: Request, res: Response) {
  sendSuccess(res, await companyService.createCompany(req.body), {
    status: 201,
    message: 'Company created',
  })
}

// Handles both PUT and PATCH — the route picks the schema.
export async function updateCompany(req: Request, res: Response) {
  sendSuccess(res, await companyService.updateCompany(getId(req), req.body), {
    message: 'Company updated',
  })
}
