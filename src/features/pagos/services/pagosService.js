import api from '@/services/api';

export const pagosService = {
  async listar() {
    try {
      const response = await api.get('/pagos/');
      return response.data;
    } catch {
      const local = localStorage.getItem('mechapp_mock_pagos');
      return local ? JSON.parse(local) : [];
    }
  },

  async obtener(id) {
    const response = await api.get(`/pagos/${id}`);
    return response.data;
  },

  async crear(data) {
    try {
      const response = await api.post('/pagos/', data);
      return response.data;
    } catch (err) {
      console.warn('API de pagos falló o no disponible, guardando pago simulado en local:', err);
      const local = localStorage.getItem('mechapp_mock_pagos');
      const list = local ? JSON.parse(local) : [];
      const nuevoPago = {
        ...data,
        id_pago: Date.now(),
        fecha_pago: new Date().toISOString(),
      };
      localStorage.setItem('mechapp_mock_pagos', JSON.stringify([...list, nuevoPago]));
      return nuevoPago;
    }
  },

  async listarMetodos() {
    try {
      const response = await api.get('/metodos_pago/');
      return response.data;
    } catch {
      return [
        { id_metodo_pago: 1, nombre: 'Efectivo', estado: true },
        { id_metodo_pago: 2, nombre: 'Transferencia', estado: true },
        { id_metodo_pago: 3, nombre: 'Tarjeta', estado: true },
        { id_metodo_pago: 4, nombre: 'PSE', estado: true },
      ];
    }
  },
};
