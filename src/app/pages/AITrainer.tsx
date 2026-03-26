import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Crown, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { FOCUS_AREAS } from '../lib/constants';
import { PRICING } from '../lib/pricing';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../contexts/UserContext';
import { authService } from '../lib/auth';

const WORKOUT_TYPES = ['Endurance', 'Sprint', 'Mixed', 'Technique', 'Recovery'];
const DURATIONS = [30, 45, 60, 75, 90];

export default function AITrainer() {
  const { profile } = useUser();
  const [workoutType, setWorkoutType] = useState('Endurance');
  const [focus, setFocus] = useState('Endurance');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSets, setExpandedSets] = useState<number[]>([]);
  
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
  
  const handleGenerate = async () => {
    if (!profile.isPremium) {
      toast.info('This is a premium feature', {
        description: 'Upgrade to unlock AI-powered workout generation'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await authService.fetchWithAuth('/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({
          workout_type: workoutType,
          focus,
          duration_minutes: duration,
          notes: notes.trim() ? notes.trim() : undefined,
        }),
      });

      if (!res.ok) {
        const msg = await res
          .json()
          .then((body) => (typeof body?.error === 'string' ? body.error : null))
          .catch(() => null);
        throw new Error(msg || `Failed to generate workout (${res.status})`);
      }

      const workout = await res.json();
      setGeneratedWorkout(workout);
      toast.success('Workout generated!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate workout');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const toggleSetExpansion = (index: number) => {
    if (expandedSets.includes(index)) {
      setExpandedSets(expandedSets.filter(i => i !== index));
    } else {
      setExpandedSets([...expandedSets, index]);
    }
  };
  
  if (!profile.isPremium) {
    return (
      <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        {/* Header */}
        <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/more" className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
            </Link>
            <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">AI Trainer</h1>
          </div>
        </div>
        
        <div className="px-6">
          {/* Premium Gate */}
          <Card className="p-8 text-center bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 border-none">
            <Crown className="w-16 h-16 mx-auto mb-4 text-white" />
            <h2 className="text-2xl font-bold mb-2 text-white">Premium Feature</h2>
            <p className="text-white/90 mb-6">
              Upgrade to Premium to unlock AI-powered workout generation tailored to your goals
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
            
            <div className="mt-6 space-y-3 text-left">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-white" />
                  <div>
                    <p className="font-bold text-white">Custom Workouts</p>
                    <p className="text-xs text-white/80">AI generates personalized training</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-white" />
                  <div>
                    <p className="font-bold text-white">Focus-Based</p>
                    <p className="text-xs text-white/80">Target specific skills & strokes</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-white" />
                  <div>
                    <p className="font-bold text-white">Any Duration</p>
                    <p className="text-xs text-white/80">30-90 minute workouts</p>
                  </div>
                </div>
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
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">AI Trainer</h1>
        </div>
      </div>
      
      <div className="px-6 pb-6">
        {/* Input Form */}
        <Card className="mb-6 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white light:text-gray-900 mb-3 uppercase tracking-wider">
                Workout Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {WORKOUT_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setWorkoutType(type)}
                    className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                      workoutType === type
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-white light:text-gray-900 mb-3 uppercase tracking-wider">
                Focus Area
              </label>
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
              >
                {FOCUS_AREAS.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-white light:text-gray-900 mb-3 uppercase tracking-wider">
                Duration (minutes)
              </label>
              <div className="flex gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                      duration === d
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-white light:text-gray-900 mb-3 uppercase tracking-wider">
                Additional Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific goals or requests?"
                rows={3}
                className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 resize-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </Card>
        
        {/* Generate Button */}
        <Button onClick={handleGenerate} fullWidth size="lg" disabled={isGenerating}>
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Workout
            </span>
          )}
        </Button>
        
        {/* Generated Workout */}
        {generatedWorkout && (
          <div className="mt-6">
            <Card className="p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white light:text-gray-900">{generatedWorkout.title}</h2>
                  <p className="text-cyan-500 font-mono font-bold">{generatedWorkout.totalYards.toLocaleString()} yards</p>
                </div>
                <Sparkles className="w-8 h-8 text-cyan-500" />
              </div>
            </Card>
            
            {generatedWorkout.sets.map((set: any, idx: number) => {
              const isExpanded = expandedSets.includes(idx);
              return (
                <Card key={idx} className="mb-3">
                  <button
                    onClick={() => toggleSetExpansion(idx)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-left flex-1">
                      <h3 className="font-bold text-white light:text-gray-900 mb-1">{set.name}</h3>
                      <p className="text-sm text-gray-400 light:text-gray-600">{set.description}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-white/10 light:border-gray-200 pt-3">
                      {set.sets.map((s: string, i: number) => (
                        <div key={i} className="py-2 text-white light:text-gray-900 font-mono">
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}