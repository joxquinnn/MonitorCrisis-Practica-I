import type { ReactElement } from 'react';

interface BatteryIconProps {
  percent: number;
}

export function BatteryIcon({ percent }: BatteryIconProps): ReactElement {
  const width = Math.max(0, Math.min(100, percent)) * 0.14;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="2" y="7" width="18" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M22 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="4" y="9" width={width} height="6" rx="1" fill="currentColor" />
    </svg>
  );
}
