import { useState, useEffect, useRef } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { getCompany, getDefaultCompany } from '../utils/company'
import { formatCurrency } from '../utils/format'
import { useToast } from '../utils/toast'

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
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
          const s = clonedDoc.createElement('style')
          s.textContent = `:root,*{--color-gray-50:#f9fafb;--color-gray-100:#f3f4f6;--color-gray-200:#e5e7eb;--color-gray-300:#d1d5db;--color-gray-400:#9ca3af;--color-gray-500:#6b7280;--color-gray-600:#4b5563;--color-gray-700:#374151;--color-gray-800:#1f2937;--color-gray-900:#111827;--color-amber-50:#fffbeb;--color-amber-100:#fef3c7;--color-amber-200:#fde68a;--color-amber-300:#fcd34d;--color-amber-600:#d97706;--color-amber-700:#b45309;--color-blue-50:#eff6ff;--color-blue-600:#2563eb;--color-green-100:#dcfce7;--color-green-600:#16a34a;--color-green-700:#15803d;--color-red-50:#fef2f2;--color-red-100:#fee2e2;--color-red-400:#f87171;--color-red-500:#ef4444;--color-red-600:#dc2626;--color-red-700:#b91c1c}`
          clonedDoc.head.appendChild(s)
        }
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const ratio = canvas.width / canvas.height
      let imgW = pdfW
      let imgH = imgW / ratio
      if (imgH > pdfH) { imgH = pdfH; imgW = imgH * ratio }
      const x = (pdfW - imgW) / 2
      const y = 0
      pdf.addImage(imgData, 'PNG', x, y, imgW, imgH)
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

      <div ref={printRef} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 print:p-6 print:shadow-none print:border-none relative">
        {isDraft && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 rounded-full print:hidden">
              BORRADOR
            </span>
          </div>
        )}

        {/* Encabezado */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            {company?.logo_url && (
              <img src={company.logo_url} alt="Logo" className="w-20 h-20 object-contain print:w-24 print:h-24" />
            )}
            <div>
              {company?.name && <p className="text-lg font-bold text-gray-800">{company.name}</p>}
              {company?.ruc && <p className="text-sm text-gray-500">RUC: {company.ruc}</p>}
              {company?.address && <p className="text-sm text-gray-500">{company.address}</p>}
              {company?.phone && <p className="text-sm text-gray-500">Tel: {company.phone}</p>}
              {company?.email && <p className="text-sm text-gray-500">{company.email}</p>}
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-800">PROFORMA</h1>
            <p className="text-sm text-gray-500 mt-1">{invoice.number || 'Sin numerar'}</p>
            <p className="text-sm text-gray-500 mt-2">Fecha: {invoice.date}</p>
            <p className="text-sm text-blue-600 font-medium">Válida hasta: {calcExpiry()}</p>
          </div>
        </div>

        {/* Cliente */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Datos del Cliente</h2>
          {isFinal ? (
            <div className="text-sm">
              <p className="font-medium text-gray-800">CONSUMIDOR FINAL</p>
              <p className="text-gray-500">RUC: 9999999999</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><span className="text-gray-500">Nombre:</span> <span className="font-medium text-gray-800">{invoice.customer.name}</span></p>
              <p><span className="text-gray-500">Cédula/RUC:</span> <span className="font-medium text-gray-800">{invoice.customer.cedula}</span></p>
              <p><span className="text-gray-500">Dirección:</span> <span className="font-medium text-gray-800">{invoice.customer.address}</span></p>
              <p><span className="text-gray-500">Teléfono:</span> <span className="font-medium text-gray-800">{invoice.customer.phone}</span></p>
              {invoice.customer.email && <p><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800">{invoice.customer.email}</span></p>}
            </div>
          )}
        </div>

        {/* Productos */}
        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2 text-gray-600 font-semibold text-xs uppercase tracking-wider">Descripción</th>
              <th className="text-center py-2 text-gray-600 font-semibold text-xs uppercase tracking-wider">Cant.</th>
              <th className="text-right py-2 text-gray-600 font-semibold text-xs uppercase tracking-wider">P. Unit.</th>
              <th className="text-right py-2 text-gray-600 font-semibold text-xs uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={item.id} className={i < invoice.items.length - 1 ? 'border-b border-gray-100' : ''}>
                <td className="py-3 text-gray-800">{item.description || '(sin descripción)'}</td>
                <td className="py-3 text-center text-gray-800">{item.quantity}</td>
                <td className="py-3 text-right text-gray-800">${formatCurrency(item.unitPrice)}</td>
                <td className="py-3 text-right font-medium text-gray-800">${formatCurrency(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-end pt-4 border-t-2 border-gray-300">
          <div className="text-right space-y-1">
            <p className="text-sm text-gray-500">Subtotal: ${formatCurrency(subtotal)}</p>
            {discountAmt > 0 && (
              <p className="text-sm text-red-600">
                Descuento ({invoice.discountType === 'percentage' ? `${discountVal}%` : '$' + formatCurrency(discountVal)}):
                -${formatCurrency(discountAmt)}
              </p>
            )}
            <p className="text-sm text-gray-500 mb-1">TOTAL</p>
            <p className="text-3xl font-bold text-gray-800">${formatCurrency(total)}</p>
          </div>
        </div>

        {/* Condiciones de pago */}
        {invoice.paymentTerms && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Condiciones de Pago</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.paymentTerms}</p>
          </div>
        )}

        {/* Observaciones */}
        {invoice.notes && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Observaciones</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Oferta válida por {invoice.validityDays || 15} días desde la fecha de emisión.
          </p>
          {company?.name && (
            <p className="text-xs text-gray-400 mt-1">
              {company.name} {company.ruc ? `| RUC: ${company.ruc}` : ''} | {company.phone || ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
