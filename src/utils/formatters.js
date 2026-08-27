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

export function formatDate(dateStr) {
  if (!dateStr) return 'Sin fecha';
  try {
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
