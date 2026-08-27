import React, { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Loader from '@/components/common/Loader';
import { canchasService } from '../services/canchasService';
import { ubicacionesService } from '@/features/ubicaciones/services/ubicacionesService';
import { reservasService } from '@/features/reservas/services/reservasService';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/utils/formatters';

export default function CanchasUserPage() {
  const [canchas, setCanchas] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCancha, setSelectedCancha] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuth();
  const { showSuccess, showError } = useApp();

  const [reservaForm, setReservaForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '18:00',
    hora_fin: '20:00',
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [canchasData, ubicacionesData] = await Promise.all([
        canchasService.listar(),
        ubicacionesService.listar(),
      ]);
      setCanchas(canchasData);
      setUbicaciones(ubicacionesData);
    } catch {
      showError('Error cargando canchas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleOpenReservar = (cancha) => {
    setSelectedCancha(cancha);
    setReservaForm({
      fecha: new Date().toISOString().split('T')[0],
      hora_inicio: '18:00',
      hora_fin: '20:00',
    });
    setIsModalOpen(true);
  };

  const handleCrearReserva = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id_usuario: user?.id_usuario || 2,
        id_cancha: selectedCancha.id_cancha,
        fecha: reservaForm.fecha,
        hora_inicio: reservaForm.hora_inicio + ':00',
        hora_fin: reservaForm.hora_fin + ':00',
        valor: (selectedCancha.precio_hora || 35000) * 2, // 2 horas
        estado: 'Confirmada',
      };

      await reservasService.crear(payload);
      showSuccess(`¡Reserva creada exitosamente en ${selectedCancha.nombre}!`);
      setIsModalOpen(false);
    } catch (err) {
      showError(err.message || 'No se pudo completar la reserva.');
    }
  };

  return (
    <UserLayout
      title="Canchas y Escenarios de Tejo"
      subtitle="Explora las pistas disponibles de la comunidad, consulta tarifas y agenda tu partida."
    >
      {loading ? (
        <Loader message="Buscando canchas aliadas..." />
      ) : (
        <div className="services-grid">
          {canchas.map((cancha) => {
            const ubicacion = ubicaciones.find((u) => u.id_ubicacion === cancha.id_ubicacion);
            return (
              <article key={cancha.id_cancha} className="service-card">
                <img
                  src="https://s3.amazonaws.com/rtvc-assets-senalmemoria.gov.co/s3fs-public/field_image/tejo.jpg"
                  alt={cancha.nombre}
                  className="service-card-img"
                />
                <div className="service-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <Badge variant={cancha.estado ? 'success' : 'danger'}>
                      {cancha.estado ? 'Disponible' : 'Ocupado'}
                    </Badge>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      📍 {ubicacion?.ciudad || 'Colombia'}
                    </span>
                  </div>

                  <h3>{cancha.nombre}</h3>
                  <p style={{ fontSize: '0.88rem', minHeight: '44px' }}>
                    {cancha.descripcion}
                  </p>

                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      margin: '16px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <small style={{ color: 'var(--text-dim)', display: 'block' }}>Tarifa</small>
                      <strong>{formatCurrency(cancha.precio_hora)} / hr</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <small style={{ color: 'var(--text-dim)', display: 'block' }}>Capacidad</small>
                      <strong>{cancha.capacidad} canchas</strong>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Dirección: {ubicacion?.direccion || 'Sede principal'} ({ubicacion?.barrio || 'Centro'})
                  </p>

                  <Button
                    variant="primary"
                    style={{ width: '100%' }}
                    onClick={() => handleOpenReservar(cancha)}
                    disabled={!cancha.estado}
                  >
                    🎯 Reservar Cancha
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal de Reserva */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`🎯 Reservar en ${selectedCancha?.nombre}`}
      >
        <form onSubmit={handleCrearReserva}>
          <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Tarifa por hora: <strong>{formatCurrency(selectedCancha?.precio_hora)}</strong>
            </p>
          </div>

          <Input
            label="Fecha de la Reserva"
            type="date"
            value={reservaForm.fecha}
            onChange={(e) => setReservaForm({ ...reservaForm, fecha: e.target.value })}
            required
          />

          <div className="form-grid-2">
            <Input
              label="Hora de Inicio"
              type="time"
              value={reservaForm.hora_inicio}
              onChange={(e) => setReservaForm({ ...reservaForm, hora_inicio: e.target.value })}
              required
            />
            <Input
              label="Hora de Fin"
              type="time"
              value={reservaForm.hora_fin}
              onChange={(e) => setReservaForm({ ...reservaForm, hora_fin: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Confirmar Reserva
            </Button>
          </div>
        </form>
      </Modal>
    </UserLayout>
  );
}
