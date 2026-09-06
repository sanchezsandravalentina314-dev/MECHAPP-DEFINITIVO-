import React, { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import PasarelaPagoModal from '@/components/payment/PasarelaPagoModal';
import ComprobanteDigitalModal from '@/components/common/ComprobanteDigitalModal';
import { reservasService } from '../services/reservasService';
import { canchasService } from '@/features/canchas/services/canchasService';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { formatDate, formatTime, formatCurrency } from '@/utils/formatters';

export default function MisReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reservaAPagar, setReservaAPagar] = useState(null);
  const [isPasarelaOpen, setIsPasarelaOpen] = useState(false);
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState(null);
  const [isComprobanteOpen, setIsComprobanteOpen] = useState(false);

  const { user } = useAuth();
  const { showSuccess } = useApp();

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [reservasData, canchasData] = await Promise.all([
        reservasService.listar(),
        canchasService.listar(),
      ]);
      // Filtrar reservas del usuario actual
      const misRes = (reservasData || []).filter((r) => r.id_usuario === user?.id_usuario || r.id_usuario === 2);
      setReservas(misRes);
      setCanchas(canchasData || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [user]);

  const handlePagarReserva = (reserva) => {
    setReservaAPagar(reserva);
    setIsPasarelaOpen(true);
  };

  const handleVerComprobante = (reserva, cancha) => {
    setComprobanteSeleccionado({
      referencia: `TXN-${String(reserva.id_reserva).padStart(6, '0')}`,
      valor: reserva.valor,
      fecha: reserva.fecha_reserva,
      fechaReserva: reserva.fecha,
      horario: `${formatTime(reserva.hora_inicio)} a ${formatTime(reserva.hora_fin)}`,
      cancha: cancha?.nombre || `Pista de Tejo #${reserva.id_cancha}`,
      cliente: user?.nombre || 'Deportista MechApp',
      concepto: `Alquiler Cancha #${reserva.id_cancha} (${formatDate(reserva.fecha)})`,
      metodoNombre: 'Pasarela Digital MechApp (Tarjeta / PSE / Nequi)',
    });
    setIsComprobanteOpen(true);
  };

  const handlePagoExitoso = async (pagoResultado) => {
    showSuccess('¡Pago confirmado! Tu reserva ya está lista para disfrutar.');
    await cargarDatos();
    if (pagoResultado) {
      setComprobanteSeleccionado({
        ...pagoResultado,
        cliente: user?.nombre || 'Deportista MechApp',
      });
      setIsComprobanteOpen(true);
    }
  };

  return (
    <UserLayout
      title="Mis Reservas de Canchas"
      subtitle="Historial y estado de tus alquileres de pistas de tejo."
    >
      {loading ? (
        <Loader message="Cargando tu historial de reservas..." />
      ) : reservas.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>Aún no tienes reservas activas</h3>
          <p>Explora nuestras canchas aliadas y agenda tu primera partida con amigos.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reservas.map((reserva) => {
            const cancha = canchas.find((c) => c.id_cancha === reserva.id_cancha);
            return (
              <div key={reserva.id_reserva} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <Badge variant={reserva.estado === 'Confirmada' ? 'success' : 'warning'}>
                      {reserva.estado}
                    </Badge>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      Código de reserva: #{reserva.id_reserva}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem' }}>{cancha?.nombre || `Cancha #${reserva.id_cancha}`}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>
                    📅 Fecha: <strong>{formatDate(reserva.fecha)}</strong> · ⏰ Horario: <strong>{formatTime(reserva.hora_inicio)} a {formatTime(reserva.hora_fin)}</strong>
                  </p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block' }}>Total:</span>
                    <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>
                      {formatCurrency(reserva.valor)}
                    </strong>
                  </div>
                  {reserva.estado !== 'Confirmada' ? (
                    <Button
                      variant="primary"
                      onClick={() => handlePagarReserva(reserva)}
                      style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      💳 Pagar con Pasarela
                    </Button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 600 }}>
                        ✓ Pago al día
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => handleVerComprobante(reserva, cancha)}
                        style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        🧾 Ver Comprobante
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pasarela de Pagos Simulada */}
      <PasarelaPagoModal
        isOpen={isPasarelaOpen}
        onClose={() => setIsPasarelaOpen(false)}
        monto={reservaAPagar?.valor || 0}
        concepto={`Reserva #${reservaAPagar?.id_reserva} - Pista de Tejo (${formatDate(reservaAPagar?.fecha)})`}
        metadata={{ id_reserva: reservaAPagar?.id_reserva }}
        onSuccess={handlePagoExitoso}
      />

      {/* Comprobante Digital Modal */}
      <ComprobanteDigitalModal
        isOpen={isComprobanteOpen}
        onClose={() => setIsComprobanteOpen(false)}
        pago={comprobanteSeleccionado}
      />
    </UserLayout>
  );
}
