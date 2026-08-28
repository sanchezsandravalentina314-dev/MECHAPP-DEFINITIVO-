import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';

export default function Navbar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLight]);

  return (
    <header className="public-header">
      <div className="container public-header-inner">
        <Link to="/" className="brand-logo-wrapper">
          <img src="/logo.jpeg" alt="Logo MechApp" className="brand-logo-img" />
          <span className="brand-title">MechApp</span>
        </Link>

        <nav>
          <ul className="public-nav-list">
            <li>
              <a href="/#inicio" className="public-nav-link">Inicio</a>
            </li>
            <li>
              <a href="/#tejo" className="public-nav-link">El Tejo</a>
            </li>
            <li>
              <a href="/#servicios" className="public-nav-link">Servicios</a>
            </li>
          </ul>
        </nav>

        <div className="public-nav-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setIsLight(!isLight)}
          >
            {isLight ? 'Oscuro' : 'Claro'}
          </Button>

          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? '/admin/dashboard' : '/user/torneos'}>
                <Button variant="secondary" size="sm">
                  {isAdmin ? 'Panel Admin' : 'Mi Panel'}
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/registro">
                <Button variant="primary" size="sm">
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
