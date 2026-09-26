import { Prisma } from '../../generated/prisma/client'
import { HttpError } from '../../lib/httpError'
import * as userRepository from '../repositories/userRepository'
import { LoginInput } from '../validations/authValidation'
import {
  CreateUserInput,
  ListUsersQuery,
  ReplaceUserInput,
  UpdateUserInput,
} from '../validations/userValidation'

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

export async function listUsers({
  page,
  pageSize,
  search,
  roleId,
}: ListUsersQuery) {
  const where: Prisma.UserWhereInput = {
    roleId,
    ...(search && {
      OR: [
        { name: { contains: search } },
        { mobile_no: { contains: search } },
        { city: { contains: search } },
      ],
    }),
  }

  const [users, total] = await Promise.all([
    userRepository.findUsers(where, (page - 1) * pageSize, pageSize),
    userRepository.countUsers(where),
  ])

  return { users, total, page, pageSize }
}

export async function getUserById(id: number) {
  const user = await userRepository.findUserById(id)
  if (!user) {
    throw new HttpError(404, 'User not found')
  }
  return user
}

// A user who can log in must have a password.
function ensurePasswordForLogin(allowLogin: boolean, password?: string | null) {
  if (allowLogin && !password) {
    throw new HttpError(400, 'Password is required when login is allowed')
  }
}

export function createUser(input: CreateUserInput) {
  ensurePasswordForLogin(input.allow_login ?? false, input.password)

  // TODO: passwords are stored as plain text for now — hash them before going live.
  return userRepository.createUser(input)
}

// Used by both PUT and PATCH — the schemas decide which fields are required.
export async function updateUser(
  id: number,
  input: ReplaceUserInput | UpdateUserInput,
) {
  const existing = await userRepository.findUserLoginStateById(id)
  if (!existing) {
    throw new HttpError(404, 'User not found')
  }

  ensurePasswordForLogin(
    input.allow_login ?? existing.allow_login,
    input.password ?? existing.password,
  )

  return userRepository.updateUser(id, input)
}

export async function deleteUser(id: number) {
  const existing = await userRepository.findUserById(id)
  if (!existing) {
    throw new HttpError(404, 'User not found')
  }

  await userRepository.deleteUser(id)
}
