import React, { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Loader from '@/components/common/Loader';
import { torneosService } from '../services/torneosService';
import { canchasService } from '@/features/canchas/services/canchasService';
import { inscripcionesService } from '@/features/inscripciones/services/inscripcionesService';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { formatDate, formatCurrency } from '@/utils/formatters';

export default function TorneosUserPage() {
  const [torneos, setTorneos] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [misInscripciones, setMisInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTorneo, setSelectedTorneo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoria, setCategoria] = useState('Mayores (A)');
  const [notas, setNotas] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const { showSuccess, showError } = useApp();

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [torneosData, canchasData, inscripcionesData] = await Promise.all([
        torneosService.listar(),
        canchasService.listar(),
        inscripcionesService.listar().catch(() => []),
      ]);
      setTorneos(torneosData || []);
      setCanchas(canchasData || []);
      setMisInscripciones(inscripcionesData || []);
    } catch {
      showError('Error cargando torneos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleOpenInscripcion = (torneo) => {
    setSelectedTorneo(torneo);
    setCategoria('Mayores (A)');
    setNotas('');
    setIsModalOpen(true);
  };

  const handleConfirmarInscripcion = async (e) => {
    e.preventDefault();
    if (!categoria) {
      showError('Por favor selecciona una categoría de juego.');
      return;
    }
    try {
      setSubmitting(true);
      await inscripcionesService.inscribirUsuario({
        id_usuario: user?.id_usuario || 2,
        id_torneo: selectedTorneo.id_torneo,
        estado: 'Confirmada',
      });
      showSuccess(`¡Te has inscrito exitosamente en ${selectedTorneo.nombre}! Categoría: ${categoria}`);
      setIsModalOpen(false);
      await cargarDatos();
    } catch (err) {
      showError(err.message || 'No se pudo completar la inscripción.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserLayout
      title="Centro de Torneos y Campeonatos"
      subtitle="Participa en los torneos oficiales de tejo, compite por premios y sube en el ranking nacional."
    >
      {loading ? (
        <Loader message="Cargando calendario de torneos..." />
      ) : (
        <div className="services-grid">
          {torneos.map((torneo) => {
            const cancha = canchas.find((c) => c.id_cancha === torneo.id_cancha);
            return (
              <article key={torneo.id_torneo} className="service-card">
                <img
                  src="https://www.eldiario.com.co/wp-content/uploads/2023/11/1.20-1068x712.jpeg"
                  alt={torneo.nombre}
                  className="service-card-img"
                />
                <div className="service-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <Badge
                      variant={
                        torneo.estado === 'Activo'
                          ? 'success'
                          : torneo.estado === 'En Inscripción'
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {torneo.estado}
                    </Badge>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
                      🏆 {formatCurrency(torneo.premio)}
                    </span>
                  </div>

                  <h3>{torneo.nombre}</h3>
                  <p style={{ fontSize: '0.88rem', minHeight: '44px' }}>
                    {torneo.descripcion}
                  </p>

                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      margin: '16px 0',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      📍 Sede: <strong>{cancha?.nombre || 'Escenario oficial'}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      📅 Fechas: {formatDate(torneo.fecha_inicio)} al {formatDate(torneo.fecha_fin)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      👥 Cupos: Máximo {torneo.cupo_maximo} competidores
                    </div>
                  </div>

                  {(() => {
                    const estaInscrito = misInscripciones.some(
                      (ins) => ins.id_torneo === torneo.id_torneo && Number(ins.id_usuario) === Number(user?.id_usuario || 2)
                    );
                    return (
                      <Button
                        variant={estaInscrito ? 'secondary' : 'primary'}
                        style={{ width: '100%' }}
                        onClick={() => handleOpenInscripcion(torneo)}
                        disabled={torneo.estado === 'Finalizado' || estaInscrito}
                      >
                        {estaInscrito ? '✅ Ya estás inscrito' : '📝 Inscribirme al Torneo'}
                      </Button>
                    );
                  })()}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal de Inscripción */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`📝 Inscripción: ${selectedTorneo?.nombre}`}
      >
        <form onSubmit={handleConfirmarInscripcion}>
          <div style={{ marginBottom: '16px', padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Jugador: <strong>{user?.nombre || 'Deportista'}</strong>
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Documento: {user?.documento || 'No registrado'}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--primary)' }}>
              Premio en juego: {formatCurrency(selectedTorneo?.premio)}
            </p>
          </div>

          <Input
            label="Categoría de Juego"
            type="select"
            id="categoria-select"
            name="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
            options={[
              { value: 'Mayores (A)', label: 'Mayores (A) - Avanzado' },
              { value: 'Mayores (B)', label: 'Mayores (B) - Intermedio' },
              { value: 'Juvenil / Aficionados', label: 'Juvenil / Aficionados' },
              { value: 'Parejas Libres', label: 'Parejas Libres' },
            ]}
          />

          <Input
            label="Notas o Requerimientos Especiales"
            type="textarea"
            id="notas-textarea"
            name="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Horario preferido, equipo con el que participas..."
          />

          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Inscribiendo...' : 'Confirmar Inscripción'}
            </Button>
          </div>
        </form>
      </Modal>
    </UserLayout>
  );
}
