import { Request, Response } from 'express'
import { sendSuccess } from '../../lib/apiResponse'
import * as billService from '../services/billService'
import * as itemService from '../services/itemService'
import * as userService from '../services/userService'
import {
  BillIdParams,
  ListBillsQuery,
  UpdateBillInput,
} from '../validations/billValidation'

// Params and query are already parsed by the validate middleware, so the ids are numbers.
const getId = (req: Request) => (req.params as unknown as BillIdParams).id

// Checks the linked buyer, transporter, sellers and items first, so a wrong id
// gets a clear 400 instead of a database error. Fields not sent are skipped.
async function ensureLinksExist(input: UpdateBillInput) {
  const items = input.bill_items ?? []
  await Promise.all([
    userService.ensureUsersExist([input.buyerId], 'Buyer does not exist'),
    userService.ensureUsersExist(
      [input.transporter_id],
      'Transporter does not exist',
    ),
    userService.ensureUsersExist(
      items.map((item) => item.sellerId),
      'Seller does not exist',
    ),
    itemService.ensureItemsExist(items.map((item) => item.itemId)),
  ])
}

export async function listBills(req: Request, res: Response) {
  const query = req.query as unknown as ListBillsQuery
  const bills = await billService.listBills(query)
  sendSuccess(res, bills)
}

export async function getBill(req: Request, res: Response) {
  const bill = await billService.getBillById(getId(req))
  sendSuccess(res, bill)
}

export async function createBill(req: Request, res: Response) {
  await ensureLinksExist(req.body)

  const createdBill = await billService.createBill(req.body)
  sendSuccess(res, createdBill, {
    status: 201,
    message: 'Bill created',
  })
}

// Handles both PUT and PATCH — the route picks the schema.
export async function updateBill(req: Request, res: Response) {
  await ensureLinksExist(req.body)
  const updatedBill = await billService.updateBill(getId(req), req.body)
  sendSuccess(res, updatedBill, {
    message: 'Bill updated',
  })
}

export async function deleteBill(req: Request, res: Response) {
  await billService.deleteBill(getId(req))
  sendSuccess(res, null, { message: 'Bill deleted' })
}
