import { useState, useEffect } from 'react'
import CustomerForm from './CustomerForm'
import ItemTable from './ItemTable'
import { saveInvoice, generateId, getNextNumber } from '../utils/storage'

function createEmptyInvoice() {
  const { number } = getNextNumber()
  return {
    id: generateId(),
    number,
    date: new Date().toISOString().split('T')[0],
    customerType: 'client',
    customer: { name: '', cedula: '', address: '', phone: '', email: '' },
    items: [{ id: generateId(), description: '', quantity: 1, unitPrice: 0 }],
    validityDays: 15,
    paymentTerms: 'Para dar inicio formal a las actividades de este proyecto, se requiere un anticipo equivalente al 50% del total cotizado. El 50% restante se liquidará contra entrega final del proyecto.',
  }
}

export default function InvoiceForm({ invoice: existing, onSave, onCancel }) {
  const [invoice, setInvoice] = useState(existing || createEmptyInvoice())

  useEffect(() => {
    setInvoice(existing || createEmptyInvoice())
  }, [existing])

  const handleCustomerChange = (customer) => {
    setInvoice(prev => ({ ...prev, customer }))
  }

  const handleCustomerTypeChange = (customerType) => {
    setInvoice(prev => ({ ...prev, customerType }))
  }

  const handleItemsChange = (items) => {
    setInvoice(prev => ({ ...prev, items }))
  }

  const handleFieldChange = (field, value) => {
    setInvoice(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (invoice.customerType === 'client') {
      if (!invoice.customer.name.trim()) {
        alert('El nombre del cliente es obligatorio')
        return
      }
      if (!invoice.customer.cedula.trim()) {
        alert('La cédula/RUC del cliente es obligatoria')
        return
      }
      if (!invoice.customer.address.trim()) {
        alert('La dirección del cliente es obligatoria')
        return
      }
      if (!invoice.customer.phone.trim()) {
        alert('El teléfono del cliente es obligatorio')
        return
      }
    }
    const hasItems = invoice.items.some(i => i.description.trim())
    if (!hasItems) {
      alert('Agrega al menos un producto o servicio')
      return
    }
    saveInvoice(invoice)
    onSave()
  }

  const calcExpiry = () => {
    const d = new Date(invoice.date)
    d.setDate(d.getDate() + (invoice.validityDays || 15))
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {existing ? 'Editar Cotización' : 'Nueva Cotización'}
        </h2>
        <div className="flex items-center gap-2">
          {invoice.number && (
            <span className="text-sm text-gray-400 font-mono mr-2">{invoice.number}</span>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Generar Cotización
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <CustomerForm
          customer={invoice.customer}
          customerType={invoice.customerType}
          onChange={handleCustomerChange}
          onTypeChange={handleCustomerTypeChange}
        />
        <ItemTable items={invoice.items} onChange={handleItemsChange} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Validez de la Oferta</h2>
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600">Válida por</label>
            <input
              type="number"
              min="1"
              max="90"
              value={invoice.validityDays}
              onChange={e => handleFieldChange('validityDays', Number(e.target.value) || 15)}
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <label className="text-sm text-gray-600">días desde la fecha de emisión</label>
            <span className="text-sm text-blue-600 font-medium ml-2">(vence el {calcExpiry()})</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Términos de Pago</h2>
          <textarea
            value={invoice.paymentTerms}
            onChange={e => handleFieldChange('paymentTerms', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          />
          <p className="text-xs text-gray-400 mt-1">Puedes modificar este texto según cada cotización.</p>
        </div>
      </div>
    </form>
  )
}
