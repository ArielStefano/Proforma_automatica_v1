import { supabase } from './supabase'

export async function getCompanySettings() {
  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .eq('id', 'default')
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data || { name: '', ruc: '', phone: '', address: '', email: '', logo_url: '' }
}

export async function saveCompanySettings(settings) {
  const { error } = await supabase
    .from('company_settings')
    .upsert({ id: 'default', ...settings })
  if (error) throw error
  return settings
}
