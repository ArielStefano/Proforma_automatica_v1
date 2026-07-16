const FINAL_CONSUMER = {
  name: 'CONSUMIDOR FINAL',
  cedula: '9999999999',
  address: '',
  phone: '',
  email: '',
}

export default function CustomerForm({ customer, customerType, onChange, onTypeChange }) {
  const isFinal = customerType === 'final'

  const handleTypeChange = (type) => {
    onTypeChange(type)
    if (type === 'final') {
      onChange(FINAL_CONSUMER)
    } else {
      onChange({ name: '', cedula: '', address: '', phone: '', email: '' })
    }
  }

  const handleChange = (e) => {
    onChange({ ...customer, [e.target.name]: e.target.value })
  }

  const fields = [
    { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre del cliente' },
    { name: 'cedula', label: 'Cédula / RUC', type: 'text', required: true, placeholder: 'Número de cédula o RUC' },
    { name: 'address', label: 'Dirección', type: 'text', required: true, placeholder: 'Dirección completa' },
    { name: 'phone', label: 'Teléfono', type: 'text', required: true, placeholder: 'Número de teléfono' },
    { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'correo@ejemplo.com' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Datos del Cliente</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => handleTypeChange('client')}
            className={`px-4 py-1.5 text-sm rounded-md transition ${
              !isFinal ? 'bg-white text-gray-800 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Cliente
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('final')}
            className={`px-4 py-1.5 text-sm rounded-md transition ${
              isFinal ? 'bg-white text-gray-800 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Consumidor Final
          </button>
        </div>
      </div>

      {isFinal ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">Consumidor Final</p>
          <p>RUC: 9999999999</p>
          <p className="text-blue-500 text-xs mt-2">Los datos se completarán automáticamente al guardar.</p>
        </div>
      ) : (
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
      )}
    </div>
  )
}
