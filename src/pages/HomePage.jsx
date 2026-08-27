import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/common/Button';

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section id="inicio" className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            🇨🇴 Deporte Nacional y Patrimonio Cultural
          </div>
          <h1 className="hero-title">
            Conectando generaciones a través del <span>Tejo Colombiano</span>
          </h1>
          <p className="hero-desc">
            Participa en torneos oficiales, reserva canchas en tiempo real, crea equipos y conserva la tradición de nuestro deporte de forma digital y profesional.
          </p>
          <div className="hero-actions">
            <Link to="/registro">
              <Button variant="primary" size="lg" icon="🚀">
                Comenzar Ahora (Registrarse)
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" icon="🔑">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sección Historia del Tejo */}
      <section id="tejo" className="tejo-section">
        <div className="container tejo-grid">
          <div className="tejo-text-content">
            <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
              Nuestra Identidad
            </span>
            <h2>El Tejo: Nuestro Deporte Nacional</h2>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '16px' }}>
              Originario del municipio de <strong>Turmequé (Boyacá)</strong> hace más de 500 años por los antiguos pobladores Muiscas, el tejo consiste en lanzar un disco metálico pesado hacia un área de arcilla para hacer estallar las tradicionales 'mechas' de pólvora colocadas sobre el bocín circular.
            </p>
            <p className="tejo-highlight">
              En el año 2000, fue declarado oficialmente <strong>Deporte Nacional de Colombia</strong> mediante la <strong>Ley 613</strong>, y posteriormente declarado <strong>Patrimonio Cultural Inmaterial de la Nación</strong>.
            </p>
            <p style={{ color: 'var(--text-muted)' }}>
              <strong>MechApp</strong> nace con la misión de modernizar su práctica competitiva, facilitando la gestión de clubes, torneos y estadísticas en una sola plataforma digital.
            </p>
          </div>
          <div className="tejo-image-card">
            <img
              src="https://s3.amazonaws.com/rtvc-assets-senalmemoria.gov.co/s3fs-public/field_image/tejo.jpg"
              alt="Cancha Tradicional de Tejo"
            />
          </div>
        </div>
      </section>

      {/* Sección Servicios / Qué puedes hacer */}
      <section id="servicios" className="services-section">
        <div className="container">
          <div className="section-header">
            <h2>¿Qué puedes hacer en MechApp?</h2>
            <p>
              Llevamos la experiencia del tejo tradicional al entorno digital con herramientas corporativas de alto nivel.
            </p>
          </div>

          <div className="services-grid">
            <article className="service-card">
              <img
                src="https://www.eldiario.com.co/wp-content/uploads/2023/11/1.20-1068x712.jpeg"
                alt="Torneos y Campeonatos"
                className="service-card-img"
              />
              <div className="service-card-body">
                <h3>🏆 Torneos y Campeonatos</h3>
                <p>
                  Inscríbete en torneos locales y nacionales, consulta fixtures oficiales, tablas de posiciones y compite por premios en efectivo.
                </p>
              </div>
            </article>

            <article className="service-card">
              <img
                src="https://tse3.mm.bing.net/th/id/OIP.h81PvCe_1FJ3bWEzkCeWlwHaFj?rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="Gestión de Equipos"
                className="service-card-img"
              />
              <div className="service-card-body">
                <h3>⚽ Creación de Equipos</h3>
                <p>
                  Funda tu propio club, añade deportistas, asigna capitanes y representa a tu ciudad en los eventos oficiales de la comunidad.
                </p>
              </div>
            </article>

            <article className="service-card">
              <img
                src="https://tse4.mm.bing.net/th/id/OIP.R7wRzKIL5Fcmb0qHcpuEPQHaEK?rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="Canchas Aliadas"
                className="service-card-img"
              />
              <div className="service-card-body">
                <h3>📍 Reserva de Canchas</h3>
                <p>
                  Encuentra pistas de arcilla cercanas, revisa disponibilidad de horarios, tarifas por hora y realiza tu reserva de manera digital.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ padding: '80px 0', background: 'radial-gradient(circle, rgba(255,87,34,0.15) 0%, var(--bg-surface) 100%)', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>¿Listo para lanzar tu mejor mecha? 🎯</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 32px', fontSize: '1.1rem' }}>
            Únete a la comunidad de deportistas y propietarios de canchas más grande del país.
          </p>
          <Link to="/registro">
            <Button variant="primary" size="lg">
              Crear Cuenta Gratuita
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
