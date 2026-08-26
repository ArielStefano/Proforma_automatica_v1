import { useState, useEffect } from 'react'
import InvoiceList from './components/InvoiceList'
import InvoiceForm from './components/InvoiceForm'
import InvoicePreview from './components/InvoicePreview'
import CustomerList from './components/CustomerList'
import CompanySettings from './components/CompanySettings'
import ProductCatalog from './components/ProductCatalog'
import { getInvoices, getInvoice, deleteInvoice } from './utils/storage'
import { ToastProvider, useToast } from './utils/toast'
import { DarkModeProvider, useDarkMode } from './utils/darkMode'

function DarkToggle() {
  const { dark, toggle } = useDarkMode()
  return (
    <button onClick={toggle} title={dark ? 'Modo claro' : 'Modo oscuro'}
      className="px-2 py-1.5 text-lg rounded-lg transition hover:bg-gray-100 dark:hover:bg-gray-700">
      {dark ? '☀️' : '🌙'}
    </button>
  )
}

function AppContent() {
  const toast = useToast()
  const [view, setView] = useState('list')
  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [previewReturn, setPreviewReturn] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const data = await getInvoices()
      setInvoices(data)
    } catch (e) {
      console.error('Error al cargar cotizaciones:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadInvoices() }, [])

  const refreshList = async () => {
    await loadInvoices()
    setView('list')
    setSelectedInvoice(null)
  }

  const handleView = async (id) => {
    setSelectedInvoice(await getInvoice(id))
    setView('preview')
  }

  const handleEdit = async (id) => {
    setSelectedInvoice(await getInvoice(id))
    setView('form')
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta cotización?')) {
      try {
        await deleteInvoice(id)
        await loadInvoices()
      } catch (e) {
        toast('Error al eliminar: ' + e.message, 'error')
      }
    }
  }

  const handleFormPreview = (invoice) => {
    setSelectedInvoice(invoice)
    setPreviewReturn('form')
    setView('preview')
  }

  const navClass = (active) =>
    `px-3 py-1.5 text-sm rounded-lg transition ${
      active
        ? 'bg-blue-100 text-blue-700 font-medium dark:bg-blue-900 dark:text-blue-300'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
    }`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 print:hidden transition-colors">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Proforma Automática</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Mantenimiento Eléctrico & Video Vigilancia</p>
          </div>
          <nav className="flex gap-2 items-center">
            <button onClick={() => { setView('list'); setSelectedInvoice(null) }} className={navClass(view === 'list')}>
              Cotizaciones
            </button>
            <button onClick={() => { setSelectedInvoice(null); setView('customers') }} className={navClass(view === 'customers')}>
              Clientes
            </button>
            <button onClick={() => { setSelectedInvoice(null); setView('settings') }} className={navClass(view === 'settings')}>
              Empresa
            </button>
            <button onClick={() => { setSelectedInvoice(null); setView('products') }} className={navClass(view === 'products')}>
              Productos
            </button>
            <button onClick={() => { setSelectedInvoice(null); setView('form') }} className={navClass(view === 'form' && !selectedInvoice)}>
              + Nueva
            </button>
            <DarkToggle />
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading && view === 'list' ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">Cargando cotizaciones...</div>
        ) : view === 'list' ? (
          <InvoiceList
            invoices={invoices}
            onNew={() => { setSelectedInvoice(null); setView('form') }}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : view === 'form' ? (
          <InvoiceForm
            invoice={selectedInvoice}
            onSave={refreshList}
            onCancel={refreshList}
            onPreview={handleFormPreview}
          />
        ) : view === 'preview' ? (
          <InvoicePreview
            invoice={selectedInvoice}
            onBack={() => { setView(previewReturn || 'list'); setPreviewReturn(null) }}
          />
        ) : view === 'customers' ? (
          <CustomerList />
        ) : view === 'settings' ? (
          <CompanySettings onBack={() => setView('list')} />
        ) : view === 'products' ? (
          <ProductCatalog onBack={() => setView('list')} />
        ) : null}
      </main>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <DarkModeProvider>
        <AppContent />
      </DarkModeProvider>
    </ToastProvider>
  )
}

export default App
