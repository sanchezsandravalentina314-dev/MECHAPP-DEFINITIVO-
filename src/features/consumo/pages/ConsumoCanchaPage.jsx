import React, { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { consumoService } from '@/features/consumo/services/consumoService';
import { canchasService } from '@/features/canchas/services/canchasService';
import { formatCOP } from '@/utils/formatters';
import Button from '@/components/common/Button';
import PasarelaPagoModal from '@/components/payment/PasarelaPagoModal';

export default function ConsumoCanchaPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useApp();

  // Canchas y productos
  const [canchas, setCanchas] = useState([]);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargandoMenu, setCargandoMenu] = useState(true);

  // ── MARCADOR DE JUEGO (EN VIVO) ──
  const [equipoLocal, setEquipoLocal] = useState(user?.nombre || 'Mi Equipo');
  const [equipoVisitante, setEquipoVisitante] = useState('Rival / Amigos');
  const [marcadorLocal, setMarcadorLocal] = useState(0);
  const [marcadorVisitante, setMarcadorVisitante] = useState(0);
  const [historialRondas, setHistorialRondas] = useState([]);

  // ── CONSUMO EN CANCHA ──
  const [consumos, setConsumos] = useState(() => {
    try {
      const saved = localStorage.getItem('mechapp_consumo_cancha_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [isPasarelaOpen, setIsPasarelaOpen] = useState(false);

  // Cargar canchas y productos
  useEffect(() => {
    const init = async () => {
      try {
        setCargandoMenu(true);
        const [canchasList, prods] = await Promise.all([
          canchasService.listar(),
          consumoService.listarProductos(),
        ]);
        setCanchas(canchasList || []);
        if (canchasList && canchasList.length > 0) {
          setCanchaSeleccionada(canchasList[0].id_cancha);
        }
        setProductos(prods || []);
      } catch (err) {
        console.error(err);
      } finally {
        setCargandoMenu(false);
      }
    };
    init();
  }, []);

  // Guardar consumos en LocalStorage para no perderlos si cambia de pestaña
  useEffect(() => {
    try {
      localStorage.setItem('mechapp_consumo_cancha_items', JSON.stringify(consumos));
    } catch (e) {
      console.error(e);
    }
  }, [consumos]);

  // ── ACCIONES MARCADOR ──
  const registrarTiro = (ganador, puntos = 1, tipoJugada = 'Tiro') => {
    const nuevaRonda = {
      numero: historialRondas.length + 1,
      ganador: ganador === 'local' ? equipoLocal : equipoVisitante,
      puntos,
      tipo: tipoJugada,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (ganador === 'local') {
      setMarcadorLocal(prev => prev + puntos);
    } else {
      setMarcadorVisitante(prev => prev + puntos);
    }

    setHistorialRondas(prev => [nuevaRonda, ...prev]);
  };

  const reiniciarMarcador = () => {
    if (window.confirm('¿Deseas reiniciar el marcador a 0 - 0?')) {
      setMarcadorLocal(0);
      setMarcadorVisitante(0);
      setHistorialRondas([]);
    }
  };

  // ── ACCIONES CONSUMO ──
  const agregarConsumo = (prod) => {
    setConsumos(prev => {
      const idx = prev.findIndex(item => item.id_producto === prod.id_producto);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].cantidad += 1;
        return copy;
      }
      return [...prev, {
        id_producto: prod.id_producto,
        nombre: prod.nombre,
        precio: Number(prod.precio),
        cantidad: 1
      }];
    });
    showSuccess(`+1 ${prod.nombre} sumado a la cuenta`);
  };

  const modificarCantidadConsumo = (id_producto, delta) => {
    setConsumos(prev => {
      return prev
        .map(it => it.id_producto === id_producto ? { ...it, cantidad: it.cantidad + delta } : it)
        .filter(it => it.cantidad > 0);
    });
  };

  const limpiarConsumo = () => {
    if (window.confirm('¿Deseas vaciar la cuenta de consumo en cancha?')) {
      setConsumos([]);
      localStorage.removeItem('mechapp_consumo_cancha_items');
    }
  };

  const totalConsumo = consumos.reduce((acc, it) => acc + (it.precio * it.cantidad), 0);

  // Enviar pedido o pagar
  const handlePagarCuenta = () => {
    if (consumos.length === 0) {
      showError('No tienes consumos acumulados todavía.');
      return;
    }
    setIsPasarelaOpen(true);
  };

  const handlePagoExitoso = async () => {
    try {
      setEnviandoPedido(true);
      const itemsPayload = consumos.map(it => ({
        id_producto: it.id_producto,
        id_combo: null,
        cantidad: it.cantidad
      }));

      await consumoService.crearPedido({
        id_cancha: canchaSeleccionada || 1,
        observaciones: `Consumo en Cancha - Partido: ${equipoLocal} (${marcadorLocal}) vs (${marcadorVisitante}) ${equipoVisitante}`,
        items: itemsPayload
      });

      showSuccess('¡Cuenta y consumo pagados exitosamente! ');
      setConsumos([]);
      localStorage.removeItem('mechapp_consumo_cancha_items');
      setIsPasarelaOpen(false);
    } catch (err) {
      showError(err.message || 'Error al procesar el pago del consumo');
    } finally {
      setEnviandoPedido(false);
    }
  };

  return (
    <UserLayout
      title="Consumo Cancha y Marcador en Vivo"
      subtitle="Lleva la cuenta de los tiros y el consumo de bebidas/snacks en tiempo real mientras juegas."
    >
      {/* Selector de Cancha */}
      <div style={{
        background: 'var(--bg-card, #16213e)',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}></span>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted, #a0aec0)' }}>Pista / Escenario Actual</div>
            <select
              value={canchaSeleccionada || ''}
              onChange={(e) => setCanchaSeleccionada(Number(e.target.value))}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid var(--border-color, #333)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: 600,
                marginTop: '4px'
              }}
            >
              {canchas.map(c => (
                <option key={c.id_cancha} value={c.id_cancha} style={{ background: '#1a1a2e', color: '#fff' }}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" size="sm" onClick={reiniciarMarcador}>
            Reiniciar Marcador
          </Button>
          {consumos.length > 0 && (
            <Button variant="danger" size="sm" onClick={limpiarConsumo}>
              Vaciar Consumos
            </Button>
          )}
        </div>
      </div>

      {/* Grid Principal: Marcador a la Izquierda, Consumos a la Derecha */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '20px' }}>

        {/* ── PANEL 1: MARCADOR DE TEJO EN VIVO ── */}
        <div style={{
          background: 'var(--bg-card, #16213e)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
        }}>
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Marcador de Partida
          </h2>

          {/* Marcador Gigante */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            textAlign: 'center',
            marginBottom: '20px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {/* Lado Local */}
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={equipoLocal}
                onChange={(e) => setEquipoLocal(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ff5722',
                  fontSize: '1rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  width: '100%',
                  outline: 'none'
                }}
              />
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
                {marcadorLocal}
              </div>
            </div>

            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-muted, #666)' }}>
              VS
            </div>

            {/* Lado Visitante */}
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={equipoVisitante}
                onChange={(e) => setEquipoVisitante(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2196f3',
                  fontSize: '1rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  width: '100%',
                  outline: 'none'
                }}
              />
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
                {marcadorVisitante}
              </div>
            </div>
          </div>

          {/* Botones de Registro de Tiros */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            {/* Botones Local */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => registrarTiro('local', 1, 'Mano (+1)')}
                style={{
                  background: 'linear-gradient(135deg, #ff5722, #e64a19)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                +1 Tiro {equipoLocal}
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  onClick={() => registrarTiro('local', 3, 'Mecha (+3)')}
                  style={{ background: 'rgba(255,87,34,0.15)', color: '#ff5722', border: '1px solid #ff5722', padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Mecha (+3)
                </button>
                <button
                  onClick={() => registrarTiro('local', 6, 'Embocada (+6)')}
                  style={{ background: 'rgba(255,87,34,0.15)', color: '#ff5722', border: '1px solid #ff5722', padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Bocín (+6)
                </button>
              </div>
            </div>

            {/* Botones Visitante */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => registrarTiro('visitante', 1, 'Mano (+1)')}
                style={{
                  background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                +1 Tiro {equipoVisitante}
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  onClick={() => registrarTiro('visitante', 3, 'Mecha (+3)')}
                  style={{ background: 'rgba(33,150,243,0.15)', color: '#2196f3', border: '1px solid #2196f3', padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Mecha (+3)
                </button>
                <button
                  onClick={() => registrarTiro('visitante', 6, 'Embocada (+6)')}
                  style={{ background: 'rgba(33,150,243,0.15)', color: '#2196f3', border: '1px solid #2196f3', padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Bocín (+6)
                </button>
              </div>
            </div>
          </div>

          {/* Historial de Rondas */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Historial de Anotaciones ({historialRondas.length})
            </div>
            {historialRondas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Aún no hay tiros registrados. Presiona +1 Tiro cuando anote algún equipo.
              </div>
            ) : (
              <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {historialRondas.map((r, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                  }}>
                    <span><strong>#{r.numero}</strong> {r.tipo} · {r.ganador}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{r.hora}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── PANEL 2: CONSUMO EN CANCHA (BEBIDAS, COMIDAS, MECHAS) ── */}
        <div style={{
          background: 'var(--bg-card, #16213e)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Consumos en Cancha
          </h2>

          {/* Catálogo Rápido de Productos */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
              Agregar a la mesa con 1 click:
            </div>
            {cargandoMenu ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cargando catálogo...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                {productos.slice(0, 8).map(prod => (
                  <button
                    key={prod.id_producto}
                    onClick={() => agregarConsumo(prod)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '10px 8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      color: '#fff',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>
                      {prod.nombre.toLowerCase().includes('cerveza') ? '' : prod.nombre.toLowerCase().includes('coca') ? '' : ''}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {prod.nombre}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#4caf50', fontWeight: 700 }}>
                      {formatCOP(prod.precio)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lista Acumulada de la Cuenta */}
          <div style={{
            background: 'rgba(0,0,0,0.25)',
            borderRadius: '12px',
            padding: '14px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffb300' }}>
              Cuenta de la Cancha Actual ({consumos.reduce((a, b) => a + b.cantidad, 0)} ítems)
            </div>

            {consumos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No hay consumos pedidos todavía.<br />Haz click arriba para sumar cervezas o bebidas.
              </div>
            ) : (
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {consumos.map(item => (
                  <div key={item.id_producto} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '8px 10px',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.nombre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatCOP(item.precio)} c/u · Subtotal: {formatCOP(item.precio * item.cantidad)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => modificarCantidadConsumo(item.id_producto, -1)}
                        style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: '18px', textAlign: 'center', fontWeight: 700 }}>
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => modificarCantidadConsumo(item.id_producto, 1)}
                        style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total acumulado */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '10px',
              marginTop: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>Total Consumos:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4caf50' }}>
                {formatCOP(totalConsumo)}
              </span>
            </div>
          </div>

          {/* Botón Pagar Cuenta */}
          <Button
            variant="primary"
            size="lg"
            onClick={handlePagarCuenta}
            disabled={consumos.length === 0 || enviandoPedido}
            style={{ width: '100%', background: 'linear-gradient(135deg, #4caf50, #2e7d32)' }}
          >
            Pagar Cuenta en Cancha ({formatCOP(totalConsumo)})
          </Button>
        </div>

      </div>

      {/* Pasarela de Pagos Digital */}
      {isPasarelaOpen && (
        <PasarelaPagoModal
          isOpen={isPasarelaOpen}
          onClose={() => setIsPasarelaOpen(false)}
          onPagoExitoso={handlePagoExitoso}
          montoTotal={totalConsumo}
          concepto={`Consumo en Cancha #${canchaSeleccionada} · Marcador: ${equipoLocal} ${marcadorLocal} - ${marcadorVisitante} ${equipoVisitante}`}
        />
      )}
    </UserLayout>
  );
}