import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { authService } from '@/features/auth/services/authService';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado modal recuperacion
  const [showRecovery, setShowRecovery] = useState(false);
  const [correoRecuperacion, setCorreoRecuperacion] = useState('');
  const [loadingRecovery, setLoadingRecovery] = useState(false);
  const [recoveryEnviado, setRecoveryEnviado] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !contrasena) {
      showError('Por favor ingresa tu correo y contrasena.');
      return;
    }
    try {
      setLoading(true);
      const user = await login(correo, contrasena);
      showSuccess(`Bienvenido de nuevo, ${user.nombre}!`);
      const userRoleId = Number(user.id_rol);
      if (userRoleId === 1) {
        navigate('/admin/dashboard');
      } else if (userRoleId === 3) {
        navigate('/admin/canchas');
      } else {
        navigate('/user/canchas');
      }
    } catch (err) {
      showError(err.message || 'Credenciales invalidas.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperacion = async (e) => {
    e.preventDefault();
    if (!correoRecuperacion) {
      showError('Por favor ingresa tu correo electronico.');
      return;
    }
    try {
      setLoadingRecovery(true);
      await authService.solicitarRecuperacion({ correo: correoRecuperacion });
      setRecoveryEnviado(true);
    } catch (err) {
      showError(err.message || 'Error al enviar el correo de recuperacion.');
    } finally {
      setLoadingRecovery(false);
    }
  };

  const cerrarModal = () => {
    setShowRecovery(false);
    setCorreoRecuperacion('');
    setRecoveryEnviado(false);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/">
            <img src="/logo.jpeg" alt="Logo MechApp" className="auth-logo" />
          </Link>
          <h1>Iniciar Sesion</h1>
          <p>Ingresa tus credenciales para acceder a la plataforma</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Correo Electronico"
            name="correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="ejemplo@correo.com"
            required
          />

          <div style={{ position: 'relative' }}>
            <Input
              label="Contrasena"
              name="contrasena"
              type={showPassword ? 'text' : 'password'}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Tu contrasena secreta"
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
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>

          <div style={{ textAlign: 'right', marginTop: '4px', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => setShowRecovery(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary, #ff5722)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Olvidaste tu contrasena?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{ width: '100%', marginTop: '12px' }}
          >
            Ingresar a MechApp
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Aun no tienes cuenta?{' '}
            <Link to="/registro" style={{ fontWeight: 600 }}>
              Registrate aqui
            </Link>
          </p>
          <p style={{ marginTop: '10px' }}>
            <Link to="/" style={{ color: 'var(--text-dim)' }}>
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>

      {showRecovery && (
        <div
          onClick={cerrarModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface, #16213e)',
              borderRadius: '16px',
              padding: '36px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Recuperar Contrasena</h2>
              <button
                onClick={cerrarModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  lineHeight: 1,
                }}
              >
                X
              </button>
            </div>

            {recoveryEnviado ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <p style={{ fontSize: '2.8rem', marginBottom: '12px' }}>EMAIL</p>
                <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '8px' }}>
                  Correo enviado!
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Si {correoRecuperacion} esta registrado, recibiras un enlace para
                  restablecer tu contrasena. Revisa tambien la carpeta de spam.
                </p>
                <button
                  onClick={cerrarModal}
                  style={{
                    marginTop: '20px',
                    background: 'var(--color-primary, #ff5722)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                  }}
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecuperacion}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
                  Ingresa tu correo registrado y te enviaremos un enlace para crear una
                  nueva contrasena. El enlace es valido por 30 minutos.
                </p>
                <Input
                  label="Correo Electronico"
                  name="correo_recuperacion"
                  type="email"
                  value={correoRecuperacion}
                  onChange={(e) => setCorreoRecuperacion(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={cerrarModal}
                    style={{
                      flex: 1,
                      padding: '11px',
                      border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
                      borderRadius: '8px',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    Cancelar
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loadingRecovery}
                    style={{ flex: 2 }}
                  >
                    Enviar enlace
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}