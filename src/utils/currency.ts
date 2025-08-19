// Vietnamese currency formatting utilities

// Remove all non-digit characters
export const onlyDigits = (input: string): string => input.replace(/[^0-9]/g, '');

// Format a numeric string (digits only) or number with dot thousand separators: 1500000 -> "1.500.000"
export const formatNumberToVn = (value: number | string): string => {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'number' ? String(Math.floor(value)) : value;
  const digits = onlyDigits(str);
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Parse a Vietnamese formatted number string to number: "1.500.000" -> 1500000
export const parseVnToNumber = (formatted: string): number => {
  if (!formatted) return 0;
  const digits = onlyDigits(formatted);
  if (!digits) return 0;
  // Avoid leading zeros turning into octal (not in JS modern, but be explicit)
  return Number(digits);
};

// Format full currency text if needed, e.g., 1500000 -> "1.500.000 VNĐ"
export const formatVndText = (value: number | string): string => {
  const base = formatNumberToVn(value);
  return base ? `${base} VNĐ` : '';
};

