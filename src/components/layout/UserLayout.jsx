import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import api from '@/services/api';

export default function UserLayout({ children, title, subtitle }) {
  const { user } = useAuth();
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light');
  const [notificaciones, setNotificaciones] = useState([]);
  const [showNoti, setShowNoti] = useState(false);

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLight]);

  useEffect(() => {
    const fetchNoti = async () => {
      try {
        const res = await api.get('/notificaciones/');
        setNotificaciones(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchNoti();
  }, []);

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  const marcarComoLeida = async (id) => {
    try {
      await api.put('/notificaciones/' + id + '/marcar-leida');
      setNotificaciones(notificaciones.map(n => n.id_notificacion === id ? { ...n, leida: true } : n));
    } catch (e) {}
  };

  return (
    <div className="dashboard-layout">
      <Sidebar mode="user" />
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Portal de Jugadores / MechApp
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNoti(!showNoti)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', position: 'relative' }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNoti && (
                <div style={{ position: 'absolute', top: '100%', right: '0', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', width: '300px', maxHeight: '400px', overflowY: 'auto', zIndex: 1000, boxShadow: 'var(--shadow-lg)' }}>
                  <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>Notificaciones</div>
                  {notificaciones.length === 0 ? (
                    <div style={{ padding: '15px', textAlign: 'center', color: 'var(--text-muted)' }}>No tienes notificaciones</div>
                  ) : (
                    notificaciones.map(n => (
                      <div 
                        key={n.id_notificacion} 
                        onClick={() => marcarComoLeida(n.id_notificacion)}
                        style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', background: n.leida ? 'transparent' : 'var(--primary-light)' }}
                      >
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>{n.mensaje}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

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
              <span className="badge badge-success">Jugador</span>
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
