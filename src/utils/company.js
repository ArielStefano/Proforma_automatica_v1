import { supabase } from './supabase'

export async function getCompanies() {
  const { data, error } = await supabase.from('company_settings').select('*').order('name', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getCompany(id) {
  const { data, error } = await supabase.from('company_settings').select('*').eq('id', id).single()
  if (error && error.code !== 'PGRST116') return null
  return data
}

export async function getDefaultCompany() {
  const list = await getCompanies()
  return list[0] || null
}

export async function saveCompany(data) {
  const { error } = await supabase.from('company_settings').upsert(data)
  if (error) throw error
  return data
}

export async function createCompany(data) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const { error } = await supabase.from('company_settings').insert({ id, ...data })
  if (error) throw error
  return { id, ...data }
}

export async function deleteCompany(id) {
  const { error } = await supabase.from('company_settings').delete().eq('id', id)
  if (error) throw error
}
