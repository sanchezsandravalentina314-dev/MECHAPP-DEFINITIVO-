import React, { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Loader from '@/components/common/Loader';
import { equiposService } from '../services/equiposService';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/utils/formatters';

export default function EquiposUserPage() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuth();
  const { showSuccess, showError } = useApp();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  const cargarEquipos = async () => {
    try {
      setLoading(true);
      const data = await equiposService.listar();
      setEquipos(data);
    } catch {
      showError('Error al cargar equipos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEquipos();
  }, []);

  const handleCrearEquipo = async (e) => {
    e.preventDefault();
    try {
      await equiposService.crear({
        id_capitan: user?.id_usuario || 2,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        estado: true,
      });
      showSuccess(`¡Equipo "${formData.nombre}" creado exitosamente!`);
      setIsModalOpen(false);
      setFormData({ nombre: '', descripcion: '' });
      cargarEquipos();
    } catch (err) {
      showError(err.message || 'Error al crear equipo.');
    }
  };

  return (
    <UserLayout
      title="Mis Equipos y Clubes"
      subtitle="Crea tu propio equipo, gestiona los jugadores y compite bajo una misma bandera en torneos oficiales."
    >
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={() => setIsModalOpen(true)} icon="＋">
          Crear Nuevo Equipo
        </Button>
      </div>

      {loading ? (
        <Loader message="Cargando tus equipos..." />
      ) : (
        <div className="services-grid">
          {equipos.map((equipo) => {
            const esCapitan = equipo.id_capitan === user?.id_usuario;
            return (
              <article key={equipo.id_equipo} className="service-card">
                <div
                  style={{
                    height: '140px',
                    background: 'linear-gradient(135deg, #1e1e2f 0%, #2a2a40 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3.5rem',
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  ⚽
                </div>
                <div className="service-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <Badge variant={equipo.estado ? 'success' : 'danger'}>
                      {equipo.estado ? 'Activo' : 'Inactivo'}
                    </Badge>
                    {esCapitan && <span className="badge badge-primary">👑 Capitán</span>}
                  </div>

                  <h3>{equipo.nombre}</h3>
                  <p style={{ fontSize: '0.88rem', minHeight: '44px' }}>
                    {equipo.descripcion || 'Sin descripción detallada.'}
                  </p>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: '12px 0' }}>
                    📅 Fundado: {formatDate(equipo.fecha_creacion)}
                  </div>

                  <Button
                    variant="secondary"
                    style={{ width: '100%' }}
                    onClick={() => alert(`Gestionando nómina de ${equipo.nombre}`)}
                  >
                    👥 Ver Plantilla de Jugadores
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Crear Equipo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="⚽ Fundar Nuevo Equipo de Tejo"
      >
        <form onSubmit={handleCrearEquipo}>
          <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              Capitán asignado: <strong>{user?.nombre}</strong> (Tú)
            </p>
          </div>

          <Input
            label="Nombre del Equipo"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej. Club Los Profesionales del Bocín"
            required
          />

          <Input
            label="Descripción / Historia del Club"
            type="textarea"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Menciona la procedencia, integrantes o aspiraciones..."
          />

          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Fundar Equipo
            </Button>
          </div>
        </form>
      </Modal>
    </UserLayout>
  );
}
