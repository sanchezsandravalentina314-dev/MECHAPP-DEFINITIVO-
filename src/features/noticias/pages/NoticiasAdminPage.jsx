import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { noticiasService } from '../services/noticiasService';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/formatters';

export default function NoticiasAdminPage() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoticia, setEditingNoticia] = useState(null);

  const { user } = useAuth();
  const { showSuccess, showError } = useApp();

  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    imagen_url: '',
  });

  const cargarNoticias = async () => {
    try {
      setLoading(true);
      const data = await noticiasService.listar();
      setNoticias(data);
    } catch {
      showError('Error al cargar noticias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarNoticias();
  }, []);

  const handleOpenNew = () => {
    setEditingNoticia(null);
    setFormData({
      titulo: '',
      contenido: '',
      imagen_url: 'https://www.eldiario.com.co/wp-content/uploads/2023/11/1.20-1068x712.jpeg',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (noticia) => {
    setEditingNoticia(noticia);
    setFormData({
      titulo: noticia.titulo,
      contenido: noticia.contenido,
      imagen_url: noticia.imagen_url || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`¿Eliminar la noticia #${id}?`)) return;
    try {
      await noticiasService.eliminar(id);
      showSuccess('Noticia eliminada.');
      cargarNoticias();
    } catch {
      showError('No se pudo eliminar la noticia.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        titulo: formData.titulo,
        contenido: formData.contenido,
        imagen_url: formData.imagen_url || null,
        autor_id: user?.id_usuario || 1,
      };

      if (editingNoticia) {
        await noticiasService.actualizar(editingNoticia.id, payload);
        showSuccess('Noticia actualizada.');
      } else {
        await noticiasService.crear(payload);
        showSuccess('Noticia publicada con éxito.');
      }
      setIsModalOpen(false);
      cargarNoticias();
    } catch (err) {
      showError(err.message || 'Error al guardar la noticia.');
    }
  };

  const columns = [
    { header: 'ID', key: 'id', align: 'center' },
    {
      header: 'Título de la Noticia',
      key: 'titulo',
      render: (n) => (
        <div>
          <strong>{n.titulo}</strong>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {n.contenido?.slice(0, 60)}...
          </div>
        </div>
      ),
    },
    {
      header: 'Fecha de Publicación',
      key: 'fecha_publicacion',
      render: (n) => formatDate(n.fecha_publicacion),
    },
    {
      header: 'Acciones',
      render: (n) => (
        <div className="actions-cell">
          <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(n)}>
            ✏️ Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(n.id)}>
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Gestión de Noticias y Novedades"
      subtitle="Publica artículos, comunicados oficiales y novedades del tejo para la comunidad."
    >
      <Table
        columns={columns}
        data={noticias}
        loading={loading}
        onAddNew={handleOpenNew}
        addNewLabel="＋ Publicar Noticia"
        searchPlaceholder="Buscar noticia por título..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNoticia ? `✏️ Editar Noticia (#${editingNoticia.id})` : '＋ Publicar Nueva Noticia'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Título de la Noticia"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ej. Resultados de la 5ta fecha del torneo departamental"
            required
          />

          <Input
            label="Contenido / Descripción"
            type="textarea"
            rows={5}
            value={formData.contenido}
            onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
            placeholder="Escribe el cuerpo completo de la noticia o boletín..."
            required
          />

          <Input
            label="URL de Imagen de Portada"
            type="url"
            value={formData.imagen_url}
            onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
            placeholder="https://ejemplo.com/foto-noticia.jpg"
          />

          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingNoticia ? 'Guardar Cambios' : 'Publicar Ahora'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
