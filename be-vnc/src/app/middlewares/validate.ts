import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { sendError } from '../../lib/apiResponse'

type RequestPart = 'body' | 'params' | 'query'

// Checks one part of the request against a Zod schema and replaces it with the
// parsed value, so handlers get coerced numbers, defaults and trimmed strings.
function validate(part: RequestPart, schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part] ?? {})

    if (!result.success) {
      sendError(
        res,
        400,
        result.error.issues[0]?.message ?? 'Invalid request',
        z.flattenError(result.error).fieldErrors,
      )
      return
    }

    // Express 5 makes req.query a read-only getter, so redefine it instead of assigning.
    Object.defineProperty(req, part, {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true,
    })
    next()
  }
}

export const validateBody = (schema: z.ZodType) => validate('body', schema)
export const validateParams = (schema: z.ZodType) => validate('params', schema)
export const validateQuery = (schema: z.ZodType) => validate('query', schema)
