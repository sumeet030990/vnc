import { Request, Response } from 'express'
import { sendSuccess } from '../../lib/apiResponse'
import * as itemService from '../services/itemService'
import { ItemIdParams } from '../validations/itemValidation'

// Params are already parsed by the validate middleware, so the id is a number.
const getId = (req: Request) => (req.params as unknown as ItemIdParams).id

export async function listItems(_req: Request, res: Response) {
  sendSuccess(res, await itemService.listItems())
}

export async function getItem(req: Request, res: Response) {
  sendSuccess(res, await itemService.getItemById(getId(req)))
}

export async function createItem(req: Request, res: Response) {
  sendSuccess(res, await itemService.createItem(req.body), {
    status: 201,
    message: 'Item created',
  })
}

// Handles both PUT and PATCH — the route picks the schema.
export async function updateItem(req: Request, res: Response) {
  sendSuccess(res, await itemService.updateItem(getId(req), req.body), {
    message: 'Item updated',
  })
}

export async function deleteItem(req: Request, res: Response) {
  await itemService.deleteItem(getId(req))
  sendSuccess(res, null, { message: 'Item deleted' })
}
