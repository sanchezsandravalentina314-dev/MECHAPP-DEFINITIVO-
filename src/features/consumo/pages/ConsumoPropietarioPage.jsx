import React, { useState, useEffect } from 'react';
import { consumoService } from '../services/consumoService';
import { canchasService } from '@/features/canchas/services/canchasService';
import { formatCOP } from '@/utils/formatters';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import ProductoCard from '../components/ProductoCard';
import ComboCard from '../components/ComboCard';
import ProductoModal from '../components/ProductoModal';
import ComboModal from '../components/ComboModal';
import PedidoTable from '../components/PedidoTable';

export default function ConsumoPropietarioPage({ esAdmin = false }) {
  const [seccion, setSeccion] = useState('dashboard'); // 'dashboard' | 'productos' | 'combos' | 'pedidos' | 'inventario' | 'ventas'
  const [canchas, setCanchas] = useState([]);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [combos, setCombos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Modales
  const [modalProductoOpen, setModalProductoOpen] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [modalComboOpen, setModalComboOpen] = useState(false);
  const [comboEditar, setComboEditar] = useState(null);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (canchaSeleccionada) {
      cargarDatosCancha(canchaSeleccionada);
    }
  }, [canchaSeleccionada]);

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      const [canchasList, cats] = await Promise.all([
        canchasService.listar(),
        consumoService.listarCategorias()
      ]);
      setCanchas(canchasList || []);
      setCategorias(cats || []);
      if (canchasList && canchasList.length > 0) {
        setCanchaSeleccionada(canchasList[0].id_cancha);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const cargarDatosCancha = async (idCancha) => {
    try {
      setCargando(true);
      const [prods, cmbs, peds, st] = await Promise.all([
        consumoService.listarTodosProductos(idCancha),
        consumoService.listarTodosCombos(idCancha),
        consumoService.listarPedidos(idCancha),
        consumoService.obtenerEstadisticas(idCancha)
      ]);
      setProductos(prods || []);
      setCombos(cmbs || []);
      setPedidos(peds || []);
      setStats(st || null);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  // ── HANDLERS PRODUCTOS ──
  const handleGuardarProducto = async (data) => {
    if (productoEditar) {
      await consumoService.actualizarProducto(productoEditar.id_producto, data);
    } else {
      await consumoService.crearProducto(data);
    }
    await cargarDatosCancha(canchaSeleccionada);
  };

  const handleEliminarProducto = async (id) => {
    if (window.confirm('¿Seguro que deseas desactivar este producto?')) {
      await consumoService.eliminarProducto(id);
      await cargarDatosCancha(canchaSeleccionada);
    }
  };

  // ── HANDLERS COMBOS ──
  const handleGuardarCombo = async (data) => {
    if (comboEditar) {
      await consumoService.actualizarCombo(comboEditar.id_combo, data);
    } else {
      await consumoService.crearCombo(data);
    }
    await cargarDatosCancha(canchaSeleccionada);
  };

  const handleEliminarCombo = async (id) => {
    if (window.confirm('¿Seguro que deseas desactivar este combo?')) {
      await consumoService.eliminarCombo(id);
      await cargarDatosCancha(canchaSeleccionada);
    }
  };

  // ── HANDLERS PEDIDOS ──
  const handleCambiarEstadoPedido = async (idPedido, nuevoEstado) => {
    try {
      await consumoService.actualizarEstadoPedido(idPedido, nuevoEstado);
      await cargarDatosCancha(canchaSeleccionada);
    } catch (err) {
      alert(err.message || 'Error al actualizar estado');
    }
  };

  // ── HANDLERS INVENTARIO ──
  const handleActualizarStock = async (idProducto, nuevoStock) => {
    try {
      await consumoService.actualizarProducto(idProducto, { stock: Number(nuevoStock) });
      await cargarDatosCancha(canchaSeleccionada);
    } catch (err) {
      alert(err.message || 'Error al actualizar stock');
    }
  };

  if (cargando && !canchaSeleccionada) {
    return <Loader texto="Cargando módulo de Combos y Consumo..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header y Selector de Sede/Cancha */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            🍔 Gestión de Combos y Consumo
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#a0aec0', fontSize: '0.95rem' }}>
            Administra la oferta gastronómica, bebidas, combos y pedidos de tu escenario de tejo.
          </p>
        </div>

        {canchas.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: '#ffb300', fontWeight: 600, fontSize: '0.9rem' }}>Sede / Cancha:</span>
            <select
              value={canchaSeleccionada}
              onChange={(e) => setCanchaSeleccionada(e.target.value)}
              style={{
                background: '#1a202c',
                color: '#fff',
                border: '1px solid #ff5722',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              {canchas.map((c) => (
                <option key={c.id_cancha} value={c.id_cancha}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Barra de Navegación de Subsecciones */}
      <div style={{ display: 'flex', gap: '0.5rem', background: '#121620', padding: '6px', borderRadius: '12px', overflowX: 'auto' }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard Consumo' },
          { id: 'productos', label: '🍔 Productos' },
          { id: 'combos', label: '🔥 Combos' },
          { id: 'pedidos', label: '📋 Pedidos' },
          { id: 'inventario', label: '📦 Inventario' },
          { id: 'ventas', label: '📈 Ventas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSeccion(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              background: seccion === tab.id ? 'var(--color-primary, #ff5722)' : 'transparent',
              color: seccion === tab.id ? '#fff' : '#a0aec0'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 1. DASHBOARD DE CONSUMO ── */}
      {seccion === 'dashboard' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Métricas Principales */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#1e2430', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #4caf50' }}>
              <span style={{ color: '#a0aec0', fontSize: '0.8rem', textTransform: 'uppercase' }}>VENTAS DE HOY</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4caf50', marginTop: '4px' }}>
                {formatCOP(stats.ventas_hoy)}
              </div>
            </div>

            <div style={{ background: '#1e2430', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #ff9800' }}>
              <span style={{ color: '#a0aec0', fontSize: '0.8rem', textTransform: 'uppercase' }}>PEDIDOS DE HOY</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {stats.pedidos_hoy}
              </div>
            </div>

            <div style={{ background: '#1e2430', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #2196f3' }}>
              <span style={{ color: '#a0aec0', fontSize: '0.8rem', textTransform: 'uppercase' }}>INGRESOS DEL MES</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2196f3', marginTop: '4px' }}>
                {formatCOP(stats.ventas_mes)}
              </div>
            </div>

            <div style={{ background: '#1e2430', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #9c27b0' }}>
              <span style={{ color: '#a0aec0', fontSize: '0.8rem', textTransform: 'uppercase' }}>TICKET PROMEDIO</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#9c27b0', marginTop: '4px' }}>
                {formatCOP(stats.ticket_promedio)}
              </div>
            </div>

            <div style={{ background: '#1e2430', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #f44336' }}>
              <span style={{ color: '#a0aec0', fontSize: '0.8rem', textTransform: 'uppercase' }}>ALERTA STOCK BAJO</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stats.productos_stock_bajo > 0 ? '#f44336' : '#4caf50', marginTop: '4px' }}>
                {stats.productos_stock_bajo} productos
              </div>
            </div>
          </div>

          {/* Grilla de Top Combos y Productos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: '#1e2430', padding: '1.25rem', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#ffb300', fontSize: '1.1rem' }}>🔥 Combos Más Vendidos</h3>
              {stats.top_combos?.length === 0 ? (
                <p style={{ color: '#718096', fontSize: '0.9rem' }}>Aún no hay ventas de combos registradas este mes.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {stats.top_combos.map((tc, idx) => (
                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: '#fff' }}>#{idx + 1} {tc.nombre}</span>
                      <span style={{ fontWeight: 700, color: '#4caf50' }}>{tc.total} vendidos</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ background: '#1e2430', padding: '1.25rem', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#ff5722', fontSize: '1.1rem' }}>🍔 Productos Más Vendidos</h3>
              {stats.top_productos?.length === 0 ? (
                <p style={{ color: '#718096', fontSize: '0.9rem' }}>Aún no hay ventas individuales registradas este mes.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {stats.top_productos.map((tp, idx) => (
                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: '#fff' }}>#{idx + 1} {tp.nombre}</span>
                      <span style={{ fontWeight: 700, color: '#4caf50' }}>{tp.total} unidades</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 2. PRODUCTOS ── */}
      {seccion === 'productos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#a0aec0', fontSize: '0.95rem' }}>{productos.length} producto(s) en catálogo</span>
            <Button
              variant="primary"
              onClick={() => { setProductoEditar(null); setModalProductoOpen(true); }}
            >
              + Nuevo Producto
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {productos.map((p) => (
              <ProductoCard
                key={p.id_producto}
                producto={p}
                esAdmin={true}
                onEditar={(prod) => { setProductoEditar(prod); setModalProductoOpen(true); }}
                onEliminar={handleEliminarProducto}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── 3. COMBOS ── */}
      {seccion === 'combos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#a0aec0', fontSize: '0.95rem' }}>{combos.length} combo(s) configurados</span>
            <Button
              variant="primary"
              onClick={() => { setComboEditar(null); setModalComboOpen(true); }}
              style={{ background: 'linear-gradient(135deg, #ff5722, #e64a19)' }}
            >
              🔥 Crear Nuevo Combo
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {combos.map((c) => (
              <ComboCard
                key={c.id_combo}
                combo={c}
                esAdmin={true}
                onEditar={(cmb) => { setComboEditar(cmb); setModalComboOpen(true); }}
                onEliminar={handleEliminarCombo}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── 4. PEDIDOS ── */}
      {seccion === 'pedidos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <PedidoTable
            pedidos={pedidos}
            onCambiarEstado={handleCambiarEstadoPedido}
            esAdmin={true}
          />
        </div>
      )}

      {/* ── 5. INVENTARIO ── */}
      {seccion === 'inventario' && (
        <div style={{ background: '#1e2430', borderRadius: '12px', padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>📦 Control de Stock y Existencias</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a0aec0' }}>
                  <th style={{ padding: '10px' }}>Producto</th>
                  <th style={{ padding: '10px' }}>Precio</th>
                  <th style={{ padding: '10px' }}>Stock Actual</th>
                  <th style={{ padding: '10px' }}>Mínimo</th>
                  <th style={{ padding: '10px' }}>Estado Stock</th>
                  <th style={{ padding: '10px' }}>Ajustar Stock</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => {
                  const bajo = p.stock <= p.stock_minimo;
                  const agotado = p.stock <= 0;
                  return (
                    <tr key={p.id_producto} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px', color: '#fff', fontWeight: 600 }}>{p.nombre}</td>
                      <td style={{ padding: '10px', color: '#4caf50' }}>{formatCOP(p.precio)}</td>
                      <td style={{ padding: '10px', fontWeight: 700, color: agotado ? '#f44336' : (bajo ? '#ff9800' : '#fff') }}>
                        {p.stock} uds
                      </td>
                      <td style={{ padding: '10px', color: '#a0aec0' }}>{p.stock_minimo} uds</td>
                      <td style={{ padding: '10px' }}>
                        {agotado ? (
                          <span style={{ color: '#f44336', fontWeight: 700 }}>⛔ Agotado</span>
                        ) : bajo ? (
                          <span style={{ color: '#ff9800', fontWeight: 700 }}>⚠️ Stock Bajo</span>
                        ) : (
                          <span style={{ color: '#4caf50', fontWeight: 700 }}>✅ Óptimo</span>
                        )}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <input
                            type="number"
                            defaultValue={p.stock}
                            id={`stock-input-${p.id_producto}`}
                            style={{ width: '60px', padding: '4px', background: '#0f141c', color: '#fff', border: '1px solid #4a5568', borderRadius: '4px', textAlign: 'center' }}
                          />
                          <Button
                            variant="secondary"
                            onClick={() => {
                              const val = document.getElementById(`stock-input-${p.id_producto}`).value;
                              handleActualizarStock(p.id_producto, val);
                            }}
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            💾 Guardar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 6. VENTAS ── */}
      {seccion === 'ventas' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#1e2430', padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ margin: 0, color: '#fff' }}>📈 Resumen Consolidado de Ventas</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#121620', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ color: '#a0aec0', fontSize: '0.85rem' }}>Esta Semana</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffb300' }}>{formatCOP(stats.ventas_semana)}</div>
            </div>
            <div style={{ background: '#121620', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ color: '#a0aec0', fontSize: '0.85rem' }}>Este Mes</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#4caf50' }}>{formatCOP(stats.ventas_mes)}</div>
            </div>
            <div style={{ background: '#121620', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ color: '#a0aec0', fontSize: '0.85rem' }}>Total Pedidos del Mes</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{stats.pedidos_mes}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modales de Edición/Creación */}
      <ProductoModal
        isOpen={modalProductoOpen}
        onClose={() => setModalProductoOpen(false)}
        onGuardar={handleGuardarProducto}
        productoEditar={productoEditar}
        idCancha={canchaSeleccionada}
        categorias={categorias}
      />

      <ComboModal
        isOpen={modalComboOpen}
        onClose={() => setModalComboOpen(false)}
        onGuardar={handleGuardarCombo}
        comboEditar={comboEditar}
        idCancha={canchaSeleccionada}
        productosDisponibles={productos}
      />
    </div>
  );
}
