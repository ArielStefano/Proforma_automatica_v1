export function formatCurrency(amount) {
  return Number(amount).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
