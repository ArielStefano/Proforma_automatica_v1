import { supabase } from './supabase'

function fromDb(row) {
  return { id: row.id, name: row.name, unitPrice: row.unit_price }
}

function toDb(product) {
  return { id: product.id, name: product.name, unit_price: product.unitPrice }
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return (data || []).map(fromDb)
}

export async function saveProduct(product) {
  const { error } = await supabase
    .from('products')
    .upsert(toDb(product))
  if (error) throw error
  return product
}

export async function createProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert(toDb(product))
    .select()
    .single()
  if (error) throw error
  return fromDb(data)
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  if (error) throw error
}
