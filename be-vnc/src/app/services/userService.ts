import { HttpError } from '../../lib/httpError'
import * as userRepository from '../repositories/userRepository'
import { LoginInput } from '../validations/authValidation'

// Names for the login dropdown — only users who are allowed to log in.
export function getLoginUsers() {
  return userRepository.findLoginUsers()
}

export async function login({ userId, password }: LoginInput) {
  const user = await userRepository.findLoginUserById(userId)

  // TODO: passwords are stored as plain text for now — hash them before going live.
  if (!user || user.password !== password) {
    throw new HttpError(401, 'Invalid user or password')
  }

  return {
    id: user.id,
    name: user.name,
    role: { name: user.role.name, slug: user.role.slug },
  }
}

export function countUsers() {
  return userRepository.countUsers()
}
