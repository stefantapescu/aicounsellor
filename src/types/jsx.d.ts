// src/types/jsx.d.ts
import 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        name?: string;
        src?: string;
        icon?: string;
        size?: 'small' | 'large';
        color?: string;
        mode?: 'ios' | 'md';
        lazy?: boolean;
        class?: string; // Allow class attribute
      }, HTMLElement>;
    }
  }
}
