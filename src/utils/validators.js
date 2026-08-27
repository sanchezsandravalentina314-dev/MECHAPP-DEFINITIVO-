/**
 * Validaciones comunes para formularios en MechApp.
 */

export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function isValidDocument(doc) {
  return /^[0-9A-Za-z-]{5,20}$/.test(String(doc).trim());
}

export function isValidPhone(phone) {
  if (!phone) return true; // es opcional en backend
  return /^[0-9+() -]{7,20}$/.test(String(phone).trim());
}
