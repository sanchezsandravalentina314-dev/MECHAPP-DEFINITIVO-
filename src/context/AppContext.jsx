import React, { createContext, useContext, useState, useCallback } from 'react';
import MechaExplosion from '@/components/common/MechaExplosion';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [mechaState, setMechaState] = useState(null);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const showError = useCallback((msg) => addToast(msg, 'error', 5000), [addToast]);
  const showWarning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);
  const showInfo = useCallback((msg) => addToast(msg, 'info'), [addToast]);
  const showNotification = useCallback((msg, type = 'info') => addToast(msg, type), [addToast]);

  const triggerMechaExplosion = useCallback(({
    title = '¡¡MECHAAAAA!!',
    subtitle = '¡Punto anotado y confirmado!',
    badgeText = '¡JUGADA PERFECTA!',
    duration = 2600
  } = {}) => {
    setMechaState({ title, subtitle, badgeText, duration });
  }, []);

  const closeMechaExplosion = useCallback(() => {
    setMechaState(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showNotification,
        triggerMechaExplosion,
      }}
    >
      {children}

      {/* Animación festiva de Mecha de Tejo */}
      {mechaState && (
        <MechaExplosion
          title={mechaState.title}
          subtitle={mechaState.subtitle}
          badgeText={mechaState.badgeText}
          duration={mechaState.duration}
          onClose={closeMechaExplosion}
        />
      )}

      {/* Contenedor flotante de notificaciones Toast */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`toast toast-${toast.type}`}
              onClick={() => removeToast(toast.id)}
            >
              <span>
                {toast.type === 'success' && ''}
                {toast.type === 'error' && ''}
                {toast.type === 'warning' && ''}
                {toast.type === 'info' && ''}
              </span>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {toast.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
}
