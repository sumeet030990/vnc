import { z } from 'zod'

const required = 'User and password are required'

export const loginSchema = z.object({
  user_name: z.string({ error: required }).trim().min(1, { error: required }),
  password: z.string({ error: required }).min(1, { error: required }),
})

export type LoginInput = z.infer<typeof loginSchema>
