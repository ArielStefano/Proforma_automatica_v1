import { useState, useEffect, useRef } from 'react'
import { getCompanies, saveCompany, createCompany, deleteCompany } from '../utils/company'
import { useToast } from '../utils/toast'

export default function CompanySettings({ onBack }) {
  const toast = useToast()
  const [companies, setCompanies] = useState([])
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [preview, setPreview] = useState('')
  const fileRef = useRef()

  useEffect(() => {
    getCompanies().then(setCompanies).catch(console.error)
  }, [])

  const startNew = () => {
    setEditing({ name: '', ruc: '', phone: '', address: '', email: '', logo_url: '' })
    setLogoFile(null)
    setPreview('')
  }

  const startEdit = (c) => {
    setEditing({ ...c })
    setPreview(c.logo_url || '')
    setLogoFile(null)
  }

  const cancelEdit = () => {
    setEditing(null)
    setLogoFile(null)
    setPreview('')
  }

  const handleChange = (e) => {
    setEditing({ ...editing, [e.target.name]: e.target.value })
  }

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoFile(null)
    setPreview('')
    setEditing({ ...editing, logo_url: '' })
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const data = { ...editing, logo_url: preview || '' }
      if (editing.id) {
        await saveCompany(data)
      } else {
        await createCompany(data)
      }
      cancelEdit()
      setCompanies(await getCompanies())
      toast('Empresa guardada', 'success')
    } catch (e) {
      toast('Error al guardar: ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta empresa?')) return
    try {
      await deleteCompany(id)
      setCompanies(await getCompanies())
      toast('Empresa eliminada', 'success')
    } catch (e) {
      toast('Error al eliminar: ' + e.message, 'error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Empresas</h2>
        <div className="flex gap-2">
          {!editing && (
            <button onClick={startNew}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
              + Agregar Empresa
            </button>
          )}
          <button onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Volver
          </button>
        </div>
      </div>

      {editing ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">{editing.id ? 'Editar Empresa' : 'Nueva Empresa'}</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {preview ? (
                  <img src={preview} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-400">Sin logo</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} className="text-sm" />
                {preview && (
                  <button type="button" onClick={removeLogo}
                    className="text-xs text-red-500 hover:text-red-700">Eliminar logo</button>
                )}
                <p className="text-xs text-gray-400 mt-1">Recomendado: PNG o JPG, máximo 500 KB</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
              <input type="text" name="name" value={editing.name} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
              <input type="text" name="ruc" value={editing.ruc} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="text" name="phone" value={editing.phone} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input type="text" name="address" value={editing.address} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={editing.email} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={cancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
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
          {companies.length === 0 && (
            <p className="text-sm text-gray-400 py-8 text-center">No hay empresas registradas. Agrega una para comenzar.</p>
          )}
          {companies.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
              {c.logo_url ? (
                <img src={c.logo_url} alt="" className="w-12 h-12 object-contain rounded" />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">Sin logo</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{c.name || '(sin nombre)'}</p>
                {c.ruc && <p className="text-xs text-gray-500">RUC: {c.ruc}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(c)}
                  className="px-3 py-1 text-xs font-medium text-amber-600 bg-amber-50 rounded hover:bg-amber-100 transition">Editar</button>
                <button onClick={() => handleDelete(c.id)}
                  className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
