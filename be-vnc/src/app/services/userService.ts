import { Prisma } from '../../generated/prisma/client'
import { HttpError } from '../../lib/httpError'
import { hashPassword, verifyPassword } from '../../lib/password'
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

  if (
    !user ||
    !user.password ||
    !(await verifyPassword(password, user.password))
  ) {
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

export async function createUser(input: CreateUserInput) {
  ensurePasswordForLogin(input.allow_login ?? false, input.password)

  return userRepository.createUser({
    ...input,
    password: input.password && (await hashPassword(input.password)),
  })
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

  // Only hash when a new password is sent; otherwise keep the stored one.
  return userRepository.updateUser(id, {
    ...input,
    ...(input.password && { password: await hashPassword(input.password) }),
  })
}

export async function deleteUser(id: number) {
  const existing = await userRepository.findUserById(id)
  if (!existing) {
    throw new HttpError(404, 'User not found')
  }

  await userRepository.deleteUser(id)
}
