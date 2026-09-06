import React from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';

export default function ComprobanteDigitalModal({
  isOpen,
  onClose,
  pago, // { referencia, valor/monto, fecha, metodoNombre, concepto, cliente, cancha, fechaReserva, horario }
}) {
  if (!pago) return null;

  const handleImprimir = () => {
    window.print();
  };

  const ref = pago.referencia || `TXN-${pago.id_pago || '0001'}`;
  const valor = pago.monto || pago.valor || 0;
  const fechaEmision = pago.fecha || pago.fecha_pago ? new Date(pago.fecha || pago.fecha_pago).toLocaleString('es-CO') : new Date().toLocaleString('es-CO');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🧾 Comprobante Digital de Pago"
      size="md"
    >
      {/* Estilos para impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #comprobante-ticket, #comprobante-ticket * {
            visibility: visible;
          }
          #comprobante-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="comprobante-ticket"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        {/* Encabezado del comprobante */}
        <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.6rem' }}>🎯</span>
            <strong style={{ fontSize: '1.4rem', letterSpacing: '1px', color: 'var(--primary)' }}>MECHAPP</strong>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Plataforma Deportiva Oficial de Tejo Colombiano
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            NIT: 901.584.239-4 · Facturación y Comprobante Digital
          </div>
          <div style={{ marginTop: '10px', display: 'inline-block', background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
            ● TRANSACCIÓN APROBADA
          </div>
        </div>

        {/* Metadatos de la transacción */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
          <div>
            <span style={{ color: 'var(--text-dim)', display: 'block' }}>No. de Referencia:</span>
            <code style={{ fontWeight: 700, fontSize: '0.9rem' }}>{ref}</code>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: 'var(--text-dim)', display: 'block' }}>Fecha y Hora:</span>
            <span>{fechaEmision}</span>
          </div>
        </div>

        {/* Datos del Cliente y Servicio */}
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {pago.cliente && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Titular:</span>
              <strong>{pago.cliente}</strong>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Concepto:</span>
            <span>{pago.concepto || 'Alquiler de Cancha de Tejo'}</span>
          </div>
          {pago.cancha && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Escenario:</span>
              <strong>{pago.cancha}</strong>
            </div>
          )}
          {pago.fechaReserva && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Fecha Turno:</span>
              <span>{formatDate(pago.fechaReserva)} {pago.horario ? `(${pago.horario})` : ''}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Método de Pago:</span>
            <span style={{ fontWeight: 600 }}>{pago.metodoNombre || 'Pasarela MechApp (Tarjeta/PSE)'}</span>
          </div>
        </div>

        {/* Desglose de Valores */}
        <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '12px 0', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
            <span>{formatCurrency(valor)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Tarifa de Servicio Digital:</span>
            <span style={{ color: '#22c55e' }}>$ 0 COP (Incluido)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
            <span>TOTAL PAGADO:</span>
            <span style={{ color: 'var(--primary)' }}>{formatCurrency(valor)}</span>
          </div>
        </div>

        {/* Pie y Código de Seguridad */}
        <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          <div style={{ letterSpacing: '4px', fontFamily: 'monospace', margin: '8px 0', fontSize: '1rem', opacity: 0.8 }}>
            ||| | |||| | ||||| |||| | ||| | |||
          </div>
          <p style={{ margin: '4px 0 0' }}>
            Código de Verificación: <strong>{ref.replace(/[^0-9A-Z]/g, '').slice(-8)}</strong>
          </p>
          <p style={{ margin: '4px 0 0', fontStyle: 'italic' }}>
            Presenta este comprobante físico o digital en el escenario de tejo al ingresar.
          </p>
        </div>
      </div>

      {/* Botones de acción (no se imprimen) */}
      <div className="no-print" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Button
          variant="secondary"
          onClick={onClose}
          style={{ flex: 1 }}
        >
          Cerrar
        </Button>
        <Button
          variant="primary"
          onClick={handleImprimir}
          style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
        >
          🖨️ Imprimir / PDF
        </Button>
      </div>
    </Modal>
  );
}
