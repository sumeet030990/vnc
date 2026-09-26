import { Request, Response } from 'express'
import { sendSuccess } from '../../lib/apiResponse'
import * as roleService from '../services/roleService'
import * as userService from '../services/userService'
import { ListUsersQuery, UserIdParams } from '../validations/userValidation'

// Params and query are already parsed by the validate middleware, so the ids are numbers.
const getId = (req: Request) => (req.params as unknown as UserIdParams).id

export async function listUsers(req: Request, res: Response) {
  const query = req.query as unknown as ListUsersQuery
  sendSuccess(res, await userService.listUsers(query))
}

export async function getUser(req: Request, res: Response) {
  sendSuccess(res, await userService.getUserById(getId(req)))
}

export async function createUser(req: Request, res: Response) {
  await roleService.ensureRoleExists(req.body.roleId)

  const result = await userService.createUser(req.body)

  sendSuccess(res, result, {
    status: 201,
    message: 'User created',
  })
}

// Handles both PUT and PATCH — the route picks the schema.
export async function updateUser(req: Request, res: Response) {
  await roleService.ensureRoleExists(req.body.roleId)
  sendSuccess(res, await userService.updateUser(getId(req), req.body), {
    message: 'User updated',
  })
}

export async function deleteUser(req: Request, res: Response) {
  // requireAuth runs first on these routes, so req.user is always set.
  await userService.deleteUser(getId(req), req.user!.id)
  sendSuccess(res, null, { message: 'User deleted' })
}
