import { ReactNode } from 'react';
import { CARD_BASE_STYLES, CARD_HOVER_STYLES } from '../lib/design-tokens';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`${CARD_BASE_STYLES} ${onClick ? CARD_HOVER_STYLES : ''} ${className}`}
    >
      {children}
    </div>
  );
}