import type { ReactElement } from 'react';
import { Svg } from './Svg';

export function ClockIcon({ size = 20 }: { size?: number }): ReactElement {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  );
}
