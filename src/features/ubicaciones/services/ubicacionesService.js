import api from '@/services/api';

const MOCK_UBICACIONES = [
  { id_ubicacion: 1, nombre: 'Club El Porvenir - Centro', direccion: 'Calle 22 # 14-35', ciudad: 'Bogotá D.C.', barrio: 'Centro', estado: true },
  { id_ubicacion: 2, nombre: 'Complejo Deportivo Turmequé', direccion: 'Carrera 68 # 45-10', ciudad: 'Bogotá D.C.', barrio: 'Salitre', estado: true },
  { id_ubicacion: 3, nombre: 'Cancha Los Embajadores', direccion: 'Av. Caracas # 53-12', ciudad: 'Bogotá D.C.', barrio: 'Chapinero', estado: true },
];

export const ubicacionesService = {
  async listar() {
    try {
      const response = await api.get('/ubicaciones/');
      return response.data;
    } catch {
      const saved = localStorage.getItem('mechapp_mock_ubicaciones');
      return saved ? JSON.parse(saved) : MOCK_UBICACIONES;
    }
  },

  async crear(data) {
    try {
      const response = await api.post('/ubicaciones/', data);
      return response.data;
    } catch {
      const list = await this.listar();
      const nuevo = { ...data, id_ubicacion: Date.now() };
      const updated = [...list, nuevo];
      localStorage.setItem('mechapp_mock_ubicaciones', JSON.stringify(updated));
      return nuevo;
    }
  },
};
