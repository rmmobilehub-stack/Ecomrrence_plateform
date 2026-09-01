export function formatMoney(amount: number, currency = 'PKR'): string {
  const code = (currency || 'PKR').toUpperCase();
  const wholeNumberCurrency = code === 'PKR';
  return new Intl.NumberFormat(code === 'PKR' ? 'en-PK' : 'en-US', {
    style: 'currency',
    currency: code,
    currencyDisplay: 'code',
    minimumFractionDigits: wholeNumberCurrency ? 0 : 2,
    maximumFractionDigits: wholeNumberCurrency ? 0 : 2,
  }).format(Number(amount) || 0).replace(/\u00a0/g, ' ');
}
