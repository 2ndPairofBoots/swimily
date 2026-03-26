import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { BUTTON_BASE_STYLES, BUTTON_SIZES, BUTTON_VARIANTS } from '../lib/design-tokens';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  fullWidth = false,
  type = 'button'
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${BUTTON_BASE_STYLES} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${fullWidth ? 'w-full' : ''}`}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />}
      {children}
    </button>
  );
}