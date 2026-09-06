import React from 'react';
import { formatCOP } from '@/utils/formatters';
import Button from '@/components/common/Button';

export default function ComboCard({ combo, onAgregar, accionTexto = 'Agregar al plan', esAdmin = false, onEditar, onEliminar }) {
  return (
    <div style={{
      background: 'var(--color-surface, #1e2430)',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
    }}>
      {/* Imagen */}
      <div style={{ position: 'relative', height: '180px', background: '#121620' }}>
        <img
          src={combo.imagen_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600'}
          alt={combo.nombre}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600'; }}
        />
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          color: '#ffb300',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 700
        }}>
          👥 {combo.personas_min}-{combo.personas_max} personas
        </div>
        {!combo.estado && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: '#d32f2f',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            Desactivado
          </div>
        )}
      </div>

      {/* Contenido */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#fff' }}>{combo.nombre}</h3>
        <p style={{ margin: '0 0 1rem 0', color: '#a0aec0', fontSize: '0.9rem', lineHeight: '1.4' }}>
          {combo.descripcion || 'Combo especial para disfrutar durante tu partida de tejo.'}
        </p>

        {/* Productos incluidos */}
        {combo.productos && combo.productos.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <span style={{ fontSize: '0.8rem', color: '#ff5722', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              INCLUYE:
            </span>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
              {combo.productos.map((cp) => (
                <li key={cp.id_combo_producto || cp.id_producto}>
                  {cp.cantidad}x {cp.producto?.nombre || `Producto #${cp.id_producto}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer con Precio y Botón */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#718096', display: 'block' }}>PRECIO TOTAL</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#4caf50' }}>
              {formatCOP(combo.precio)}
            </span>
          </div>

          {esAdmin ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {onEditar && <Button variant="secondary" onClick={() => onEditar(combo)} style={{ padding: '6px 12px' }}>✏️</Button>}
              {onEliminar && <Button variant="danger" onClick={() => onEliminar(combo.id_combo)} style={{ padding: '6px 12px' }}>🗑️</Button>}
            </div>
          ) : (
            onAgregar && (
              <Button variant="primary" onClick={() => onAgregar(combo)} style={{ background: 'linear-gradient(135deg, #ff5722, #e64a19)' }}>
                🔥 {accionTexto}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
