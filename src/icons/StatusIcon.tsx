import type { ReactElement } from 'react';
import type { LiveState } from '../types/dashboard.types';
import { Svg } from './Svg';

interface StatusIconProps {
  state: LiveState;
}

export function StatusIcon({ state }: StatusIconProps): ReactElement {
  if (state === 'stable') {
    return (
      <Svg size={30}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l2.7 2.7L16 9.5" />
      </Svg>
    );
  }
  if (state === 'evaluating') {
    return (
      <Svg size={30}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </Svg>
    );
  }
  return (
    <Svg size={30}>
      <path d="M10.3 3.9L2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9.5v4" />
      <path d="M12 17h.01" />
    </Svg>
  );
}
