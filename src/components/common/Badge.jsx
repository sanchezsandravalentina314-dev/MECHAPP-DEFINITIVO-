import React from 'react';

export default function Badge({
  children,
  variant = 'primary', // success | warning | danger | info | primary
  className = '',
}) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      ● {children}
    </span>
  );
}
