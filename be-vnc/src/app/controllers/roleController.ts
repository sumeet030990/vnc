import { Request, Response } from 'express'
import { sendSuccess } from '../../lib/apiResponse'
import * as roleService from '../services/roleService'
import * as userService from '../services/userService'
import { RoleIdParams } from '../validations/roleValidation'

// Params are already parsed by the validate middleware, so the id is a number.
const getId = (req: Request) => (req.params as unknown as RoleIdParams).id

export async function listRoles(_req: Request, res: Response) {
  sendSuccess(res, await roleService.listRoles())
}

export async function getRole(req: Request, res: Response) {
  sendSuccess(res, await roleService.getRoleById(getId(req)))
}

export async function createRole(req: Request, res: Response) {
  sendSuccess(res, await roleService.createRole(req.body), {
    status: 201,
    message: 'Role created',
  })
}

// Handles both PUT and PATCH — the route picks the schema.
export async function updateRole(req: Request, res: Response) {
  sendSuccess(res, await roleService.updateRole(getId(req), req.body), {
    message: 'Role updated',
  })
}

export async function deleteRole(req: Request, res: Response) {
  const id = getId(req)
  await userService.ensureNoUsersInRole(id)
  await roleService.deleteRole(id)
  sendSuccess(res, null, { message: 'Role deleted' })
}
