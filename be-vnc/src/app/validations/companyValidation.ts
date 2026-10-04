import { z } from 'zod'

// Text columns are VARCHAR(191) in the database.
const MAX_TEXT = 191

const name = z
  .string({ error: 'Name is required' })
  .trim()
  .min(1, { error: 'Name is required' })
  .max(MAX_TEXT, { error: `Name must be at most ${MAX_TEXT} characters` })

const optionalText = (label: string) =>
  z
    .string({ error: `${label} must be text` })
    .trim()
    .max(MAX_TEXT, { error: `${label} must be at most ${MAX_TEXT} characters` })
    .nullable()

const mobileNo = (label: string) =>
  z
    .string({ error: `${label} must be text` })
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, { error: `${label} must be 7 to 15 digits` })
    .nullable()

const email = (label: string) =>
  z
    .email({ error: `${label} must be a valid email` })
    .max(MAX_TEXT, { error: `${label} must be at most ${MAX_TEXT} characters` })
    .nullable()

const pinCode = z
  .string({ error: 'Pin code must be text' })
  .trim()
  .regex(/^[0-9]{6}$/, { error: 'Pin code must be 6 digits' })
  .nullable()

// GSTIN is 15 letters and numbers. Stored in upper case.
const gstNumber = z
  .string({ error: 'GST number must be text' })
  .trim()
  .toUpperCase()
  .regex(/^[0-9A-Z]{15}$/, {
    error: 'GST number must be 15 letters and numbers',
  })
  .nullable()

// PAN is 5 letters, 4 digits, then 1 letter (e.g. ABCDE1234F). Stored in upper case.
const panNumber = z
  .string({ error: 'PAN number must be text' })
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, {
    error: 'PAN number must be 5 letters, 4 digits, then 1 letter',
  })
  .nullable()

const percentage = (label: string) =>
  z
    .number({ error: `${label} must be a number` })
    .min(0, { error: `${label} cannot be negative` })
    .max(100, { error: `${label} must be 100 or less` })
    .nullable()

export const companyIdParamsSchema = z.object({
  id: z.coerce
    .number({ error: 'Company id must be a number' })
    .int({ error: 'Company id must be a whole number' })
    .positive({ error: 'Company id is invalid' }),
})

// PUT replaces the whole company, so every field must be sent (null clears it).
export const replaceCompanySchema = z.object({
  name,
  primary_mobile_no: mobileNo('Primary mobile number'),
  secondary_mobile_no: mobileNo('Secondary mobile number'),
  primary_email: email('Primary email'),
  secondary_email: email('Secondary email'),
  address: optionalText('Address'),
  pin_code: pinCode,
  city: optionalText('City'),
  state: optionalText('State'),
  gst_number: gstNumber,
  pan_number: panNumber,
  seller_commision_percentage: percentage('Seller commission percentage'),
  buyer_commision_percentage: percentage('Buyer commission percentage'),
  tds_percentage: percentage('TDS percentage'),
})

// Only the name is needed to create; the rest can be filled in later.
export const createCompanySchema = replaceCompanySchema.partial().required({
  name: true,
})

export const updateCompanySchema = replaceCompanySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: 'Send at least one field to update',
  })

export type CompanyIdParams = z.infer<typeof companyIdParamsSchema>
export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type ReplaceCompanyInput = z.infer<typeof replaceCompanySchema>
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
