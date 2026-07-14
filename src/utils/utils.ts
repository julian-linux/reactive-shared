type FormatToNumberProps = (n: string | number) => string
type FormatToMoneyProps = (value: string | number, spacing?: boolean) => string
type FormatToPhoneProps = (text: string) => string

/**
 * Converts any string or number to a properly formatted number string
 * Handles various formats: "$ 1.234,34", "1234,34", "1,234.34", etc.
 * @param n - Input value (string or number)
 * @returns Formatted number string with thousand separators and decimal places
 */
export const formatToNumber: FormatToNumberProps = (n) => {
  // If it's already a number, format it directly
  if (typeof n === 'number') {
    if (isNaN(n)) return '0'
    const fixed = n % 1 !== 0 ? 2 : 0
    return n
      .toFixed(fixed)
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
  }

  // If it's a string, clean and parse it
  if (typeof n === 'string') {
    // Remove all non-numeric characters except dots, commas, and minus sign
    let cleaned = n.replace(/[^0-9.,-]/g, '')

    // Handle empty or invalid strings
    if (!cleaned || cleaned === '-' || cleaned === '.') return '0'

    // Determine the decimal separator (comma or dot)
    const lastCommaIndex = cleaned.lastIndexOf(',')
    const lastDotIndex = cleaned.lastIndexOf('.')

    let numericValue: number

    if (lastCommaIndex > lastDotIndex) {
      // European format: 1.234,34 or 1234,34
      // Remove thousand separators (dots) and replace decimal comma with dot
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
      numericValue = parseFloat(cleaned)
    } else if (lastDotIndex > lastCommaIndex) {
      // US/International format: 1,234.34 or 1234.34
      // Remove thousand separators (commas)
      cleaned = cleaned.replace(/,/g, '')
      numericValue = parseFloat(cleaned)
    } else {
      // No decimal separator found, just remove any remaining separators
      cleaned = cleaned.replace(/[.,]/g, '')
      numericValue = parseFloat(cleaned)
    }

    // Handle parsing errors
    if (isNaN(numericValue)) return '0'

    // Format the number
    const fixed = numericValue % 1 !== 0 ? 2 : 0
    return numericValue
      .toFixed(fixed)
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
  }

  return '0'
}

export const formatToMoney: FormatToMoneyProps = (value, spacing = true) => `$${spacing
  ? ' '
  : ''}${formatToNumber(value)}`

export const formatToPhone: FormatToPhoneProps = (text = '') => {
  const t1 = text.slice(0, 3)
  const t2 = text.slice(3, 6)
  const t3 = text.slice(6)

  return `${t1} ${t2} ${t3}`
}
