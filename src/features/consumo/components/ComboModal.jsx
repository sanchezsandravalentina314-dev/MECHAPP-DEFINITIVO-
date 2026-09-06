import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { formatCOP } from '@/utils/formatters';

export default function ComboModal({ isOpen, onClose, onGuardar, comboEditar, idCancha, productosDisponibles = [] }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    personas_min: 2,
    personas_max: 6,
    imagen_url: ''
  });
  // Map of id_producto -> cantidad (0 si no está seleccionado)
  const [itemsSeleccionados, setItemsSeleccionados] = useState({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (comboEditar) {
      setFormData({
        nombre: comboEditar.nombre || '',
        descripcion: comboEditar.descripcion || '',
        precio: comboEditar.precio || '',
        personas_min: comboEditar.personas_min || 2,
        personas_max: comboEditar.personas_max || 6,
        imagen_url: comboEditar.imagen_url || ''
      });
      const mapping = {};
      if (comboEditar.productos) {
        comboEditar.productos.forEach((p) => {
          mapping[p.id_producto] = p.cantidad || 1;
        });
      }
      setItemsSeleccionados(mapping);
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        personas_min: 2,
        personas_max: 6,
        imagen_url: ''
      });
      setItemsSeleccionados({});
    }
  }, [comboEditar, isOpen]);

  const handleToggleProducto = (idProd) => {
    setItemsSeleccionados((prev) => {
      const nuevo = { ...prev };
      if (nuevo[idProd]) {
        delete nuevo[idProd];
      } else {
        nuevo[idProd] = 1;
      }
      return nuevo;
    });
  };

  const handleCantidadChange = (idProd, cant) => {
    setItemsSeleccionados((prev) => ({
      ...prev,
      [idProd]: Math.max(1, Number(cant) || 1)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio) {
      alert('Por favor completa el nombre y precio del combo');
      return;
    }

    const productosList = Object.entries(itemsSeleccionados).map(([id, cantidad]) => ({
      id_producto: Number(id),
      cantidad: Number(cantidad)
    }));

    if (productosList.length === 0) {
      alert('El combo debe incluir al menos un producto');
      return;
    }

    try {
      setCargando(true);
      await onGuardar({
        ...formData,
        id_cancha: Number(idCancha) || 1,
        precio: Number(formData.precio),
        personas_min: Number(formData.personas_min),
        personas_max: Number(formData.personas_max),
        productos: productosList
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Error al guardar el combo');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={comboEditar ? '✏️ Editar Combo' : '🔥 Crear Nuevo Combo'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto' }}>
        <Input
          label="Nombre del Combo"
          placeholder="Ej: Combo La Mecha Brava, Combo Parche Tejo..."
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <Input
            label="Precio Total ($ COP)"
            type="number"
            placeholder="Ej: 95000"
            value={formData.precio}
            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
            required
          />
          <Input
            label="Personas Mín"
            type="number"
            value={formData.personas_min}
            onChange={(e) => setFormData({ ...formData, personas_min: e.target.value })}
          />
          <Input
            label="Personas Máx"
            type="number"
            value={formData.personas_max}
            onChange={(e) => setFormData({ ...formData, personas_max: e.target.value })}
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
          placeholder="Qué incluye, sugerencia de consumo para el grupo..."
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          isTextarea
        />

        {/* Selector de productos a incluir */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#ffb300', fontWeight: 700, fontSize: '0.9rem' }}>
            🛒 Selecciona los Productos que incluye este Combo:
          </label>

          {productosDisponibles.length === 0 ? (
            <p style={{ color: '#a0aec0', fontSize: '0.85rem', margin: 0 }}>
              No tienes productos creados en esta cancha. Crea productos primero para agregarlos al combo.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {productosDisponibles.map((prod) => {
                const seleccionado = !!itemsSeleccionados[prod.id_producto];
                return (
                  <div
                    key={prod.id_producto}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: seleccionado ? 'rgba(255, 87, 34, 0.12)' : 'rgba(255,255,255,0.02)',
                      borderRadius: '8px',
                      border: seleccionado ? '1px solid #ff5722' : '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', flex: 1, margin: 0, color: '#fff', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        checked={seleccionado}
                        onChange={() => handleToggleProducto(prod.id_producto)}
                      />
                      <span>{prod.nombre} ({formatCOP(prod.precio)})</span>
                    </label>

                    {seleccionado && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Cant:</span>
                        <input
                          type="number"
                          min="1"
                          value={itemsSeleccionados[prod.id_producto]}
                          onChange={(e) => handleCantidadChange(prod.id_producto, e.target.value)}
                          style={{
                            width: '55px',
                            padding: '4px 8px',
                            background: '#0f141c',
                            color: '#fff',
                            border: '1px solid #ff5722',
                            borderRadius: '6px',
                            textAlign: 'center'
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={cargando}>
            {cargando ? 'Guardando...' : (comboEditar ? 'Actualizar Combo' : 'Guardar Combo')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
