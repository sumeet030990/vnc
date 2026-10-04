import { toDateOnly } from '../../lib/financialYear'
import { round2 } from '../../lib/round'
import * as billItemsRepository from '../repositories/billItemsRepository'
import { ReportRangeQuery } from '../validations/reportValidation'

// Every item one seller sold in the date range, each with its buyer, plus grand totals.
export async function getSellerReport(
  sellerId: number,
  { from, to }: ReportRangeQuery,
) {
  const items = await billItemsRepository.findSellerReportItems(
    sellerId,
    from,
    to,
  )

  const totals = {
    items: items.length,
    bills: new Set(items.map((item) => item.bill.id)).size,
    quantity_bags: 0,
    weight: 0,
    amount: 0,
    seller_commision_amount: 0,
  }
  for (const item of items) {
    totals.quantity_bags += item.quantity_bags
    totals.weight += item.weight
    totals.amount += item.amount
    totals.seller_commision_amount += item.seller_commision_amount
  }

  return {
    from: toDateOnly(from),
    to: toDateOnly(to),
    items: items.map((item) => ({
      ...item,
      bill: { ...item.bill, bill_date: toDateOnly(item.bill.bill_date) },
    })),
    totals: {
      ...totals,
      weight: round2(totals.weight),
      amount: round2(totals.amount),
      seller_commision_amount: round2(totals.seller_commision_amount),
    },
  }
}
