import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { equiposService } from '../services/equiposService';
import { usuariosService } from '@/features/usuarios/services/usuariosService';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/utils/formatters';

export default function EquiposAdminPage() {
  const [equipos, setEquipos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState(null);

  const { showSuccess, showError } = useApp();

  const [formData, setFormData] = useState({
    id_capitan: '2',
    nombre: '',
    descripcion: '',
    estado: true,
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [equiposData, usuariosData] = await Promise.all([
        equiposService.listar(),
        usuariosService.listar(),
      ]);
      setEquipos(equiposData);
      setUsuarios(usuariosData);
    } catch {
      showError('Error al cargar equipos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleOpenNew = () => {
    setEditingEquipo(null);
    setFormData({
      id_capitan: usuarios[0]?.id_usuario ? String(usuarios[0].id_usuario) : '2',
      nombre: '',
      descripcion: '',
      estado: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (equipo) => {
    setEditingEquipo(equipo);
    setFormData({
      id_capitan: String(equipo.id_capitan),
      nombre: equipo.nombre,
      descripcion: equipo.descripcion || '',
      estado: equipo.estado,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`¿Eliminar el equipo #${id}?`)) return;
    try {
      await equiposService.eliminar(id);
      showSuccess('Equipo eliminado.');
      cargarDatos();
    } catch {
      showError('No se pudo eliminar el equipo.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id_capitan: Number(formData.id_capitan),
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        estado: Boolean(formData.estado),
      };

      if (editingEquipo) {
        await equiposService.actualizar(editingEquipo.id_equipo, payload);
        showSuccess('Equipo actualizado.');
      } else {
        await equiposService.crear(payload);
        showSuccess('Equipo registrado.');
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (err) {
      showError(err.message || 'Error al guardar equipo.');
    }
  };

  const columns = [
    { header: 'ID', key: 'id_equipo', align: 'center' },
    {
      header: 'Nombre del Equipo',
      key: 'nombre',
      render: (e) => (
        <div>
          <strong>⚽ {e.nombre}</strong>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {e.descripcion?.slice(0, 50)}...
          </div>
        </div>
      ),
    },
    {
      header: 'Capitán Asignado',
      render: (e) => {
        const cap = usuarios.find((u) => u.id_usuario === e.id_capitan);
        return cap ? cap.nombre : `Usuario #${e.id_capitan}`;
      },
    },
    {
      header: 'Fecha Creación',
      key: 'fecha_creacion',
      render: (e) => formatDate(e.fecha_creacion),
    },
    {
      header: 'Estado',
      key: 'estado',
      render: (e) => (
        <Badge variant={e.estado ? 'success' : 'danger'}>
          {e.estado ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      render: (e) => (
        <div className="actions-cell">
          <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(e)}>
            ✏️ Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(e.id_equipo)}>
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Gestión de Equipos y Delegaciones"
      subtitle="Administra los clubes participantes, sus capitanes y la vinculación de jugadores."
    >
      <Table
        columns={columns}
        data={equipos}
        loading={loading}
        onAddNew={handleOpenNew}
        addNewLabel="＋ Nuevo Equipo"
        searchPlaceholder="Buscar equipo por nombre o capitán..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEquipo ? `✏️ Editar Equipo (#${editingEquipo.id_equipo})` : '＋ Registrar Nuevo Equipo'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre del Equipo o Club"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej. Los Embajadores del Tejo"
            required
          />

          <Input
            label="Capitán / Líder del Equipo"
            type="select"
            value={formData.id_capitan}
            onChange={(e) => setFormData({ ...formData, id_capitan: e.target.value })}
            required
            options={usuarios.map((u) => ({
              value: String(u.id_usuario),
              label: `${u.nombre} (${u.correo})`,
            }))}
          />

          <Input
            label="Historial o Descripción"
            type="textarea"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Años de experiencia, títulos obtenidos, ciudad de origen..."
          />

          <Input
            label="Estado del Equipo"
            type="select"
            value={formData.estado ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value === 'true' })}
            options={[
              { value: 'true', label: '🟢 Activo para Competencia' },
              { value: 'false', label: '🔴 Inactivo' },
            ]}
          />

          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingEquipo ? 'Guardar Cambios' : 'Registrar Equipo'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
