import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserLayout from '@/components/layout/UserLayout';
import { consumoService } from '../services/consumoService';
import { reservasService } from '@/features/reservas/services/reservasService';
import { useApp } from '@/context/AppContext';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';
import ComboCard from '../components/ComboCard';
import ProductoCard from '../components/ProductoCard';
import CarritoConsumo from '../components/CarritoConsumo';
import PasarelaPagoModal from '@/components/payment/PasarelaPagoModal';

export default function ClienteConsumoPage() {
  const { idReserva } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useApp();

  const [reserva, setReserva] = useState(null);
  const [combos, setCombos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('combos'); // 'combos' | id_categoria
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [isPasarelaOpen, setIsPasarelaOpen] = useState(false);

  useEffect(() => {
    cargarMenu();
  }, [idReserva]);

  const cargarMenu = async () => {
    try {
      setCargando(true);
      let idCancha = null;
      let rData = null;

      if (idReserva) {
        try {
          rData = await reservasService.obtener(idReserva);
          setReserva(rData);
          idCancha = rData?.id_cancha;
        } catch (e) {
          console.warn('No se pudo cargar la reserva específica:', e);
        }
      }

      const [cmbs, prods, cats] = await Promise.all([
        consumoService.listarCombos(idCancha),
        consumoService.listarProductos(idCancha),
        consumoService.listarCategorias()
      ]);

      setCombos(cmbs || []);
      setProductos(prods || []);
      setCategorias(cats || []);
    } catch (err) {
      console.error(err);
      showNotification('Error al cargar la carta de consumo', 'error');
    } finally {
      setCargando(false);
    }
  };

  // ── CARRITO ACTIONS ──
  const handleAgregarCombo = (combo) => {
    setCarrito((prev) => {
      const idx = prev.findIndex((it) => it.tipo === 'combo' && it.id === combo.id_combo);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].cantidad += 1;
        return copy;
      }
      return [...prev, {
        tipo: 'combo',
        id: combo.id_combo,
        id_combo: combo.id_combo,
        nombre: combo.nombre,
        precio: combo.precio,
        cantidad: 1
      }];
    });
    showNotification(`¡${combo.nombre} agregado al carrito!`, 'success');
  };

  const handleAgregarProducto = (producto) => {
    setCarrito((prev) => {
      const idx = prev.findIndex((it) => it.tipo === 'producto' && it.id === producto.id_producto);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].cantidad += 1;
        return copy;
      }
      return [...prev, {
        tipo: 'producto',
        id: producto.id_producto,
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1
      }];
    });
    showNotification(`¡${producto.nombre} agregado!`, 'success');
  };

  const handleModificarCantidad = (item, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      handleEliminarItem(item);
      return;
    }
    setCarrito((prev) =>
      prev.map((it) => (it.tipo === item.tipo && it.id === item.id ? { ...it, cantidad: nuevaCantidad } : it))
    );
  };

  const handleEliminarItem = (item) => {
    setCarrito((prev) => prev.filter((it) => !(it.tipo === item.tipo && it.id === item.id)));
  };

  const totalCarrito = carrito.reduce((sum, it) => sum + (it.precio || 0) * it.cantidad, 0);

  const handleConfirmarPedido = () => {
    if (carrito.length === 0) return;
    setIsPasarelaOpen(true);
  };

  const handlePagoExitoso = async () => {
    try {
      setEnviando(true);
      const itemsPayload = carrito.map((it) => ({
        id_combo: it.tipo === 'combo' ? it.id_combo : null,
        id_producto: it.tipo === 'producto' ? it.id_producto : null,
        cantidad: it.cantidad
      }));

      await consumoService.crearPedido({
        id_reserva: idReserva ? Number(idReserva) : null,
        id_cancha: reserva?.id_cancha || 1,
        observaciones: 'Pedido pagado y confirmado desde la pasarela web',
        items: itemsPayload
      });

      showNotification('¡Pedido y pago confirmados con éxito! 🎉', 'success');
      setCarrito([]);
      setIsPasarelaOpen(false);
      navigate('/user/mis-reservas');
    } catch (err) {
      showNotification(err.message || 'Error al procesar el pedido', 'error');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <UserLayout title="Combos y Consumo para tu Juego">
        <Loader texto="Cargando menú de bebidas y comidas..." />
      </UserLayout>
    );
  }

  return (
    <UserLayout
      title="Combos y Consumo para tu Juego"
      subtitle="¿Quieres agregar algo a tu plan para disfrutar con tu parche?"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Banner de Felicitación por Reserva si viene de una reserva */}
        {idReserva && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.2), rgba(76, 175, 80, 0.15))',
            border: '1px solid rgba(255, 87, 34, 0.4)',
            borderRadius: '16px',
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>
              🎯 ¡Tu cancha está reservada!
            </h2>
            <p style={{ margin: '6px 0 0 0', color: '#ffb300', fontSize: '1rem', fontWeight: 600 }}>
              Puedes añadir combos, comida o bebidas a tu plan ahora mismo:
            </p>
          </div>
        )}

      {/* Layout de Contenido: Catálogo a la izquierda, Carrito a la derecha */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        {/* Catálogo de Productos y Combos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Categorías en forma de pestañas */}
          <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setCategoriaActiva('combos')}
              style={{
                padding: '10px 18px',
                borderRadius: '25px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.9rem',
                background: categoriaActiva === 'combos' ? 'linear-gradient(135deg, #ff5722, #e64a19)' : '#1e2430',
                color: categoriaActiva === 'combos' ? '#fff' : '#a0aec0'
              }}
            >
              🔥 Combos y Promos
            </button>

            {categorias.map((cat) => (
              <button
                key={cat.id_categoria}
                onClick={() => setCategoriaActiva(cat.id_categoria)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '25px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  background: categoriaActiva === cat.id_categoria ? '#ff5722' : '#1e2430',
                  color: categoriaActiva === cat.id_categoria ? '#fff' : '#a0aec0'
                }}
              >
                {cat.icono || '🍽️'} {cat.nombre}
              </button>
            ))}
          </div>

          {/* Renderizado según pestaña activa */}
          {categoriaActiva === 'combos' ? (
            <div>
              <h3 style={{ color: '#ffb300', margin: '0 0 1rem 0' }}>🔥 Combos Especiales de Tejo</h3>
              {combos.length === 0 ? (
                <p style={{ color: '#718096' }}>No hay combos disponibles en este momento.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {combos.map((combo) => (
                    <ComboCard
                      key={combo.id_combo}
                      combo={combo}
                      onAgregar={handleAgregarCombo}
                      accionTexto="Agregar al plan"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 style={{ color: '#fff', margin: '0 0 1rem 0' }}>
                {categorias.find((c) => c.id_categoria === categoriaActiva)?.nombre || 'Productos'}
              </h3>
              {productos.filter((p) => !categoriaActiva || p.id_categoria === categoriaActiva).length === 0 ? (
                <p style={{ color: '#718096' }}>No hay productos en esta categoría.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  {productos
                    .filter((p) => p.id_categoria === categoriaActiva)
                    .map((producto) => (
                      <ProductoCard
                        key={producto.id_producto}
                        producto={producto}
                        onAgregar={handleAgregarProducto}
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Carrito de Consumo flotante */}
        <div style={{ position: 'sticky', top: '20px' }}>
          <CarritoConsumo
            items={carrito}
            onModificarCantidad={handleModificarCantidad}
            onEliminarItem={handleEliminarItem}
            onConfirmar={handleConfirmarPedido}
            cargando={enviando}
            reservaInfo={reserva}
          />

          {idReserva && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Button
                variant="secondary"
                onClick={() => navigate('/user/mis-reservas')}
                style={{ width: '100%' }}
              >
                Omitir y ver mis reservas →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Pasarela de Pagos Simulada */}
    <PasarelaPagoModal
      isOpen={isPasarelaOpen}
      onClose={() => setIsPasarelaOpen(false)}
      monto={totalCarrito}
      concepto={`Consumo para la cancha #${reserva?.id_cancha || 1} (${carrito.length} artículos)`}
      metadata={{ id_reserva: idReserva ? Number(idReserva) : null }}
      onSuccess={handlePagoExitoso}
    />
    </UserLayout>
  );
}
