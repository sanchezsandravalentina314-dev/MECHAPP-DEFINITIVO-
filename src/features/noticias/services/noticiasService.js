import api from '@/services/api';

const MOCK_NOTICIAS = [
  {
    id: 1,
    titulo: 'Gran Campeonato Regional de Tejo 2026',
    contenido: 'La federación nacional anuncia las fechas oficiales para el circuito clasificatorio en Cundinamarca y Boyacá.',
    imagen_url: 'https://www.eldiario.com.co/wp-content/uploads/2023/11/1.20-1068x712.jpeg',
    fecha_publicacion: '2026-08-10T10:00:00Z',
    autor_id: 1,
  },
  {
    id: 2,
    titulo: 'Nuevas Canchas Aliadas se unen a MechApp',
    contenido: 'Conoce los 5 nuevos clubes en Bogotá y alrededores que ya cuentan con reservas digitales integradas.',
    imagen_url: 'https://s3.amazonaws.com/rtvc-assets-senalmemoria.gov.co/s3fs-public/field_image/tejo.jpg',
    fecha_publicacion: '2026-08-20T14:30:00Z',
    autor_id: 1,
  },
];

export const noticiasService = {
  async listar() {
    try {
      const response = await api.get('/noticias/');
      return response.data;
    } catch {
      const saved = localStorage.getItem('mechapp_mock_noticias');
      return saved ? JSON.parse(saved) : MOCK_NOTICIAS;
    }
  },

  async crear(data) {
    try {
      const response = await api.post('/noticias/', data);
      return response.data;
    } catch {
      const list = await this.listar();
      const nuevo = {
        ...data,
        id: Date.now(),
        fecha_publicacion: new Date().toISOString(),
      };
      const updated = [...list, nuevo];
      localStorage.setItem('mechapp_mock_noticias', JSON.stringify(updated));
      return nuevo;
    }
  },

  async actualizar(id, data) {
    try {
      const response = await api.put(`/noticias/${id}`, data);
      return response.data;
    } catch {
      const list = await this.listar();
      const updated = list.map((n) => (n.id === Number(id) ? { ...n, ...data } : n));
      localStorage.setItem('mechapp_mock_noticias', JSON.stringify(updated));
      return { id, ...data };
    }
  },

  async eliminar(id) {
    try {
      const response = await api.delete(`/noticias/${id}`);
      return response.data;
    } catch {
      const list = await this.listar();
      const updated = list.filter((n) => n.id !== Number(id));
      localStorage.setItem('mechapp_mock_noticias', JSON.stringify(updated));
      return { ok: true };
    }
  },
};
