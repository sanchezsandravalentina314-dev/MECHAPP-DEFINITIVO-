import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/common/Loader';

/**
 * Protege rutas según el rol del usuario (ej. id_rol = 1 para Administrador).
 */
export default function RoleRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Verificando permisos..." />;
  }

  const userRoleId = user ? Number(user.id_rol) : null;
  const rolesMapped = allowedRoles.map(Number);

  if (!user || (rolesMapped.length > 0 && !rolesMapped.includes(userRoleId))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
