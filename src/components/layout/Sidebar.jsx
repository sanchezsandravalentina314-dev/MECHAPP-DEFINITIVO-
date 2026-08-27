import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getRoleName } from '@/utils/formatters';

export default function Sidebar({ mode = 'admin' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminMenu = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
    { to: '/admin/canchas', label: 'Canchas / Escenarios', icon: '📍' },
    { to: '/admin/torneos', label: 'Torneos', icon: '🏆' },
    { to: '/admin/equipos', label: 'Equipos', icon: '⚽' },
    { to: '/admin/partidos', label: 'Partidas y Resultados', icon: '🎯' },
    { to: '/admin/reservas', label: 'Reservas de Canchas', icon: '📅' },
    { to: '/admin/noticias', label: 'Noticias', icon: '📰' },
    { to: '/admin/eventos', label: 'Eventos', icon: '🎉' },
  ];

  const userMenu = [
    { to: '/user/torneos', label: 'Torneos Activos', icon: '🏆' },
    { to: '/user/canchas', label: 'Explorar Canchas', icon: '📍' },
    { to: '/user/mis-reservas', label: 'Mis Reservas', icon: '📅' },
    { to: '/user/equipos', label: 'Mis Equipos', icon: '⚽' },
    { to: '/user/eventos', label: 'Eventos y Actividades', icon: '🎉' },
    { to: '/user/noticias', label: 'Noticias y Novedades', icon: '📰' },
    { to: '/user/perfil', label: 'Mi Perfil', icon: '👤' },
  ];

  const items = mode === 'admin' ? adminMenu : userMenu;

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <img src="/logo.jpeg" alt="Logo MechApp" className="brand-logo-img" />
        <span className="brand-title">MechApp</span>
      </div>

      <div className="sidebar-user-pill">
        <div className="sidebar-user-avatar">
          {user?.nombre ? user.nombre[0].toUpperCase() : 'U'}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.nombre || 'Usuario'}</div>
          <div className="sidebar-user-role">{getRoleName(user?.id_rol)}</div>
        </div>
      </div>

      <nav className="sidebar-menu">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-logout-btn"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
