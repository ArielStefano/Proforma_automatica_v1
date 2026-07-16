import { useState, useEffect, useRef } from 'react'
import { getCompanySettings, saveCompanySettings } from '../utils/company'

export default function CompanySettings({ onBack }) {
  const [form, setForm] = useState({ name: '', ruc: '', phone: '', address: '', email: '', logo_url: '' })
  const [logoFile, setLogoFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    getCompanySettings().then(data => {
      setForm(data)
      setPreview(data.logo_url || '')
    }).catch(console.error)
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
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
    setForm({ ...form, logo_url: '' })
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await saveCompanySettings({ ...form, logo_url: preview || '' })
      alert('Datos guardados correctamente')
      onBack()
    } catch (e) {
      alert('Error al guardar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Configuración de la Empresa</h2>
        <button onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          Volver
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la Empresa</label>
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

        {/* Datos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
            <input type="text" name="name" value={form.name} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
            <input type="text" name="ruc" value={form.ruc} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input type="text" name="address" value={form.address} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar Datos'}
          </button>
        </div>
      </div>
    </div>
  )
}
