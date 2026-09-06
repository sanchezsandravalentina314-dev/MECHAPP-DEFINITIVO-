import React from 'react';
import { formatCOP } from '@/utils/formatters';
import Button from '@/components/common/Button';

export default function CarritoConsumo({ items, onModificarCantidad, onEliminarItem, onConfirmar, cargando, reservaInfo }) {
  const total = items.reduce((acc, it) => acc + Number(it.precio) * it.cantidad, 0);

  if (items.length === 0) {
    return (
      <div style={{
        background: 'var(--color-surface, #1e2430)',
        borderRadius: '16px',
        padding: '2rem',
        textAlign: 'center',
        border: '1px dashed rgba(255,255,255,0.15)',
        color: '#a0aec0'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
        <h4 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>Tu carrito está vacío</h4>
        <p style={{ fontSize: '0.9rem', margin: 0 }}>
          Agrega combos o bebidas para disfrutar al máximo tu tiempo en la cancha.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--color-surface, #1e2430)',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      {/* Header del carrito */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🛒 Tu Pedido de Consumo
        </h3>
        {reservaInfo && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#ffb300', background: 'rgba(255, 179, 0, 0.1)', padding: '6px 10px', borderRadius: '6px' }}>
            🎯 Asociado a Reserva #{reservaInfo.id_reserva} · Cancha: {reservaInfo.cancha_nombre || reservaInfo.id_cancha}
          </div>
        )}
      </div>

      {/* Lista de Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
        {items.map((it) => (
          <div key={`${it.tipo}-${it.id}`} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.03)',
            padding: '0.75rem',
            borderRadius: '10px'
          }}>
            <div style={{ flex: 1, paddingRight: '0.5rem' }}>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
                {it.tipo === 'combo' ? '🔥 ' : '🍔 '} {it.nombre}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                {formatCOP(it.precio)} c/u
              </div>
            </div>

            {/* Controles cantidad */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={() => onModificarCantidad(it, it.cantidad - 1)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                -
              </button>
              <span style={{ fontWeight: 700, color: '#fff', minWidth: '20px', textAlign: 'center' }}>
                {it.cantidad}
              </span>
              <button
                onClick={() => onModificarCantidad(it, it.cantidad + 1)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                +
              </button>

              <button
                onClick={() => onEliminarItem(it)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#e53e3e',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  marginLeft: '0.5rem'
                }}
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de totales */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#a0aec0', fontSize: '0.9rem' }}>
          <span>Subtotal Consumo</span>
          <span>{formatCOP(total)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: '#4caf50' }}>
          <span>Total a Pagar</span>
          <span>{formatCOP(total)}</span>
        </div>
      </div>

      {/* Botón Confirmar */}
      <Button
        variant="primary"
        onClick={onConfirmar}
        disabled={cargando || items.length === 0}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '1rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #4caf50, #2e7d32)'
        }}
      >
        {cargando ? 'Procesando...' : '✅ Confirmar Pedido de Consumo'}
      </Button>
    </div>
  );
}
