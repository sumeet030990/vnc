import { z } from 'zod'

const required = 'User and password are required'

export const loginSchema = z.object({
  userId: z.int({ error: required }),
  password: z.string({ error: required }).min(1, { error: required }),
})

export type LoginInput = z.infer<typeof loginSchema>
