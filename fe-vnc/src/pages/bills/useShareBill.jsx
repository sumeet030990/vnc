import { useState } from 'react'
import BillSnapshot from './BillSnapshot.jsx'
import { canvasToPdf, canvasToPng } from './billCapture.js'

const WHATSAPP_WEB_URL = 'https://web.whatsapp.com/'
const PASTE_SHORTCUT = /Mac|iPhone|iPad/.test(navigator.userAgent)
  ? '⌘ V'
  : 'Ctrl + V'

// Our Electron desktop app adds this (desktop/preload.js). Missing in a browser.
const desktop = window.vncDesktop

// True where the share menu takes files (phones, Chrome/Edge on Windows, Safari on Mac).
function canSharePdf() {
  try {
    const probe = new File([''], 'bill.pdf', { type: 'application/pdf' })
    return Boolean(navigator.canShare?.({ files: [probe] }))
  } catch {
    return false
  }
}

function canCopyPicture() {
  return (
    Boolean(navigator.clipboard?.write) && typeof ClipboardItem !== 'undefined'
  )
}

function openWhatsAppWeb() {
  const tab = window.open(WHATSAPP_WEB_URL, '_blank')
  if (tab) tab.opener = null
  return Boolean(tab)
}

// Shares a bill for WhatsApp. Where it can, it opens the share menu with the
// PDF attached; the user picks WhatsApp and a contact. Elsewhere it copies the
// bill as a picture and opens WhatsApp Web, for the user to paste in a chat.
// showNotice(message, action?) shows a message, with an optional { label, onClick } button.
export function useShareBill(showNotice) {
  // The bill being drawn, with the hooks that hand back its canvas. One at a time.
  const [job, setJob] = useState(null)

  const drawBillCanvas = (billId) => {
    let next
    const canvas = new Promise((resolve, reject) => {
      next = { billId, resolve, reject }
    })
    setJob(next)
    return canvas
  }

  const sharePdf = async (file) => {
    try {
      await navigator.share({ files: [file], title: file.name })
    } catch (error) {
      if (error.name === 'AbortError') return
      // The PDF took too long and the browser no longer counts the click.
      if (error.name === 'NotAllowedError') {
        showNotice('The PDF is ready.', {
          label: 'Share PDF',
          onClick: () => sharePdf(file),
        })
        return
      }
      throw error
    }
  }

  // The desktop app opens the macOS share menu itself, so no click is needed.
  const shareDesktopPdf = async (file) => {
    const bytes = new Uint8Array(await file.arrayBuffer())
    await desktop.sharePdf(file.name, bytes)
  }

  const shareBill = (billId) => {
    if (desktop?.canSharePdf || canSharePdf()) {
      const share = desktop?.canSharePdf ? shareDesktopPdf : sharePdf
      drawBillCanvas(billId)
        .then((canvas) => canvasToPdf(canvas, `Bill-${billId}.pdf`))
        .then(share)
        .catch(() => showNotice('Could not share the bill. Please try again.'))
        .finally(() => setJob(null))
      return
    }

    if (!canCopyPicture()) {
      showNotice(
        'This browser cannot share the bill. Please try Chrome or Edge.',
      )
      return
    }
    // Copy must start during the click, so it gets a picture that is still being drawn.
    const picture = drawBillCanvas(billId).then(canvasToPng)
    navigator.clipboard
      .write([new ClipboardItem({ 'image/png': picture })])
      .then(() => {
        // The desktop app always opens links in the browser, but window.open
        // there still returns nothing, so don't offer the button again.
        const opened = openWhatsAppWeb() || Boolean(desktop)
        showNotice(
          `Bill #${billId} copied. In WhatsApp Web, open a chat and press ${PASTE_SHORTCUT}.`,
          opened
            ? null
            : { label: 'Open WhatsApp Web', onClick: openWhatsAppWeb },
        )
      })
      .catch(() => showNotice('Could not copy the bill. Please try again.'))
      .finally(() => setJob(null))
  }

  const snapshot = job && (
    <BillSnapshot
      billId={job.billId}
      onDone={job.resolve}
      onError={job.reject}
    />
  )

  return { shareBill, sharingBillId: job?.billId ?? null, snapshot }
}
