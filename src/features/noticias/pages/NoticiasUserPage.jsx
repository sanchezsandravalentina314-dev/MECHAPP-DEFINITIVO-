import React, { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import Loader from '@/components/common/Loader';
import { noticiasService } from '../services/noticiasService';
import { formatDate } from '@/utils/formatters';

export default function NoticiasUserPage() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await noticiasService.listar();
        setNoticias(data);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  return (
    <UserLayout
      title="Novedades y Noticias del Tejo"
      subtitle="Mantente informado sobre las últimas actividades, reglamentos y eventos de la comunidad."
    >
      {loading ? (
        <Loader message="Cargando noticias..." />
      ) : (
        <div className="services-grid">
          {noticias.map((noticia) => (
            <article key={noticia.id} className="service-card">
              <img
                src={noticia.imagen_url || 'https://www.eldiario.com.co/wp-content/uploads/2023/11/1.20-1068x712.jpeg'}
                alt={noticia.titulo}
                className="service-card-img"
              />
              <div className="service-card-body">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>
                  📅 {formatDate(noticia.fecha_publicacion)}
                </span>
                <h3>{noticia.titulo}</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{noticia.contenido}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </UserLayout>
  );
}
