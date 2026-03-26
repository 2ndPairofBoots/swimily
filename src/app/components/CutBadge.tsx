interface CutBadgeProps {
  cut: string;
}

const CUT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'AAAA': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  'AAA': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'AA': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  'A': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  'BB': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  'B': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

export default function CutBadge({ cut }: CutBadgeProps) {
  const colors = CUT_COLORS[cut] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
      {cut}
    </span>
  );
}
