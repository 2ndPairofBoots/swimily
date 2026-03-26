import { useEffect, useState } from 'react';
import { Award, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import CutBadge from '../components/CutBadge';
import { useUser } from '../contexts/UserContext';
import { fetchRecords, upsertRecord, type PersonalRecord } from '../lib/records-api';
import { EVENTS_SCY, EVENTS_LCM } from '../lib/constants';
import { formatTime, parseTimeToSeconds, calculateFINAPoints, calculateCuts, getHighestCut } from '../lib/swim-utils';
import Card from '../components/Card';
import LoadingScreen from '../components/LoadingScreen';
import InlineError from '../components/InlineError';

export default function Records() {
  const { profile, preferences } = useUser();
  const [course, setCourse] = useState<'SCY' | 'LCM'>(preferences.preferredCourse);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [timeInput, setTimeInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  
  const events = course === 'SCY' ? EVENTS_SCY : EVENTS_LCM;

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRecords(course);
      setRecords(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load records';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const data = await fetchRecords(course);
        if (!cancelled) setRecords(data);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to load records';
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
  }, [course]);

  const timeRecords = records.filter((r) => r.timeSeconds != null);
  const allCuts = timeRecords.flatMap((r) => r.cuts ?? []);
  const bestCut = allCuts.length > 0 ? getHighestCut(allCuts) || 'B' : '-';
  const avgFina =
    timeRecords.length > 0
      ? Math.round(timeRecords.reduce((sum, r) => sum + (r.finaPoints ?? 0), 0) / timeRecords.length)
      : '-';

  const getRecordForEvent = (event: string) => records.find((r) => r.event === event);

  const handleSaveTime = async (event: string) => {
    if (!timeInput) {
      toast.error('Enter a time');
      return;
    }

    const seconds = parseTimeToSeconds(timeInput);
    if (seconds === 0) {
      toast.error('Invalid time format');
      return;
    }

    const finaPoints = calculateFINAPoints(event, seconds, profile.gender, course);
    const cuts = calculateCuts(event, seconds, profile.gender, course);

    setIsSaving(true);
    try {
      await upsertRecord({
        event,
        course,
        timeSeconds: seconds,
        finaPoints,
        cuts,
      });

      const data = await fetchRecords(course);
      setRecords(data);
      toast.success('Time saved!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save time');
    } finally {
      setIsSaving(false);
      setTimeInput('');
    }
  };

  const handleSaveGoal = async (event: string) => {
    if (!goalInput) {
      toast.error('Enter a goal time');
      return;
    }

    const seconds = parseTimeToSeconds(goalInput);
    if (seconds === 0) {
      toast.error('Invalid time format');
      return;
    }

    setIsSaving(true);
    try {
      await upsertRecord({
        event,
        course,
        goalTimeSeconds: seconds,
      });

      const data = await fetchRecords(course);
      setRecords(data);
      toast.success('Goal saved!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save goal');
    } finally {
      setIsSaving(false);
      setGoalInput('');
    }
  };
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight mb-4">Records</h1>
        </div>
        <div className="px-6">
          <InlineError title="Couldn’t load records" message={error} onRetry={load} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight mb-4">Records</h1>
        
        {/* Course Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCourse('SCY');
              setSelectedEvent(null);
              setTimeInput('');
              setGoalInput('');
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              course === 'SCY'
                ? 'bg-cyan-500 text-black'
                : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
            }`}
          >
            SCY
          </button>
          <button
            onClick={() => {
              setCourse('LCM');
              setSelectedEvent(null);
              setTimeInput('');
              setGoalInput('');
            }}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              course === 'LCM'
                ? 'bg-cyan-500 text-black'
                : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
            }`}
          >
            LCM
          </button>
        </div>
      </div>
      
      <div className="px-6 -mt-3">
        {/* Stats Summary */}
        <Card className="mb-6 p-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 font-mono">Performance Summary</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Award className="w-6 h-6 text-cyan-500 mb-2" />
              <p className="text-3xl font-bold text-white font-mono">{timeRecords.length}</p>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Events</p>
            </div>
            <div>
              <TrendingUp className="w-6 h-6 text-green-500 mb-2" />
              <p className="text-3xl font-bold text-white font-mono">
                {bestCut}
              </p>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Best Cut</p>
            </div>
            <div>
              <Target className="w-6 h-6 text-yellow-500 mb-2" />
              <p className="text-3xl font-bold text-white font-mono">
                {avgFina}
              </p>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Avg FINA</p>
            </div>
          </div>
        </Card>
        
        {/* Events List */}
        <div className="space-y-2">
          {events.map(event => {
            const record = getRecordForEvent(event);
            const timeSeconds = record?.timeSeconds;
            const goalTimeSeconds = record?.goalTimeSeconds;
            const isExpanded = selectedEvent === event;
            
            return (
              <Card key={event}>
                <button
                  onClick={() => setSelectedEvent(isExpanded ? null : event)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <p className="font-bold text-white">{event}</p>
                    {timeSeconds != null && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-cyan-500 font-mono text-sm font-bold">{formatTime(timeSeconds)}</span>
                        {record?.finaPoints != null && (
                          <span className="text-xs text-gray-500 font-mono">{record.finaPoints} pts</span>
                        )}
                      </div>
                    )}
                  </div>
                  {record?.cuts && record.cuts.length > 0 && (
                    <CutBadge cut={getHighestCut(record.cuts) || 'B'} />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/10 pt-3 space-y-3">
                    {/* Current Time */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                        Current Time
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={timeInput}
                          onChange={(e) => setTimeInput(e.target.value)}
                          placeholder={timeSeconds != null ? formatTime(timeSeconds) : "1:23.45"}
                          className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white font-mono font-bold focus:ring-2 focus:ring-cyan-500"
                        />
                        <button
                          onClick={() => handleSaveTime(event)}
                          className="px-4 py-2 bg-cyan-500 text-black rounded-lg font-bold hover:bg-cyan-400 transition-colors"
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Goal Time */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                        Goal Time
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={goalInput}
                          onChange={(e) => setGoalInput(e.target.value)}
                          placeholder={goalTimeSeconds != null ? formatTime(goalTimeSeconds) : "1:20.00"}
                          className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white font-mono font-bold focus:ring-2 focus:ring-cyan-500"
                        />
                        <button
                          onClick={() => handleSaveGoal(event)}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition-colors"
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Time Difference */}
                    {timeSeconds != null && goalTimeSeconds != null && (
                      <div className="bg-black/40 rounded-lg p-3 border border-white/10">
                        <p className="text-xs text-gray-400 mb-1 font-mono">Improvement Needed</p>
                        <p className="text-lg font-bold text-white font-mono">
                          {formatTime(timeSeconds - goalTimeSeconds)}
                        </p>
                      </div>
                    )}
                    
                    {/* Cuts */}
                    {record?.cuts && record.cuts.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">All Cuts</p>
                        <div className="flex flex-wrap gap-1">
                          {record.cuts.map(cut => (
                            <CutBadge key={cut} cut={cut} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}