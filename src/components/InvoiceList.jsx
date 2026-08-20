import { formatCurrency } from '../utils/format'

export default function InvoiceList({ invoices, onNew, onView, onEdit, onDelete }) {
  const drafts = invoices.filter(i => i.status !== 'finalized')
  const finalized = invoices.filter(i => i.status === 'finalized')

  if (invoices.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4 text-gray-300 dark:text-gray-600">📋</div>
        <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No hay cotizaciones aún</h2>
        <p className="text-gray-400 dark:text-gray-500 mb-6">Crea tu primera proforma para comenzar</p>
        <button onClick={onNew}
          className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition font-medium">
          + Nueva Cotización
        </button>
      </div>
    )
  }

  const Table = ({ title, list, emptyMsg }) => (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      {list.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4">{emptyMsg}</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 dark:bg-gray-700/50 dark:border-gray-600">
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300 font-medium">N°</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300 font-medium">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-300 font-medium">Fecha</th>
                <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-300 font-medium">Total</th>
                <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-300 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {[...list].reverse().map(inv => {
                const sub = inv.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0)
                const dv = inv.discountValue || 0
                const da = inv.discountType === 'percentage' ? sub * (dv / 100) : dv
                const base = Math.max(0, sub - da)
                const rate = inv.ivaRate || 0
                const total = base + base * (rate / 100)
                return (
                  <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-mono text-xs">
                      {inv.number || <span className="text-gray-400 dark:text-gray-500 italic">Borrador</span>}
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{inv.customer.name || '(sin nombre)'}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{inv.date}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800 dark:text-gray-200">${formatCurrency(total)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => onView(inv.id)}
                          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition dark:text-blue-400 dark:bg-blue-900/50 dark:hover:bg-blue-800">Ver</button>
                        <button onClick={() => onEdit(inv.id)}
                          className="px-3 py-1 text-xs font-medium text-amber-600 bg-amber-50 rounded hover:bg-amber-100 transition dark:text-amber-400 dark:bg-amber-900/50 dark:hover:bg-amber-800">Editar</button>
                        <button onClick={() => onDelete(inv.id)}
                          className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition dark:text-red-400 dark:bg-red-900/50 dark:hover:bg-red-800">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Mis Cotizaciones ({finalized.length + drafts.length})</h2>
        <button onClick={onNew}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          + Nueva
        </button>
      </div>
      <Table title="Finalizadas" list={finalized} emptyMsg="No hay cotizaciones finalizadas" />
      <Table title="Borradores" list={drafts} emptyMsg="No hay borradores" />
    </div>
  )
}
