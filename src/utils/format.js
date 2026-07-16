export function formatCurrency(amount) {
  return Number(amount).toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
