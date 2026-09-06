import React from 'react';
import { formatCOP } from '@/utils/formatters';
import Button from '@/components/common/Button';

export default function ProductoCard({ producto, onAgregar, esAdmin = false, onEditar, onEliminar }) {
  const sinStock = producto.stock <= 0;
  const stockBajo = producto.stock > 0 && producto.stock <= producto.stock_minimo;

  return (
    <div style={{
      background: 'var(--color-surface, #1e2430)',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
    }}>
      {/* Imagen */}
      <div style={{ position: 'relative', height: '140px', background: '#121620' }}>
        <img
          src={producto.imagen_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600'}
          alt={producto.nombre}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: sinStock ? 0.5 : 1 }}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600'; }}
        />
        {sinStock && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#d32f2f',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            Agotado
          </div>
        )}
        {stockBajo && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#ff9800',
            color: '#000',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            ¡Quedan {producto.stock}!
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', color: '#fff' }}>{producto.nombre}</h4>
        <p style={{ margin: '0 0 0.75rem 0', color: '#a0aec0', fontSize: '0.85rem', flex: 1, lineHeight: '1.3' }}>
          {producto.descripcion || 'Producto fresco y listo para el consumo.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4caf50' }}>
              {formatCOP(producto.precio)}
            </span>
          </div>

          {esAdmin ? (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {onEditar && <Button variant="secondary" onClick={() => onEditar(producto)} style={{ padding: '4px 8px' }}>✏️</Button>}
              {onEliminar && <Button variant="danger" onClick={() => onEliminar(producto.id_producto)} style={{ padding: '4px 8px' }}>🗑️</Button>}
            </div>
          ) : (
            onAgregar && (
              <Button
                variant="primary"
                onClick={() => onAgregar(producto)}
                disabled={sinStock}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                {sinStock ? 'Agotado' : '+ Agregar'}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
