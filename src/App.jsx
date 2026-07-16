import { useState, useEffect } from 'react'
import InvoiceList from './components/InvoiceList'
import InvoiceForm from './components/InvoiceForm'
import InvoicePreview from './components/InvoicePreview'
import CustomerList from './components/CustomerList'
import { getInvoices, getInvoice, deleteInvoice } from './utils/storage'

export default function App() {
  const [view, setView] = useState('list')
  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  useEffect(() => {
    setInvoices(getInvoices())
  }, [])

  const refreshList = () => {
    setInvoices(getInvoices())
    setView('list')
    setSelectedInvoice(null)
  }

  const handleView = (id) => {
    setSelectedInvoice(getInvoice(id))
    setView('preview')
  }

  const handleEdit = (id) => {
    setSelectedInvoice(getInvoice(id))
    setView('form')
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar esta cotización?')) {
      deleteInvoice(id)
      setInvoices(getInvoices())
    }
  }

  const navClass = (active) =>
    `px-3 py-1.5 text-sm rounded-lg transition ${
      active ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Proforma Automática</h1>
            <p className="text-xs text-gray-500">Mantenimiento Eléctrico & Video Vigilancia</p>
          </div>
          <nav className="flex gap-2">
            <button onClick={() => { setView('list'); setSelectedInvoice(null) }} className={navClass(view === 'list')}>
              Cotizaciones
            </button>
            <button onClick={() => { setSelectedInvoice(null); setView('customers') }} className={navClass(view === 'customers')}>
              Clientes
            </button>
            <button onClick={() => { setSelectedInvoice(null); setView('form') }} className={navClass(view === 'form' && !selectedInvoice)}>
              + Nueva
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {view === 'list' && (
          <InvoiceList
            invoices={invoices}
            onNew={() => { setSelectedInvoice(null); setView('form') }}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        {view === 'form' && (
          <InvoiceForm
            invoice={selectedInvoice}
            onSave={refreshList}
            onCancel={refreshList}
          />
        )}
        {view === 'preview' && (
          <InvoicePreview
            invoice={selectedInvoice}
            onBack={() => setView('list')}
          />
        )}
        {view === 'customers' && (
          <CustomerList />
        )}
      </main>
    </div>
  )
}
