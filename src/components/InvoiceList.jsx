export default function InvoiceList({ invoices, onNew, onView, onEdit, onDelete }) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4 text-gray-300">📋</div>
        <h2 className="text-xl font-semibold text-gray-600 mb-2">No hay cotizaciones aún</h2>
        <p className="text-gray-400 mb-6">Crea tu primera proforma para comenzar</p>
        <button
          onClick={onNew}
          className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Nueva Cotización
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Mis Cotizaciones ({invoices.length})</h2>
        <button
          onClick={onNew}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          + Nueva
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 text-gray-600 font-medium">N°</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Cliente</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Fecha</th>
              <th className="text-right py-3 px-4 text-gray-600 font-medium">Total</th>
              <th className="text-center py-3 px-4 text-gray-600 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {[...invoices].reverse().map(inv => {
              const total = inv.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0)
              return (
                <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800 font-mono text-xs">
                    {inv.number || `#${inv.id.slice(-6).toUpperCase()}`}
                  </td>
                  <td className="py-3 px-4 text-gray-800">{inv.customer.name || '(sin nombre)'}</td>
                  <td className="py-3 px-4 text-gray-500">{inv.date}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-800">
                    ${total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => onView(inv.id)} className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition">Ver</button>
                      <button onClick={() => onEdit(inv.id)} className="px-3 py-1 text-xs font-medium text-amber-600 bg-amber-50 rounded hover:bg-amber-100 transition">Editar</button>
                      <button onClick={() => onDelete(inv.id)} className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition">Eliminar</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
