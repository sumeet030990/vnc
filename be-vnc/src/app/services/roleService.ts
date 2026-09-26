import { HttpError } from '../../lib/httpError'
import * as roleRepository from '../repositories/roleRepository'

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
