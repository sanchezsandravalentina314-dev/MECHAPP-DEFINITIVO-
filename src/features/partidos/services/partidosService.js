import api from '@/services/api';

const MOCK_PARTIDOS = [
  {
    id_partido: 1,
    id_torneo: 1,
    id_equipo_local: 1,
    id_equipo_visitante: 2,
    fecha: '2026-07-16',
    hora: '15:00:00',
    ronda: 'Semifinal',
    estado: 'Finalizado',
    resultado: {
      puntos_local: 27,
      puntos_visitante: 18,
      id_equipo_ganador: 1,
      observaciones: 'Excelente partida con 4 mechas y una embocada directa.',
    },
  },
  {
    id_partido: 2,
    id_torneo: 1,
    id_equipo_local: 2,
    id_equipo_visitante: 3,
    fecha: '2026-07-17',
    hora: '17:00:00',
    ronda: 'Final',
    estado: 'Programado',
    resultado: null,
  },
];

export const partidosService = {
  async listar() {
    try {
      const response = await api.get('/partidos/');
      return response.data;
    } catch {
      const saved = localStorage.getItem('mechapp_mock_partidos');
      return saved ? JSON.parse(saved) : MOCK_PARTIDOS;
    }
  },

  async crear(data) {
    try {
      const response = await api.post('/partidos/', data);
      return response.data;
    } catch {
      const list = await this.listar();
      const nuevo = { ...data, id_partido: Date.now() };
      const updated = [...list, nuevo];
      localStorage.setItem('mechapp_mock_partidos', JSON.stringify(updated));
      return nuevo;
    }
  },

  async registrarResultado(idPartido, resultadoData) {
    try {
      const response = await api.post('/resultados/', {
        id_partido: idPartido,
        ...resultadoData,
      });
      return response.data;
    } catch {
      const list = await this.listar();
      const updated = list.map((p) =>
        p.id_partido === Number(idPartido)
          ? { ...p, estado: 'Finalizado', resultado: resultadoData }
          : p
      );
      localStorage.setItem('mechapp_mock_partidos', JSON.stringify(updated));
      return resultadoData;
    }
  },

  async eliminar(id) {
    try {
      const response = await api.delete(`/partidos/${id}`);
      return response.data;
    } catch {
      const list = await this.listar();
      const updated = list.filter((p) => p.id_partido !== Number(id));
      localStorage.setItem('mechapp_mock_partidos', JSON.stringify(updated));
      return { ok: true };
    }
  },
};
