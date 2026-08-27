import React, { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import Loader from '@/components/common/Loader';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { eventosService } from '../services/eventosService';
import { canchasService } from '@/features/canchas/services/canchasService';
import { useApp } from '@/context/AppContext';
import { formatDate, formatTime } from '@/utils/formatters';

export default function EventosUserPage() {
  const [eventos, setEventos] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showSuccess } = useApp();

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const [eventosData, canchasData] = await Promise.all([
          eventosService.listar(),
          canchasService.listar(),
        ]);
        setEventos(eventosData);
        setCanchas(canchasData);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const handleAnotarse = (evento) => {
    showSuccess(`¡Te has registrado con éxito en el evento "${evento.nombre}"!`);
  };

  return (
    <UserLayout
      title="Próximos Eventos y Talleres"
      subtitle="Descubre actividades, capacitaciones técnicas y festivales de integración del tejo."
    >
      {loading ? (
        <Loader message="Cargando calendario de actividades..." />
      ) : (
        <div className="services-grid">
          {eventos.map((evento) => {
            const cancha = canchas.find((c) => c.id_cancha === evento.cancha_id);
            return (
              <article key={evento.id} className="service-card">
                <div className="service-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <Badge variant="info">{evento.tipo || 'Evento'}</Badge>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      📅 {formatDate(evento.fecha)}
                    </span>
                  </div>

                  <h3>{evento.nombre}</h3>
                  <p style={{ fontSize: '0.88rem', minHeight: '44px' }}>{evento.descripcion}</p>

                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      margin: '16px 0',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      📍 Sede: <strong>{cancha?.nombre || 'Escenario deportivo'}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      ⏰ Hora: {formatTime(evento.hora)}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    style={{ width: '100%' }}
                    onClick={() => handleAnotarse(evento)}
                  >
                    🎟️ Anotarme al Evento
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </UserLayout>
  );
}
