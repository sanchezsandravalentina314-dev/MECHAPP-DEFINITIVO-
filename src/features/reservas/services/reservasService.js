import api from '@/services/api';

export const reservasService = {
  async listar() {
    const response = await api.get('/reservas/');
    return response.data;
  },

  async misReservas(id_usuario) {
    const response = await api.get(`/reservas/usuario/${id_usuario}`);
    return response.data;
  },

  async obtener(id) {
    const response = await api.get(`/reservas/${id}`);
    return response.data;
  },

  async crear(data) {
    const response = await api.post('/reservas/', data);
    return response.data;
  },

  async actualizar(id, data) {
    const response = await api.put(`/reservas/${id}`, data);
    return response.data;
  },

  async cancelar(id) {
    const response = await api.delete(`/reservas/${id}`);
    return response.data;
  },
};
