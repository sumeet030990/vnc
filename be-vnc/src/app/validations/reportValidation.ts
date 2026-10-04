import { z } from 'zod'
import { financialYearOf, today } from '../../lib/financialYear'

const reportDate = (label: string) =>
  z.iso
    .date({ error: `${label} must be a date like 2026-10-04` })
    .transform((value) => new Date(value))

export const reportUserParamsSchema = z.object({
  id: z.coerce
    .number({ error: 'User id must be a number' })
    .int({ error: 'User id must be a whole number' })
    .positive({ error: 'User id is invalid' }),
})

// A missing date is filled from the financial year of the other date, or of
// today when both are missing (so the default is the current financial year).
export const reportRangeQuerySchema = z
  .object({
    from: reportDate('From date').optional(),
    to: reportDate('To date').optional(),
  })
  .transform(({ from, to }) => ({
    from: from ?? financialYearOf(to ?? today()).from,
    to: to ?? financialYearOf(from ?? today()).to,
  }))
  .refine(({ from, to }) => from <= to, {
    error: 'From date must be on or before the to date',
  })

export type ReportUserParams = z.infer<typeof reportUserParamsSchema>
export type ReportRangeQuery = z.infer<typeof reportRangeQuerySchema>
