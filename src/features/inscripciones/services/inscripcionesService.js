import api from '@/services/api';

export const inscripcionesService = {
  async inscribirUsuario(data) {
    // data: { id_usuario, id_torneo, estado: 'Confirmada' }
    try {
      const response = await api.post('/inscripciones/', data);
      return response.data;
    } catch {
      const saved = localStorage.getItem('mechapp_mock_inscripciones');
      const list = saved ? JSON.parse(saved) : [];
      const nuevo = { ...data, id_inscripcion: Date.now(), fecha_inscripcion: new Date().toISOString() };
      localStorage.setItem('mechapp_mock_inscripciones', JSON.stringify([...list, nuevo]));
      return nuevo;
    }
  },

  async inscribirEquipo(data) {
    // data: { id_equipo, id_torneo, estado: 'Confirmada' }
    try {
      const response = await api.post('/inscripcion-equipos/', data);
      return response.data;
    } catch {
      const saved = localStorage.getItem('mechapp_mock_inscripcion_equipos');
      const list = saved ? JSON.parse(saved) : [];
      const nuevo = { ...data, id_inscripcion_equipo: Date.now(), fecha_inscripcion: new Date().toISOString() };
      localStorage.setItem('mechapp_mock_inscripcion_equipos', JSON.stringify([...list, nuevo]));
      return nuevo;
    }
  },
};
