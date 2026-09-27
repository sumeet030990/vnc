import { HttpError } from '../../lib/httpError'
import * as roleRepository from '../repositories/roleRepository'
import {
  CreateRoleInput,
  ReplaceRoleInput,
  UpdateRoleInput,
} from '../validations/roleValidation'

export function countRoles() {
  return roleRepository.countRoles()
}

// Does nothing when no role id is given, so update calls can pass it straight through.
export async function ensureRoleExists(roleId?: number) {
  if (roleId === undefined) return

  const role = await roleRepository.findRoleById(roleId)
  if (!role) {
    throw new HttpError(400, 'Role does not exist')
  }
}

// Options for the role dropdowns in the UI.
export function listRoles() {
  return roleRepository.findRoles()
}

export async function getRoleById(id: number) {
  const role = await roleRepository.findRoleById(id)
  if (!role) {
    throw new HttpError(404, 'Role not found')
  }
  return role
}

// Name and slug must be unique. Pass the current role's id on update so it can keep its own.
async function ensureNameAndSlugAreFree(
  { name, slug }: UpdateRoleInput,
  roleId?: number,
) {
  const [nameOwner, slugOwner] = await Promise.all([
    name ? roleRepository.findRoleIdByName(name) : null,
    slug ? roleRepository.findRoleIdBySlug(slug) : null,
  ])
  if (nameOwner && nameOwner.id !== roleId) {
    throw new HttpError(409, 'Role name is already taken')
  }
  if (slugOwner && slugOwner.id !== roleId) {
    throw new HttpError(409, 'Role slug is already taken')
  }
}

export async function createRole(input: CreateRoleInput) {
  await ensureNameAndSlugAreFree(input)
  return roleRepository.createRole(input)
}

// Used by both PUT and PATCH — the schemas decide which fields are required.
export async function updateRole(
  id: number,
  input: ReplaceRoleInput | UpdateRoleInput,
) {
  await getRoleById(id)
  await ensureNameAndSlugAreFree(input, id)
  return roleRepository.updateRole(id, input)
}

export async function deleteRole(id: number) {
  await getRoleById(id)
  await roleRepository.deleteRole(id)
}
