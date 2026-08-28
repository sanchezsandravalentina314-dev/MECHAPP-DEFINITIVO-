import api from '@/services/api';

export const canchasService = {
  async listar() {
    const response = await api.get('/canchas/');
    return response.data;
  },

  async obtener(id) {
    const response = await api.get(`/canchas/${id}`);
    return response.data;
  },

  async consultarDisponibilidad(id, fecha) {
    const response = await api.get(`/canchas/${id}/disponibilidad?fecha=${fecha}`);
    return response.data;
  },

  async obtenerValoraciones(id) {
    const response = await api.get(`/valoraciones/cancha/${id}`);
    return response.data;
  },

  async crear(data) {
    const response = await api.post('/canchas/', data);
    return response.data;
  },

  async actualizar(id, data) {
    const response = await api.put(`/canchas/${id}`, data);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/canchas/${id}`);
    return response.data;
  },
};
