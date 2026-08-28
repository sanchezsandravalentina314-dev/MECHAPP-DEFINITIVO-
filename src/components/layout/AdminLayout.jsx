import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminLayout({ children, title, subtitle }) {
  const { user } = useAuth();
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light');

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
    <div className="dashboard-layout">
      <Sidebar mode="admin" />
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Panel de Control / Admin
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setIsLight(!isLight)}
              style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              {isLight ? 'Oscuro' : 'Claro'}
            </button>
            <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
              Ver Sitio Web
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.nombre}</span>
              <span className="badge badge-warning">Admin</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content-area">
          {title && (
            <div className="page-header">
              <div className="page-title-group">
                <h1>{title}</h1>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
