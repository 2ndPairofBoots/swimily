import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Clock, Award, Crown, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import Card from '../components/Card';
import { PRICING } from '../lib/pricing';
import { useUser } from '../contexts/UserContext';
import { fetchPractices } from '../lib/practices-api';
import type { Practice } from '../lib/types';

export default function Analytics() {
  const { profile } = useUser();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleUpgradeMonthly = () => {
    toast.info('Upgrade to Premium', { 
      description: 'Redirecting to checkout for Monthly plan ($4.99/month)...' 
    });
  };
  
  const handleUpgradeAnnual = () => {
    toast.info('Upgrade to Premium', { 
      description: 'Redirecting to checkout for Annual plan ($49.99/year)...' 
    });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPractices();
        if (!cancelled) setPractices(data);
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : 'Failed to load analytics');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ymd = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const practiceYMD = (p: Practice) => String(p.date).slice(0, 10);

  const start7 = new Date();
  start7.setDate(start7.getDate() - 6);
  start7.setHours(0, 0, 0, 0);
  const end7 = new Date();
  end7.setHours(23, 59, 59, 999);

  const start7YMD = ymd(start7);
  const end7YMD = ymd(end7);

  const lastStart = new Date(start7);
  lastStart.setDate(lastStart.getDate() - 7);
  const lastEnd = new Date(end7);
  lastEnd.setDate(lastEnd.getDate() - 7);

  const lastStartYMD = ymd(lastStart);
  const lastEndYMD = ymd(lastEnd);

  const thisWeekPractices = practices.filter((p) => {
    const ds = practiceYMD(p);
    return ds >= start7YMD && ds <= end7YMD;
  });

  const lastWeekPractices = practices.filter((p) => {
    const ds = practiceYMD(p);
    return ds >= lastStartYMD && ds <= lastEndYMD;
  });

  const thisWeekYards = thisWeekPractices.reduce((sum, p) => sum + p.totalYards, 0);
  const lastWeekYards = lastWeekPractices.reduce((sum, p) => sum + p.totalYards, 0);
  const weekChangePct = lastWeekYards > 0 ? ((thisWeekYards - lastWeekYards) / lastWeekYards) * 100 : 0;
  const sessionsThisWeek = thisWeekPractices.length;
  const avgPerSession = sessionsThisWeek > 0 ? Math.round(thisWeekYards / sessionsThisWeek) : 0;

  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start7);
    d.setDate(start7.getDate() + i);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayYMD = ymd(d);
    const yards = thisWeekPractices
      .filter((p) => practiceYMD(p) === dayYMD)
      .reduce((sum, p) => sum + p.totalYards, 0);
    return { day: dayLabel, yards };
  });

  const monthWindowStart = new Date();
  monthWindowStart.setDate(monthWindowStart.getDate() - 27);
  monthWindowStart.setHours(0, 0, 0, 0);

  const monthlyTrend = Array.from({ length: 4 }).map((_, weekIdx) => {
    const weekStart = new Date(monthWindowStart);
    weekStart.setDate(monthWindowStart.getDate() + weekIdx * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startY = ymd(weekStart);
    const endY = ymd(weekEnd);
    const yards = practices
      .filter((p) => {
        const ds = practiceYMD(p);
        return ds >= startY && ds <= endY;
      })
      .reduce((sum, p) => sum + p.totalYards, 0);

    return { week: `Week ${weekIdx + 1}`, yards };
  });

  if (isLoading && profile.isPremium) {
    return (
      <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA] flex items-center justify-center">
        <span className="text-white/80 light:text-gray-900 font-semibold">Loading…</span>
      </div>
    );
  }

  if (!profile.isPremium) {
    return (
      <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        {/* Header */}
        <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/more" className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
            </Link>
            <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Analytics</h1>
          </div>
        </div>
        
        <div className="px-6">
          {/* Premium Gate */}
          <Card className="p-8 text-center bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 border-none">
            <Crown className="w-16 h-16 mx-auto mb-4 text-white" />
            <h2 className="text-2xl font-bold mb-2 text-white">Premium Feature</h2>
            <p className="text-white/90 mb-6">
              Upgrade to Premium to unlock advanced analytics, charts, and insights about your training
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">{PRICING.monthly.displayPrice}</div>
                <div className="text-sm text-white/90 font-medium mb-3">per month</div>
                <button 
                  onClick={handleUpgradeMonthly}
                  className="w-full py-2.5 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition-shadow text-sm"
                >
                  Monthly Plan
                </button>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-left border-2 border-white/40 relative">
                <div className="absolute -top-2 right-2 bg-cyan-400 text-black px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                  Save {PRICING.annual.savings}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{PRICING.annual.displayPrice}</div>
                <div className="text-sm text-white/90 font-medium mb-3">per year</div>
                <button 
                  onClick={handleUpgradeAnnual}
                  className="w-full py-2.5 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition-shadow text-sm"
                >
                  Annual Plan
                </button>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3 text-left">
              <div className="bg-white/10 rounded-lg p-3">
                <BarChart3 className="w-5 h-5 mb-1 text-white" />
                <p className="text-xs font-semibold text-white">Weekly Charts</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <TrendingUp className="w-5 h-5 mb-1 text-white" />
                <p className="text-xs font-semibold text-white">Progress Trends</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <Clock className="w-5 h-5 mb-1 text-white" />
                <p className="text-xs font-semibold text-white">Time Analysis</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <Award className="w-5 h-5 mb-1 text-white" />
                <p className="text-xs font-semibold text-white">Performance Metrics</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/more" className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
          </Link>
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Analytics</h1>
        </div>
      </div>
      
      <div className="px-6 pb-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-xs text-gray-500 light:text-gray-600 uppercase font-mono mb-1">This Week</p>
            <p className="text-3xl font-bold text-white light:text-gray-900 font-mono">{(thisWeekYards / 1000).toFixed(1)}k</p>
            <p className={`text-xs mt-1 ${weekChangePct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {weekChangePct >= 0 ? '+' : ''}
              {weekChangePct.toFixed(0)}% vs last week
            </p>
          </Card>
          
          <Card className="p-4">
            <p className="text-xs text-gray-500 light:text-gray-600 uppercase font-mono mb-1">Avg/Session</p>
            <p className="text-3xl font-bold text-white light:text-gray-900 font-mono">
              {avgPerSession >= 1000 ? `${(avgPerSession / 1000).toFixed(1)}k` : avgPerSession.toLocaleString()}
            </p>
            <p className="text-xs text-cyan-500 mt-1">{sessionsThisWeek} sessions</p>
          </Card>
        </div>
        
        {/* Weekly Yardage Chart */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-bold text-white light:text-gray-900 mb-4">Weekly Yardage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#999" style={{ fontSize: '12px' }} />
              <YAxis stroke="#999" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="yards" fill="#00FFFF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Monthly Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-white light:text-gray-900 mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="week" stroke="#999" style={{ fontSize: '12px' }} />
              <YAxis stroke="#999" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line type="monotone" dataKey="yards" stroke="#00FFFF" strokeWidth={3} dot={{ fill: '#00FFFF', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}