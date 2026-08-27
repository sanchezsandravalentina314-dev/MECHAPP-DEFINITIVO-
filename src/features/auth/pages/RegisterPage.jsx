import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { isValidEmail, isValidDocument } from '@/utils/validators';

export default function RegisterPage() {
  const [form, setForm] = useState({
    nombre: '',
    documento: '',
    correo: '',
    telefono: '',
    id_rol: '2', // Por defecto 2 = Jugador
    contrasena: '',
    confirmarContrasena: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { registro } = useAuth();
  const { showSuccess, showError } = useApp();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim() || !form.documento.trim() || !form.correo.trim() || !form.contrasena) {
      showError('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (!isValidDocument(form.documento)) {
      showError('Por favor ingresa un número de documento válido (mínimo 5 caracteres).');
      return;
    }

    if (!isValidEmail(form.correo)) {
      showError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (form.contrasena.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (form.contrasena !== form.confirmarContrasena) {
      showError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        id_rol: Number(form.id_rol),
        nombre: form.nombre.trim(),
        documento: form.documento.trim(),
        correo: form.correo.trim().toLowerCase(),
        telefono: form.telefono.trim() || null,
        contrasena: form.contrasena,
      };

      const user = await registro(payload);
      showSuccess(`¡Cuenta creada con éxito! Bienvenido, ${user.nombre}.`);
      if (user.id_rol === 1) {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/torneos');
      }
    } catch (err) {
      showError(err.message || 'Error al registrar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ maxWidth: '540px' }}>
        <div className="auth-header">
          <Link to="/">
            <img src="/logo.jpeg" alt="Logo MechApp" className="auth-logo" />
          </Link>
          <h1>Crear Cuenta en MechApp</h1>
          <p>Únete a la plataforma digital del tejo colombiano</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <Input
              label="Nombre Completo"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Valentina Sánchez"
              required
            />
            <Input
              label="Documento (Cédula/ID)"
              name="documento"
              value={form.documento}
              onChange={handleChange}
              placeholder="Ej. 1015404883"
              required
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Correo Electrónico"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              required
            />
            <Input
              label="Teléfono / Celular"
              name="telefono"
              type="tel"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej. 3101234567"
            />
          </div>

          <Input
            label="Tipo de Usuario / Rol"
            name="id_rol"
            type="select"
            value={form.id_rol}
            onChange={handleChange}
            required
            options={[
              { value: '2', label: '🎯 Jugador / Deportista' },
              { value: '3', label: '🏟️ Propietario de Canchas' },
              { value: '1', label: '👑 Administrador' },
            ]}
          />

          <div className="form-grid-2">
            <div style={{ position: 'relative' }}>
              <Input
                label="Contraseña"
                name="contrasena"
                type={showPassword ? 'text' : 'password'}
                value={form.contrasena}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Input
                label="Confirmar Contraseña"
                name="confirmarContrasena"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmarContrasena}
                onChange={handleChange}
                placeholder="Repite la contraseña"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}
            >
              {showPassword ? '🙈 Ocultar contraseñas' : '👁️ Mostrar contraseñas'}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{ width: '100%' }}
          >
            Registrarse e Iniciar Sesión
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Inicia sesión aquí
            </Link>
          </p>
          <p style={{ marginTop: '10px' }}>
            <Link to="/" style={{ color: 'var(--text-dim)' }}>
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
