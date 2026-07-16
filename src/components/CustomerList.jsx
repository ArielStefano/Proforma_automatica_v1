import { useState, useEffect } from 'react'
import { getCustomers, saveCustomer, deleteCustomer } from '../utils/customers'

export default function CustomerList({ onBack }) {
  const [customers, setCustomers] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', cedula: '', address: '', phone: '', email: '' })

  useEffect(() => { setCustomers(getCustomers()) }, [])

  const refresh = () => setCustomers(getCustomers())

  const startEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name, cedula: c.cedula, address: c.address, phone: c.phone, email: c.email })
  }

  const startNew = () => {
    setEditing({ id: null })
    setForm({ name: '', cedula: '', address: '', phone: '', email: '' })
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm({ name: '', cedula: '', address: '', phone: '', email: '' })
  }

  const handleSave = () => {
    if (!form.name.trim()) { alert('El nombre es obligatorio'); return }
    if (!form.cedula.trim()) { alert('La cédula/RUC es obligatoria'); return }
    saveCustomer({ ...form, id: editing?.id || undefined })
    refresh()
    cancelEdit()
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este cliente del registro?')) {
      deleteCustomer(id)
      refresh()
    }
  }

  if (editing !== null) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editing.id ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <div className="space-y-4">
            {['name','cedula','address','phone','email'].map(f => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {f === 'cedula' ? 'Cédula / RUC' : f}
                  {f !== 'email' && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type={f === 'email' ? 'email' : 'text'}
                  value={form[f]}
                  onChange={e => setForm({ ...form, [f]: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={cancelEdit} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="button" onClick={handleSave} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">Guardar</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Mis Clientes ({customers.length})</h2>
        <button onClick={startNew} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          + Nuevo Cliente
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">No hay clientes registrados aún</p>
          <p className="text-sm text-gray-400">Agrega clientes desde el formulario de cotización o desde aquí.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Nombre</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Cédula/RUC</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Teléfono</th>
                <th className="text-center py-3 px-4 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{c.name}</td>
                  <td className="py-3 px-4 text-gray-600">{c.cedula}</td>
                  <td className="py-3 px-4 text-gray-600">{c.phone}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => startEdit(c)} className="px-3 py-1 text-xs font-medium text-amber-600 bg-amber-50 rounded hover:bg-amber-100">Editar</button>
                      <button onClick={() => handleDelete(c.id)} className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
