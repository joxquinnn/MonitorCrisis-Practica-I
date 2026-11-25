import type { ReactElement } from 'react';
import { Svg } from './Svg';

export function PatternIcon({ size = 22 }: { size?: number }): ReactElement {
  return (
    <Svg size={size}>
      <path d="M3 12h3l2.5-6 3 12 2.5-8 2 4h5" />
    </Svg>
  );
}
