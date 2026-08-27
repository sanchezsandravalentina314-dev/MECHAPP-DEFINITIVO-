/**
 * Cliente HTTP para la API FastAPI de MechApp.
 * Utiliza Fetch API nativo del navegador con interceptores de autorización JWT y control de errores.
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('mechapp_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const res = await fetch(url, config);

    // Si la sesión expiró o es inválida
    if (res.status === 401) {
      localStorage.removeItem('mechapp_token');
      localStorage.removeItem('mechapp_user');
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Extraer mensaje descriptivo enviado por FastAPI / Pydantic
      let message = data?.detail || data?.mensaje || `Error en la petición (HTTP ${res.status})`;
      if (Array.isArray(message)) {
        message = message.map((m) => `${m.loc ? m.loc.join('.') + ': ' : ''}${m.msg}`).join(', ');
      }
      throw new Error(message);
    }

    return { data, status: res.status };
  } catch (error) {
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('No se pudo conectar con el servidor de MechApp (FastAPI).');
    }
    throw error;
  }
}

const api = {
  get: (url, opts) => request(url, { ...opts, method: 'GET' }),
  post: (url, body, opts) => request(url, { ...opts, method: 'POST', body: JSON.stringify(body) }),
  put: (url, body, opts) => request(url, { ...opts, method: 'PUT', body: JSON.stringify(body) }),
  delete: (url, opts) => request(url, { ...opts, method: 'DELETE' }),
};

export default api;
