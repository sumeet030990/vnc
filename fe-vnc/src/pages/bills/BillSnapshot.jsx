import { useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { useBill } from '../../api/bills.js'
import { MAIN_COMPANY_ID, useCompany } from '../../api/companies.js'
import { BillDocument } from './BillPrintPage.jsx'
import { drawBill } from './billCapture.js'

// Draws one bill off-screen and hands back its canvas through onDone(canvas),
// or calls onError(). Shows nothing on screen.
function BillSnapshot({ billId, onDone, onError }) {
  const bill = useBill(billId)
  const company = useCompany(MAIN_COMPANY_ID)
  const sheetRef = useRef(null)
  // If the company fails to load, still draw the bill with the app name.
  const ready = Boolean(bill.data) && !company.isPending

  useEffect(() => {
    if (bill.isError) onError(bill.error)
  }, [bill.isError, bill.error, onError])

  useEffect(() => {
    if (!ready) return
    let cancelled = false
    drawBill(sheetRef.current)
      .then((canvas) => !cancelled && onDone(canvas))
      .catch((error) => !cancelled && onError(error))
    return () => {
      cancelled = true
    }
  }, [ready, onDone, onError])

  if (!ready) return null
  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        top: 0,
        left: '-10000px',
        pointerEvents: 'none',
      }}
    >
      <BillDocument ref={sheetRef} bill={bill.data} company={company.data} />
    </Box>
  )
}

export default BillSnapshot
