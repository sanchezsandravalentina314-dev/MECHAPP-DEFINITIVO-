import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminLayout({ children, title, subtitle }) {
  const { user } = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar mode="admin" />
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Panel de Administración / MechApp
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              🌐 Ver Sitio Web
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.nombre}</span>
              <span className="badge badge-primary">Admin</span>
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
