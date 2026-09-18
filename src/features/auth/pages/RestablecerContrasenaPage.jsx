import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { authService } from '@/features/auth/services/authService';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function RestablecerContrasenaPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

  const { showSuccess, showError } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      showError('El enlace de recuperación no es válido. Solicita uno nuevo.');
      return;
    }
    if (nuevaContrasena.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nuevaContrasena !== confirmarContrasena) {
      showError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      await authService.restablecerContrasena({ token, nueva_contrasena: nuevaContrasena });
      showSuccess('¡Contraseña restablecida exitosamente!');
      setExito(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      showError(err.message || 'El enlace expiró o es inválido. Solicita uno nuevo.');
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
          <h1>Nueva Contraseña</h1>
          <p>Ingresa y confirma tu nueva contraseña para MechApp</p>
        </div>

        {exito ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✅</p>
            <p style={{ color: 'var(--color-success, #4caf50)', fontWeight: 600, fontSize: '1.05rem' }}>
              ¡Contraseña actualizada!
            </p>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.9rem' }}>
              Redirigiendo al inicio de sesión...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!token && (
              <p style={{
                background: 'rgba(255, 87, 34, 0.12)',
                border: '1px solid var(--color-primary, #ff5722)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'var(--color-primary, #ff5722)',
                fontSize: '0.9rem',
                marginBottom: '16px',
              }}>
                ⚠️ Enlace inválido. Por favor solicita un nuevo correo de recuperación.
              </p>
            )}

            <div style={{ position: 'relative' }}>
              <Input
                label="Nueva Contraseña"
                name="nueva_contrasena"
                type={showPass ? 'text' : 'password'}
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '38px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                {showPass ? 'Ocultar' : 'Ver'}
              </button>
            </div>

            <Input
              label="Confirmar Contraseña"
              name="confirmar_contrasena"
              type={showPass ? 'text' : 'password'}
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              placeholder="Repite tu nueva contraseña"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!token}
              style={{ width: '100%', marginTop: '12px' }}
            >
              Guardar Nueva Contraseña
            </Button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            <Link to="/login" style={{ fontWeight: 600 }}>
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
