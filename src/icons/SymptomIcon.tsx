import type { ReactElement } from 'react';
import type { SymptomKey } from '../types/dashboard.types';
import { Svg, type IconProps } from './Svg';

interface SymptomIconProps extends IconProps {
  symptom: SymptomKey;
}

export function SymptomIcon({ symptom, size = 24 }: SymptomIconProps): ReactElement {
  switch (symptom) {
    case 'palpitaciones':
      return (
        <Svg size={size}>
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
        </Svg>
      );
    case 'resequedadBoca':
      return (
        <Svg size={size}>
          <path d="M12 2.7s6 6.3 6 10.8a6 6 0 0 1-12 0C6 9 12 2.7 12 2.7z" />
        </Svg>
      );
    case 'faltaAire':
      return (
        <Svg size={size}>
          <path d="M3 8h11a3 3 0 1 0-3-3" />
          <path d="M3 12h16a3 3 0 1 1-3 3" />
          <path d="M3 16h7a2.5 2.5 0 1 1-2.5 2.5" />
        </Svg>
      );
    case 'necesidadCaminar':
      return (
        <Svg size={size}>
          <ellipse cx="8" cy="15.5" rx="2.5" ry="4" />
          <ellipse cx="16" cy="8.5" rx="2.5" ry="4" />
        </Svg>
      );
  }
}
