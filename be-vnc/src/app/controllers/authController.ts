import { Request, Response } from 'express'
import { sendSuccess } from '../../lib/apiResponse'
import * as userService from '../services/userService'

export async function getLoginUsers(_req: Request, res: Response) {
  sendSuccess(res, await userService.getLoginUsers())
}

export async function login(req: Request, res: Response) {
  sendSuccess(res, await userService.login(req.body), {
    message: 'Logged in',
  })
}
