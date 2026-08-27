import api from '@/services/api';

export const torneosService = {
  async listar() {
    const response = await api.get('/torneos/');
    return response.data;
  },

  async obtener(id) {
    const response = await api.get(`/torneos/${id}`);
    return response.data;
  },

  async crear(data) {
    const response = await api.post('/torneos/', data);
    return response.data;
  },

  async actualizar(id, data) {
    const response = await api.put(`/torneos/${id}`, data);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/torneos/${id}`);
    return response.data;
  },
};
