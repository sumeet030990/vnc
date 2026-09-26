import { NextFunction, Request, Response } from 'express'
import { HttpError } from '../../lib/httpError'
import { TokenUser, verifyToken } from '../../lib/jwt'

declare global {
  namespace Express {
    interface Request {
      // Set by requireAuth for routes behind login.
      user?: TokenUser
    }
  }
}

// Lets the request through only with a valid "Authorization: Bearer <token>" header.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? []
  const user = scheme === 'Bearer' && token ? verifyToken(token) : null

  if (!user) {
    throw new HttpError(401, 'Please log in again')
  }

  req.user = user
  next()
}
