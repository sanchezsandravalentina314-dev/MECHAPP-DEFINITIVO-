import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { reservasService } from '../services/reservasService';
import { canchasService } from '@/features/canchas/services/canchasService';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatTime, formatCurrency } from '@/utils/formatters';

export default function ReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { showSuccess, showError } = useApp();

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [reservasData, canchasData, usuariosData] = await Promise.all([
        reservasService.listar(),
        canchasService.listar(),
        usuariosService.listar(),
      ]);
      setReservas(reservasData);
      setCanchas(canchasData);
      setUsuarios(usuariosData);
    } catch {
      showError('Error al cargar reservas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCambiarEstado = async (reserva, nuevoEstado) => {
    try {
      await reservasService.actualizar(reserva.id_reserva, { estado: nuevoEstado });
      showSuccess(`Reserva #${reserva.id_reserva} marcada como ${nuevoEstado}.`);
      cargarDatos();
    } catch {
      showError('No se pudo actualizar la reserva.');
    }
  };

  const columns = [
    { header: 'ID', key: 'id_reserva', align: 'center' },
    {
      header: 'Cliente / Jugador',
      render: (r) => {
        const u = usuarios.find((user) => user.id_usuario === r.id_usuario);
        return (
          <div>
            <strong>{u ? u.nombre : `Usuario #${r.id_usuario}`}</strong>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{u?.correo}</div>
          </div>
        );
      },
    },
    {
      header: 'Cancha',
      render: (r) => {
        const c = canchas.find((can) => can.id_cancha === r.id_cancha);
        return c ? c.nombre : `Cancha #${r.id_cancha}`;
      },
    },
    {
      header: 'Fecha y Horario',
      render: (r) => `${formatDate(r.fecha)} (${formatTime(r.hora_inicio)} - ${formatTime(r.hora_fin)})`,
    },
    {
      header: 'Valor Total',
      key: 'valor',
      render: (r) => <strong>{formatCurrency(r.valor)}</strong>,
    },
    {
      header: 'Estado',
      key: 'estado',
      render: (r) => (
        <Badge
          variant={
            r.estado === 'Confirmada'
              ? 'success'
              : r.estado === 'Pendiente Pago'
              ? 'warning'
              : 'danger'
          }
        >
          {r.estado}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      render: (r) => (
        <div className="actions-cell">
          {r.estado !== 'Confirmada' && (
            <Button variant="primary" size="sm" onClick={() => handleCambiarEstado(r, 'Confirmada')}>
              ✓ Confirmar
            </Button>
          )}
          {r.estado !== 'Cancelada' && (
            <Button variant="danger" size="sm" onClick={() => handleCambiarEstado(r, 'Cancelada')}>
              ✕ Cancelar
            </Button>
          )}
        </div>
      ),
    },
  ];

  const esPropietario = user ? Number(user.id_rol) === 3 : false;
  const misCanchasIds = canchas.filter((c) => c.id_usuario === user?.id_usuario).map((c) => c.id_cancha);
  const reservasVisibles = esPropietario
    ? reservas.filter((r) => misCanchasIds.includes(r.id_cancha))
    : reservas;

  return (
    <AdminLayout
      title={esPropietario ? "Reservas Recibidas en Mis Canchas" : "Gestión Global de Reservas"}
      subtitle={
        esPropietario
          ? "Monitorea y gestiona las reservas que los jugadores han realizado en tus pistas de tejo."
          : "Monitorea las solicitudes de alquiler de canchas, pagos recibidos y estados de confirmación."
      }
    >
      <Table
        columns={columns}
        data={reservasVisibles}
        loading={loading}
        searchPlaceholder="Buscar por cliente, cancha o estado..."
      />
    </AdminLayout>
  );
}
