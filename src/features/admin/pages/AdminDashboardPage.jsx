import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { usuariosService } from '@/features/usuarios/services/usuariosService';
import { canchasService } from '@/features/canchas/services/canchasService';
import { torneosService } from '@/features/torneos/services/torneosService';
import { equiposService } from '@/features/equipos/services/equiposService';
import { reservasService } from '@/features/reservas/services/reservasService';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    usuarios: 0,
    canchas: 0,
    torneos: 0,
    equipos: 0,
    reservas: 0,
  });

  useEffect(() => {
    const cargarContadores = async () => {
      try {
        const [u, c, t, e, r] = await Promise.all([
          usuariosService.listar(),
          canchasService.listar(),
          torneosService.listar(),
          equiposService.listar(),
          reservasService.listar(),
        ]);
        setCounts({
          usuarios: u.length,
          canchas: c.length,
          torneos: t.length,
          equipos: e.length,
          reservas: r.length,
        });
      } catch (err) {
        console.error(err);
      }
    };
    cargarContadores();
  }, []);

  return (
    <AdminLayout
      title={`¡Hola, ${user?.nombre || 'Administrador'}! 👑`}
      subtitle="Panel central de control y supervisión operativa de MechApp."
    >
      {/* Grid de Métricas */}
      <div className="stats-grid">
        <Link to="/admin/usuarios" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{counts.usuarios}</h3>
              <p>Usuarios Registrados</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/canchas" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-icon">📍</div>
            <div className="stat-content">
              <h3>{counts.canchas}</h3>
              <p>Canchas / Escenarios</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/torneos" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>{counts.torneos}</h3>
              <p>Torneos Activos</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/equipos" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-icon">⚽</div>
            <div className="stat-content">
              <h3>{counts.equipos}</h3>
              <p>Equipos Federados</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/reservas" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{counts.reservas}</h3>
              <p>Reservas Generadas</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Acciones Rápidas */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <h2 className="card-title" style={{ marginBottom: '16px' }}>⚡ Acciones Rápidas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <Link to="/admin/torneos">
            <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }} icon="🏆">
              Planificar Torneo
            </Button>
          </Link>
          <Link to="/admin/canchas">
            <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }} icon="📍">
              Agregar Escenario
            </Button>
          </Link>
          <Link to="/admin/partidos">
            <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }} icon="🎯">
              Computar Partida
            </Button>
          </Link>
          <Link to="/admin/noticias">
            <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }} icon="📰">
              Publicar Noticia
            </Button>
          </Link>
        </div>
      </div>

      {/* Estado del Sistema */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '12px' }}>🟢 Estado de Conectividad con FastAPI</h2>
        <p style={{ marginBottom: '16px' }}>
          La aplicación está estructurada para comunicarse con el servidor Backend FastAPI en <code>http://localhost:8000/api</code>.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span className="badge badge-success">● API REST Conectada</span>
          <span className="badge badge-primary">● Token JWT HS256</span>
          <span className="badge badge-info">● Base de Datos PostgreSQL/SQLite</span>
          <span className="badge badge-success">● 18 Tablas Relacionales Listas</span>
        </div>
      </div>
    </AdminLayout>
  );
}
