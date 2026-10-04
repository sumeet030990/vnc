import { Request, Response } from 'express'
import { sendSuccess } from '../../lib/apiResponse'
import * as billItemsService from '../services/billItemsService'
import * as billService from '../services/billService'
import * as userService from '../services/userService'
import {
  ReportRangeQuery,
  ReportUserParams,
} from '../validations/reportValidation'

// Params and query are already parsed by the validate middleware, so the id is a
// number and the date range is filled in.
const getId = (req: Request) => (req.params as unknown as ReportUserParams).id
const getRange = (req: Request) => req.query as unknown as ReportRangeQuery

export async function getBuyerReport(req: Request, res: Response) {
  const buyer = await userService.getReportUserById(getId(req), 'Buyer')
  const report = await billService.getBuyerReport(buyer.id, getRange(req))
  sendSuccess(res, { buyer, ...report })
}

export async function getSellerReport(req: Request, res: Response) {
  const seller = await userService.getReportUserById(getId(req), 'Seller')
  const report = await billItemsService.getSellerReport(
    seller.id,
    getRange(req),
  )
  sendSuccess(res, { seller, ...report })
}
