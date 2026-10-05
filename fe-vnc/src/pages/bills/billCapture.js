// A4 sheet size in mm.
const PAGE_WIDTH_MM = 210
const PAGE_HEIGHT_MM = 297

// Draws the bill sheet onto a canvas, the way it looks on paper.
export async function drawBill(element) {
  // The drawing package is big, so load it only when a bill is shared.
  const [{ default: html2canvas }] = await Promise.all([
    import('html2canvas-pro'),
    // Wait for Roboto, or the picture may use a fallback font.
    document.fonts.ready,
  ])
  return html2canvas(element, {
    scale: 2,
    backgroundColor: '#FFFFFF',
    // Draw at desktop width, so a small screen doesn't squeeze the sheet.
    windowWidth: 1280,
    onclone: (_doc, sheet) => {
      // The sheet sits off-screen; bring the copy into view to draw it.
      Object.assign(sheet.style, { position: 'fixed', top: '0', left: '0' })
      // On paper the sheet has no shadow or round corners, so match that.
      sheet.style.boxShadow = 'none'
      sheet.style.borderRadius = '0'
    },
  })
}

// PNG picture of the bill, for pasting into a chat.
export function canvasToPng(canvas) {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('Could not draw the bill')),
      'image/png',
    ),
  )
}

// A4 PDF file of the bill, for the share menu.
export async function canvasToPdf(canvas, fileName) {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const image = canvas.toDataURL('image/jpeg', 0.92)
  const imageHeight = (canvas.height * PAGE_WIDTH_MM) / canvas.width

  // A long bill continues on the next page: the same picture, moved up one page each time.
  for (let top = 0; top < imageHeight - 1; top += PAGE_HEIGHT_MM) {
    if (top > 0) pdf.addPage()
    pdf.addImage(image, 'JPEG', 0, -top, PAGE_WIDTH_MM, imageHeight)
  }

  return new File([pdf.output('blob')], fileName, { type: 'application/pdf' })
}
