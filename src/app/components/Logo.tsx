import logoImage from '../../assets/ba6babfab77e2e9acbdc12e9c0283f39a4c60576.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showTagline = false, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img 
        src={logoImage} 
        alt="Swimily - Track Every Yard" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
    </div>
  );
}
