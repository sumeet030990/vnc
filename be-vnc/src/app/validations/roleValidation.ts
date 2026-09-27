import { z } from 'zod'

// Text columns are VARCHAR(191) in the database.
const MAX_TEXT = 191

const name = z
  .string({ error: 'Name is required' })
  .trim()
  .min(1, { error: 'Name is required' })
  .max(MAX_TEXT, { error: `Name must be at most ${MAX_TEXT} characters` })

const slug = z
  .string({ error: 'Slug is required' })
  .trim()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    error: 'Slug must be lowercase letters and numbers, joined by dashes',
  })
  .max(MAX_TEXT, { error: `Slug must be at most ${MAX_TEXT} characters` })

export const roleIdParamsSchema = z.object({
  id: z.coerce
    .number({ error: 'Role id must be a number' })
    .int({ error: 'Role id must be a whole number' })
    .positive({ error: 'Role id is invalid' }),
})

// A role only has two fields, so create and PUT need the same shape.
export const createRoleSchema = z.object({ name, slug })

export const replaceRoleSchema = createRoleSchema

export const updateRoleSchema = createRoleSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: 'Send at least one field to update',
  })

export type RoleIdParams = z.infer<typeof roleIdParamsSchema>
export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type ReplaceRoleInput = z.infer<typeof replaceRoleSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
