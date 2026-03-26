import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Droplets, TrendingUp, Flame, Zap, Plus, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import Card from '../components/Card';
import Logo from '../components/Logo';
import LoadingScreen from '../components/LoadingScreen';
import InlineError from '../components/InlineError';
import EmptyStateCard from '../components/EmptyStateCard';
import { useUser } from '../contexts/UserContext';
import type { Practice } from '../lib/types';
import { fetchPractices } from '../lib/practices-api';
import { calculateLevel, calculateStreak } from '../lib/swim-utils';

export default function Dashboard() {
  const { profile } = useUser();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPractices();
      setPractices(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load workouts';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPractices();
        if (!cancelled) setPractices(data);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to load workouts';
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  
  const thisWeekYards = practices
    .filter(p => {
      const practiceDate = new Date(p.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return practiceDate >= weekAgo;
    })
    .reduce((total, p) => total + p.totalYards, 0);
  
  const thisMonthPractices = practices
    .filter(p => {
      const practiceDate = new Date(p.date);
      const now = new Date();
      return practiceDate.getMonth() === now.getMonth() && practiceDate.getFullYear() === now.getFullYear();
    }).length;

  const xpTotal = practices.reduce((sum, p) => sum + (p.xpEarned ?? 0), 0);
  const level = Math.min(6, calculateLevel(xpTotal));
  const streakDays = calculateStreak(practices.map((p) => ({ date: p.date })));
  
  const weeklyGoal = 15000;
  const weekProgress = Math.min((thisWeekYards / weeklyGoal) * 100, 100);
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="px-6 pt-16 pb-6">
          <div className="flex items-center justify-between mb-4">
            <Logo size="md" />
          </div>
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight mb-1">{profile.name}</h1>
        </div>
        <div className="px-6">
          <InlineError title="Couldn’t load your dashboard" message={error} onRetry={load} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      {/* Header */}
      <div className="px-6 pt-16 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Logo size="md" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight mb-1">{profile.name}</h1>
            <p className="text-gray-400 light:text-gray-600 text-sm font-mono">{thisWeekYards.toLocaleString()} yards this week</p>
          </div>
          <Link to="/rewards" className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center text-black font-bold text-xl">
            {level}
          </Link>
        </div>
      </div>
      
      {/* Week Progress */}
      <div className="px-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 light:text-gray-600 uppercase tracking-wider font-mono mb-1">Weekly Goal</p>
              <p className="text-4xl font-bold text-white light:text-gray-900 font-mono">{(thisWeekYards / 1000).toFixed(1)}k</p>
              <p className="text-sm text-gray-400 light:text-gray-600 mt-1">of {(weeklyGoal / 1000).toFixed(0)}k yards</p>
            </div>
            <div className="relative w-24 h-24">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(255,255,255,0.1)"
                  className="light:stroke-gray-200"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#00FFFF"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - weekProgress / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white light:text-gray-900 font-mono">{Math.round(weekProgress)}%</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 light:border-gray-200">
            <div>
              <p className="text-xs text-gray-500 light:text-gray-600 font-mono mb-1">SESSIONS</p>
              <p className="text-2xl font-bold text-white light:text-gray-900 font-mono">{thisMonthPractices}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 light:text-gray-600 font-mono mb-1">STREAK</p>
              <p className="text-2xl font-bold text-white light:text-gray-900 font-mono flex items-center gap-1">
                <Flame className="w-5 h-5 text-orange-500" />
                {streakDays}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 light:text-gray-600 font-mono mb-1">XP</p>
              <p className="text-2xl font-bold text-white light:text-gray-900 font-mono">{(xpTotal / 1000).toFixed(1)}k</p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="px-6">
        {/* Log Workout CTA */}
        <Link to="/log" className="block mb-6">
          <div className="bg-cyan-500 rounded-xl p-4 flex items-center justify-between hover:bg-cyan-400 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-black" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-black font-bold text-lg">Log Workout</p>
                <p className="text-black/70 text-sm font-medium">Record today's swim</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-black/70" />
          </div>
        </Link>
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link to="/analytics">
            <Card className="p-4 hover:border-cyan-500/50 transition-colors">
              <TrendingUp className="w-6 h-6 text-cyan-500 mb-3" />
              <p className="text-sm text-gray-500 font-mono mb-1">PERFORMANCE</p>
              <p className="text-2xl font-bold text-white font-mono">
                {practices.length > 0 && practices[0].sets.length > 0 
                  ? Math.round((practices[0].totalYards / practices[0].duration) * 60)
                  : '0'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">yd/hr avg</p>
            </Card>
          </Link>
          
          <Link to="/records">
            <Card className="p-4 hover:border-cyan-500/50 transition-colors">
              <Zap className="w-6 h-6 text-yellow-500 mb-3" />
              <p className="text-sm text-gray-500 font-mono mb-1">BEST TIMES</p>
              <p className="text-2xl font-bold text-white font-mono">12</p>
              <p className="text-xs text-gray-500 mt-1">personal records</p>
            </Card>
          </Link>
        </div>
        
        {/* Recent Activity */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
            <Link to="/calendar" className="text-sm font-semibold text-cyan-500 flex items-center gap-1">
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {practices.length > 0 ? (
            <div className="space-y-3">
              {practices.slice(0, 4).map(practice => {
                const date = new Date(practice.date);
                const isToday = date.toDateString() === new Date().toDateString();
                const intensity = practice.sets.some(s => s.effort === 'Sprint' || s.effort === 'Race Pace') ? 'high' : 
                                practice.sets.some(s => s.effort === 'Hard') ? 'medium' : 'low';
                
                const intensityColors = {
                  high: 'bg-red-500',
                  medium: 'bg-yellow-500',
                  low: 'bg-green-500'
                };
                
                return (
                  <Card key={practice.id} className="p-4 hover:border-cyan-500/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-1 h-16 rounded-full ${intensityColors[intensity]}`} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-white">
                              {isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-sm text-gray-400 font-mono">{practice.duration} min</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white font-mono">
                              {(practice.totalYards / 1000).toFixed(1)}k
                            </p>
                          </div>
                        </div>
                        
                        {practice.notes && (
                          <p className="text-sm text-gray-400 mb-2 line-clamp-1">{practice.notes}</p>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 font-mono">
                            {Math.round((practice.totalYards / practice.duration) * 60)} yd/hr
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-500 font-mono">
                            {practice.sets.length} sets
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyStateCard
              icon={<Droplets className="w-16 h-16 text-gray-700" />}
              title="No workouts yet"
              description="Start tracking your swimming"
              action={
                <Link
                  to="/log"
                  className="inline-flex items-center justify-center px-6 py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors"
                >
                  Log First Workout
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}