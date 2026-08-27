import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !contrasena) {
      showError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(correo, contrasena);
      showSuccess(`¡Bienvenido de nuevo, ${user.nombre}!`);
      if (user.id_rol === 1) {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/torneos');
      }
    } catch (err) {
      showError(err.message || 'Credenciales inválidas.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    try {
      setLoading(true);
      const email = role === 'admin' ? 'admin@mechapp.com' : 'jugador@mechapp.com';
      const user = await login(email, '123456');
      showSuccess(`Acceso demo concedido como ${role === 'admin' ? 'Administrador' : 'Jugador'}`);
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/torneos');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/">
            <img src="/logo.jpeg" alt="Logo MechApp" className="auth-logo" />
          </Link>
          <h1>¡Bienvenido a MechApp!</h1>
          <p>Ingresa tus credenciales para acceder a la plataforma</p>
        </div>

        {/* Acceso rápido de demostración */}
        <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', textAlign: 'center' }}>
            ⚡ Acceso rápido de prueba:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
            >
              👑 Administrador
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDemoLogin('user')}
              disabled={loading}
            >
              🎯 Jugador
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Correo Electrónico"
            name="correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="ejemplo@correo.com"
            required
          />

          <div style={{ position: 'relative' }}>
            <Input
              label="Contraseña"
              name="contrasena"
              type={showPassword ? 'text' : 'password'}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Tu contraseña secreta"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '38px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}
            >
              {showPassword ? '🙈 Ocultar' : '👁️ Ver'}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{ width: '100%', marginTop: '12px' }}
          >
            Iniciar Sesión
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Aún no tienes cuenta?{' '}
            <Link to="/registro" style={{ fontWeight: 600 }}>
              Regístrate aquí
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
