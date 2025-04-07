/**
 * Formats a number as currency (USD by default).
 * @param value - The number to format.
 * @param currency - The currency code (e.g., 'USD', 'EUR'). Defaults to 'USD'.
 * @param locale - The locale string (e.g., 'en-US', 'de-DE'). Defaults to 'en-US'.
 * @returns The formatted currency string, or an empty string if value is null/undefined.
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  if (value == null) {
    return ''; // Return empty string for null or undefined
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0, // Adjust as needed
      maximumFractionDigits: 0, // Show whole dollars for simplicity
    }).format(value);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return String(value); // Fallback to string representation
  }
}

/**
 * Formats a number as a percentage.
 * @param value - The number to format (e.g., 5 for 5%).
 * @param locale - The locale string (e.g., 'en-US'). Defaults to 'en-US'.
 * @returns The formatted percentage string (e.g., "5%"), or an empty string if value is null/undefined.
 */
export function formatPercent(
  value: number | null | undefined,
  locale: string = 'en-US'
): string {
   if (value == null) {
     return '';
   }
  try {
    // Note: Intl.NumberFormat with style 'percent' expects a decimal (e.g., 0.05 for 5%).
    // If your input is already a percentage number (like 5 for 5%), divide by 100.
    // If your input is a decimal (like 0.05), use it directly.
    // Assuming input is like '5' for 5%:
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1, // Allow one decimal place if needed
    }).format(value / 100);
  } catch (error) {
    console.error("Error formatting percent:", error);
    return `${value}%`; // Basic fallback
  }
}

/**
 * Formats a number with commas as thousands separators.
 * @param value - The number to format.
 * @param locale - The locale string (e.g., 'en-US'). Defaults to 'en-US'.
 * @returns The formatted number string, or an empty string if value is null/undefined.
 */
export function formatNumber(
  value: number | null | undefined,
  locale: string = 'en-US'
): string {
  if (value == null) {
    return '';
  }
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch (error) {
    console.error("Error formatting number:", error);
    return String(value); // Fallback
  }
}
