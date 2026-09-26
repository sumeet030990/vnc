import jwt, { SignOptions } from 'jsonwebtoken'

const secret = process.env.JWT_SECRET

if (!secret) {
  throw new Error('JWT_SECRET is not set')
}

const expiresIn = (process.env.JWT_EXPIRES_IN ??
  '1d') as SignOptions['expiresIn']

// What we keep inside the token — just enough to know who is calling.
export type TokenUser = { id: number; role: string }

export function signToken({ id, role }: TokenUser) {
  return jwt.sign({ role }, secret!, {
    subject: String(id),
    expiresIn,
    algorithm: 'HS256',
  })
}

// Returns the user inside a valid token, or null if it is missing, bad or expired.
export function verifyToken(token: string): TokenUser | null {
  try {
    const payload = jwt.verify(token, secret!, { algorithms: ['HS256'] })
    if (typeof payload === 'string' || !payload.sub) return null
    return { id: Number(payload.sub), role: String(payload.role) }
  } catch {
    return null
  }
}
