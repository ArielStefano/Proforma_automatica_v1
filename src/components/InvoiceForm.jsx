import { useState, useEffect } from 'react'
import CustomerForm from './CustomerForm'
import ItemTable from './ItemTable'
import { saveInvoice, finalizeInvoice, generateId } from '../utils/storage'
import { formatCurrency } from '../utils/format'
import { getCompanies, getDefaultCompany } from '../utils/company'
import { useToast } from '../utils/toast'

export default function InvoiceForm({ invoice: existing, onSave, onCancel, onPreview }) {
  const toast = useToast()
  const [invoice, setInvoice] = useState(null)
  const [companies, setCompanies] = useState([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    getCompanies().then(setCompanies).catch(console.error)
  }, [])

  useEffect(() => {
    if (existing) {
      setInvoice(existing)
    } else {
      getDefaultCompany().then(def => {
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
          companyId: def?.id || null,
          discountType: 'percentage',
          discountValue: 0,
          ivaRate: 15,
          status: 'draft',
        })
      })
    }
  }, [existing])

  const clearError = (field) => {
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next })
  }

  const handleCustomerChange = (customer) => {
    setInvoice(prev => prev ? { ...prev, customer } : prev)
    clearError('customer_name')
    clearError('customer_cedula')
    clearError('customer_address')
    clearError('customer_phone')
  }
  const handleCustomerTypeChange = (customerType) => {
    setInvoice(prev => prev ? { ...prev, customerType } : prev)
    clearError('customer_name')
    clearError('customer_cedula')
    clearError('customer_address')
    clearError('customer_phone')
  }
  const handleItemsChange = (items) => {
    setInvoice(prev => prev ? { ...prev, items } : prev)
    clearError('items')
  }
  const handleFieldChange = (field, value) => {
    setInvoice(prev => prev ? { ...prev, [field]: value } : prev)
    clearError(field)
  }

  const validate = () => {
    const next = {}
    if (invoice.customerType === 'client') {
      if (!invoice.customer.name.trim()) next.customer_name = 'El nombre del cliente es obligatorio'
      if (!invoice.customer.cedula.trim()) next.customer_cedula = 'La cédula/RUC del cliente es obligatoria'
      if (!invoice.customer.address.trim()) next.customer_address = 'La dirección del cliente es obligatoria'
      if (!invoice.customer.phone.trim()) next.customer_phone = 'El teléfono del cliente es obligatorio'
    }
    if (!invoice.items.some(i => i.description.trim())) {
      next.items = 'Agrega al menos un producto o servicio'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSaveDraft = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setSaving(true)
      await saveInvoice({ ...invoice, status: 'draft', number: null })
      toast('Borrador guardado', 'success')
      onSave()
    } catch (e) {
      toast('Error al guardar: ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleFinalize = async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (invoice.status !== 'finalized') {
      if (!window.confirm('¿Estás seguro de finalizar y numerar esta cotización? Ya no podrás editarla como borrador.')) return
    }
    try {
      setSaving(true)
      if (invoice.status === 'finalized') {
        await saveInvoice(invoice)
        toast('Cambios guardados', 'success')
      } else {
        await finalizeInvoice(invoice)
        toast('Cotización finalizada y numerada', 'success')
      }
      onSave()
    } catch (e) {
      toast('Error al finalizar: ' + e.message, 'error')
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

  if (!invoice) return <div className="text-center py-20 text-gray-400 dark:text-gray-500">Cargando...</div>

  const isFinalized = invoice.status === 'finalized'

  return (
    <form>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {existing ? 'Editar Cotización' : 'Nueva Cotización'}
          </h2>
          {invoice.number && (
            <p className="text-sm text-gray-400 dark:text-gray-500 font-mono mt-1">{invoice.number}</p>
          )}
          {isFinalized && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full dark:bg-green-900/50 dark:text-green-400">Finalizada</span>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700">
            Cancelar
          </button>
          <button type="button" onClick={() => onPreview && onPreview(invoice)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition dark:text-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700">
            Vista Previa
          </button>
          <button type="button" onClick={handleSaveDraft} disabled={saving || isFinalized}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
            {saving ? 'Guardando...' : 'Guardar Borrador'}
          </button>
          <button type="button" onClick={handleFinalize} disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            {saving ? 'Guardando...' : isFinalized ? 'Guardar Cambios' : 'Finalizar y Numerar'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Empresa Emisora</h2>
          </div>
          {companies.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">No hay empresas registradas. Ve a Configuración &gt; Empresa para agregar una.</p>
          ) : (
            <select value={invoice.companyId || companies[0]?.id || ''}
              onChange={e => handleFieldChange('companyId', e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name || '(sin nombre)'}</option>
              ))}
            </select>
          )}
        </div>

        <CustomerForm customer={invoice.customer} customerType={invoice.customerType}
          onChange={handleCustomerChange} onTypeChange={handleCustomerTypeChange}
          errors={errors} />

        <ItemTable items={invoice.items} onChange={handleItemsChange} />
        {errors.items && <p className="text-xs text-red-500 -mt-4">{errors.items}</p>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Descuento</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <select value={invoice.discountType}
              onChange={e => handleFieldChange('discountType', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto Fijo ($)</option>
            </select>
            <input type="number" min="0" step={invoice.discountType === 'percentage' ? '1' : '0.01'}
              value={invoice.discountValue}
              onChange={e => handleFieldChange('discountValue', Number(e.target.value) || 0)}
              className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              placeholder="0" />
            {invoice.discountValue > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {invoice.discountType === 'percentage'
                  ? `- ${invoice.discountValue}%`
                  : `- $${formatCurrency(invoice.discountValue)}`}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">IVA (Ecuador)</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm text-gray-600 dark:text-gray-300">Tarifa</label>
            <input type="number" min="0" max="100" step="1"
              value={invoice.ivaRate || 0}
              onChange={e => handleFieldChange('ivaRate', Number(e.target.value) || 0)}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
            <label className="text-sm text-gray-600 dark:text-gray-300">%</label>
            <span className="text-sm text-gray-400 dark:text-gray-500 ml-2">Déjalo en 0 si la cotización no aplica IVA.</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Resumen</h2>
          {(() => {
            const sub = invoice.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0)
            const dv = invoice.discountValue || 0
            const da = invoice.discountType === 'percentage' ? sub * (dv / 100) : dv
            const base = Math.max(0, sub - da)
            const rate = invoice.ivaRate || 0
            const iva = base * (rate / 100)
            const tot = base + iva
            return (
              <div className="text-right space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Subtotal: ${formatCurrency(sub)}</p>
                {da > 0 && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Descuento: -${formatCurrency(da)}
                    <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">
                      ({invoice.discountType === 'percentage' ? `${dv}%` : '$' + formatCurrency(dv)})
                    </span>
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">Subtotal sin IVA: ${formatCurrency(base)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">IVA ({rate}%): ${formatCurrency(iva)}</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100 border-t border-gray-200 dark:border-gray-600 pt-1">Total: ${formatCurrency(tot)}</p>
              </div>
            )
          })()}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Validez de la Oferta</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm text-gray-600 dark:text-gray-300">Válida por</label>
            <input type="number" min="1" max="90" value={invoice.validityDays}
              onChange={e => handleFieldChange('validityDays', Number(e.target.value) || 15)}
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
            <label className="text-sm text-gray-600 dark:text-gray-300">días desde la fecha de emisión</label>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium ml-2">(vence el {calcExpiry()})</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Términos de Pago</h2>
          <textarea value={invoice.paymentTerms}
            onChange={e => handleFieldChange('paymentTerms', e.target.value)} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Puedes modificar este texto según cada cotización.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Observaciones</h2>
          <textarea value={invoice.notes}
            onChange={e => handleFieldChange('notes', e.target.value)} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" placeholder="Notas adicionales para el cliente..." />
        </div>
      </div>
    </form>
  )
}
