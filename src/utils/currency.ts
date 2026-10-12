/**
 * Formats a number into Indian Rupee representation (₹ with Indian numbering grouping: 1,00,000.00)
 */
export function formatINR(amount: number | null | undefined, includeDecimals = true): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.00';
  }
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  };

  try {
    const formatted = new Intl.NumberFormat('en-IN', options).format(absAmount);
    return isNegative ? `-${formatted}` : formatted;
  } catch {
    const parts = absAmount.toFixed(includeDecimals ? 2 : 0).split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1] ? `.${parts[1]}` : '';
    
    // Indian numbering regex: last 3 digits, then groups of 2 digits
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    if (otherNumbers !== '') {
      integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }
    
    const res = `₹${integerPart}${decimalPart}`;
    return isNegative ? `-${res}` : res;
  }
}

/**
 * Returns plain number formatted with Indian commas without the currency symbol
 */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}
