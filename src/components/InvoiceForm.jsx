import { useState } from 'react'
import CustomerForm from './CustomerForm'
import ItemTable from './ItemTable'
import { saveInvoice, generateId } from '../utils/storage'

const emptyInvoice = {
  id: generateId(),
  date: new Date().toISOString().split('T')[0],
  customer: { name: '', phone: '', address: '', email: '', ruc: '' },
  items: [{ id: generateId(), description: '', quantity: 1, unitPrice: 0 }],
}

export default function InvoiceForm({ invoice: existing, onSave, onCancel }) {
  const [invoice, setInvoice] = useState(existing || emptyInvoice)

  const handleCustomerChange = (customer) => {
    setInvoice(prev => ({ ...prev, customer }))
  }

  const handleItemsChange = (items) => {
    setInvoice(prev => ({ ...prev, items }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!invoice.customer.name.trim()) {
      alert('El nombre del cliente es obligatorio')
      return
    }
    if (!invoice.customer.phone.trim()) {
      alert('El teléfono del cliente es obligatorio')
      return
    }
    if (!invoice.customer.address.trim()) {
      alert('La dirección del cliente es obligatoria')
      return
    }
    if (!invoice.customer.email.trim()) {
      alert('El email del cliente es obligatorio')
      return
    }
    const hasItems = invoice.items.some(i => i.description.trim())
    if (!hasItems) {
      alert('Agrega al menos un producto o servicio')
      return
    }
    saveInvoice(invoice)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {existing ? 'Editar Factura' : 'Nueva Factura'}
        </h2>
        <div className="flex gap-2">
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
            Guardar Factura
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <CustomerForm customer={invoice.customer} onChange={handleCustomerChange} />
        <ItemTable items={invoice.items} onChange={handleItemsChange} />
      </div>
    </form>
  )
}
