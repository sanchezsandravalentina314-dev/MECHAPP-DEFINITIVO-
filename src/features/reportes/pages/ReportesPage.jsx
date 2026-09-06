import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import UserLayout from '@/components/layout/UserLayout';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Loader from '@/components/common/Loader';
import ComprobanteDigitalModal from '@/components/common/ComprobanteDigitalModal';
import { pagosService } from '@/features/pagos/services/pagosService';
import { reservasService } from '@/features/reservas/services/reservasService';
import { canchasService } from '@/features/canchas/services/canchasService';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatCurrency } from '@/utils/formatters';

export default function ReportesPage() {
  const { user } = useAuth();
  const isAdmin = Number(user?.id_rol) === 1;

  const [loading, setLoading] = useState(true);
  const [pagos, setPagos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [canchas, setCanchas] = useState([]);

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos'); // 'todos' | 'hoy' | 'semana' | 'mes'

  // Modal Comprobante
  const [comprobanteActivo, setComprobanteActivo] = useState(null);
  const [isComprobanteOpen, setIsComprobanteOpen] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [pagosData, reservasData, canchasData] = await Promise.all([
        pagosService.listar(),
        reservasService.listar(),
        canchasService.listar(),
      ]);

      setPagos(pagosData || []);
      setReservas(reservasData || []);
      setCanchas(canchasData || []);
    } catch (err) {
      console.error('Error cargando datos para reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [user]);

  // Consolidar datos de reporte unificando Pagos y Reservas
  const reportesData = useMemo(() => {
    // Si no es admin, solo mostrar datos del usuario actual
    const misReservas = isAdmin
      ? reservas
      : reservas.filter((r) => r.id_usuario === user?.id_usuario || r.id_usuario === 2);

    return misReservas.map((r) => {
      const pagoAsociado = pagos.find((p) => p.id_reserva === r.id_reserva);
      const cancha = canchas.find((c) => c.id_cancha === r.id_cancha);

      // Determinar método de pago
      let metodoNombre = 'Efectivo en Sede';
      const mId = pagoAsociado?.id_metodo_pago;
      if (mId === 3) metodoNombre = 'Tarjeta de Crédito/Débito';
      else if (mId === 4) metodoNombre = 'PSE (Transferencia)';
      else if (mId === 2) metodoNombre = 'Nequi / Daviplata';

      return {
        id: r.id_reserva,
        referencia: pagoAsociado?.referencia || `TXN-${String(r.id_reserva).padStart(6, '0')}`,
        fecha: r.fecha_reserva || r.fecha,
        fechaReserva: r.fecha,
        horario: `${r.hora_inicio?.slice(0, 5)} a ${r.hora_fin?.slice(0, 5)}`,
        cancha: cancha?.nombre || `Cancha #${r.id_cancha}`,
        ciudad: cancha?.ciudad || 'Sede Principal',
        valor: Number(pagoAsociado?.valor || r.valor || 0),
        estado: r.estado || 'Pendiente',
        metodo: metodoNombre,
        cliente: isAdmin ? `Usuario #${r.id_usuario}` : (user?.nombre || 'Mi Usuario'),
        pagoCompleto: pagoAsociado,
      };
    });
  }, [reservas, pagos, canchas, user, isAdmin]);

  // Aplicar filtros
  const reportesFiltrados = useMemo(() => {
    return reportesData.filter((item) => {
      // Filtro texto
      if (filtroTexto) {
        const query = filtroTexto.toLowerCase();
        const coincide =
          item.referencia.toLowerCase().includes(query) ||
          item.cancha.toLowerCase().includes(query) ||
          item.metodo.toLowerCase().includes(query) ||
          item.cliente.toLowerCase().includes(query);
        if (!coincide) return false;
      }

      // Filtro estado
      if (filtroEstado !== 'todos' && item.estado.toLowerCase() !== filtroEstado.toLowerCase()) {
        return false;
      }

      // Filtro método
      if (filtroMetodo !== 'todos' && !item.metodo.toLowerCase().includes(filtroMetodo.toLowerCase())) {
        return false;
      }

      // Filtro período
      if (filtroPeriodo !== 'todos') {
        const itemFecha = new Date(item.fecha);
        const hoy = new Date();
        if (filtroPeriodo === 'hoy') {
          if (itemFecha.toDateString() !== hoy.toDateString()) return false;
        } else if (filtroPeriodo === 'semana') {
          const hace7Dias = new Date();
          hace7Dias.setDate(hoy.getDate() - 7);
          if (itemFecha < hace7Dias) return false;
        } else if (filtroPeriodo === 'mes') {
          if (itemFecha.getMonth() !== hoy.getMonth() || itemFecha.getFullYear() !== hoy.getFullYear()) return false;
        }
      }

      return true;
    });
  }, [reportesData, filtroTexto, filtroEstado, filtroMetodo, filtroPeriodo]);

  // Estadísticas y Métricas
  const totalMonto = useMemo(() => {
    return reportesFiltrados.reduce((acc, it) => acc + it.valor, 0);
  }, [reportesFiltrados]);

  const totalConfirmadas = useMemo(() => {
    return reportesFiltrados.filter((it) => it.estado === 'Confirmada').length;
  }, [reportesFiltrados]);

  const tasaConfirmacion = reportesFiltrados.length > 0
    ? Math.round((totalConfirmadas / reportesFiltrados.length) * 100)
    : 100;

  // Exportar a CSV
  const handleExportarCSV = () => {
    const encabezados = ['ID Reserva', 'Referencia', 'Fecha Turno', 'Horario', 'Cancha', 'Cliente', 'Método', 'Valor (COP)', 'Estado'];
    const filas = reportesFiltrados.map((it) => [
      it.id,
      it.referencia,
      it.fechaReserva,
      it.horario,
      `"${it.cancha}"`,
      `"${it.cliente}"`,
      `"${it.metodo}"`,
      it.valor,
      it.estado,
    ]);

    const contenidoCSV = [encabezados.join(','), ...filas.map((f) => f.join(','))].join('\n');
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_pagos_mechapp_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVerComprobante = (item) => {
    setComprobanteActivo({
      referencia: item.referencia,
      valor: item.valor,
      fecha: item.fecha,
      fechaReserva: item.fechaReserva,
      horario: item.horario,
      cancha: item.cancha,
      cliente: item.cliente,
      concepto: `Reserva Cancha #${item.id} - ${item.cancha}`,
      metodoNombre: item.metodo,
    });
    setIsComprobanteOpen(true);
  };

  const LayoutComponent = isAdmin ? AdminLayout : UserLayout;

  return (
    <LayoutComponent
      title={isAdmin ? "Panel de Reportes y Facturación" : "Mis Reportes y Comprobantes"}
      subtitle={isAdmin ? "Supervisa los ingresos por reservas, métodos de pago y comprobantes del sistema." : "Consulta y descarga el historial de tus pagos y comprobantes digitales."}
    >
      {/* Estilos para impresión */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .dashboard-sidebar, .admin-navbar, .user-navbar { display: none !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>

      {/* TARJETAS DE MÉTRICAS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isAdmin ? 'Total Recaudado' : 'Total Invertido'}
          </span>
          <h2 style={{ color: 'var(--primary)', margin: '6px 0 0', fontSize: '1.8rem' }}>
            {formatCurrency(totalMonto)}
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
            En {reportesFiltrados.length} operaciones
          </span>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #22c55e' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reservas Confirmadas</span>
          <h2 style={{ color: '#22c55e', margin: '6px 0 0', fontSize: '1.8rem' }}>
            {totalConfirmadas}
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
            Tasa de efectividad: {tasaConfirmacion}%
          </span>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Registros</span>
          <h2 style={{ color: '#3b82f6', margin: '6px 0 0', fontSize: '1.8rem' }}>
            {reportesFiltrados.length}
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
            Transacciones filtradas
          </span>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #eab308' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Seguridad Pasarela</span>
          <h2 style={{ color: '#eab308', margin: '6px 0 0', fontSize: '1.6rem' }}>
            SSL 256-bit
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
            Auditoría digital activa
          </span>
        </div>
      </div>

      {/* BARRA DE FILTROS Y ACCIONES */}
      <div
        className="card no-print"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          <input
            type="text"
            placeholder="🔍 Buscar por ref, cancha, cliente o método..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-color)',
              minWidth: '220px',
            }}
          />

          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-color)',
            }}
          >
            <option value="todos">Todo el período</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Últimos 7 días</option>
            <option value="mes">Este mes</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-color)',
            }}
          >
            <option value="todos">Todos los Estados</option>
            <option value="confirmada">Confirmadas</option>
            <option value="pendiente">Pendientes</option>
          </select>

          <select
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-color)',
            }}
          >
            <option value="todos">Todos los Métodos</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="pse">PSE</option>
            <option value="nequi">Nequi / Daviplata</option>
            <option value="efectivo">Efectivo</option>
          </select>
        </div>

        {/* Botones de Exportar */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="secondary"
            onClick={handleExportarCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📥 Exportar CSV
          </Button>
          <Button
            variant="primary"
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🖨️ Imprimir Reporte
          </Button>
        </div>
      </div>

      {/* TABLA DE REPORTES */}
      {loading ? (
        <Loader message="Consolidando datos de pagos y reportes..." />
      ) : reportesFiltrados.length === 0 ? (
        <div className="card empty-state" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊</div>
          <h3>No se encontraron registros con los filtros seleccionados</h3>
          <p style={{ color: 'var(--text-muted)' }}>Prueba cambiando el período o criterio de búsqueda.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '14px 16px' }}>Referencia</th>
                <th style={{ padding: '14px 16px' }}>Fecha Turno</th>
                <th style={{ padding: '14px 16px' }}>Cancha / Escenario</th>
                {isAdmin && <th style={{ padding: '14px 16px' }}>Cliente</th>}
                <th style={{ padding: '14px 16px' }}>Método de Pago</th>
                <th style={{ padding: '14px 16px' }}>Valor</th>
                <th style={{ padding: '14px 16px' }}>Estado</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }} className="no-print">Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {reportesFiltrados.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <code style={{ background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px' }}>
                      {item.referencia}
                    </code>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div>{formatDate(item.fechaReserva)}</div>
                    <small style={{ color: 'var(--text-muted)' }}>{item.horario}</small>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <strong>{item.cancha}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{item.ciudad}</div>
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '14px 16px' }}>{item.cliente}</td>
                  )}
                  <td style={{ padding: '14px 16px' }}>{item.metodo}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary)' }}>
                    {formatCurrency(item.valor)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={item.estado === 'Confirmada' ? 'success' : 'warning'}>
                      {item.estado}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }} className="no-print">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleVerComprobante(item)}
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    >
                      🧾 Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Comprobante Digital */}
      <ComprobanteDigitalModal
        isOpen={isComprobanteOpen}
        onClose={() => setIsComprobanteOpen(false)}
        pago={comprobanteActivo}
      />
    </LayoutComponent>
  );
}
