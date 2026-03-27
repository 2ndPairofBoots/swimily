import iconSvg from '../../assets/swimily_icon.svg';
import wordmarkSvg from '../../assets/swimily_wordmark.svg';
import badgeSvg from '../../assets/swimily_badge.svg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'wordmark' | 'badge';
  showTagline?: boolean;
  className?: string;
}

export default function Logo({
  size = 'md',
  variant = 'icon',
  showTagline = false,
  className = '',
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
  };

  const src =
    variant === 'wordmark'
      ? wordmarkSvg
      : variant === 'badge'
      ? badgeSvg
      : iconSvg;
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img 
        src={src}
        alt="Swimily - Track Every Yard" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
    </div>
  );
}
