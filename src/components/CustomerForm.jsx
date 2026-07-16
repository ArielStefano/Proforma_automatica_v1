import { useState, useEffect } from 'react'
import { getCustomers, createCustomer } from '../utils/customers'

const FINAL_CONSUMER = {
  name: 'CONSUMIDOR FINAL',
  cedula: '9999999999',
  address: '',
  phone: '',
  email: '',
}

export default function CustomerForm({ customer, customerType, onChange, onTypeChange, errors = {} }) {
  const isFinal = customerType === 'final'
  const [savedCustomers, setSavedCustomers] = useState([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')

  useEffect(() => {
    getCustomers().then(setSavedCustomers).catch(console.error)
  }, [])

  const handleTypeChange = (type) => {
    onTypeChange(type)
    setSelectedCustomerId('')
    onChange(type === 'final' ? FINAL_CONSUMER : { name: '', cedula: '', address: '', phone: '', email: '' })
  }

  const handleChange = (e) => {
    setSelectedCustomerId('')
    onChange({ ...customer, [e.target.name]: e.target.value })
  }

  const handleSelectCustomer = (id) => {
    setSelectedCustomerId(id)
    const found = savedCustomers.find(c => c.id === id)
    if (found) {
      onChange({
        name: found.name || '',
        cedula: found.cedula || '',
        address: found.address || '',
        phone: found.phone || '',
        email: found.email || '',
      })
    }
  }

  const handleSaveToRegistry = async () => {
    if (!customer.name.trim()) {
      alert('Ingresa al menos el nombre del cliente para guardarlo')
      return
    }
    try {
      await createCustomer(customer)
      setSavedCustomers(await getCustomers())
      alert('Cliente guardado en el registro')
    } catch (e) {
      alert('Error al guardar cliente: ' + e.message)
    }
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
          <button type="button" onClick={() => handleTypeChange('client')}
            className={`px-4 py-1.5 text-sm rounded-md transition ${!isFinal ? 'bg-white text-gray-800 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
            Cliente
          </button>
          <button type="button" onClick={() => handleTypeChange('final')}
            className={`px-4 py-1.5 text-sm rounded-md transition ${isFinal ? 'bg-white text-gray-800 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
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
        <div className="space-y-4">
          {savedCustomers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente registrado</label>
              <select value={selectedCustomerId} onChange={e => handleSelectCustomer(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option value="">-- Seleccionar del registro --</option>
                {savedCustomers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.cedula}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(f => {
              const errKey = 'customer_' + f.name
              return (
                <div key={f.name} className={!f.required ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {f.label}{f.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input type={f.type} name={f.name} value={customer[f.name] || ''} onChange={handleChange}
                    required={f.required}
                    className={`w-full border rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors[errKey] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    placeholder={f.placeholder} />
                  {errors[errKey] && <p className="text-xs text-red-500 mt-1">{errors[errKey]}</p>}
                </div>
              )
            })}
          </div>

          <button type="button" onClick={handleSaveToRegistry}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            + Guardar datos en mi registro de clientes
          </button>
        </div>
      )}
    </div>
  )
}
