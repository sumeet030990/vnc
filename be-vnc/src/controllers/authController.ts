import { Request, Response } from 'express'
import * as userService from '../services/userService'

export async function getLoginUsers(_req: Request, res: Response) {
  res.json(await userService.getLoginUsers())
}

export async function login(req: Request, res: Response) {
  res.json(await userService.login(req.body))
}
