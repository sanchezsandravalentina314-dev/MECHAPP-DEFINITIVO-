import api from '@/services/api';

export const authService = {
  /**
   * Registra un nuevo usuario en FastAPI / PostgreSQL.
   * @param {Object} data { id_rol, nombre, documento, correo, telefono, contrasena }
   */
  async registro(data) {
    const response = await api.post('/auth/registro', data);
    return response.data;
  },

  /**
   * Inicia sesión. El token JWT viene del backend y se guarda en localStorage.
   * @param {Object} data { correo, contrasena }
   */
  async login(data) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  /**
   * Solicita el envío de un correo de recuperación de contraseña.
   * @param {Object} data { correo }
   */
  async solicitarRecuperacion(data) {
    const response = await api.post('/auth/recuperar-contrasena', data);
    return response.data;
  },

  /**
   * Restablece la contraseña usando el token recibido por correo.
   * @param {Object} data { token, nueva_contrasena }
   */
  async restablecerContrasena(data) {
    const response = await api.post('/auth/restablecer-contrasena', data);
    return response.data;
  },
};
