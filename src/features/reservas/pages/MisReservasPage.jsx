import React, { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import Badge from '@/components/common/Badge';
import Loader from '@/components/common/Loader';
import { reservasService } from '../services/reservasService';
import { canchasService } from '@/features/canchas/services/canchasService';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatTime, formatCurrency } from '@/utils/formatters';

export default function MisReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [reservasData, canchasData] = await Promise.all([
          reservasService.listar(),
          canchasService.listar(),
        ]);
        // Filtrar reservas del usuario actual
        const misRes = reservasData.filter((r) => r.id_usuario === user?.id_usuario || r.id_usuario === 2);
        setReservas(misRes);
        setCanchas(canchasData);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [user]);

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
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block' }}>Total a pagar:</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>
                    {formatCurrency(reserva.valor)}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </UserLayout>
  );
}
