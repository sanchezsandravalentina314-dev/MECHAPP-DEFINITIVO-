import React from 'react';

export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  icon,
  options = [], // Para select
  rows = 3,     // Para textarea
  className = '',
  ...props
}) {
  const inputId = id || name;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId}>
          {label} {required && <span style={{ color: 'var(--primary)' }}>*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={inputId}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          required={required}
          className="form-control"
          {...props}
        >
          <option value="">Selecciona una opción...</option>
          {options.map((opt) => (
            <option
              key={typeof opt === 'object' ? opt.value : opt}
              value={typeof opt === 'object' ? opt.value : opt}
            >
              {typeof opt === 'object' ? opt.label : opt}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className="form-control"
          {...props}
        />
      ) : (
        <div style={{ position: 'relative' }}>
          <input
            id={inputId}
            name={name}
            type={type}
            value={value ?? ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="form-control"
            {...props}
          />
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '4px' }}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '4px' }}>
          {helperText}
        </p>
      )}
    </div>
  );
}
