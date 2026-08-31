import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/features/auth/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('mechapp_token');
      const savedUser = localStorage.getItem('mechapp_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Error cargando sesión de localStorage', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (correo, contrasena) => {
    const data = await authService.login({ correo, contrasena });
    setToken(data.access_token);
    setUser(data.usuario);
    localStorage.setItem('mechapp_token', data.access_token);
    localStorage.setItem('mechapp_user', JSON.stringify(data.usuario));
    return data.usuario;
  };

  const registro = async (datosRegistro) => {
    const data = await authService.registro(datosRegistro);
    setToken(data.access_token);
    setUser(data.usuario);
    localStorage.setItem('mechapp_token', data.access_token);
    localStorage.setItem('mechapp_user', JSON.stringify(data.usuario));
    return data.usuario;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mechapp_token');
    localStorage.removeItem('mechapp_user');
  };

  // Helper para verificar rol (1: Admin, 2: Jugador, 3: Propietario)
  const userRoleId = user ? Number(user.id_rol) : null;
  const isAdmin = userRoleId === 1;
  const isJugador = userRoleId === 2;
  const isPropietario = userRoleId === 3;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isJugador,
        isPropietario,
        login,
        registro,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
