// Whole baht with Thai digit grouping, such as `฿1,250`.
export function formatPrice(price: number) {
  return `฿${price.toLocaleString('th-TH')}`
}
