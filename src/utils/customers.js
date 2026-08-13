import { supabase } from './supabase'
import { generateId } from './storage'

export async function getCustomers() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('name')
  if (error) throw error
  return data || []
}

export async function saveCustomer(customer) {
  const { error } = await supabase
    .from('clientes')
    .upsert({
      id: customer.id,
      name: customer.name,
      cedula: customer.cedula,
      address: customer.address,
      phone: customer.phone,
      email: customer.email,
    })
  if (error) throw error
  return customer
}

export async function deleteCustomer(id) {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getCustomer(id) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createCustomer(data) {
  const customer = {
    id: generateId(),
    name: data.name || '',
    cedula: data.cedula || '',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
  }
  await saveCustomer(customer)
  return customer
}
