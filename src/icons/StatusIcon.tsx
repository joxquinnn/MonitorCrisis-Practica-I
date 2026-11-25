import type { ReactElement } from 'react';
import { Svg } from './Svg';

export type ClinicalState = 'alerta' | 'estable' | 'evaluando' | 'desconocido';

interface StatusIconProps {
  state: ClinicalState;
}

/** Íconos de estado clínico: el color nunca es el único indicador. */
export function StatusIcon({ state }: StatusIconProps): ReactElement {
  if (state === 'alerta') {
    return (
      <Svg size={28}>
        <path d="M10.3 3.9L2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        <path d="M12 9.5v4" />
        <path d="M12 17h.01" />
      </Svg>
    );
  }
  if (state === 'evaluando') {
    return (
      <Svg size={28}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </Svg>
    );
  }
  if (state === 'estable') {
    return (
      <Svg size={28}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l2.7 2.7L16 9.5" />
      </Svg>
    );
  }
  return (
    <Svg size={28}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5h.01" />
      <path d="M14.5 9.5h.01" />
      <path d="M8.5 15a5 5 0 0 1 7 0" />
    </Svg>
  );
}
