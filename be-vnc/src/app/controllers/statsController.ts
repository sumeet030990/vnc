import { Request, Response } from 'express'
import { sendSuccess } from '../../lib/apiResponse'
import * as itemService from '../services/itemService'
import * as roleService from '../services/roleService'
import * as userService from '../services/userService'

// Totals for the dashboard cards.
export async function getStats(_req: Request, res: Response) {
  const [users, roles, items] = await Promise.all([
    userService.countUsers(),
    roleService.countRoles(),
    itemService.countItems(),
  ])
  sendSuccess(res, { users, roles, items })
}
