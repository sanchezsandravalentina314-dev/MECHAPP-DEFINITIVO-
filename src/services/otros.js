import api from '@/services/api';

export const inscripcionesService = {
  async listar() {
    const response = await api.get('/inscripciones/');
    return response.data;
  },

  async obtener(id) {
    const response = await api.get(`/inscripciones/${id}`);
    return response.data;
  },

  async crear(data) {
    const response = await api.post('/inscripciones/', data);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/inscripciones/${id}`);
    return response.data;
  },
};

export const partidosService = {
  async listar() {
    const response = await api.get('/partidos/');
    return response.data;
  },

  async obtener(id) {
    const response = await api.get(`/partidos/${id}`);
    return response.data;
  },

  async crear(data) {
    const response = await api.post('/partidos/', data);
    return response.data;
  },

  async actualizar(id, data) {
    const response = await api.put(`/partidos/${id}`, data);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/partidos/${id}`);
    return response.data;
  },
};

export const noticiasService = {
  async listar() {
    const response = await api.get('/noticias/');
    return response.data;
  },

  async obtener(id) {
    const response = await api.get(`/noticias/${id}`);
    return response.data;
  },

  async crear(data) {
    const response = await api.post('/noticias/', data);
    return response.data;
  },

  async actualizar(id, data) {
    const response = await api.put(`/noticias/${id}`, data);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/noticias/${id}`);
    return response.data;
  },
};

export const eventosService = {
  async listar() {
    const response = await api.get('/eventos/');
    return response.data;
  },

  async obtener(id) {
    const response = await api.get(`/eventos/${id}`);
    return response.data;
  },

  async crear(data) {
    const response = await api.post('/eventos/', data);
    return response.data;
  },

  async actualizar(id, data) {
    const response = await api.put(`/eventos/${id}`, data);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/eventos/${id}`);
    return response.data;
  },
};

export const ubicacionesService = {
  async listar() {
    const response = await api.get('/ubicaciones/');
    return response.data;
  },

  async obtener(id) {
    const response = await api.get(`/ubicaciones/${id}`);
    return response.data;
  },

  async crear(data) {
    const response = await api.post('/ubicaciones/', data);
    return response.data;
  },

  async actualizar(id, data) {
    const response = await api.put(`/ubicaciones/${id}`, data);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/ubicaciones/${id}`);
    return response.data;
  },
};
