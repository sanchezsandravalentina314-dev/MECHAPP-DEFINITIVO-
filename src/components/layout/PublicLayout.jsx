import React from 'react';
import Navbar from './Navbar';

export default function PublicLayout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <footer className="public-footer">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.jpeg" alt="Logo MechApp" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              <strong>MechApp</strong> - La plataforma digital del tejo colombiano
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Turmequé (Boyacá) · Deporte Nacional de Colombia (Ley 613 del 2000)
            </div>
          </div>
          <div className="footer-bottom">
            © {new Date().getFullYear()} MechApp. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
