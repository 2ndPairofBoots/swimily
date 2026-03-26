import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
  iconBgColor?: string;
}

export default function StatCard({ icon: Icon, label, value, iconColor = 'text-blue-600', iconBgColor = 'bg-blue-100' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3">
        <div className={`${iconBgColor} ${iconColor} p-3 rounded-lg`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-slate-600 text-sm">{label}</p>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
