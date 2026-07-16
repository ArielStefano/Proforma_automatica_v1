import { supabase } from './supabase'

function toDb(invoice) {
  return {
    id: invoice.id,
    number: invoice.number || null,
    date: invoice.date,
    customer_type: invoice.customerType,
    customer: invoice.customer,
    items: invoice.items,
    validity_days: invoice.validityDays,
    payment_terms: invoice.paymentTerms,
    notes: invoice.notes || '',
    status: invoice.status || 'draft',
  }
}

function fromDb(row) {
  return {
    id: row.id,
    number: row.number,
    date: row.date,
    customerType: row.customer_type,
    customer: row.customer,
    items: row.items,
    validityDays: row.validity_days,
    paymentTerms: row.payment_terms,
    notes: row.notes || '',
    status: row.status || 'draft',
  }
}

export async function getInvoices() {
  const { data, error } = await supabase
    .from('cotizaciones')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return (data || []).map(fromDb)
}

export async function saveInvoice(invoice) {
  const { error } = await supabase
    .from('cotizaciones')
    .upsert(toDb(invoice))
  if (error) throw error
  return invoice
}

export async function deleteInvoice(id) {
  const { error } = await supabase
    .from('cotizaciones')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getInvoice(id) {
  const { data, error } = await supabase
    .from('cotizaciones')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data ? fromDb(data) : null
}

export async function finalizeInvoice(invoice) {
  const { number } = await getNextNumber()
  const updated = { ...invoice, number, status: 'finalized' }
  await saveInvoice(updated)
  return updated
}

async function getNextNumber() {
  const { data, error } = await supabase
    .rpc('increment_counter', { key_name: 'proforma_counter' })
  if (error) throw error
  const year = new Date().getFullYear()
  const seq = data || 1
  return { number: `COT-${year}-${String(seq).padStart(4, '0')}`, seq }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
