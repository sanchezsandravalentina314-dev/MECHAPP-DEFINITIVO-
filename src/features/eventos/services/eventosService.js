import api from '@/services/api';

const MOCK_EVENTOS = [
  {
    id: 1,
    nombre: 'Taller de Técnicas de Lanzamiento y Agarre',
    descripcion: 'Clase magistral dirigida a jóvenes promesas del tejo para mejorar la precisión de embocada.',
    cancha_id: 1,
    fecha: '2026-07-05',
    hora: '09:00:00',
    tipo: 'Taller / Capacitación',
  },
  {
    id: 2,
    nombre: 'Festival de Integración de Familias del Tejo',
    descripcion: 'Jornada recreativa con comida típica boyacense, exhibición de campeones y música tradicional.',
    cancha_id: 2,
    fecha: '2026-08-25',
    hora: '11:00:00',
    tipo: 'Recreativo / Cultural',
  },
];

export const eventosService = {
  async listar() {
    try {
      const response = await api.get('/eventos/');
      return response.data;
    } catch {
      const saved = localStorage.getItem('mechapp_mock_eventos');
      return saved ? JSON.parse(saved) : MOCK_EVENTOS;
    }
  },

  async crear(data) {
    try {
      const response = await api.post('/eventos/', data);
      return response.data;
    } catch {
      const list = await this.listar();
      const nuevo = { ...data, id: Date.now() };
      const updated = [...list, nuevo];
      localStorage.setItem('mechapp_mock_eventos', JSON.stringify(updated));
      return nuevo;
    }
  },

  async actualizar(id, data) {
    try {
      const response = await api.put(`/eventos/${id}`, data);
      return response.data;
    } catch {
      const list = await this.listar();
      const updated = list.map((e) => (e.id === Number(id) ? { ...e, ...data } : e));
      localStorage.setItem('mechapp_mock_eventos', JSON.stringify(updated));
      return { id, ...data };
    }
  },

  async eliminar(id) {
    try {
      const response = await api.delete(`/eventos/${id}`);
      return response.data;
    } catch {
      const list = await this.listar();
      const updated = list.filter((e) => e.id !== Number(id));
      localStorage.setItem('mechapp_mock_eventos', JSON.stringify(updated));
      return { ok: true };
    }
  },
};
