import { NextFunction, Request, Response } from 'express'
import { sendError } from '../../lib/apiResponse'
import { HttpError } from '../../lib/httpError'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    sendError(res, err.status, err.message)
    return
  }

  console.error(err)
  sendError(res, 500, 'Something went wrong')
}

// Runs when no route matched the request.
export function notFoundHandler(_req: Request, res: Response) {
  sendError(res, 404, 'Route not found')
}
