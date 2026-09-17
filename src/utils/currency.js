/** Formats a number as an Indian Rupee amount, e.g. 1499 -> "₹1,499". */
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
