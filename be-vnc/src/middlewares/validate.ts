import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { sendError } from '../lib/apiResponse'

// Checks req.body against a Zod schema and replaces it with the parsed value.
export function validateBody(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {})

    if (!result.success) {
      sendError(
        res,
        400,
        result.error.issues[0]?.message ?? 'Invalid request',
        z.flattenError(result.error).fieldErrors,
      )
      return
    }

    req.body = result.data
    next()
  }
}
