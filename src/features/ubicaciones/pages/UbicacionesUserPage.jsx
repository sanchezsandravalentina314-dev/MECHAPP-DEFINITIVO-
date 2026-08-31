import React, { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Loader from '@/components/common/Loader';
import { ubicacionesService } from '../services/ubicacionesService';
import { canchasService } from '@/features/canchas/services/canchasService';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function UbicacionesUserPage() {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCiudad, setFiltroCiudad] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const { showError, showSuccess } = useApp();
  const navigate = useNavigate();

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ubicacionesData, canchasData] = await Promise.all([
        ubicacionesService.listar(),
        canchasService.listar(),
      ]);
      setUbicaciones(ubicacionesData || []);
      setCanchas(canchasData || []);
    } catch {
      showError('Error al cargar las ubicaciones y clubes de tejo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleObtenerMiUbicacion = () => {
    if (!navigator.geolocation) {
      showError('Tu navegador no soporta geolocalización.');
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingLocation(false);
        showSuccess('¡Ubicación detectada! Mostrando sedes cercanas.');
      },
      (error) => {
        setLoadingLocation(false);
        showError('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
      }
    );
  };

  const ciudadesDisponibles = Array.from(
    new Set(ubicaciones.map((u) => u.ciudad).filter(Boolean))
  );

  const ubicacionesFiltradas = ubicaciones.filter((u) => {
    const cumpleCiudad = filtroCiudad === 'todas' || u.ciudad === filtroCiudad;
    const cumpleBusqueda =
      !busqueda.trim() ||
      (u.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (u.barrio || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (u.direccion || '').toLowerCase().includes(busqueda.toLowerCase());
    return cumpleCiudad && cumpleBusqueda;
  });

  const abrirEnGoogleMaps = (ubicacion) => {
    const query = encodeURIComponent(
      `${ubicacion.nombre}, ${ubicacion.direccion}, ${ubicacion.ciudad}, Colombia`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <UserLayout
      title="Sedes y Ubicaciones de Tejo"
      subtitle="Encuentra clubes, canchas oficiales y escenarios deportivos cerca de ti."
    >
      {/* Barra de Filtros y Geolocalización */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, barrio o dirección..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-color)',
              minWidth: '240px',
              flex: 1,
            }}
          />

          <select
            value={filtroCiudad}
            onChange={(e) => setFiltroCiudad(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-color)',
              cursor: 'pointer',
            }}
          >
            <option value="todas">Todas las Ciudades</option>
            {ciudadesDisponibles.map((ciudad) => (
              <option key={ciudad} value={ciudad}>
                {ciudad}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="secondary"
          onClick={handleObtenerMiUbicacion}
          disabled={loadingLocation}
        >
          {loadingLocation ? '📍 Localizando...' : '📍 Cerca de Mí'}
        </Button>
      </div>

      {loading ? (
        <Loader message="Cargando sedes y canchas disponibles..." />
      ) : ubicacionesFiltradas.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <h3>No se encontraron sedes</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Prueba cambiando los filtros de búsqueda o seleccionando otra ciudad.
          </p>
        </div>
      ) : (
        <div className="services-grid">
          {ubicacionesFiltradas.map((ubicacion) => {
            const canchasDeSede = canchas.filter(
              (c) => c.id_ubicacion === ubicacion.id_ubicacion
            );

            return (
              <article
                key={ubicacion.id_ubicacion}
                className="service-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div className="service-card-body">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <Badge variant={ubicacion.estado !== false ? 'success' : 'danger'}>
                      {ubicacion.estado !== false ? 'Sede Abierta' : 'Cerrada'}
                    </Badge>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'var(--primary-color)',
                      }}
                    >
                      🏙️ {ubicacion.ciudad}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>
                    {ubicacion.nombre}
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    📍 <strong>Dirección:</strong> {ubicacion.direccion}
                  </p>

                  {ubicacion.barrio && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
                      🏘️ <strong>Barrio:</strong> {ubicacion.barrio}
                    </p>
                  )}

                  {/* Resumen de Canchas en esta Sede */}
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      margin: '14px 0',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      Pistas disponibles en esta sede:
                    </div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                      🎯 {canchasDeSede.length}{' '}
                      {canchasDeSede.length === 1 ? 'Cancha' : 'Canchas'}
                    </strong>
                    {canchasDeSede.length > 0 && (
                      <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {canchasDeSede.map((c) => (
                          <span
                            key={c.id_cancha}
                            style={{
                              fontSize: '0.75rem',
                              background: 'var(--bg-card)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            {c.nombre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '0 16px 16px 16px',
                  }}
                >
                  <Button
                    variant="outline"
                    style={{ flex: 1 }}
                    onClick={() => abrirEnGoogleMaps(ubicacion)}
                  >
                    🗺️ Cómo llegar
                  </Button>
                  <Button
                    variant="primary"
                    style={{ flex: 1 }}
                    onClick={() => navigate('/user/canchas')}
                  >
                    Ver Pistas
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </UserLayout>
  );
}
