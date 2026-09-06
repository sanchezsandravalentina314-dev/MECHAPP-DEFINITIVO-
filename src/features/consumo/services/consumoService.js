import api from '@/services/api';

export const consumoService = {
  // ── CATEGORÍAS ──
  async listarCategorias() {
    const res = await api.get('/consumo/categorias');
    return res.data;
  },
  async crearCategoria(data) {
    const res = await api.post('/consumo/categorias', data);
    return res.data;
  },

  // ── PRODUCTOS ──
  async listarProductos(id_cancha) {
    const url = id_cancha ? `/consumo/productos?id_cancha=${id_cancha}` : '/consumo/productos';
    const res = await api.get(url);
    return res.data;
  },
  async listarTodosProductos(id_cancha) {
    const url = id_cancha ? `/consumo/productos/todos?id_cancha=${id_cancha}` : '/consumo/productos/todos';
    const res = await api.get(url);
    return res.data;
  },
  async obtenerProducto(id) {
    const res = await api.get(`/consumo/productos/${id}`);
    return res.data;
  },
  async crearProducto(data) {
    const res = await api.post('/consumo/productos', data);
    return res.data;
  },
  async actualizarProducto(id, data) {
    const res = await api.put(`/consumo/productos/${id}`, data);
    return res.data;
  },
  async eliminarProducto(id) {
    const res = await api.delete(`/consumo/productos/${id}`);
    return res.data;
  },
  async stockBajo(id_cancha) {
    const res = await api.get(`/consumo/productos/stock-bajo?id_cancha=${id_cancha}`);
    return res.data;
  },

  // ── COMBOS ──
  async listarCombos(id_cancha) {
    const url = id_cancha ? `/consumo/combos?id_cancha=${id_cancha}` : '/consumo/combos';
    const res = await api.get(url);
    return res.data;
  },
  async listarTodosCombos(id_cancha) {
    const url = id_cancha ? `/consumo/combos/todos?id_cancha=${id_cancha}` : '/consumo/combos/todos';
    const res = await api.get(url);
    return res.data;
  },
  async obtenerCombo(id) {
    const res = await api.get(`/consumo/combos/${id}`);
    return res.data;
  },
  async crearCombo(data) {
    const res = await api.post('/consumo/combos', data);
    return res.data;
  },
  async actualizarCombo(id, data) {
    const res = await api.put(`/consumo/combos/${id}`, data);
    return res.data;
  },
  async eliminarCombo(id) {
    const res = await api.delete(`/consumo/combos/${id}`);
    return res.data;
  },

  // ── PEDIDOS ──
  async listarPedidos(id_cancha) {
    const url = id_cancha ? `/consumo/pedidos?id_cancha=${id_cancha}` : '/consumo/pedidos';
    const res = await api.get(url);
    return res.data;
  },
  async obtenerPedido(id) {
    const res = await api.get(`/consumo/pedidos/${id}`);
    return res.data;
  },
  async crearPedido(data) {
    const res = await api.post('/consumo/pedidos', data);
    return res.data;
  },
  async actualizarEstadoPedido(id, estado) {
    const res = await api.patch(`/consumo/pedidos/${id}/estado`, { estado });
    return res.data;
  },

  // ── ESTADÍSTICAS ──
  async obtenerEstadisticas(id_cancha) {
    const url = id_cancha ? `/consumo/estadisticas?id_cancha=${id_cancha}` : '/consumo/estadisticas';
    const res = await api.get(url);
    return res.data;
  }
};
