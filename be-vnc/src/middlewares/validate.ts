import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

// Checks req.body against a Zod schema and replaces it with the parsed value.
export function validateBody(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {})

    if (!result.success) {
      res.status(400).json({
        message: result.error.issues[0]?.message ?? 'Invalid request',
        errors: z.flattenError(result.error).fieldErrors,
      })
      return
    }

    req.body = result.data
    next()
  }
}
