import { useRef, useState } from 'react';
import { Plus, X, FileText, Camera } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../components/Button';
import Card from '../components/Card';
import { PracticeSet } from '../lib/types';
import { parseWorkoutText } from '../lib/workout-parser';
import { calculateTotalYards, calculateXPForYards } from '../lib/swim-utils';
import { STROKES, EFFORT_LEVELS, DISTANCES, FOCUS_AREAS } from '../lib/constants';
import { useUser } from '../contexts/UserContext';
import { createPractice } from '../lib/practices-api';
import { authService } from '../lib/auth';

export default function Log() {
  const [activeTab, setActiveTab] = useState<'manual' | 'paste' | 'photo'>('manual');
  const [sets, setSets] = useState<PracticeSet[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // Practice details
  const [focus, setFocus] = useState('Endurance');
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const { profile, preferences } = useUser();
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  
  const totalYards = calculateTotalYards(sets);
  const xpToEarn = calculateXPForYards(totalYards);
  
  const addSet = () => {
    const newSet: PracticeSet = {
      id: crypto.randomUUID(),
      distance: 100,
      repetitions: 1,
      stroke: 'Free',
      effort: 'Moderate',
    };
    setSets([...sets, newSet]);
  };
  
  const updateSet = (id: string, updates: Partial<PracticeSet>) => {
    setSets(sets.map(set => set.id === id ? { ...set, ...updates } : set));
  };
  
  const deleteSet = (id: string) => {
    setSets(sets.filter(set => set.id !== id));
  };
  
  const handleParse = () => {
    if (!pasteText.trim()) {
      toast.error('Please enter workout text');
      return;
    }
    
    const parsed = parseWorkoutText(pasteText);
    if (parsed.length === 0) {
      toast.error('Could not parse workout text');
      return;
    }
    
    setSets(parsed);
    setActiveTab('manual');
    toast.success(`Parsed ${parsed.length} sets`);
  };
  
  const handlePhotoScanFile = async (file: File) => {
    if (!profile.isPremium) {
      toast.info('Photo scanning is a premium feature', {
        description: 'Upgrade to unlock AI photo workout scanning',
      });
      return;
    }

    setIsScanning(true);
    try {
      // MVP endpoint ignores actual image content for now; we still send minimal metadata.
      const res = await authService.fetchWithAuth('/api/ocr-scan', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name }),
      });

      if (!res.ok) {
        const msg = await res
          .json()
          .then((body) => (typeof body?.error === 'string' ? body.error : null))
          .catch(() => null);
        toast.error(msg || `Photo scan failed (${res.status})`);
        return;
      }

      toast.success('Photo scan complete!');
      // TODO: Map OCR result into sets + allow user to edit before saving practice.
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Photo scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handlePhotoUploadClick = () => {
    if (isScanning) return;
    photoInputRef.current?.click();
  };
  
  const handleSave = () => {
    if (sets.length === 0) {
      toast.error('Add at least one set');
      return;
    }
    
    if (!duration) {
      toast.error('Enter practice duration');
      return;
    }
    
    const durationNum = parseInt(duration, 10);
    if (!Number.isFinite(durationNum) || durationNum <= 0) {
      toast.error('Enter a valid duration (minutes)');
      return;
    }

    setIsSaving(true);

    (async () => {
      try {
        await createPractice({
          date: new Date().toISOString(),
          totalYards,
          duration: durationNum,
          course: preferences.preferredCourse,
          focus,
          intensity: timeOfDay,
          notes,
          xpEarned: xpToEarn,
          sets: sets.map((s) => ({
            distance: s.distance,
            repetitions: s.repetitions,
            stroke: s.stroke,
            effort: s.effort,
            interval: s.interval,
            notes: s.notes,
          })),
        });

        toast.success(`Workout logged! +${xpToEarn} XP`, {
          description: `${(totalYards / 1000).toFixed(1)}k yards in ${durationNum} min`,
        });

        // Reset form
        setSets([]);
        setNotes('');
        setDuration('');
        setPasteText('');
        setFocus('Endurance');
        setTimeOfDay('Morning');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save workout');
      } finally {
        setIsSaving(false);
      }
    })();

  };
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight mb-4">Log Workout</h1>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'manual'
                ? 'bg-cyan-500 text-black'
                : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'paste'
                ? 'bg-cyan-500 text-black'
                : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'photo'
                ? 'bg-cyan-500 text-black'
                : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
            }`}
          >
            <Camera className="w-4 h-4" />
            Photo
          </button>
        </div>
      </div>
      
      <div className="px-6">
        {/* Paste Tab */}
        {activeTab === 'paste' && (
          <div className="mb-6">
            <label className="block text-sm font-bold text-white mb-3">
              Paste Workout Text
            </label>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="8 x 100 Free @ 1:30&#10;4 x 200 IM on 3:00&#10;10 x 50 Fly :45"
              className="w-full h-48 px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl resize-none text-white font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <Button onClick={handleParse} fullWidth variant="primary" size="lg" className="mt-3">
              Parse Workout
            </Button>
          </div>
        )}
        
        {/* Photo Tab */}
        {activeTab === 'photo' && (
          <div className="mb-6">
            <Card className="border-2 border-dashed border-white/20">
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-cyan-500" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">AI Photo Scanning</h3>
                <p className="text-gray-400 text-sm mb-6">Scan whiteboard workouts</p>
                <div className="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-full text-xs font-bold mb-6 uppercase tracking-wide">
                  Premium
                </div>
                <div>
                  <Button
                    onClick={handlePhotoUploadClick}
                    fullWidth
                    size="lg"
                    disabled={isScanning}
                  >
                    {isScanning ? 'Scanning…' : 'Upload Photo'}
                  </Button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handlePhotoScanFile(file);
                      // Allow selecting the same file again.
                      e.currentTarget.value = '';
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {/* Practice Details Form */}
        {activeTab === 'manual' && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Practice Details</h2>
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Focus</label>
                  <select
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-bold focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    {FOCUS_AREAS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Time</label>
                  <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-bold focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Duration (min)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="90"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-mono text-lg font-bold focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </Card>
          </div>
        )}
        
        {/* Sets List */}
        {activeTab === 'manual' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Sets ({sets.length})</h2>
              <button
                onClick={addSet}
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 text-black rounded-xl font-bold text-sm hover:bg-cyan-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Set
              </button>
            </div>
            
            <div className="space-y-3">
              {sets.map((set, index) => (
                <Card key={set.id}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">Set {index + 1}</span>
                      <button
                        onClick={() => deleteSet(set.id)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2">Reps</label>
                        <input
                          type="number"
                          value={set.repetitions}
                          onChange={(e) => updateSet(set.id, { repetitions: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-mono font-bold focus:ring-2 focus:ring-cyan-500"
                          min="1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2">Distance</label>
                        <select
                          value={set.distance}
                          onChange={(e) => updateSet(set.id, { distance: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-mono font-bold focus:ring-2 focus:ring-cyan-500"
                        >
                          {DISTANCES.map(d => (
                            <option key={d} value={d}>{d}y</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2">Stroke</label>
                        <select
                          value={set.stroke}
                          onChange={(e) => updateSet(set.id, { stroke: e.target.value })}
                          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-bold focus:ring-2 focus:ring-cyan-500"
                        >
                          {STROKES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2">Effort</label>
                        <select
                          value={set.effort}
                          onChange={(e) => updateSet(set.id, { effort: e.target.value })}
                          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-bold focus:ring-2 focus:ring-cyan-500"
                        >
                          {EFFORT_LEVELS.map(e => (
                            <option key={e} value={e}>{e}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-400 mb-2">Interval</label>
                      <input
                        type="text"
                        value={set.interval || ''}
                        onChange={(e) => updateSet(set.id, { interval: e.target.value || undefined })}
                        placeholder="1:30"
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-mono focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-sm font-mono text-gray-400">
                        Total: <span className="text-white font-bold">{(set.distance * set.repetitions).toLocaleString()}</span> yards
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              
              {sets.length === 0 && (
                <Card className="border-2 border-dashed border-white/20">
                  <div className="p-12 text-center">
                    <Plus className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400 font-semibold mb-4">No sets added</p>
                    <Button onClick={addSet} icon={Plus} size="lg">
                      Add First Set
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
        
        {/* Notes & Summary */}
        {sets.length > 0 && activeTab === 'manual' && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-bold text-white mb-3">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the workout feel?"
                className="w-full h-24 px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl resize-none text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            
            {/* Summary */}
            <Card className="mb-6 bg-cyan-500/10 border-cyan-500/30">
              <div className="p-6">
                <p className="text-xs font-bold text-cyan-500/70 uppercase tracking-wider mb-4 font-mono">Workout Summary</p>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 font-mono mb-1">Total Distance</p>
                    <p className="text-4xl font-bold text-white font-mono">{(totalYards / 1000).toFixed(1)}k</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 font-mono mb-1">XP Earned</p>
                    <p className="text-3xl font-bold text-cyan-500 font-mono">+{xpToEarn}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-xs text-gray-400 mb-1 font-mono">TOTAL SETS</p>
                    <p className="text-xl font-bold text-white font-mono">{sets.length}</p>
                  </div>
                  {duration && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1 font-mono">YD/HR</p>
                      <p className="text-xl font-bold text-white font-mono">{Math.round((totalYards / parseInt(duration)) * 60)}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            
            {/* Save Button */}
            <Button onClick={handleSave} fullWidth size="lg" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save Workout'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}