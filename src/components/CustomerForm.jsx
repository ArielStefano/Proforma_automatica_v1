export default function CustomerForm({ customer, onChange }) {
  const handleChange = (e) => {
    onChange({ ...customer, [e.target.name]: e.target.value })
  }

  const fields = [
    { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre del cliente' },
    { name: 'phone', label: 'Teléfono', type: 'text', required: true, placeholder: 'Número de teléfono' },
    { name: 'address', label: 'Dirección', type: 'text', required: true, placeholder: 'Dirección completa' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'correo@ejemplo.com' },
    { name: 'ruc', label: 'RUC / Cédula', type: 'text', required: false, placeholder: 'RUC o cédula (opcional)' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Datos del Cliente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.name} className={!f.required ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {f.label}
              {f.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={f.type}
              name={f.name}
              value={customer[f.name] || ''}
              onChange={handleChange}
              required={f.required}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
