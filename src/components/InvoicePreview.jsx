export default function InvoicePreview({ invoice, onBack }) {
  if (!invoice) return null

  const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const isFinal = invoice.customerType === 'final'

  const calcExpiry = () => {
    const d = new Date(invoice.date)
    d.setDate(d.getDate() + (invoice.validityDays || 15))
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          ← Volver
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Imprimir / PDF
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 print:p-4 print:shadow-none print:border-none">
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">PROFORMA</h1>
            <p className="text-sm text-gray-500 mt-1">{invoice.number || `#${invoice.id.slice(-6).toUpperCase()}`}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Fecha de emisión</p>
            <p className="font-medium text-gray-800">{invoice.date}</p>
            <p className="text-sm text-gray-500 mt-2">Válida hasta</p>
            <p className="font-medium text-blue-600">{calcExpiry()}</p>
          </div>
        </div>

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

        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 text-gray-500 font-semibold">Descripción</th>
              <th className="text-center py-2 text-gray-500 font-semibold">Cant.</th>
              <th className="text-right py-2 text-gray-500 font-semibold">P. Unit.</th>
              <th className="text-right py-2 text-gray-500 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map(item => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 text-gray-800">{item.description || '(sin descripción)'}</td>
                <td className="py-3 text-center text-gray-800">{item.quantity}</td>
                <td className="py-3 text-right text-gray-800">${Number(item.unitPrice).toFixed(2)}</td>
                <td className="py-3 text-right font-medium text-gray-800">${(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end pt-4 border-t-2 border-gray-200">
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">TOTAL</p>
            <p className="text-3xl font-bold text-gray-800">${total.toFixed(2)}</p>
          </div>
        </div>

        {invoice.paymentTerms && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Condiciones de Pago</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.paymentTerms}</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Oferta válida por {invoice.validityDays || 15} días desde la fecha de emisión.
          </p>
        </div>
      </div>
    </div>
  )
}
