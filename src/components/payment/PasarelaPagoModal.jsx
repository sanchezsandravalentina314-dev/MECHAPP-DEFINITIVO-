import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { formatCurrency } from '@/utils/formatters';
import { pagosService } from '@/features/pagos/services/pagosService';

export default function PasarelaPagoModal({
  isOpen,
  onClose,
  monto = 0,
  concepto = 'Servicio deportivo MechApp',
  metadata = {}, // { id_reserva, id_inscripcion, id_pedido, etc. }
  onSuccess,
}) {
  const [metodo, setMetodo] = useState('tarjeta'); // 'tarjeta' | 'pse' | 'nequi' | 'efectivo'
  const [procesando, setProcesando] = useState(false);
  const [pasoProceso, setPasoProceso] = useState('');
  const [pagoExitoso, setPagoExitoso] = useState(null);

  // Formulario Tarjeta
  const [tarjeta, setTarjeta] = useState({
    numero: '',
    nombre: '',
    expiracion: '',
    cvc: '',
    cuotas: '1',
  });

  // Formulario PSE
  const [pse, setPse] = useState({
    banco: 'bancolombia',
    tipoPersona: 'natural',
    email: '',
    documento: '',
  });

  // Formulario Nequi / Daviplata
  const [billetera, setBilletera] = useState({
    tipo: 'nequi',
    celular: '',
  });

  useEffect(() => {
    if (isOpen) {
      setProcesando(false);
      setPasoProceso('');
      setPagoExitoso(null);
    }
  }, [isOpen]);

  // Formateadores interactivos para tarjeta
  const handleNumeroTarjetaChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setTarjeta((prev) => ({ ...prev, numero: formatted }));
  };

  const handleExpiracionChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setTarjeta((prev) => ({ ...prev, expiracion: val }));
  };

  const handleCvcChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    setTarjeta((prev) => ({ ...prev, cvc: val }));
  };

  // Identificar franquicia
  const getFranquicia = (num) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return { nombre: 'Visa', color: '#1a1f71', logo: '💳 VISA' };
    if (clean.startsWith('5')) return { nombre: 'Mastercard', color: '#eb001b', logo: '💳 MASTERCARD' };
    if (clean.startsWith('3')) return { nombre: 'Amex', color: '#007cc3', logo: '💳 AMEX' };
    return { nombre: 'Tarjeta', color: '#334155', logo: '💳 CRÉDITO / DÉBITO' };
  };

  // Mapear método a id_metodo_pago de la BD
  const getMetodoId = () => {
    switch (metodo) {
      case 'efectivo': return 1;
      case 'nequi': return 2; // Transferencia
      case 'tarjeta': return 3;
      case 'pse': return 4;
      default: return 3;
    }
  };

  const handlePagar = async (e) => {
    e.preventDefault();
    setProcesando(true);
    setPasoProceso('Conectando de forma segura con la red de pagos...');

    const ref = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);

    setTimeout(() => {
      setPasoProceso('Validando fondos y autorización bancaria...');
    }, 900);

    setTimeout(async () => {
      try {
        const payload = {
          id_metodo_pago: getMetodoId(),
          id_reserva: metadata?.id_reserva || null,
          id_inscripcion: metadata?.id_inscripcion || null,
          valor: Number(monto),
          estado: 'Aprobado',
          referencia: ref,
        };

        const res = await pagosService.crear(payload);
        const resultadoFinal = {
          ...res,
          referencia: ref,
          monto,
          concepto,
          metodoNombre:
            metodo === 'tarjeta'
              ? `Tarjeta (${getFranquicia(tarjeta.numero).nombre} terminada en ${tarjeta.numero.slice(-4) || '****'})`
              : metodo === 'pse'
              ? `PSE (${pse.banco.toUpperCase()})`
              : metodo === 'nequi'
              ? `${billetera.tipo.toUpperCase()} (${billetera.celular || 'Móvil'})`
              : 'Efectivo en Sede',
          fecha: new Date().toLocaleString(),
        };

        setPagoExitoso(resultadoFinal);
        if (onSuccess) {
          onSuccess(resultadoFinal);
        }
      } catch (err) {
        console.error('Error al registrar pago en backend:', err);
      } finally {
        setProcesando(false);
        setPasoProceso('');
      }
    }, 1900);
  };

  const franquicia = getFranquicia(tarjeta.numero);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !procesando && onClose()}
      title={pagoExitoso ? '✅ ¡Pago Confirmado Exitosamente!' : '🔒 Pasarela de Pago Segura (Simulada)'}
      size="md"
    >
      {/* PANTALLA 1: COMPROBANTE DE PAGO EXITOSO */}
      {pagoExitoso ? (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '2px solid #22c55e',
              color: '#22c55e',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            ✓
          </div>

          <h3 style={{ margin: '0 0 6px', fontSize: '1.4rem', color: 'var(--text-color)' }}>
            ¡Transacción Aprobada!
          </h3>
          <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Tu pago ha sido procesado y registrado correctamente en el sistema.
          </p>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              textAlign: 'left',
              fontSize: '0.88rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Monto Pagado:</span>
              <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>
                {formatCurrency(pagoExitoso.monto)}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Referencia:</span>
              <code style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                {pagoExitoso.referencia}
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Concepto:</span>
              <strong>{pagoExitoso.concepto}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Método de Pago:</span>
              <span>{pagoExitoso.metodoNombre}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Fecha y Hora:</span>
              <span>{pagoExitoso.fecha}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estado:</span>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>● Aprobado</span>
            </div>
          </div>

          <Button
            variant="primary"
            style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
            onClick={onClose}
          >
            Finalizar y Continuar
          </Button>
        </div>
      ) : procesando ? (
        /* PANTALLA 2: PROCESANDO TRANSACCIÓN */
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              border: '4px solid var(--border-color)',
              borderTop: '4px solid var(--primary)',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <h4 style={{ margin: '0 0 10px', fontSize: '1.2rem' }}>Procesando tu pago...</h4>
          <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.95rem' }}>
            {pasoProceso}
          </p>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '14px' }}>
            Por favor, no cierres esta ventana mientras confirmamos la operación.
          </p>
        </div>
      ) : (
        /* PANTALLA 3: FORMULARIO DE CHECKOUT Y SELECCIÓN DE MÉTODO */
        <div>
          {/* Resumen del cobro */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.08), rgba(255, 179, 0, 0.08))',
              border: '1px solid rgba(255, 87, 34, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                Resumen de Compra
              </span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-color)' }}>{concepto}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                Total a pagar
              </span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>
                {formatCurrency(monto)}
              </strong>
            </div>
          </div>

          {/* Selector de pestañas de métodos */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
              marginBottom: '18px',
              background: 'var(--bg-surface)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {[
              { id: 'tarjeta', label: '💳 Tarjeta' },
              { id: 'pse', label: '🏦 PSE' },
              { id: 'nequi', label: '📱 Nequi' },
              { id: 'efectivo', label: '💵 Sede' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMetodo(tab.id)}
                style={{
                  padding: '8px 4px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: metodo === tab.id ? 'var(--primary)' : 'transparent',
                  color: metodo === tab.id ? '#fff' : 'var(--text-color)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handlePagar}>
            {/* SUB-FORMULARIO 1: TARJETA */}
            {metodo === 'tarjeta' && (
              <div>
                {/* Visual Card Mockup */}
                <div
                  style={{
                    background: `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`,
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    color: '#fff',
                    marginBottom: '18px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.75rem', letterSpacing: '1px', opacity: 0.7 }}>MECHAPP PAY</span>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ffb300' }}>
                      {franquicia.logo}
                    </span>
                  </div>

                  {/* Chip de la tarjeta */}
                  <div
                    style={{
                      width: '34px',
                      height: '26px',
                      background: 'linear-gradient(135deg, #d4af37, #f3e5ab)',
                      borderRadius: '5px',
                      marginBottom: '12px',
                    }}
                  />

                  <div
                    style={{
                      fontSize: '1.2rem',
                      letterSpacing: '3px',
                      fontFamily: 'monospace',
                      marginBottom: '14px',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    {tarjeta.numero || '•••• •••• •••• ••••'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.8rem' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase' }}>Titular</div>
                      <div style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {tarjeta.nombre || 'NOMBRE DEL TITULAR'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7, textTransform: 'uppercase' }}>Vence</div>
                      <div style={{ fontWeight: 600 }}>{tarjeta.expiracion || 'MM/AA'}</div>
                    </div>
                  </div>
                </div>

                {/* Inputs de la tarjeta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      value={tarjeta.numero}
                      onChange={handleNumeroTarjetaChange}
                      placeholder="4500 1234 5678 9012"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-color)',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>
                      Nombre en la Tarjeta
                    </label>
                    <input
                      type="text"
                      value={tarjeta.nombre}
                      onChange={(e) => setTarjeta({ ...tarjeta, nombre: e.target.value })}
                      placeholder="Como figura en el plástico"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-color)',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>
                        Vence
                      </label>
                      <input
                        type="text"
                        value={tarjeta.expiracion}
                        onChange={handleExpiracionChange}
                        placeholder="MM/AA"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-color)',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>
                        CVC / CVV
                      </label>
                      <input
                        type="password"
                        value={tarjeta.cvc}
                        onChange={handleCvcChange}
                        placeholder="123"
                        required
                        maxLength={4}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-color)',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>
                        Cuotas
                      </label>
                      <select
                        value={tarjeta.cuotas}
                        onChange={(e) => setTarjeta({ ...tarjeta, cuotas: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-color)',
                        }}
                      >
                        <option value="1">1 cuota</option>
                        <option value="3">3 cuotas</option>
                        <option value="6">6 cuotas</option>
                        <option value="12">12 cuotas</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-FORMULARIO 2: PSE */}
            {metodo === 'pse' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  🏦 Transfiere directamente desde tu cuenta bancaria a través del botón de pagos PSE.
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>
                    Selecciona tu Banco
                  </label>
                  <select
                    value={pse.banco}
                    onChange={(e) => setPse({ ...pse, banco: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-color)',
                    }}
                  >
                    <option value="bancolombia">Bancolombia</option>
                    <option value="nequi">Nequi</option>
                    <option value="daviplata">Daviplata</option>
                    <option value="davivienda">Davivienda</option>
                    <option value="bogota">Banco de Bogotá</option>
                    <option value="bbva">BBVA Colombia</option>
                    <option value="occidente">Banco de Occidente</option>
                    <option value="colpatria">Scotiabank Colpatria</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>
                      Tipo de Persona
                    </label>
                    <select
                      value={pse.tipoPersona}
                      onChange={(e) => setPse({ ...pse, tipoPersona: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-color)',
                      }}
                    >
                      <option value="natural">Persona Natural</option>
                      <option value="juridica">Persona Jurídica</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>
                      No. Documento
                    </label>
                    <input
                      type="text"
                      placeholder="C.C. / NIT"
                      value={pse.documento}
                      onChange={(e) => setPse({ ...pse, documento: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-color)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>
                    Correo electrónico registrado en PSE
                  </label>
                  <input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={pse.email}
                    onChange={(e) => setPse({ ...pse, email: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-color)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* SUB-FORMULARIO 3: NEQUI / DAVIPLATA */}
            {metodo === 'nequi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setBilletera({ ...billetera, tipo: 'nequi' })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: billetera.tipo === 'nequi' ? '2px solid #8b5cf6' : '1px solid var(--border-color)',
                      background: billetera.tipo === 'nequi' ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-surface)',
                      color: 'var(--text-color)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    💜 Nequi
                  </button>
                  <button
                    type="button"
                    onClick={() => setBilletera({ ...billetera, tipo: 'daviplata' })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: billetera.tipo === 'daviplata' ? '2px solid #ef4444' : '1px solid var(--border-color)',
                      background: billetera.tipo === 'daviplata' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-surface)',
                      color: 'var(--text-color)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ❤️ Daviplata
                  </button>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>
                    Número de Celular Asociado
                  </label>
                  <input
                    type="tel"
                    placeholder="300 123 4567"
                    value={billetera.celular}
                    onChange={(e) => setBilletera({ ...billetera, celular: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-color)',
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                  📲 Al presionar pagar, recibirás una notificación push simulada en tu celular para aprobar la transferencia con tu clave o huella digital.
                </div>
              </div>
            )}

            {/* SUB-FORMULARIO 4: EFECTIVO EN SEDE */}
            {metodo === 'efectivo' && (
              <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💵</div>
                <h4 style={{ margin: '0 0 6px' }}>Pago en Efectivo en Taquilla</h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Tu reserva quedará apartada con código pendiente. Podrás pagar el total en efectivo directamente en la entrada de la cancha antes de iniciar tu turno de juego.
                </p>
              </div>
            )}

            {/* Pie y botón de pago */}
            <div style={{ marginTop: '20px' }}>
              <Button
                type="submit"
                variant="primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                🔒 Pagar {formatCurrency(monto)}
              </Button>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '12px',
                  fontSize: '0.75rem',
                  color: 'var(--text-dim)',
                }}
              >
                <span>🛡️ Transacción 100% segura con cifrado SSL de 256 bits (Entorno de Simulación MechApp)</span>
              </div>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
