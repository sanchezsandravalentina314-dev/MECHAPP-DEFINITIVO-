import React, { useState } from 'react';
import { formatCOP, formatFecha } from '@/utils/formatters';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';

export default function PedidoTable({ pedidos = [], onCambiarEstado, esAdmin = false }) {
  const [pedidoDetalle, setPedidoDetalle] = useState(null);

  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'Confirmado': return 'info';
      case 'En preparación': return 'warning';
      case 'Listo': return 'success';
      case 'Entregado': return 'success';
      case 'Cancelado': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div>
      <div style={{ overflowX: 'auto', background: 'var(--color-surface, #1e2430)', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a0aec0' }}>
              <th style={{ padding: '12px 16px' }}># Pedido</th>
              <th style={{ padding: '12px 16px' }}>Reserva</th>
              <th style={{ padding: '12px 16px' }}>Fecha</th>
              <th style={{ padding: '12px 16px' }}>Items</th>
              <th style={{ padding: '12px 16px' }}>Total</th>
              <th style={{ padding: '12px 16px' }}>Estado</th>
              <th style={{ padding: '12px 16px' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                  No hay pedidos registrados.
                </td>
              </tr>
            ) : (
              pedidos.map((p) => (
                <tr key={p.id_pedido} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#ff5722' }}>
                    #{p.id_pedido}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#e2e8f0' }}>
                    {p.id_reserva ? `Reserva #${p.id_reserva}` : 'Consumo directo'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#a0aec0' }}>
                    {formatFecha(p.fecha_pedido)}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#fff' }}>
                    {p.detalles?.length || 0} producto(s)
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#4caf50' }}>
                    {formatCOP(p.total)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge variant={getBadgeColor(p.estado)}>
                      {p.estado}
                    </Badge>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => setPedidoDetalle(p)}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: 'none',
                          color: '#fff',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        👁️ Ver
                      </button>

                      {onCambiarEstado && (
                        <select
                          value={p.estado}
                          onChange={(e) => onCambiarEstado(p.id_pedido, e.target.value)}
                          style={{
                            background: '#0f141c',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.8rem'
                          }}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Confirmado">Confirmado</option>
                          <option value="En preparación">En preparación</option>
                          <option value="Listo">Listo</option>
                          <option value="Entregado">Entregado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalle de Pedido */}
      {pedidoDetalle && (
        <Modal
          isOpen={!!pedidoDetalle}
          onClose={() => setPedidoDetalle(null)}
          title={`🧾 Detalle del Pedido #${pedidoDetalle.id_pedido}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
              <div><strong style={{ color: '#a0aec0' }}>Fecha:</strong> {formatFecha(pedidoDetalle.fecha_pedido)}</div>
              <div><strong style={{ color: '#a0aec0' }}>Estado:</strong> <Badge variant={getBadgeColor(pedidoDetalle.estado)}>{pedidoDetalle.estado}</Badge></div>
              <div><strong style={{ color: '#a0aec0' }}>Reserva:</strong> #{pedidoDetalle.id_reserva || 'N/A'}</div>
              <div><strong style={{ color: '#a0aec0' }}>Usuario:</strong> #{pedidoDetalle.id_usuario}</div>
            </div>

            <h4 style={{ margin: '0.5rem 0 0 0', color: '#ffb300' }}>Productos / Combos solicitados:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pedidoDetalle.detalles?.map((d) => (
                <div key={d.id_detalle} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#fff' }}>
                      {d.id_combo ? '🔥 Combo' : '🍔 Producto'} #{d.id_combo || d.id_producto}
                    </span>
                    <span style={{ color: '#a0aec0', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                      x{d.cantidad}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#4caf50' }}>
                    {formatCOP(d.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
              <span style={{ color: '#fff' }}>Total:</span>
              <span style={{ color: '#4caf50' }}>{formatCOP(pedidoDetalle.total)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
