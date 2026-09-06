import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function ProductoModal({ isOpen, onClose, onGuardar, productoEditar, idCancha, categorias = [] }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    id_categoria: '',
    stock: 10,
    stock_minimo: 3,
    imagen_url: ''
  });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (productoEditar) {
      setFormData({
        nombre: productoEditar.nombre || '',
        descripcion: productoEditar.descripcion || '',
        precio: productoEditar.precio || '',
        id_categoria: productoEditar.id_categoria || '',
        stock: productoEditar.stock ?? 10,
        stock_minimo: productoEditar.stock_minimo ?? 3,
        imagen_url: productoEditar.imagen_url || ''
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        id_categoria: categorias[0]?.id_categoria || '',
        stock: 10,
        stock_minimo: 3,
        imagen_url: ''
      });
    }
  }, [productoEditar, isOpen, categorias]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio) {
      alert('Por favor completa el nombre y precio del producto');
      return;
    }

    try {
      setCargando(true);
      await onGuardar({
        ...formData,
        id_cancha: Number(idCancha) || 1,
        precio: Number(formData.precio),
        stock: Number(formData.stock),
        stock_minimo: Number(formData.stock_minimo),
        id_categoria: formData.id_categoria ? Number(formData.id_categoria) : null
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Error al guardar producto');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={productoEditar ? '✏️ Editar Producto' : '🍔 Nuevo Producto'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Nombre del Producto"
          placeholder="Ej: Picada Familiar de Tejo, Cerveza Águila 330ml..."
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Precio ($ COP)"
            type="number"
            placeholder="Ej: 25000"
            value={formData.precio}
            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
            required
          />

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 600 }}>
              Categoría
            </label>
            <select
              value={formData.id_categoria}
              onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--color-bg, #0f141c)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            >
              <option value="">-- Sin categoría --</option>
              {categorias.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.icono || '🍽️'} {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Stock Inicial"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          />
          <Input
            label="Alerta de Stock Mínimo"
            type="number"
            value={formData.stock_minimo}
            onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
          />
        </div>

        <Input
          label="URL de Imagen (Opcional)"
          placeholder="https://images.unsplash.com/..."
          value={formData.imagen_url}
          onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
        />

        <Input
          label="Descripción"
          placeholder="Ingredientes, porciones, temperatura..."
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          isTextarea
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={cargando}>
            {cargando ? 'Guardando...' : (productoEditar ? 'Actualizar' : 'Crear Producto')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
