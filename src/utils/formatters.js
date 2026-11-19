/**
 * Utilidades para formatear fechas, monedas y textos en MechApp.
 */

export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '$0 COP';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

// Alias conveniente
export const formatCOP = formatCurrency;

export function formatDate(dateStr) {
  if (!dateStr) return 'Sin fecha';
  try {
    // Si viene en formato YYYY-MM-DD o YYYY-MM-DDT..., parsear partes locales para evitar desfase de UTC a Colombia (UTC-5)
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const datePart = dateStr.split('T')[0].trim();
      const parts = datePart.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        const localDate = new Date(parts[0], parts[1] - 1, parts[2]);
        return localDate.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Alias conveniente
export const formatFecha = formatDate;

export function formatTime(timeStr) {
  if (!timeStr) return '--:--';
  return timeStr.slice(0, 5);
}

export function getRoleName(idRol) {
  const roles = {
    1: 'Administrador',
    2: 'Jugador',
    3: 'Propietario',
  };
  return roles[idRol] || `Rol #${idRol}`;
}
