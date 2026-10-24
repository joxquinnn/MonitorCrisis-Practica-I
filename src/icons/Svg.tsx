import type { ReactElement } from 'react';

export interface IconProps {
  size?: number;
}

interface SvgProps extends IconProps {
  children: ReactElement | ReactElement[];
}

/** Contenedor base para íconos de línea (stroke), en estilo consistente. */
export function Svg({ size = 24, children }: SvgProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}
