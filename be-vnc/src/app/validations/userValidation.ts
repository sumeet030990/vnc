import { z } from 'zod'

// Text columns are VARCHAR(191) in the database.
const MAX_TEXT = 191

const optionalText = (label: string) =>
  z
    .string({ error: `${label} must be text` })
    .trim()
    .max(MAX_TEXT, { error: `${label} must be at most ${MAX_TEXT} characters` })
    .nullable()

const roleId = z
  .int({ error: 'Role is required' })
  .positive({ error: 'Role is invalid' })

const mobileNo = z
  .string({ error: 'Mobile number is required' })
  .trim()
  .regex(/^\+?[0-9]{7,15}$/, { error: 'Mobile number must be 7 to 15 digits' })

const optionalMobileNo = (label: string) =>
  z
    .string({ error: `${label} must be text` })
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, { error: `${label} must be 7 to 15 digits` })
    .nullable()

const pinCode = z
  .string({ error: 'Pin code must be text' })
  .trim()
  .regex(/^[0-9]{6}$/, { error: 'Pin code must be 6 digits' })
  .nullable()

// GST state code is 2 digits (e.g. 27 for Maharashtra).
const stateCode = z
  .string({ error: 'State code must be text' })
  .trim()
  .regex(/^[0-9]{2}$/, { error: 'State code must be 2 digits' })
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

const allowLogin = z.boolean({ error: 'Allow login must be true or false' })

const userName = z
  .string({ error: 'Username must be text' })
  .trim()
  .regex(/^[A-Za-z0-9._-]{3,50}$/, {
    error:
      'Username must be 3 to 50 letters, numbers, dots, dashes or underscores',
  })
  .nullable()

const password = z
  .string({ error: 'Password must be text' })
  .min(1, { error: 'Password cannot be empty' })
  .max(MAX_TEXT, {
    error: `Password must be at most ${MAX_TEXT} characters`,
  })

export const userIdParamsSchema = z.object({
  id: z.coerce
    .number({ error: 'User id must be a number' })
    .int({ error: 'User id must be a whole number' })
    .positive({ error: 'User id is invalid' }),
})

export const listUsersQuerySchema = z.object({
  page: z.coerce
    .number({ error: 'Page must be a number' })
    .int({ error: 'Page must be a whole number' })
    .min(1, { error: 'Page must be 1 or more' })
    .default(1),
  pageSize: z.coerce
    .number({ error: 'Page size must be a number' })
    .int({ error: 'Page size must be a whole number' })
    .min(1, { error: 'Page size must be 1 or more' })
    .max(100, { error: 'Page size must be 100 or less' })
    .default(20),
  search: z.string().trim().max(MAX_TEXT).optional(),
  roleId: z.coerce
    .number({ error: 'Role must be a number' })
    .int({ error: 'Role must be a whole number' })
    .positive({ error: 'Role is invalid' })
    .optional(),
})

export const createUserSchema = z.object({
  roleId,
  name: optionalText('Name').optional(),
  primary_mobile_no: mobileNo,
  secondary_mobile_no: optionalMobileNo('Secondary mobile number').optional(),
  address: optionalText('Address').optional(),
  city: optionalText('City').optional(),
  state: optionalText('State').optional(),
  state_code: stateCode.optional(),
  pin_code: pinCode.optional(),
  gst_number: gstNumber.optional(),
  pan_number: panNumber.optional(),
  allow_login: allowLogin.optional(),
  user_name: userName.optional(),
  password: password.optional(),
})

// PUT replaces the whole record. Password is the one exception: leave it out
// to keep the current one, so clients never have to send it back.
export const replaceUserSchema = z.object({
  roleId,
  name: optionalText('Name'),
  primary_mobile_no: mobileNo,
  secondary_mobile_no: optionalMobileNo('Secondary mobile number'),
  address: optionalText('Address'),
  city: optionalText('City'),
  state: optionalText('State'),
  state_code: stateCode,
  pin_code: pinCode,
  gst_number: gstNumber,
  pan_number: panNumber,
  allow_login: allowLogin,
  user_name: userName,
  password: password.optional(),
})

export const updateUserSchema = replaceUserSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: 'Send at least one field to update',
  })

export type UserIdParams = z.infer<typeof userIdParamsSchema>
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type ReplaceUserInput = z.infer<typeof replaceUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
