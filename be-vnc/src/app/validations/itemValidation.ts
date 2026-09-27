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

export const itemIdParamsSchema = z.object({
  id: z.coerce
    .number({ error: 'Item id must be a number' })
    .int({ error: 'Item id must be a whole number' })
    .positive({ error: 'Item id is invalid' }),
})

export const createItemSchema = z.object({ name, slug })

// The slug is fixed once the item is created, so updates only take the name.
// Zod drops unknown keys, so a slug sent on update is ignored.
export const replaceItemSchema = z.object({ name })

export const updateItemSchema = replaceItemSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: 'Send at least one field to update',
  })

export type ItemIdParams = z.infer<typeof itemIdParamsSchema>
export type CreateItemInput = z.infer<typeof createItemSchema>
export type ReplaceItemInput = z.infer<typeof replaceItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
