import { useState, useEffect } from 'react'
import { getCompanySettings } from '../utils/company'

export default function InvoicePreview({ invoice, onBack }) {
  const [company, setCompany] = useState(null)

  useEffect(() => {
    getCompanySettings().then(setCompany).catch(console.error)
  }, [])

  if (!invoice) return null

  const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const isFinal = invoice.customerType === 'final'
  const isDraft = invoice.status !== 'finalized'

  const calcExpiry = () => {
    const d = new Date(invoice.date)
    d.setDate(d.getDate() + (invoice.validityDays || 15))
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          ← Volver
        </button>
        <button onClick={() => window.print()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          Imprimir / PDF
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 print:p-6 print:shadow-none print:border-none relative">
        {isDraft && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 rounded-full print:hidden">
              BORRADOR
            </span>
          </div>
        )}

        {/* Encabezado: Logo + Empresa + Número */}
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

        {/* Datos del cliente */}
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

        {/* Tabla de productos */}
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
                <td className="py-3 text-right text-gray-800">${Number(item.unitPrice).toFixed(2)}</td>
                <td className="py-3 text-right font-medium text-gray-800">${(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-end pt-4 border-t-2 border-gray-300">
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">TOTAL</p>
            <p className="text-3xl font-bold text-gray-800">${total.toFixed(2)}</p>
          </div>
        </div>

        {/* Condiciones de pago */}
        {invoice.paymentTerms && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Condiciones de Pago</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.paymentTerms}</p>
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
