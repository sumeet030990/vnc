import { Prisma } from '../../generated/prisma/client'
import { HttpError } from '../../lib/httpError'
import { signToken } from '../../lib/jwt'
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

export async function login({ user_name, password }: LoginInput) {
  const user = await userRepository.findLoginUserByUserName(user_name)

  if (
    !user ||
    !user.password ||
    !(await verifyPassword(password, user.password))
  ) {
    throw new HttpError(401, 'Invalid user or password')
  }

  return {
    token: signToken({ id: user.id, role: user.role.slug }),
    user: {
      id: user.id,
      name: user.name,
      role: { name: user.role.name, slug: user.role.slug },
    },
  }
}

export function countUsers() {
  return userRepository.countUsers()
}

// A role can only be deleted once no user is linked to it.
export async function ensureNoUsersInRole(roleId: number) {
  const count = await userRepository.countUsers({ roleId })
  if (count > 0) {
    throw new HttpError(409, 'Role is assigned to users and cannot be deleted')
  }
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
        { user_name: { contains: search } },
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

// A user who can log in must have a username and a password.
function ensureLoginDetails(
  allowLogin: boolean,
  userName?: string | null,
  password?: string | null,
) {
  if (!allowLogin) return
  if (!userName) {
    throw new HttpError(400, 'Username is required when login is allowed')
  }
  if (!password) {
    throw new HttpError(400, 'Password is required when login is allowed')
  }
}

// Usernames must be unique. Pass the current user's id on update so it can keep its own.
async function ensureUserNameIsFree(userName?: string | null, userId?: number) {
  if (!userName) return
  const owner = await userRepository.findUserIdByUserName(userName)
  if (owner && owner.id !== userId) {
    throw new HttpError(409, 'Username is already taken')
  }
}

export async function createUser(input: CreateUserInput) {
  ensureLoginDetails(
    input.allow_login ?? false,
    input.user_name,
    input.password,
  )
  await ensureUserNameIsFree(input.user_name)

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

  // `undefined` means the field wasn't sent (PATCH), so fall back to the stored value.
  ensureLoginDetails(
    input.allow_login ?? existing.allow_login,
    input.user_name === undefined ? existing.user_name : input.user_name,
    input.password ?? existing.password,
  )
  await ensureUserNameIsFree(input.user_name, id)

  // Only hash when a new password is sent; otherwise keep the stored one.
  return userRepository.updateUser(id, {
    ...input,
    ...(input.password && { password: await hashPassword(input.password) }),
  })
}

export async function deleteUser(id: number, currentUserId: number) {
  if (id === currentUserId) {
    throw new HttpError(400, 'You cannot delete your own account')
  }

  const existing = await userRepository.findUserById(id)
  if (!existing) {
    throw new HttpError(404, 'User not found')
  }

  await userRepository.deleteUser(id)
}
