import { useState, useEffect, useRef } from 'react'
import { generateId } from '../utils/storage'
import { getProducts } from '../utils/products'
import { formatCurrency } from '../utils/format'

function formatInput(n) {
  return Number(n).toLocaleString('es-EC', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export default function ItemTable({ items, onChange }) {
  const [focused, setFocused] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [showPicker, setShowPicker] = useState(null)
  const [search, setSearch] = useState('')
  const pickerRef = useRef(null)

  useEffect(() => {
    getProducts().then(setCatalog).catch(() => {})
  }, [])

  useEffect(() => {
    if (showPicker === null) return
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(null)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPicker])

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

  const selectProduct = (itemIdx, product) => {
    onChange(items.map((item, i) =>
      i === itemIdx ? { ...item, description: product.name, unitPrice: product.unitPrice } : item
    ))
    setShowPicker(null)
    setSearch('')
  }

  const filtered = catalog.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Productos / Servicios</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="text-left py-2 px-1 text-gray-600 dark:text-gray-300 font-medium w-[40%]">Descripción</th>
              <th className="text-center py-2 px-1 text-gray-600 dark:text-gray-300 font-medium w-[15%]">Cant.</th>
              <th className="text-right py-2 px-1 text-gray-600 dark:text-gray-300 font-medium w-[18%]">P. Unit.</th>
              <th className="text-right py-2 px-1 text-gray-600 dark:text-gray-300 font-medium w-[18%]">Total</th>
              <th className="text-center py-2 px-1 w-[9%]"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const isFocused = focused === item.id
              return (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 relative">
                  <td className="py-2 px-1 relative">
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        placeholder="Ej: Cámara HD, Instalación..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowPicker(showPicker === idx ? null : idx)}
                        className="shrink-0 px-1.5 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition dark:border-gray-600 dark:hover:bg-gray-600 text-gray-400 dark:text-gray-500"
                        title="Seleccionar del catálogo"
                      >📋</button>
                    </div>
                    {showPicker === idx && (
                      <div ref={pickerRef} className="absolute z-50 top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                          <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            placeholder="🔍 Buscar producto..."
                            autoFocus
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                          {filtered.length === 0 ? (
                            <p className="p-3 text-sm text-gray-400 dark:text-gray-500 text-center">
                              {catalog.length === 0
                                ? 'No hay productos. Agregá desde Productos.'
                                : 'Sin resultados'}
                            </p>
                          ) : (
                            filtered.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => selectProduct(idx, p)}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition flex justify-between items-center"
                              >
                                <span className="text-sm text-gray-800 dark:text-gray-100 truncate">{p.name}</span>
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 shrink-0 ml-2">${formatCurrency(p.unitPrice)}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-1">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                      className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-center text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mx-auto block dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
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
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-right text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </td>
                  <td className="py-2 px-1 text-right font-medium text-gray-800 dark:text-gray-200">
                    ${formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                  <td className="py-2 px-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 1}
                      className="text-red-400 hover:text-red-600 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed text-lg leading-none"
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
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition dark:text-blue-400 dark:bg-blue-900/50 dark:hover:bg-blue-800"
        >
          + Agregar producto
        </button>
        <div className="text-right">
          <span className="text-gray-500 dark:text-gray-400 text-sm mr-2">TOTAL:</span>
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">${formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}
