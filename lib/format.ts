export function formatPrice(value: number) {
  return `${Math.round(value).toLocaleString("en-US")} IQD`;
}

export function formatStock(stock: number) {
  if (stock <= 0) return "نفد المخزون";
  if (stock === 1) return "قطعة واحدة";
  if (stock === 2) return "قطعتان";
  if (stock >= 3 && stock <= 10) return `${stock} قطع`;
  return `${stock} قطعة`;
}
