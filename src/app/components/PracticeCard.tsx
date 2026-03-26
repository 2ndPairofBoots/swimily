import { Calendar, Clock, Droplets } from 'lucide-react';
import Card from './Card';
import { Practice } from '../lib/types';

interface PracticeCardProps {
  practice: Practice;
  onClick?: () => void;
}

export default function PracticeCard({ practice, onClick }: PracticeCardProps) {
  const date = new Date(practice.date);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return (
    <Card onClick={onClick}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-slate-900">{formattedDate}</p>
            <p className="text-sm text-slate-600">{practice.duration} min</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{(practice.totalYards / 1000).toFixed(1)}k</p>
            <p className="text-xs text-slate-500">yards</p>
          </div>
        </div>
        
        {practice.notes && (
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{practice.notes}</p>
        )}
        
        <div className="flex flex-wrap gap-2">
          {practice.sets.slice(0, 3).map((set, idx) => (
            <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
              {set.repetitions}×{set.distance} {set.stroke}
            </span>
          ))}
          {practice.sets.length > 3 && (
            <span className="text-xs text-slate-500 font-medium">+{practice.sets.length - 3} more</span>
          )}
        </div>
      </div>
    </Card>
  );
}
