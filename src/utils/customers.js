import { generateId } from './storage'

const STORAGE_KEY = 'proforma_customers'

export function getCustomers() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveCustomer(customer) {
  const customers = getCustomers()
  const index = customers.findIndex(c => c.id === customer.id)
  if (index >= 0) {
    customers[index] = customer
  } else {
    customers.push(customer)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
  return customer
}

export function deleteCustomer(id) {
  const customers = getCustomers().filter(c => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
}

export function getCustomer(id) {
  return getCustomers().find(c => c.id === id) || null
}

export function createCustomer(data) {
  return saveCustomer({
    id: generateId(),
    name: data.name || '',
    cedula: data.cedula || '',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    createdAt: new Date().toISOString(),
  })
}
