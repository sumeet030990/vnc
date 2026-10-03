import { HttpError } from '../../lib/httpError'
import * as companyRepository from '../repositories/companyRepository'
import {
  CreateCompanyInput,
  ReplaceCompanyInput,
  UpdateCompanyInput,
} from '../validations/companyValidation'

export function listCompanies() {
  return companyRepository.findCompanies()
}

export async function getCompanyById(id: number) {
  const company = await companyRepository.findCompanyById(id)
  if (!company) {
    throw new HttpError(404, 'Company not found')
  }
  return company
}

// Name must be unique. Pass the current company's id on update so it can keep its own.
async function ensureNameIsFree(name: string | undefined, companyId?: number) {
  if (!name) return

  const owner = await companyRepository.findCompanyIdByName(name)
  if (owner && owner.id !== companyId) {
    throw new HttpError(409, 'Company name is already taken')
  }
}

export async function createCompany(input: CreateCompanyInput) {
  await ensureNameIsFree(input.name)
  return companyRepository.createCompany(input)
}

// Used by both PUT and PATCH — the schemas decide which fields are required.
export async function updateCompany(
  id: number,
  input: ReplaceCompanyInput | UpdateCompanyInput,
) {
  await getCompanyById(id)
  await ensureNameIsFree(input.name, id)
  return companyRepository.updateCompany(id, input)
}
