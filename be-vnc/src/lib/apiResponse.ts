import { Response } from 'express'

// Every API response uses one of these two shapes, so the client can always
// check `success` and read `message`, then `data` or `errors`.
export type SuccessResponse<T> = {
  success: true
  message: string
  data: T
}

export type ErrorResponse = {
  success: false
  message: string
  errors?: Record<string, string[] | undefined>
}

type SuccessOptions = { status?: number; message?: string }

export function sendSuccess<T>(
  res: Response,
  data: T,
  { status = 200, message = 'OK' }: SuccessOptions = {},
) {
  const body: SuccessResponse<T> = { success: true, message, data }
  res.status(status).json(body)
}

export function sendError(
  res: Response,
  status: number,
  message: string,
  errors?: ErrorResponse['errors'],
) {
  const body: ErrorResponse = { success: false, message, errors }
  res.status(status).json(body)
}
