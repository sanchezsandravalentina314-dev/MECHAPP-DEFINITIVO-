import React, { useState, useMemo } from 'react';
import Button from './Button';

export default function Table({
  columns = [],
  data = [],
  searchPlaceholder = 'Buscar en los registros...',
  searchKeys = [],
  onAddNew,
  addNewLabel = 'Nuevo Registro',
  loading = false,
  emptyMessage = 'No se encontraron registros.',
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((item) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((k) => String(item[k] || '').toLowerCase().includes(term));
      }
      return JSON.stringify(item).toLowerCase().includes(term);
    });
  }, [data, searchTerm, searchKeys]);

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <div className="table-search">
          <span>🔍</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
        {onAddNew && (
          <Button onClick={onAddNew} icon="＋">
            {addNewLabel}
          </Button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key || col.header} style={{ textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="empty-state">
                  <div className="empty-state-icon">⏳</div>
                  <p>Cargando datos desde el servidor...</p>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-state">
                  <div className="empty-state-icon">📂</div>
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr key={row.id || row.id_usuario || row.id_cancha || row.id_torneo || idx}>
                  {columns.map((col) => (
                    <td key={col.key || col.header} style={{ textAlign: col.align || 'left' }}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
