import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { canchasService } from '../services/canchasService';
import { ubicacionesService } from '@/features/ubicaciones/services/ubicacionesService';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatters';

export default function CanchasAdminPage() {
  const [canchas, setCanchas] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCancha, setEditingCancha] = useState(null);

  const { user } = useAuth();
  const { showSuccess, showError } = useApp();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    id_ubicacion: '1',
    capacidad: '8',
    precio_hora: '35000',
    estado: true,
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
      showError('Error al cargar escenarios deportivos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleOpenNew = () => {
    setEditingCancha(null);
    setFormData({
      nombre: '',
      descripcion: '',
      id_ubicacion: ubicaciones[0]?.id_ubicacion ? String(ubicaciones[0].id_ubicacion) : '1',
      capacidad: '8',
      precio_hora: '35000',
      estado: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cancha) => {
    setEditingCancha(cancha);
    setFormData({
      nombre: cancha.nombre,
      descripcion: cancha.descripcion || '',
      id_ubicacion: String(cancha.id_ubicacion),
      capacidad: String(cancha.capacidad || 1),
      precio_hora: String(cancha.precio_hora || 0),
      estado: cancha.estado,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`¿Eliminar la cancha #${id}?`)) return;
    try {
      await canchasService.eliminar(id);
      showSuccess('Cancha eliminada.');
      cargarDatos();
    } catch {
      showError('No se pudo eliminar la cancha.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id_usuario: user?.id_usuario || 1,
        id_ubicacion: Number(formData.id_ubicacion),
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        capacidad: Number(formData.capacidad),
        precio_hora: Number(formData.precio_hora),
        estado: Boolean(formData.estado),
      };

      if (editingCancha) {
        await canchasService.actualizar(editingCancha.id_cancha, payload);
        showSuccess('Cancha actualizada con éxito.');
      } else {
        await canchasService.crear(payload);
        showSuccess('Cancha registrada con éxito.');
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (err) {
      showError(err.message || 'Error al guardar la cancha.');
    }
  };

  const columns = [
    { header: 'ID', key: 'id_cancha', align: 'center' },
    {
      header: 'Nombre del Escenario',
      key: 'nombre',
      render: (c) => (
        <div>
          <strong>{c.nombre}</strong>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {c.descripcion?.slice(0, 55)}...
          </div>
        </div>
      ),
    },
    {
      header: 'Ubicación / Ciudad',
      render: (c) => {
        const u = ubicaciones.find((ub) => ub.id_ubicacion === c.id_ubicacion);
        return u ? `${u.nombre} (${u.ciudad})` : `Ubicación #${c.id_ubicacion}`;
      },
    },
    {
      header: 'Capacidad',
      key: 'capacidad',
      render: (c) => `${c.capacidad} Pistas (${c.capacidad * 15} personas)`,
    },
    {
      header: 'Precio / Hora',
      key: 'precio_hora',
      render: (c) => <strong>{formatCurrency(c.precio_hora)}</strong>,
    },
    {
      header: 'Estado',
      key: 'estado',
      render: (c) => (
        <Badge variant={c.estado ? 'success' : 'danger'}>
          {c.estado ? 'Disponible' : 'Cerrado'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      render: (c) => (
        <div className="actions-cell">
          <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(c)}>
            ✏️ Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(c.id_cancha)}>
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Gestión de Escenarios y Canchas"
      subtitle="Administra los clubes deportivos aliados, su aforo de canchas, tarifas y ubicaciones."
    >
      <Table
        columns={columns}
        data={canchas}
        loading={loading}
        onAddNew={handleOpenNew}
        addNewLabel="＋ Nueva Cancha"
        searchPlaceholder="Buscar por club, dirección o capacidad..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCancha ? `✏️ Editar Escenario (#${editingCancha.id_cancha})` : '＋ Registrar Nuevo Escenario'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre del Club o Escenario"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej. Club de Tejo El Dorado"
            required
          />

          <Input
            label="Descripción e Instalaciones"
            type="textarea"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Detalla las pistas, servicios, zonas comunes, parqueadero..."
            required
          />

          <div className="form-grid-2">
            <Input
              label="Sede / Ubicación"
              type="select"
              value={formData.id_ubicacion}
              onChange={(e) => setFormData({ ...formData, id_ubicacion: e.target.value })}
              required
              options={ubicaciones.map((u) => ({
                value: String(u.id_ubicacion),
                label: `${u.nombre} - ${u.direccion} (${u.ciudad})`,
              }))}
            />

            <Input
              label="Número de Canchas (Pistas)"
              type="number"
              value={formData.capacidad}
              onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
              min="1"
              required
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Precio por Hora ($ COP)"
              type="number"
              value={formData.precio_hora}
              onChange={(e) => setFormData({ ...formData, precio_hora: e.target.value })}
              min="0"
              required
            />

            <Input
              label="Disponibilidad"
              type="select"
              value={formData.estado ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value === 'true' })}
              options={[
                { value: 'true', label: '🟢 Activo / Abierto' },
                { value: 'false', label: '🔴 Cerrado / Mantenimiento' },
              ]}
            />
          </div>

          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingCancha ? 'Guardar Cambios' : 'Registrar Cancha'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
