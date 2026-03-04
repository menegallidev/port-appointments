export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidPhone(value: string) {
  const digits = normalizePhone(value);
  return digits.length >= 10 && digits.length <= 11;
}

export function formatPhoneMask(value: string) {
  const digits = normalizePhone(value).slice(0, 11);

  if (digits.length === 0) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
