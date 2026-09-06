import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';

// Admin Pages
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage';
import UsuariosPage from '@/features/usuarios/pages/UsuariosPage';
import CanchasAdminPage from '@/features/canchas/pages/CanchasAdminPage';
import TorneosAdminPage from '@/features/torneos/pages/TorneosAdminPage';
import EquiposAdminPage from '@/features/equipos/pages/EquiposAdminPage';
import PartidosAdminPage from '@/features/partidos/pages/PartidosAdminPage';
import ReservasPage from '@/features/reservas/pages/ReservasPage';
import NoticiasAdminPage from '@/features/noticias/pages/NoticiasAdminPage';
import EventosAdminPage from '@/features/eventos/pages/EventosAdminPage';

// User / Player Pages
import TorneosUserPage from '@/features/torneos/pages/TorneosUserPage';
import CanchasUserPage from '@/features/canchas/pages/CanchasUserPage';
import UbicacionesUserPage from '@/features/ubicaciones/pages/UbicacionesUserPage';
import MisReservasPage from '@/features/reservas/pages/MisReservasPage';
import EquiposUserPage from '@/features/equipos/pages/EquiposUserPage';
import EventosUserPage from '@/features/eventos/pages/EventosUserPage';
import NoticiasUserPage from '@/features/noticias/pages/NoticiasUserPage';
import PerfilPage from '@/features/usuarios/pages/PerfilPage';

// Módulo Combos y Consumo
import ConsumoPropietarioPage from '@/features/consumo/pages/ConsumoPropietarioPage';
import ClienteConsumoPage from '@/features/consumo/pages/ClienteConsumoPage';

// Guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      {/* Rutas de Gestión de Canchas y Reservas (Admin y Propietarios - Roles 1 y 3) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[1, 3]} />}>
          <Route path="/admin/canchas" element={<CanchasAdminPage />} />
          <Route path="/admin/reservas" element={<ReservasPage />} />
          <Route path="/admin/torneos" element={<TorneosAdminPage />} />
        </Route>
      </Route>

      {/* Rutas Exclusivas de Administrador General (Rol 1) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[1]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/usuarios" element={<UsuariosPage />} />
          <Route path="/admin/equipos" element={<EquiposAdminPage />} />
          <Route path="/admin/partidos" element={<PartidosAdminPage />} />
          <Route path="/admin/noticias" element={<NoticiasAdminPage />} />
          <Route path="/admin/eventos" element={<EventosAdminPage />} />
          <Route path="/admin/consumo" element={<ConsumoPropietarioPage esAdmin={true} />} />
        </Route>
      </Route>

      {/* Rutas de Propietario (Rol 1 y 3) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[1, 3]} />}>
          <Route path="/propietario/consumo" element={<ConsumoPropietarioPage esAdmin={false} />} />
        </Route>
      </Route>

      {/* Rutas Protegidas del Portal de Jugadores / Usuarios (Roles 1, 2, 3) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[1, 2, 3]} />}>
          <Route path="/user/torneos" element={<TorneosUserPage />} />
          <Route path="/user/canchas" element={<CanchasUserPage />} />
          <Route path="/user/ubicaciones" element={<UbicacionesUserPage />} />
          <Route path="/user/mis-reservas" element={<MisReservasPage />} />
          <Route path="/user/equipos" element={<EquiposUserPage />} />
          <Route path="/user/eventos" element={<EventosUserPage />} />
          <Route path="/user/noticias" element={<NoticiasUserPage />} />
          <Route path="/user/perfil" element={<PerfilPage />} />

          {/* Flujo de Consumo y Carrito */}
          <Route path="/consumo" element={<ClienteConsumoPage />} />
          <Route path="/reservas/:idReserva/consumo" element={<ClienteConsumoPage />} />
        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
