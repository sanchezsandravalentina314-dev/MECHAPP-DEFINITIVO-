import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { torneosService } from '../services/torneosService';
import { canchasService } from '@/features/canchas/services/canchasService';
import { useApp } from '@/context/AppContext';
import { formatDate, formatCurrency } from '@/utils/formatters';

export default function TorneosAdminPage() {
  const [torneos, setTorneos] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTorneo, setEditingTorneo] = useState(null);

  const { showSuccess, showError } = useApp();

  const [formData, setFormData] = useState({
    id_cancha: '1',
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    premio: '2500000',
    estado: 'En Inscripción',
    cupo_maximo: '32',
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [torneosData, canchasData] = await Promise.all([
        torneosService.listar(),
        canchasService.listar(),
      ]);
      setTorneos(torneosData);
      setCanchas(canchasData);
    } catch {
      showError('Error al cargar torneos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleOpenNew = () => {
    setEditingTorneo(null);
    setFormData({
      id_cancha: canchas[0]?.id_cancha ? String(canchas[0].id_cancha) : '1',
      nombre: '',
      descripcion: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      premio: '2500000',
      estado: 'En Inscripción',
      cupo_maximo: '32',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (torneo) => {
    setEditingTorneo(torneo);
    setFormData({
      id_cancha: String(torneo.id_cancha),
      nombre: torneo.nombre,
      descripcion: torneo.descripcion || '',
      fecha_inicio: torneo.fecha_inicio,
      fecha_fin: torneo.fecha_fin,
      premio: String(torneo.premio || 0),
      estado: torneo.estado,
      cupo_maximo: String(torneo.cupo_maximo || 32),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`¿Eliminar el torneo #${id}?`)) return;
    try {
      await torneosService.eliminar(id);
      showSuccess('Torneo eliminado.');
      cargarDatos();
    } catch {
      showError('No se pudo eliminar el torneo.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id_cancha: Number(formData.id_cancha),
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        premio: Number(formData.premio),
        estado: formData.estado,
        cupo_maximo: Number(formData.cupo_maximo),
      };

      if (editingTorneo) {
        await torneosService.actualizar(editingTorneo.id_torneo, payload);
        showSuccess('Torneo actualizado con éxito.');
      } else {
        await torneosService.crear(payload);
        showSuccess('Torneo creado con éxito.');
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (err) {
      showError(err.message || 'Error al guardar el torneo.');
    }
  };

  const columns = [
    { header: 'ID', key: 'id_torneo', align: 'center' },
    {
      header: 'Torneo',
      key: 'nombre',
      render: (t) => (
        <div>
          <strong>{t.nombre}</strong>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Cupos: {t.cupo_maximo} equipos / jugadores
          </div>
        </div>
      ),
    },
    {
      header: 'Fechas',
      render: (t) => `${formatDate(t.fecha_inicio)} - ${formatDate(t.fecha_fin)}`,
    },
    {
      header: 'Sede / Escenario',
      render: (t) => {
        const c = canchas.find((can) => can.id_cancha === t.id_cancha);
        return c ? c.nombre : `Cancha #${t.id_cancha}`;
      },
    },
    {
      header: 'Bolsa de Premios',
      key: 'premio',
      render: (t) => <strong>🏆 {formatCurrency(t.premio)}</strong>,
    },
    {
      header: 'Estado',
      key: 'estado',
      render: (t) => (
        <Badge
          variant={
            t.estado === 'Activo'
              ? 'success'
              : t.estado === 'En Inscripción'
              ? 'warning'
              : 'info'
          }
        >
          {t.estado}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      render: (t) => (
        <div className="actions-cell">
          <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(t)}>
            ✏️ Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(t.id_torneo)}>
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Gestión de Torneos"
      subtitle="Planifica y administra campeonatos oficiales, fechas, escenarios aliados y bolsas de premios."
    >
      <Table
        columns={columns}
        data={torneos}
        loading={loading}
        onAddNew={handleOpenNew}
        addNewLabel="＋ Nuevo Torneo"
        searchPlaceholder="Buscar torneo por nombre o estado..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTorneo ? `✏️ Editar Torneo (#${editingTorneo.id_torneo})` : '＋ Planificar Nuevo Torneo'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre Oficial del Torneo"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej. Copa Relámpago de Tejo 2026"
            required
          />

          <Input
            label="Descripción y Reglamento"
            type="textarea"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Modalidad, categorías, mechas permitidas, arbitraje..."
          />

          <div className="form-grid-2">
            <Input
              label="Escenario / Sede"
              type="select"
              value={formData.id_cancha}
              onChange={(e) => setFormData({ ...formData, id_cancha: e.target.value })}
              required
              options={canchas.map((c) => ({
                value: String(c.id_cancha),
                label: c.nombre,
              }))}
            />

            <Input
              label="Cupo Máximo"
              type="number"
              value={formData.cupo_maximo}
              onChange={(e) => setFormData({ ...formData, cupo_maximo: e.target.value })}
              min="2"
              required
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Fecha de Inicio"
              type="date"
              value={formData.fecha_inicio}
              onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
              required
            />
            <Input
              label="Fecha de Finalización"
              type="date"
              value={formData.fecha_fin}
              onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Bolsa de Premio ($ COP)"
              type="number"
              value={formData.premio}
              onChange={(e) => setFormData({ ...formData, premio: e.target.value })}
              min="0"
              required
            />

            <Input
              label="Estado del Torneo"
              type="select"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              required
              options={[
                { value: 'En Inscripción', label: '🟡 En Inscripción' },
                { value: 'Activo', label: '🟢 Activo en Competencia' },
                { value: 'Finalizado', label: '⚪ Finalizado' },
                { value: 'Próximo', label: '🔵 Próximamente' },
              ]}
            />
          </div>

          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingTorneo ? 'Guardar Cambios' : 'Publicar Torneo'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
