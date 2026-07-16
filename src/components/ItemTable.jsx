import { useState } from 'react'
import { generateId } from '../utils/storage'
import { formatCurrency } from '../utils/format'

function formatInput(n) {
  return Number(n).toLocaleString('es-PY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export default function ItemTable({ items, onChange }) {
  const [focused, setFocused] = useState(null)

  const addItem = () => {
    onChange([...items, { id: generateId(), description: '', quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (id) => {
    if (items.length <= 1) return
    onChange(items.filter(item => item.id !== id))
  }

  const updateItem = (id, field, value) => {
    onChange(items.map(item =>
      item.id === id ? { ...item, [field]: field === 'description' ? value : Number(value) || 0 } : item
    ))
  }

  const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Productos / Servicios</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-1 text-gray-600 font-medium w-[40%]">Descripción</th>
              <th className="text-center py-2 px-1 text-gray-600 font-medium w-[15%]">Cant.</th>
              <th className="text-right py-2 px-1 text-gray-600 font-medium w-[18%]">P. Unit.</th>
              <th className="text-right py-2 px-1 text-gray-600 font-medium w-[18%]">Total</th>
              <th className="text-center py-2 px-1 w-[9%]"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const isFocused = focused === item.id
              return (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2 px-1">
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Ej: Cámara HD, Instalación..."
                    />
                  </td>
                  <td className="py-2 px-1">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                      className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-center text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mx-auto block"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={isFocused ? item.unitPrice || '' : formatInput(item.unitPrice)}
                      onFocus={() => setFocused(item.id)}
                      onBlur={() => setFocused(null)}
                      onChange={e => {
                        const raw = e.target.value.replace(/[^\d.,]/g, '').replace(/,/g, '')
                        updateItem(item.id, 'unitPrice', raw ? parseFloat(raw) : 0)
                      }}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-right text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </td>
                  <td className="py-2 px-1 text-right font-medium text-gray-800">
                    ${formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                  <td className="py-2 px-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 1}
                      className="text-red-400 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed text-lg leading-none"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
        >
          + Agregar producto
        </button>
        <div className="text-right">
          <span className="text-gray-500 text-sm mr-2">TOTAL:</span>
          <span className="text-2xl font-bold text-gray-800">${formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}
