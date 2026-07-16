import { useState, useEffect } from 'react'
import CustomerForm from './CustomerForm'
import ItemTable from './ItemTable'
import { saveInvoice, finalizeInvoice, generateId } from '../utils/storage'
import { formatCurrency } from '../utils/format'

export default function InvoiceForm({ invoice: existing, onSave, onCancel }) {
  const [invoice, setInvoice] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setInvoice(existing)
    } else {
      setInvoice({
        id: generateId(),
        number: null,
        date: new Date().toISOString().split('T')[0],
        customerType: 'client',
        customer: { name: '', cedula: '', address: '', phone: '', email: '' },
        items: [{ id: generateId(), description: '', quantity: 1, unitPrice: 0 }],
        validityDays: 15,
        paymentTerms: 'Para dar inicio formal a las actividades de este proyecto, se requiere un anticipo equivalente al 50% del total cotizado. El 50% restante se liquidará contra entrega final del proyecto.',
        notes: '',
        discountType: 'percentage',
        discountValue: 0,
        status: 'draft',
      })
    }
  }, [existing])

  const handleCustomerChange = (customer) => {
    setInvoice(prev => prev ? { ...prev, customer } : prev)
  }
  const handleCustomerTypeChange = (customerType) => {
    setInvoice(prev => prev ? { ...prev, customerType } : prev)
  }
  const handleItemsChange = (items) => {
    setInvoice(prev => prev ? { ...prev, items } : prev)
  }
  const handleFieldChange = (field, value) => {
    setInvoice(prev => prev ? { ...prev, [field]: value } : prev)
  }

  const validate = () => {
    if (!invoice) return false
    if (invoice.customerType === 'client') {
      if (!invoice.customer.name.trim()) { alert('El nombre del cliente es obligatorio'); return false }
      if (!invoice.customer.cedula.trim()) { alert('La cédula/RUC del cliente es obligatoria'); return false }
      if (!invoice.customer.address.trim()) { alert('La dirección del cliente es obligatoria'); return false }
      if (!invoice.customer.phone.trim()) { alert('El teléfono del cliente es obligatorio'); return false }
    }
    if (!invoice.items.some(i => i.description.trim())) {
      alert('Agrega al menos un producto o servicio')
      return false
    }
    return true
  }

  const handleSaveDraft = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setSaving(true)
      await saveInvoice({ ...invoice, status: 'draft', number: null })
      onSave()
    } catch (e) {
      alert('Error al guardar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleFinalize = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setSaving(true)
      if (invoice.status === 'finalized') {
        await saveInvoice(invoice)
      } else {
        await finalizeInvoice(invoice)
      }
      onSave()
    } catch (e) {
      alert('Error al finalizar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const calcExpiry = () => {
    if (!invoice) return ''
    const d = new Date(invoice.date)
    d.setDate(d.getDate() + (invoice.validityDays || 15))
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  if (!invoice) return <div className="text-center py-20 text-gray-400">Cargando...</div>

  const isFinalized = invoice.status === 'finalized'

  return (
    <form>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {existing ? 'Editar Cotización' : 'Nueva Cotización'}
          </h2>
          {invoice.number && (
            <p className="text-sm text-gray-400 font-mono mt-1">{invoice.number}</p>
          )}
          {isFinalized && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Finalizada</span>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button type="button" onClick={() => onPreview && onPreview(invoice)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition">
            Vista Previa
          </button>
          <button type="button" onClick={handleSaveDraft} disabled={saving || isFinalized}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar Borrador'}
          </button>
          <button type="button" onClick={handleFinalize} disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            {saving ? 'Guardando...' : isFinalized ? 'Guardar Cambios' : 'Finalizar y Numerar'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <CustomerForm customer={invoice.customer} customerType={invoice.customerType}
          onChange={handleCustomerChange} onTypeChange={handleCustomerTypeChange} />
        <ItemTable items={invoice.items} onChange={handleItemsChange} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Descuento</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <select value={invoice.discountType}
              onChange={e => handleFieldChange('discountType', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto Fijo ($)</option>
            </select>
            <input type="number" min="0" step={invoice.discountType === 'percentage' ? '1' : '0.01'}
              value={invoice.discountValue}
              onChange={e => handleFieldChange('discountValue', Number(e.target.value) || 0)}
              className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="0" />
            {invoice.discountValue > 0 && (
              <span className="text-sm text-gray-500">
                {invoice.discountType === 'percentage'
                  ? `- ${invoice.discountValue}%`
                  : `- $${formatCurrency(invoice.discountValue)}`}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Validez de la Oferta</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm text-gray-600">Válida por</label>
            <input type="number" min="1" max="90" value={invoice.validityDays}
              onChange={e => handleFieldChange('validityDays', Number(e.target.value) || 15)}
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <label className="text-sm text-gray-600">días desde la fecha de emisión</label>
            <span className="text-sm text-blue-600 font-medium ml-2">(vence el {calcExpiry()})</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Términos de Pago</h2>
          <textarea value={invoice.paymentTerms}
            onChange={e => handleFieldChange('paymentTerms', e.target.value)} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y" />
          <p className="text-xs text-gray-400 mt-1">Puedes modificar este texto según cada cotización.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Observaciones</h2>
          <textarea value={invoice.notes}
            onChange={e => handleFieldChange('notes', e.target.value)} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y" placeholder="Notas adicionales para el cliente..." />
        </div>
      </div>
    </form>
  )
}
