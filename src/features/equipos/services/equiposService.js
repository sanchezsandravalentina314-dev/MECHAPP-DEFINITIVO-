import api from '@/services/api';

export const equiposService = {
  async listar() {
    const response = await api.get('/equipos/');
    return response.data;
  },

  async obtener(id) {
    const response = await api.get(`/equipos/${id}`);
    return response.data;
  },

  async crear(data) {
    const response = await api.post('/equipos/', data);
    return response.data;
  },

  async actualizar(id, data) {
    const response = await api.put(`/equipos/${id}`, data);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/equipos/${id}`);
    return response.data;
  },

  async agregarJugador(id_equipo, id_usuario) {
    const response = await api.post(`/equipos/${id_equipo}/jugadores`, { id_usuario });
    return response.data;
  },

  async removerJugador(id_equipo, id_usuario) {
    const response = await api.delete(`/equipos/${id_equipo}/jugadores/${id_usuario}`);
    return response.data;
  },
};
