import React, { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Loader from '@/components/common/Loader';
import { canchasService } from '../services/canchasService';
import { ubicacionesService } from '@/features/ubicaciones/services/ubicacionesService';
import { reservasService } from '@/features/reservas/services/reservasService';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';

export default function CanchasUserPage() {
  const [canchas, setCanchas] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCancha, setSelectedCancha] = useState(null);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  
  // Forms state
  const [reservaPendiente, setReservaPendiente] = useState(null);
  const [ocupados, setOcupados] = useState([]);
  const [buscandoDisponibilidad, setBuscandoDisponibilidad] = useState(false);
  const [estrellasCanchas, setEstrellasCanchas] = useState({});

  const { user } = useAuth();
  const { showSuccess, showError } = useApp();

  const [reservaForm, setReservaForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '18:00',
    hora_fin: '20:00',
  });

  const [tarjetaForm, setTarjetaForm] = useState({
    numero: '',
    nombre: '',
    vencimiento: '',
    cvc: ''
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

      const estrellas = {};
      for (const c of canchasData) {
        try {
          const valoracion = await canchasService.obtenerValoraciones(c.id_cancha);
          estrellas[c.id_cancha] = valoracion;
        } catch(e) {}
      }
      setEstrellasCanchas(estrellas);
      
    } catch {
      showError('Error cargando canchas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (selectedCancha && reservaForm.fecha) {
      const fetchDisponibilidad = async () => {
        try {
          setBuscandoDisponibilidad(true);
          const data = await canchasService.consultarDisponibilidad(selectedCancha.id_cancha, reservaForm.fecha);
          setOcupados(data.horarios_ocupados || []);
        } catch (error) {
          console.error(error);
          setOcupados([]);
        } finally {
          setBuscandoDisponibilidad(false);
        }
      };
      fetchDisponibilidad();
    }
  }, [selectedCancha, reservaForm.fecha]);

  const handleOpenReservar = (cancha) => {
    setSelectedCancha(cancha);
    setReservaForm({
      fecha: new Date().toISOString().split('T')[0],
      hora_inicio: '18:00',
      hora_fin: '20:00',
    });
    setOcupados([]);
    setIsModalOpen(true);
  };

  const handleCrearReservaPendiente = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id_usuario: user?.id_usuario || 2,
        id_cancha: selectedCancha.id_cancha,
        fecha: reservaForm.fecha,
        hora_inicio: reservaForm.hora_inicio + ':00',
        hora_fin: reservaForm.hora_fin + ':00',
        valor: (selectedCancha.precio_hora || 35000) * 2, // asumiendo 2h default
        estado: 'Pendiente Pago', // ESTADO INICIAL
      };

      const nuevaReserva = await reservasService.crear(payload);
      setReservaPendiente(nuevaReserva);
      setIsModalOpen(false);
      
      // Abrir la pasarela de pagos simulada
      showSuccess('Reserva pre-aprobada. Redirigiendo a pagos...');
      setIsPaymentOpen(true);
      
    } catch (err) {
      showError(err.message || 'No se pudo generar la reserva. Verifica disponibilidad.');
    }
  };

  const handleProcesarPago = async (e) => {
    e.preventDefault();
    try {
      // Simulamos la creación del pago en el backend
      // El backend (pagos_service.py) automáticamente cambiará la reserva a 'Confirmada'
      const payloadPago = {
        id_reserva: reservaPendiente.id_reserva,
        id_inscripcion: null,
        monto: reservaPendiente.valor,
        metodo_pago: 'Tarjeta de Crédito/Débito',
        estado: 'Aprobado',
        referencia_transaccion: 'TXN-' + Math.floor(Math.random() * 1000000)
      };

      await api.post('/pagos/', payloadPago);
      
      showSuccess(`Pago exitoso. Reserva en ${selectedCancha.nombre} confirmada.`);
      setIsPaymentOpen(false);
      setReservaPendiente(null);
      setTarjetaForm({ numero: '', nombre: '', vencimiento: '', cvc: '' });
      cargarDatos();
    } catch (error) {
      showError('Error al procesar el pago con la pasarela.');
    }
  };

  return (
    <UserLayout
      title="Canchas y Escenarios de Tejo"
      subtitle="Explora las pistas disponibles, consulta disponibilidad y reseñas."
    >
      {loading ? (
        <Loader message="Buscando canchas aliadas..." />
      ) : (
        <div className="services-grid">
          {canchas.map((cancha) => {
            const ubicacion = ubicaciones.find((u) => u.id_ubicacion === cancha.id_ubicacion);
            const rating = estrellasCanchas[cancha.id_cancha];
            
            return (
              <article key={cancha.id_cancha} className="service-card">
                <img
                  src="https://s3.amazonaws.com/rtvc-assets-senalmemoria.gov.co/s3fs-public/field_image/tejo.jpg"
                  alt={cancha.nombre}
                  className="service-card-img"
                />
                <div className="service-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <Badge variant={cancha.estado ? 'success' : 'danger'}>
                      {cancha.estado ? 'Disponible' : 'Ocupado'}
                    </Badge>
                    <span style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 'bold' }}>
                      ⭐ {rating?.promedio > 0 ? rating.promedio : 'Nuevo'} <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>({rating?.total || 0})</span>
                    </span>
                  </div>

                  <h3>{cancha.nombre}</h3>
                  <p style={{ fontSize: '0.88rem', minHeight: '44px' }}>
                    {cancha.descripcion}
                  </p>

                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      margin: '16px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <small style={{ color: 'var(--text-dim)', display: 'block' }}>Tarifa</small>
                      <strong>{formatCurrency(cancha.precio_hora)} / hr</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <small style={{ color: 'var(--text-dim)', display: 'block' }}>Capacidad</small>
                      <strong>{cancha.capacidad} jugadores</strong>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Dirección: {ubicacion?.direccion || 'Sede principal'} ({ubicacion?.barrio || 'Centro'})
                  </p>

                  <Button
                    variant="primary"
                    style={{ width: '100%' }}
                    onClick={() => handleOpenReservar(cancha)}
                    disabled={!cancha.estado}
                  >
                    Reservar Cancha
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal 1: Crear Reserva */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Reservar en ${selectedCancha?.nombre}`}
      >
        <form onSubmit={handleCrearReservaPendiente}>
          <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Tarifa por hora: <strong>{formatCurrency(selectedCancha?.precio_hora)}</strong>
            </p>
          </div>

          <Input
            label="Fecha de la Reserva"
            type="date"
            value={reservaForm.fecha}
            onChange={(e) => setReservaForm({ ...reservaForm, fecha: e.target.value })}
            required
          />

          {buscandoDisponibilidad ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Buscando disponibilidad...</p>
          ) : ocupados.length > 0 ? (
            <div style={{ marginBottom: '16px', padding: '10px', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger)', borderRadius: '4px' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>Horarios ocupados este día:</p>
              <ul style={{ margin: '5px 0 0 20px', fontSize: '0.85rem', color: 'var(--color-danger)' }}>
                {ocupados.map((oc, i) => (
                  <li key={i}>{oc.hora_inicio} a {oc.hora_fin}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-success)', marginBottom: '16px' }}>Disponibilidad completa.</p>
          )}

          <div className="form-grid-2">
            <Input
              label="Hora de Inicio"
              type="time"
              value={reservaForm.hora_inicio}
              onChange={(e) => setReservaForm({ ...reservaForm, hora_inicio: e.target.value })}
              required
            />
            <Input
              label="Hora de Fin"
              type="time"
              value={reservaForm.hora_fin}
              onChange={(e) => setReservaForm({ ...reservaForm, hora_fin: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">Continuar al Pago</Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Pasarela de Pagos Simulada */}
      <Modal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          showError('Has cancelado el proceso de pago. La reserva quedó Pendiente.');
        }}
        title="Pago Seguro"
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 5px 0' }}>Total a pagar</h4>
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>{formatCurrency(reservaPendiente?.valor || 0)}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cancha: {selectedCancha?.nombre}</p>
        </div>

        <form onSubmit={handleProcesarPago} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#475569' }}>Número de Tarjeta</label>
            <input 
              type="text" 
              placeholder="0000 0000 0000 0000" 
              value={tarjetaForm.numero}
              onChange={e => setTarjetaForm({...tarjetaForm, numero: e.target.value})}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#475569' }}>Nombre en la Tarjeta</label>
            <input 
              type="text" 
              placeholder="Ej. Juan Pérez" 
              value={tarjetaForm.nombre}
              onChange={e => setTarjetaForm({...tarjetaForm, nombre: e.target.value})}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#475569' }}>Vencimiento (MM/AA)</label>
              <input 
                type="text" 
                placeholder="12/25" 
                value={tarjetaForm.vencimiento}
                onChange={e => setTarjetaForm({...tarjetaForm, vencimiento: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#475569' }}>CVC</label>
              <input 
                type="text" 
                placeholder="123" 
                value={tarjetaForm.cvc}
                onChange={e => setTarjetaForm({...tarjetaForm, cvc: e.target.value})}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <Button type="submit" variant="primary" style={{ width: '100%', padding: '12px' }}>
            Pagar {formatCurrency(reservaPendiente?.valor || 0)}
          </Button>
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
            Transacción procesada de forma segura (Simulada).
          </div>
        </form>
      </Modal>
    </UserLayout>
  );
}
