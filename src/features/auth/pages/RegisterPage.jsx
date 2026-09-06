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
  const [aceptaTratamiento, setAceptaTratamiento] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

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
      showError('Por favor ingresa un número de documento válido.');
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

    if (!aceptaTratamiento) {
      showError('Debes autorizar el tratamiento de tus datos personales para registrarte.');
      return;
    }

    // Seguridad extra: Si alguien intenta inyectar rol 1 por consola, forzamos a 2.
    let rolSeleccionado = Number(form.id_rol);
    if (rolSeleccionado === 1) {
      rolSeleccionado = 2;
    }

    try {
      setLoading(true);
      const payload = {
        id_rol: rolSeleccionado,
        nombre: form.nombre.trim(),
        documento: form.documento.trim(),
        correo: form.correo.trim().toLowerCase(),
        telefono: form.telefono.trim() || null,
        contrasena: form.contrasena,
        acepta_tratamiento_datos: aceptaTratamiento,
      };

      const user = await registro(payload);
      showSuccess(`¡Cuenta creada con éxito! Bienvenido, ${user.nombre}.`);
      const userRoleId = Number(user.id_rol);
      if (userRoleId === 1) {
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

          {/* Seguridad: Quitamos la opción de registrarse como Administrador libremente */}
          <Input
            label="Tipo de Usuario / Rol"
            name="id_rol"
            type="select"
            value={form.id_rol}
            onChange={handleChange}
            required
            options={[
              { value: '2', label: 'Jugador / Deportista' },
              { value: '3', label: 'Propietario de Canchas' }
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
              {showPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
            </button>
          </div>

          {/* Tratamiento de datos personales: casilla independiente del botón de Registrarse */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '20px' }}>
            <input
              type="checkbox"
              id="aceptaTratamiento"
              checked={aceptaTratamiento}
              onChange={(e) => setAceptaTratamiento(e.target.checked)}
              style={{ marginTop: '4px' }}
            />
            <label htmlFor="aceptaTratamiento" style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
              Autorizo el tratamiento de mis datos personales de acuerdo con la{' '}
              <button
                type="button"
                onClick={() => setShowPolicyModal(true)}
                style={{ textDecoration: 'underline', color: 'var(--primary, #ff6b35)', fontWeight: 600 }}
              >
                Política de Tratamiento de Datos Personales
              </button>{' '}
              de MechApp.
            </label>
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
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>

      {showPolicyModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setShowPolicyModal(false)}
        >
          <div
            style={{
              background: 'var(--card-bg, #1a1a2e)', color: 'var(--text, #fff)',
              maxWidth: '620px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
              borderRadius: '12px', padding: '28px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '16px' }}>Política de Tratamiento de Datos Personales</h2>

            <h4>¿Qué datos recopilamos?</h4>
            <p>Nombre, documento de identidad, correo electrónico, teléfono, usuario y contraseña (cifrada), así como tus estadísticas de juego, torneos y canchas asociadas.</p>

            <h4>¿Para qué los usamos?</h4>
            <p>Para crear y administrar tu cuenta, gestionar reservas, torneos y equipos, enviarte notificaciones del servicio, mejorar la plataforma y cumplir obligaciones legales.</p>

            <h4>¿Cómo se almacenan?</h4>
            <p>En una base de datos con controles de acceso, contraseñas cifradas y medidas de seguridad técnicas razonables contra pérdida o acceso no autorizado.</p>

            <h4>¿Con quién pueden compartirse?</h4>
            <p>No se venden ni comparten con terceros, salvo obligación legal o con proveedores tecnológicos (hosting, nube) bajo acuerdos de confidencialidad.</p>

            <h4>¿Cuáles son tus derechos?</h4>
            <p>Conocer, actualizar, rectificar y suprimir tus datos, revocar tu autorización, y presentar quejas ante la Superintendencia de Industria y Comercio (SIC), conforme a la Ley 1581 de 2012.</p>

            <h4>¿Cómo solicitar modificación o eliminación?</h4>
            <p>Escribiendo a [correo de contacto de MechApp] indicando tu nombre, documento y la solicitud específica. Responderemos en máximo 10 días hábiles (consultas) o 15 días hábiles (reclamos).</p>

            <h4>¿Cómo contactar al responsable?</h4>
            <p>[Nombre del responsable] — [correo de contacto] — [dirección].</p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <Button type="button" variant="primary" onClick={() => setShowPolicyModal(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}