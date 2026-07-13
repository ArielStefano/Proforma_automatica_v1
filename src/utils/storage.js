const STORAGE_KEY = 'proforma_invoices'

export function getInvoices() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveInvoice(invoice) {
  const invoices = getInvoices()
  const index = invoices.findIndex(inv => inv.id === invoice.id)
  if (index >= 0) {
    invoices[index] = invoice
  } else {
    invoices.push(invoice)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
  return invoice
}

export function deleteInvoice(id) {
  const invoices = getInvoices().filter(inv => inv.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
}

export function getInvoice(id) {
  return getInvoices().find(inv => inv.id === id) || null
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
