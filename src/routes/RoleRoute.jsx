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

  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.id_rol))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
