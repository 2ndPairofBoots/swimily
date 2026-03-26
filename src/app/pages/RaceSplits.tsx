import { useState } from 'react';
import { Timer, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { parseTimeToSeconds, formatTime, generateRaceSplits } from '../lib/swim-utils';
import { PACING_PROFILES } from '../lib/constants';
import { toast } from 'sonner';
import Card from '../components/Card';

const SPLIT_EVENTS = [
  { name: '50 Free', distance: 50 },
  { name: '100 Free', distance: 100 },
  { name: '200 Free', distance: 200 },
  { name: '500 Free', distance: 500 },
  { name: '100 Fly', distance: 100 },
  { name: '200 IM', distance: 200 },
];

export default function RaceSplits() {
  const [event, setEvent] = useState('100 Free');
  const [goalTime, setGoalTime] = useState('');
  const [profile, setProfile] = useState<'Even Split' | 'Negative Split' | 'Positive Split' | 'Fly & Die'>('Even Split');
  const [splits, setSplits] = useState<{ split: number; target: number; cumulative: number }[]>([]);
  
  const handleCalculate = () => {
    if (!goalTime) {
      toast.error('Enter a goal time');
      return;
    }
    
    const seconds = parseTimeToSeconds(goalTime);
    if (seconds === 0) {
      toast.error('Invalid time format');
      return;
    }
    
    const selectedEvent = SPLIT_EVENTS.find(e => e.name === event);
    if (!selectedEvent) return;
    
    const calculated = generateRaceSplits(selectedEvent.distance, seconds, profile);
    setSplits(calculated);
    toast.success('Splits calculated!');
  };
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/more" className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
          </Link>
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Race Splits</h1>
        </div>
      </div>
      
      <div className="px-6">
        {/* Input Form */}
        <Card className="mb-6 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white light:text-gray-900 mb-3 uppercase tracking-wider">
                Event
              </label>
              <select
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
              >
                {SPLIT_EVENTS.map(e => (
                  <option key={e.name} value={e.name}>{e.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-white light:text-gray-900 mb-3 uppercase tracking-wider">
                Goal Time
              </label>
              <input
                type="text"
                value={goalTime}
                onChange={(e) => setGoalTime(e.target.value)}
                placeholder="1:23.45"
                className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-mono font-bold text-lg focus:ring-2 focus:ring-cyan-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Format: MM:SS.MS or SS.MS
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-white light:text-gray-900 mb-3 uppercase tracking-wider">
                Pacing Strategy
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(PACING_PROFILES).map(p => (
                  <button
                    key={p.name}
                    onClick={() => setProfile(p.name as typeof profile)}
                    className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                      profile === p.name
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleCalculate}
              className="w-full py-4 bg-cyan-500 text-black rounded-xl font-bold text-lg hover:bg-cyan-400 transition-colors"
            >
              Calculate Splits
            </button>
          </div>
        </Card>
        
        {/* Results */}
        {splits.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white light:text-gray-900 mb-3">Target Splits</h2>
            <Card className="divide-y divide-white/10 light:divide-gray-200">
              <div className="p-4 bg-white/5 light:bg-gray-50">
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-xs font-bold text-gray-500 uppercase">Split</p>
                  <p className="text-xs font-bold text-gray-500 uppercase text-center">Time</p>
                  <p className="text-xs font-bold text-gray-500 uppercase text-right">Total</p>
                </div>
              </div>
              
              {splits.map((split, idx) => (
                <div key={idx} className="p-4 hover:bg-white/5 light:hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <p className="font-bold text-white light:text-gray-900">
                      {split.split}y
                    </p>
                    <p className="text-cyan-500 font-mono font-bold text-center">
                      {formatTime(split.target)}
                    </p>
                    <p className="text-gray-400 light:text-gray-600 font-mono font-bold text-right">
                      {formatTime(split.cumulative)}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}