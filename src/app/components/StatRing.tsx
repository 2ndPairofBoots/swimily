interface StatRingProps {
  value: number;
  max: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
  showValue?: boolean;
}

export default function StatRing({ 
  value, 
  max, 
  size = 'md', 
  color = '#0066FF',
  label,
  showValue = true 
}: StatRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizes = {
    sm: { radius: 32, stroke: 6, fontSize: 'text-xs' },
    md: { radius: 48, stroke: 8, fontSize: 'text-sm' },
    lg: { radius: 64, stroke: 10, fontSize: 'text-base' }
  };
  
  const { radius, stroke, fontSize } = sizes[size];
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="inline-flex flex-col items-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          stroke="#E2E8F0"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress ring */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            strokeDasharray: `${circumference} ${circumference}`,
            strokeDashoffset,
            transition: 'stroke-dashoffset 0.5s ease'
          }}
        />
      </svg>
      {showValue && (
        <div className={`text-center -mt-${radius + 8}`}>
          <p className={`${fontSize} font-bold text-slate-900 tabular-nums`}>
            {Math.round(percentage)}%
          </p>
          {label && <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>}
        </div>
      )}
    </div>
  );
}
