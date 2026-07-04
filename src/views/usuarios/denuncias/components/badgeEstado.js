import React from 'react';
import { CBadge } from '@coreui/react';

const BadgeEstado = ({ estado }) => {
  const config = {
    pendiente: { color: 'warning', text: 'Pendiente' },
    investigando: { color: 'info', text: 'En revisión' },
    asignada: { color: 'primary', text: 'Asignada' },
    en_proceso: { color: 'dark', text: 'En Proceso' },
    resuelta: { color: 'success', text: 'Resuelta' }
  }[estado] || { color: 'secondary', text: estado };

  return <CBadge color={config.color}>{config.text}</CBadge>;
};

export default BadgeEstado;