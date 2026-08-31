import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { usuariosService } from '../services/usuariosService';
import { useApp } from '@/context/AppContext';
import { formatDate, getRoleName } from '@/utils/formatters';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    id_rol: '2',
    nombre: '',
    documento: '',
    correo: '',
    telefono: '',
    contrasena: '',
    estado: true,
  });

  const { showSuccess, showError } = useApp();

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuariosService.listar();
      setUsuarios(data);
    } catch (err) {
      showError('Error al cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleOpenNew = () => {
    setEditingUser(null);
    setFormData({
      id_rol: '2',
      nombre: '',
      documento: '',
      correo: '',
      telefono: '',
      contrasena: '',
      estado: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      id_rol: String(user.id_rol),
      nombre: user.nombre,
      documento: user.documento,
      correo: user.correo,
      telefono: user.telefono || '',
      contrasena: '',
      estado: user.estado,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`¿Estás seguro de eliminar el usuario #${id}?`)) return;
    try {
      await usuariosService.eliminar(id);
      showSuccess('Usuario eliminado con éxito.');
      cargarUsuarios();
    } catch (err) {
      showError('No se pudo eliminar el usuario.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        id_rol: Number(formData.id_rol),
        estado: Boolean(formData.estado),
      };

      if (editingUser) {
        if (!payload.contrasena) delete payload.contrasena;
        await usuariosService.actualizar(editingUser.id_usuario, payload);
        showSuccess('Usuario actualizado correctamente.');
      } else {
        if (!payload.contrasena) payload.contrasena = '123456';
        await usuariosService.crear(payload);
        showSuccess('Usuario registrado correctamente.');
      }
      setIsModalOpen(false);
      cargarUsuarios();
    } catch (err) {
      showError(err.message || 'Error guardando usuario.');
    }
  };

  const columns = [
    { header: 'ID', key: 'id_usuario', align: 'center' },
    {
      header: 'Nombre',
      key: 'nombre',
      render: (u) => (
        <div>
          <strong>{u.nombre}</strong>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Doc: {u.documento}</div>
        </div>
      ),
    },
    { header: 'Correo', key: 'correo' },
    { header: 'Teléfono', key: 'telefono', render: (u) => u.telefono || 'Sin teléfono' },
    {
      header: 'Rol',
      key: 'id_rol',
      render: (u) => (
        <Badge variant={Number(u.id_rol) === 1 ? 'primary' : Number(u.id_rol) === 3 ? 'warning' : 'info'}>
          {getRoleName(Number(u.id_rol))}
        </Badge>
      ),
    },
    {
      header: 'Estado',
      key: 'estado',
      render: (u) => (
        <Badge variant={u.estado ? 'success' : 'danger'}>
          {u.estado ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Registro',
      key: 'fecha_registro',
      render: (u) => formatDate(u.fecha_registro),
    },
    {
      header: 'Acciones',
      render: (u) => (
        <div className="actions-cell">
          <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(u)}>
            ✏️ Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(u.id_usuario)}>
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Gestión de Usuarios"
      subtitle="Administra cuentas, roles, credenciales y estados de acceso de MechApp."
    >
      <Table
        columns={columns}
        data={usuarios}
        loading={loading}
        onAddNew={handleOpenNew}
        addNewLabel="＋ Nuevo Usuario"
        searchPlaceholder="Buscar por nombre, correo o documento..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `✏️ Editar Usuario (#${editingUser.id_usuario})` : '＋ Registrar Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <Input
              label="Nombre Completo"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej. Juan Pérez"
              required
            />
            <Input
              label="Documento (Cédula)"
              value={formData.documento}
              onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
              placeholder="Ej. 1015404883"
              required
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Correo Electrónico"
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              placeholder="correo@ejemplo.com"
              required
            />
            <Input
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="3101234567"
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Rol en el Sistema"
              type="select"
              value={formData.id_rol}
              onChange={(e) => setFormData({ ...formData, id_rol: e.target.value })}
              required
              options={[
                { value: '1', label: '👑 Administrador' },
                { value: '2', label: '🎯 Jugador' },
                { value: '3', label: '🏟️ Propietario de Cancha' },
              ]}
            />
            <Input
              label="Estado de la Cuenta"
              type="select"
              value={formData.estado ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value === 'true' })}
              required
              options={[
                { value: 'true', label: '🟢 Activo' },
                { value: 'false', label: '🔴 Inactivo' },
              ]}
            />
          </div>

          <Input
            label={editingUser ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña Inicial'}
            type="password"
            value={formData.contrasena}
            onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
            placeholder={editingUser ? '••••••••' : 'Mínimo 6 caracteres'}
            required={!editingUser}
          />

          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
