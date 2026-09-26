import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keyLength: number,
) => Promise<Buffer>

const SALT_BYTES = 16
const KEY_BYTES = 64

// Stored as "scrypt$<salt hex>$<hash hex>" (168 chars, fits VARCHAR(191)).
export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_BYTES)
  const hash = await scryptAsync(password, salt, KEY_BYTES)
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltHex, hashHex] = stored.split('$')
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false

  const expected = Buffer.from(hashHex, 'hex')
  const actual = await scryptAsync(
    password,
    Buffer.from(saltHex, 'hex'),
    expected.length,
  )
  // Constant-time compare so response timing doesn't leak the hash.
  return timingSafeEqual(actual, expected)
}
