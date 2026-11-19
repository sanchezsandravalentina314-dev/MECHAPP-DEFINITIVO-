import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getRoleName } from '@/utils/formatters';

export default function Sidebar({ mode = 'admin' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminMenu = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/reportes', label: 'Reportes y Pagos' },
    { to: '/admin/usuarios', label: 'Usuarios' },
    { to: '/admin/canchas', label: 'Canchas / Escenarios' },
    { to: '/admin/consumo', label: 'Combos y Consumo' },
    { to: '/admin/torneos', label: 'Torneos' },
    { to: '/admin/equipos', label: 'Equipos' },
    { to: '/admin/partidos', label: 'Partidas y Resultados' },
    { to: '/admin/reservas', label: 'Reservas de Canchas' },
    { to: '/admin/noticias', label: 'Noticias' },
    { to: '/admin/eventos', label: 'Eventos' },
  ];

  const userMenu = [
    { to: '/user/canchas', label: 'Explorar Canchas' },
    { to: '/user/ubicaciones', label: 'Sedes y Clubes' },
    { to: '/user/torneos', label: 'Torneos Activos' },
    { to: '/user/mis-reservas', label: 'Mis Reservas' },
    { to: '/user/reportes', label: 'Comprobantes y Pagos' },
    // Si es propietario (Rol 3) tiene acceso a administrar sus combos y consumo
    user?.id_rol === 3
      ? { to: '/propietario/consumo', label: 'Combos y Consumo' }
      : { to: '/consumo', label: 'Combos y Bebidas' },
    { to: '/user/consumo-cancha', label: 'Consumo Cancha' },
    { to: '/user/equipos', label: 'Mis Equipos' },
    { to: '/user/noticias', label: 'Noticias y Novedades' },
    { to: '/user/perfil', label: 'Mi Perfil' },
  ];

  const propietarioMenu = [
    { to: '/admin/canchas', label: 'Mis Canchas' },
    { to: '/admin/reportes', label: 'Reportes y Ventas' },
    { to: '/propietario/consumo', label: 'Combos y Consumo' },
    { to: '/admin/reservas', label: 'Reservas Recibidas' },
    { to: '/admin/torneos', label: 'Mis Torneos' },
    { to: '/user/noticias', label: 'Noticias' },
    { to: '/user/perfil', label: 'Mi Perfil' },
  ];

  let items = userMenu;
  const userRoleId = user ? Number(user.id_rol) : null;
  if (userRoleId === 1) {
    items = adminMenu;
  } else if (userRoleId === 3) {
    items = propietarioMenu;
  }

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
          <span>Cerrar Sesion</span>
        </button>
      </div>
    </aside>
  );
}
