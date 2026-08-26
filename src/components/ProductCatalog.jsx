import { useState, useEffect } from 'react'
import { getProducts, saveProduct, createProduct, deleteProduct } from '../utils/products'
import { useToast } from '../utils/toast'

export default function ProductCatalog({ onBack }) {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', unitPrice: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      setProducts(await getProducts())
    } catch (e) {
      console.error('Error al cargar productos:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const startNew = () => {
    setEditing({ id: null })
    setForm({ name: '', unitPrice: 0 })
  }

  const startEdit = (p) => {
    setEditing(p)
    setForm({ name: p.name, unitPrice: p.unitPrice })
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm({ name: '', unitPrice: 0 })
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast('El nombre es obligatorio', 'warning'); return }
    if (form.unitPrice <= 0) { toast('El precio debe ser mayor a 0', 'warning'); return }
    try {
      setSaving(true)
      if (editing?.id) {
        await saveProduct({ ...editing, ...form })
      } else {
        await createProduct({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), ...form })
      }
      await load()
      cancelEdit()
      toast('Producto guardado', 'success')
    } catch (e) {
      toast('Error al guardar: ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto del catálogo?')) return
    try {
      await deleteProduct(id)
      await load()
      toast('Producto eliminado', 'success')
    } catch (e) {
      toast('Error al eliminar: ' + e.message, 'error')
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400 dark:text-gray-500">Cargando productos...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Productos / Servicios ({products.length})</h2>
        <div className="flex gap-2">
          {!editing && (
            <button onClick={startNew}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
              + Nuevo Producto
            </button>
          )}
          <button onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700">
            Volver
          </button>
        </div>
      </div>

      {editing ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{editing.id ? 'Editar Producto' : 'Nuevo Producto'}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Producto / Servicio</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                placeholder="Ej: Cámara IP HD, Instalación de cableado..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio Unitario ($)</label>
              <input type="number" min="0" step="0.01" value={form.unitPrice}
                onChange={e => setForm({ ...form, unitPrice: Number(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                placeholder="0.00" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={cancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 dark:text-gray-500 mb-4">No hay productos registrados aún</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Agregá productos para poder seleccionarlos rápido al crear cotizaciones.</p>
            </div>
          )}
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{p.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-gray-800 dark:text-gray-100">${Number(p.unitPrice).toFixed(2)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(p)}
                  className="px-3 py-1 text-xs font-medium text-amber-600 bg-amber-50 rounded hover:bg-amber-100 transition dark:text-amber-400 dark:bg-amber-900/50 dark:hover:bg-amber-800">Editar</button>
                <button onClick={() => handleDelete(p.id)}
                  className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition dark:text-red-400 dark:bg-red-900/50 dark:hover:bg-red-800">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
