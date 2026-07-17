import { useState, useEffect, useRef } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { getCompany, getDefaultCompany } from '../utils/company'
import { formatCurrency } from '../utils/format'
import { useToast } from '../utils/toast'

const CSS_HEX_OVERRIDE = `:root,*{--color-gray-50:#f9fafb;--color-gray-100:#f3f4f6;--color-gray-200:#e5e7eb;--color-gray-300:#d1d5db;--color-gray-400:#9ca3af;--color-gray-500:#6b7280;--color-gray-600:#4b5563;--color-gray-700:#374151;--color-gray-800:#1f2937;--color-gray-900:#111827;--color-amber-50:#fffbeb;--color-amber-100:#fef3c7;--color-amber-200:#fde68a;--color-amber-300:#fcd34d;--color-amber-600:#d97706;--color-amber-700:#b45309;--color-blue-50:#eff6ff;--color-blue-600:#2563eb;--color-blue-700:#1d4ed8;--color-green-100:#dcfce7;--color-green-600:#16a34a;--color-green-700:#15803d;--color-red-50:#fef2f2;--color-red-100:#fee2e2;--color-red-400:#f87171;--color-red-500:#ef4444;--color-red-600:#dc2626;--color-red-700:#b91c1c}`

export default function InvoicePreview({ invoice, onBack }) {
  const toast = useToast()
  const [company, setCompany] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const printRef = useRef()

  useEffect(() => {
    const load = async () => {
      let c = null
      if (invoice.companyId) c = await getCompany(invoice.companyId)
      if (!c) c = await getDefaultCompany()
      setCompany(c)
    }
    load().catch(console.error)
  }, [invoice.companyId])

  if (!invoice) return null

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const discountVal = invoice.discountValue || 0
  const discountAmt = invoice.discountType === 'percentage' ? subtotal * (discountVal / 100) : discountVal
  const total = Math.max(0, subtotal - discountAmt)
  const isFinal = invoice.customerType === 'final'
  const isDraft = invoice.status !== 'finalized'

  const calcExpiry = () => {
    const d = new Date(invoice.date)
    d.setDate(d.getDate() + (invoice.validityDays || 15))
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const handleDownload = async () => {
    if (!printRef.current) return
    setDownloading(true)
    try {
      const element = printRef.current

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
          const s = clonedDoc.createElement('style')
          s.textContent = CSS_HEX_OVERRIDE
          clonedDoc.head.appendChild(s)
        }
      })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const contentW = canvas.width
      const contentH = canvas.height
      const mmPerPx = pdfW / contentW
      const totalHmm = contentH * mmPerPx
      const pageHmm = pdfH - 20
      const numPages = Math.max(1, Math.ceil(totalHmm / pageHmm))

      for (let p = 0; p < numPages; p++) {
        if (p > 0) pdf.addPage()

        const sy = p * pageHmm / mmPerPx
        const sh = Math.min(pageHmm / mmPerPx, contentH - sy)

        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = contentW
        pageCanvas.height = sh
        const ctx = pageCanvas.getContext('2d')
        ctx.drawImage(canvas, 0, sy, contentW, sh, 0, 0, contentW, sh)
        const pageImgData = pageCanvas.toDataURL('image/png')

        pdf.addImage(pageImgData, 'PNG', 0, 10, pdfW, sh * mmPerPx)

        pdf.setFontSize(8)
        pdf.setTextColor(156, 163, 175)
        pdf.text(`Página ${p + 1} de ${numPages}`, pdfW / 2, pdfH - 5, { align: 'center' })
      }

      pdf.save(`${invoice.number || 'borrador'}.pdf`)
    } catch (e) {
      toast('Error al generar PDF: ' + e.message, 'error')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          ← Volver
        </button>
        <div className="flex gap-2">
          <button onClick={handleDownload} disabled={downloading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50">
            {downloading ? 'Generando...' : 'Descargar PDF'}
          </button>
          <button onClick={() => window.print()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Imprimir
          </button>
        </div>
      </div>

      <div ref={printRef} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none print:overflow-visible">
        <div className="h-1.5 bg-gradient-to-r from-blue-600 to-blue-400 print:h-1"></div>

        <div className="p-8 pb-4 print:p-6">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-start gap-5">
              {company?.logo_url && (
                <img src={company.logo_url} alt="Logo" className="w-22 h-22 object-contain print:w-24 print:h-24 rounded-lg" />
              )}
              <div className={`${company?.logo_url ? '' : 'ml-2'}`}>
                {company?.name && <p className="text-xl font-bold text-gray-900">{company.name}</p>}
                {company?.ruc && <p className="text-sm text-gray-500 mt-0.5">RUC: {company.ruc}</p>}
                {company?.address && <p className="text-sm text-gray-500 mt-0.5">{company.address}</p>}
                {company?.phone && <p className="text-sm text-gray-500 mt-0.5">Tel: {company.phone}</p>}
                {company?.email && <p className="text-sm text-gray-500 mt-0.5">{company.email}</p>}
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">PROFORMA</h1>
              <p className="text-sm font-medium text-gray-700 mt-1">{invoice.number || 'Sin numerar'}</p>
              <p className="text-xs text-gray-500 mt-2">Fecha: <span className="text-gray-700">{invoice.date}</span></p>
              <p className="text-xs text-blue-600 font-medium mt-0.5">Válida hasta: {calcExpiry()}</p>
            </div>
          </div>
        </div>

        {isDraft && (
          <div className="px-8 pb-2 print:hidden">
            <span className="px-3 py-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 rounded-full">
              BORRADOR
            </span>
          </div>
        )}

        <div className="mx-8 mb-6 print:mx-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/80 p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Datos del Cliente</h2>
            {isFinal ? (
              <div className="text-sm">
                <p className="font-semibold text-gray-800">CONSUMIDOR FINAL</p>
                <p className="text-gray-500 text-xs mt-0.5">RUC: 9999999999</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                <p><span className="text-gray-500">Nombre:</span> <span className="font-medium text-gray-800">{invoice.customer.name}</span></p>
                <p><span className="text-gray-500">Cédula/RUC:</span> <span className="font-medium text-gray-800">{invoice.customer.cedula}</span></p>
                <p><span className="text-gray-500">Dirección:</span> <span className="font-medium text-gray-800">{invoice.customer.address}</span></p>
                <p><span className="text-gray-500">Teléfono:</span> <span className="font-medium text-gray-800">{invoice.customer.phone}</span></p>
                {invoice.customer.email && <p className="col-span-2"><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800">{invoice.customer.email}</span></p>}
              </div>
            )}
          </div>
        </div>

        <div className="mx-8 mb-6 print:mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
                <th className="text-left py-3 pl-4 text-gray-700 font-semibold text-xs uppercase tracking-wider">Descripción</th>
                <th className="text-center py-3 text-gray-700 font-semibold text-xs uppercase tracking-wider w-16">Cant.</th>
                <th className="text-right py-3 text-gray-700 font-semibold text-xs uppercase tracking-wider w-28">P. Unit.</th>
                <th className="text-right py-3 pr-4 text-gray-700 font-semibold text-xs uppercase tracking-wider w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                    No hay items en esta cotización
                  </td>
                </tr>
              ) : (
                invoice.items.map((item, i) => (
                  <tr key={item.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'} ${i < invoice.items.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-100/50 transition-colors`}>
                    <td className="py-3 pl-4 text-gray-800">{item.description || <span className="text-gray-400 italic">(sin descripción)</span>}</td>
                    <td className="py-3 text-center text-gray-800 font-medium">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-700 tabular-nums">${formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-gray-800 tabular-nums">${formatCurrency(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mx-8 mb-6 print:mx-6">
          <div className="flex justify-end">
            <div className="w-72 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-800 font-medium tabular-nums">${formatCurrency(subtotal)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">
                      Descuento {invoice.discountType === 'percentage' ? `(${discountVal}%)` : ''}
                    </span>
                    <span className="text-red-600 font-medium tabular-nums">-${formatCurrency(discountAmt)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-800 uppercase">Total</span>
                    <span className="text-2xl font-bold text-gray-900 tabular-nums">${formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {invoice.paymentTerms && (
          <div className="mx-8 mb-6 print:mx-6">
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Condiciones de Pago</h2>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{invoice.paymentTerms}</p>
            </div>
          </div>
        )}

        {invoice.notes && (
          <div className="mx-8 mb-6 print:mx-6">
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Observaciones</h2>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{invoice.notes}</p>
            </div>
          </div>
        )}

        <div className="mx-8 pt-4 pb-6 print:mx-6 print:pb-4">
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-xs text-gray-400">
              Oferta válida por {invoice.validityDays || 15} días desde la fecha de emisión.
            </p>
            {company?.name && (
              <p className="text-xs text-gray-400 mt-1">
                {company.name}{company.ruc ? ` | RUC: ${company.ruc}` : ''}{company.phone ? ` | ${company.phone}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
