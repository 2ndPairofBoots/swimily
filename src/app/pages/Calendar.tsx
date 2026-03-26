import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Droplets } from 'lucide-react';
import PracticeCard from '../components/PracticeCard';
import { toast } from 'sonner';
import type { Practice } from '../lib/types';
import { fetchPractices } from '../lib/practices-api';
import LoadingScreen from '../components/LoadingScreen';
import InlineError from '../components/InlineError';
import EmptyStateCard from '../components/EmptyStateCard';
import Button from '../components/Button';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const formatYMD = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const practiceYMD = (p: Practice) => String(p.date).slice(0, 10);

  const getPracticesForDate = (date: Date) => {
    const target = formatYMD(date);
    return practices.filter((p) => practiceYMD(p) === target);
  };
  
  const getTotalYardsForDate = (date: Date) => {
    return getPracticesForDate(date).reduce((sum, p) => sum + p.totalYards, 0);
  };
  
  const days = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const practices = getPracticesForDate(date);
    const totalYards = getTotalYardsForDate(date);
    const isToday = formatYMD(date) === formatYMD(new Date());
    const isSelected =
      selectedDate ? formatYMD(date) === formatYMD(selectedDate) : false;
    
    days.push(
      <button
        key={day}
        onClick={() => setSelectedDate(date)}
        className={`aspect-square p-2 rounded-lg border transition-all ${
          isSelected
            ? 'bg-blue-600 text-white border-blue-600'
            : isToday
            ? 'bg-blue-50 border-blue-300 text-blue-600'
            : practices.length > 0
            ? 'bg-green-50 border-green-300 text-slate-900 hover:bg-green-100'
            : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
        }`}
      >
        <div className="flex flex-col h-full">
          <span className={`text-sm font-semibold ${isSelected ? 'text-white' : ''}`}>
            {day}
          </span>
          {practices.length > 0 && (
            <div className="mt-auto">
              <div className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-green-600'}`}>
                {(totalYards / 1000).toFixed(1)}k
              </div>
            </div>
          )}
        </div>
      </button>
    );
  }
  
  const selectedDatePractices = selectedDate ? getPracticesForDate(selectedDate) : [];
  
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPractices();
        if (!cancelled) setPractices(data);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to load calendar';
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

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPractices();
      setPractices(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load calendar';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight mb-4">Calendar</h1>
        </div>
        <div className="px-6">
          <InlineError title="Couldn’t load calendar" message={error} onRetry={load} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight mb-4">Calendar</h1>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-white/10 light:hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white/80 light:text-gray-900" />
          </button>
          <h2 className="font-semibold text-white light:text-gray-900">{monthName}</h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white/10 light:hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white/80 light:text-gray-900" />
          </button>
        </div>
      </div>
      
      <div className="px-6 pb-6">
        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-400 light:text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {days}
        </div>
        
        {/* Selected Date Details */}
        {selectedDate && (
          <div>
            <h3 className="text-lg font-semibold text-white light:text-gray-900 mb-3">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {selectedDatePractices.length > 0 ? (
              <div className="space-y-3">
                {selectedDatePractices.map(practice => (
                  <PracticeCard key={practice.id} practice={practice} />
                ))}
              </div>
            ) : (
              <EmptyStateCard
                icon={<Droplets className="w-12 h-12 text-gray-700" />}
                title="No practices on this day"
              />
            )}
          </div>
        )}

        {!selectedDate && practices.length === 0 && (
          <div className="mt-6">
            <EmptyStateCard
              icon={<Droplets className="w-12 h-12 text-gray-700" />}
              title="No workouts yet"
              description="Log your first workout to see it on the calendar."
              action={
                <Button fullWidth size="lg" onClick={() => (window.location.href = '/log')}>
                  Log a workout
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}