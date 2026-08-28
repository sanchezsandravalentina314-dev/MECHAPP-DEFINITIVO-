import React, { useState } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { getRoleName } from '@/utils/formatters';
import api from '@/services/api';

export default function PerfilPage() {
  const { user, setUser } = useAuth();
  const { showSuccess, showError } = useApp();

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    correo: user?.correo || '',
    documento: user?.documento || '',
    telefono: user?.telefono || '',
  });

  const [pwdForm, setPwdForm] = useState({
    contrasena_actual: '',
    nueva_contrasena: '',
    confirmar: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = { ...user, ...form };
    setUser(updated);
    localStorage.setItem('mechapp_user', JSON.stringify(updated));
    showSuccess('Perfil actualizado correctamente.');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.nueva_contrasena !== pwdForm.confirmar) {
      showError('Las contraseñas nuevas no coinciden.');
      return;
    }
    
    try {
      await api.put('/auth/cambiar-contrasena', {
        contrasena_actual: pwdForm.contrasena_actual,
        nueva_contrasena: pwdForm.nueva_contrasena
      });
      showSuccess('Contraseña actualizada de forma segura.');
      setPwdForm({ contrasena_actual: '', nueva_contrasena: '', confirmar: '' });
    } catch (error) {
      showError(error.message || 'No se pudo cambiar la contraseña.');
    }
  };

  return (
    <UserLayout
      title="Mi Perfil"
      subtitle="Consulta y actualiza tus datos personales y credenciales de contacto."
    >
      <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800,
                border: '2px solid var(--primary)',
              }}
            >
              {user?.nombre ? user.nombre[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>{user?.nombre || 'Usuario MechApp'}</h2>
              <p style={{ margin: 0 }}>Rol: <strong>{getRoleName(user?.id_rol)}</strong></p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Documento: {user?.documento || 'No registrado'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <Input
                label="Nombre Completo"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
              <Input
                label="Documento de Identidad"
                value={form.documento}
                disabled
                helperText="El documento no se puede modificar directamente."
              />
            </div>

            <div className="form-grid-2">
              <Input
                label="Correo Electrónico"
                type="email"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                required
              />
              <Input
                label="Teléfono / WhatsApp"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="3001234567"
              />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="primary">
                Guardar Cambios del Perfil
              </Button>
            </div>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Cambiar Contraseña</h3>
          <form onSubmit={handlePasswordSubmit}>
            <Input
              label="Contraseña Actual"
              type="password"
              value={pwdForm.contrasena_actual}
              onChange={(e) => setPwdForm({ ...pwdForm, contrasena_actual: e.target.value })}
              required
            />
            <div className="form-grid-2" style={{ marginTop: '16px' }}>
              <Input
                label="Nueva Contraseña"
                type="password"
                value={pwdForm.nueva_contrasena}
                onChange={(e) => setPwdForm({ ...pwdForm, nueva_contrasena: e.target.value })}
                required
              />
              <Input
                label="Confirmar Nueva Contraseña"
                type="password"
                value={pwdForm.confirmar}
                onChange={(e) => setPwdForm({ ...pwdForm, confirmar: e.target.value })}
                required
              />
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="secondary">
                Actualizar Contraseña
              </Button>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}
