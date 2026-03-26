import { Trophy, Zap } from 'lucide-react';
import Card from './Card';
import { getProgressToNextLevel, getLevelTitle } from '../lib/swim-utils';

interface XPCardProps {
  xp: number;
  level: number;
}

export default function XPCard({ xp, level }: XPCardProps) {
  const progress = getProgressToNextLevel(xp);
  const title = getLevelTitle(level);
  
  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-[#0066FF] to-[#0052CC] rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 mb-0.5">Level {level}</p>
              <p className="text-xl font-bold tracking-tight">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
            <Zap className="w-5 h-5 fill-current text-[#FFB020]" />
            <span className="font-bold text-lg font-mono">{xp.toLocaleString()}</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-2.5">
            <span className="font-semibold text-slate-400">Next Level</span>
            <span className="font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00C896] to-[#0066FF] rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            {((Math.floor(xp / 1000) + 1) * 1000) - xp} XP to Level {level + 1}
          </p>
        </div>
      </div>
    </Card>
  );
}