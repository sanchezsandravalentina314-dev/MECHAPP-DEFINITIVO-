import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { eventosService } from '../services/eventosService';
import { canchasService } from '@/features/canchas/services/canchasService';
import { useApp } from '@/context/AppContext';
import { formatDate, formatTime } from '@/utils/formatters';

export default function EventosAdminPage() {
  const [eventos, setEventos] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);

  const { showSuccess, showError } = useApp();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    cancha_id: '1',
    fecha: new Date().toISOString().split('T')[0],
    hora: '09:00',
    tipo: 'Taller / Capacitación',
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [eventosData, canchasData] = await Promise.all([
        eventosService.listar(),
        canchasService.listar(),
      ]);
      setEventos(eventosData);
      setCanchas(canchasData);
    } catch {
      showError('Error al cargar eventos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleOpenNew = () => {
    setEditingEvento(null);
    setFormData({
      nombre: '',
      descripcion: '',
      cancha_id: canchas[0]?.id_cancha ? String(canchas[0].id_cancha) : '1',
      fecha: new Date().toISOString().split('T')[0],
      hora: '09:00',
      tipo: 'Taller / Capacitación',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evento) => {
    setEditingEvento(evento);
    setFormData({
      nombre: evento.nombre,
      descripcion: evento.descripcion || '',
      cancha_id: String(evento.cancha_id || 1),
      fecha: evento.fecha || '',
      hora: evento.hora ? evento.hora.slice(0, 5) : '09:00',
      tipo: evento.tipo || 'General',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`¿Eliminar el evento #${id}?`)) return;
    try {
      await eventosService.eliminar(id);
      showSuccess('Evento eliminado.');
      cargarDatos();
    } catch {
      showError('No se pudo eliminar el evento.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        cancha_id: Number(formData.cancha_id),
        fecha: formData.fecha,
        hora: formData.hora + ':00',
        tipo: formData.tipo,
      };

      if (editingEvento) {
        await eventosService.actualizar(editingEvento.id, payload);
        showSuccess('Evento actualizado.');
      } else {
        await eventosService.crear(payload);
        showSuccess('Evento programado con éxito.');
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (err) {
      showError(err.message || 'Error al guardar el evento.');
    }
  };

  const columns = [
    { header: 'ID', key: 'id', align: 'center' },
    {
      header: 'Nombre del Evento',
      key: 'nombre',
      render: (ev) => (
        <div>
          <strong>🎉 {ev.nombre}</strong>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {ev.descripcion?.slice(0, 55)}...
          </div>
        </div>
      ),
    },
    {
      header: 'Tipo',
      key: 'tipo',
      render: (ev) => <Badge variant="info">{ev.tipo || 'General'}</Badge>,
    },
    {
      header: 'Sede',
      render: (ev) => {
        const c = canchas.find((can) => can.id_cancha === ev.cancha_id);
        return c ? c.nombre : `Cancha #${ev.cancha_id}`;
      },
    },
    {
      header: 'Fecha y Hora',
      render: (ev) => `${formatDate(ev.fecha)} (${formatTime(ev.hora)})`,
    },
    {
      header: 'Acciones',
      render: (ev) => (
        <div className="actions-cell">
          <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(ev)}>
            ✏️ Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(ev.id)}>
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Gestión de Eventos y Actividades"
      subtitle="Organiza talleres, clínicas deportivas, festivales y encuentros comunitarios."
    >
      <Table
        columns={columns}
        data={eventos}
        loading={loading}
        onAddNew={handleOpenNew}
        addNewLabel="＋ Programar Evento"
        searchPlaceholder="Buscar por nombre o tipo de actividad..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvento ? `✏️ Editar Evento (#${editingEvento.id})` : '＋ Programar Nuevo Evento'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre de la Actividad / Evento"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej. Clínica de Tiro y Puntería de Tejo"
            required
          />

          <Input
            label="Detalles y Requerimientos"
            type="textarea"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Aforo, instructores a cargo, materiales..."
            required
          />

          <div className="form-grid-2">
            <Input
              label="Sede / Cancha Aliada"
              type="select"
              value={formData.cancha_id}
              onChange={(e) => setFormData({ ...formData, cancha_id: e.target.value })}
              required
              options={canchas.map((c) => ({
                value: String(c.id_cancha),
                label: c.nombre,
              }))}
            />

            <Input
              label="Tipo de Evento"
              type="select"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              required
              options={[
                'Taller / Capacitación',
                'Recreativo / Cultural',
                'Exhibición de Campeones',
                'Asamblea / Reunión',
              ]}
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Fecha Programada"
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />
            <Input
              label="Hora de Inicio"
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingEvento ? 'Guardar Cambios' : 'Publicar Evento'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
