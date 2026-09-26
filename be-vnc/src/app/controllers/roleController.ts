import { Request, Response } from 'express'
import { sendSuccess } from '../../lib/apiResponse'
import * as roleService from '../services/roleService'

export async function listRoles(_req: Request, res: Response) {
  sendSuccess(res, await roleService.listRoles())
}
