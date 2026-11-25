import type { ReactElement } from 'react';
import { Svg } from './Svg';

export type TrendDirection = 'up' | 'down' | 'flat';

interface TrendIconProps {
  direction: TrendDirection;
}

export function TrendIcon({ direction }: TrendIconProps): ReactElement {
  if (direction === 'up') {
    return (
      <Svg size={18}>
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </Svg>
    );
  }
  if (direction === 'down') {
    return (
      <Svg size={18}>
        <path d="M12 5v14" />
        <path d="M19 12l-7 7-7-7" />
      </Svg>
    );
  }
  return (
    <Svg size={18}>
      <path d="M5 12h14" />
    </Svg>
  );
}
