import React from 'react';

export default function Button({
  children,
  variant = 'primary', // primary | secondary | danger | ghost
  size = 'md',        // sm | md | lg
  type = 'button',
  disabled = false,
  loading = false,
  icon,
  onClick,
  className = '',
  style = {},
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${className}`}
      style={style}
      {...props}
    >
      {loading ? (
        <span>⏳ Cargando...</span>
      ) : (
        <>
          {icon && <span className="btn-icon-wrapper">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
