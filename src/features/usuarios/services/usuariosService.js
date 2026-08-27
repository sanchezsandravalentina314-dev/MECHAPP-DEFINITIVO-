import api from '@/services/api';

export const usuariosService = {
  async listar() {
    const response = await api.get('/usuarios/');
    return response.data;
  },

  async obtener(id) {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  async actualizar(id, data) {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },

  async cambiarEstado(id, estado) {
    const response = await api.put(`/usuarios/${id}/estado`, { estado });
    return response.data;
  },
};
