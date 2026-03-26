import { useState } from 'react';
import { Dumbbell, Clock, Plus, Trash2, Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { XP_DRYLAND_BASE } from '../lib/constants';
import Card from '../components/Card';
import Button from '../components/Button';

const EQUIPMENT_OPTIONS = [
  { id: 'none', name: 'No Equipment', icon: '🤸' },
  { id: 'dumbbells', name: 'Dumbbells', icon: '🏋️' },
  { id: 'bands', name: 'Resistance Bands', icon: '💪' },
  { id: 'pullup-bar', name: 'Pull-up Bar', icon: '🎯' },
  { id: 'bench', name: 'Bench', icon: '🪑' },
  { id: 'kettlebell', name: 'Kettlebell', icon: '⚙️' },
  { id: 'medicine-ball', name: 'Medicine Ball', icon: '⚽' },
  { id: 'box', name: 'Plyo Box', icon: '📦' },
];

const COMMON_EXERCISES = [
  'Push-ups', 'Pull-ups', 'Squats', 'Lunges', 'Planks', 'Burpees',
  'Mountain Climbers', 'Jump Squats', 'Dips', 'Rows', 'Deadlifts',
  'Shoulder Press', 'Bicep Curls', 'Tricep Extensions', 'Leg Raises',
  'Russian Twists', 'Box Jumps', 'Wall Sits', 'Crunches', 'Superman'
];

export default function Dryland() {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [exercises, setExercises] = useState<string[]>([]);
  const [customExercise, setCustomExercise] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  
  const toggleEquipment = (equipmentId: string) => {
    if (selectedEquipment.includes(equipmentId)) {
      setSelectedEquipment(selectedEquipment.filter(e => e !== equipmentId));
    } else {
      setSelectedEquipment([...selectedEquipment, equipmentId]);
    }
  };
  
  const addExercise = (exercise: string) => {
    if (!exercises.includes(exercise)) {
      setExercises([...exercises, exercise]);
    }
  };
  
  const addCustomExercise = () => {
    if (customExercise.trim() && !exercises.includes(customExercise.trim())) {
      setExercises([...exercises, customExercise.trim()]);
      setCustomExercise('');
    }
  };
  
  const removeExercise = (exercise: string) => {
    setExercises(exercises.filter(e => e !== exercise));
  };
  
  const handleSave = () => {
    if (exercises.length === 0) {
      toast.error('Add at least one exercise');
      return;
    }
    
    if (!duration) {
      toast.error('Enter workout duration');
      return;
    }
    
    const xpBonus = calories ? Math.floor(parseInt(calories) / 10) : 0;
    const totalXP = XP_DRYLAND_BASE + xpBonus;
    
    toast.success(`Dryland logged! +${totalXP} XP earned`, {
      description: `${exercises.length} exercises, ${duration} minutes`
    });
    
    // Reset form
    setExercises([]);
    setSelectedEquipment([]);
    setDuration('');
    setCalories('');
    setNotes('');
  };
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/more" className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
          </Link>
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Dryland</h1>
        </div>
      </div>
      
      <div className="px-6 pb-6">
        {/* Equipment Selection */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3">Select Equipment</h2>
          <div className="grid grid-cols-2 gap-2">
            {EQUIPMENT_OPTIONS.map(equipment => (
              <button
                key={equipment.id}
                onClick={() => toggleEquipment(equipment.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedEquipment.includes(equipment.id)
                    ? 'bg-cyan-500/20 border-cyan-500 light:bg-cyan-50'
                    : 'bg-white/5 light:bg-white border-white/10 light:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{equipment.icon}</span>
                  <div className="text-left flex-1">
                    <p className={`text-sm font-bold ${
                      selectedEquipment.includes(equipment.id)
                        ? 'text-cyan-500'
                        : 'text-white light:text-gray-900'
                    }`}>
                      {equipment.name}
                    </p>
                  </div>
                  {selectedEquipment.includes(equipment.id) && (
                    <Check className="w-5 h-5 text-cyan-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Exercises */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3">Exercises</h2>
          
          {/* Selected Exercises */}
          {exercises.length > 0 && (
            <div className="mb-4">
              <Card className="p-4">
                <div className="flex flex-wrap gap-2">
                  {exercises.map(exercise => (
                    <div
                      key={exercise}
                      className="flex items-center gap-2 bg-cyan-500/20 light:bg-cyan-50 border border-cyan-500/50 light:border-cyan-200 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm font-bold text-cyan-500">{exercise}</span>
                      <button
                        onClick={() => removeExercise(exercise)}
                        className="text-cyan-500 hover:text-cyan-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
          
          {/* Add Custom Exercise */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={customExercise}
                onChange={(e) => setCustomExercise(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomExercise()}
                placeholder="Add custom exercise..."
                className="flex-1 px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={addCustomExercise}
                className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center hover:bg-cyan-400 transition-colors"
              >
                <Plus className="w-6 h-6 text-black" />
              </button>
            </div>
          </div>
          
          {/* Common Exercises */}
          <div className="flex flex-wrap gap-2">
            {COMMON_EXERCISES.filter(e => !exercises.includes(e)).map(exercise => (
              <button
                key={exercise}
                onClick={() => addExercise(exercise)}
                className="px-3 py-2 bg-white/10 light:bg-gray-100 rounded-lg text-sm font-medium text-gray-400 light:text-gray-600 hover:bg-white/20 light:hover:bg-gray-200 transition-colors"
              >
                + {exercise}
              </button>
            ))}
          </div>
        </div>
        
        {/* Workout Details */}
        <Card className="mb-6 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white light:text-gray-900 mb-3 uppercase tracking-wider">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="45"
                className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-mono font-bold text-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-white light:text-gray-900 mb-3 uppercase tracking-wider">
                Calories Burned (optional)
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="350"
                className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-mono font-bold text-lg focus:ring-2 focus:ring-cyan-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                From Apple Health or manual entry
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-white light:text-gray-900 mb-3 uppercase tracking-wider">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did you feel?"
                rows={3}
                className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 resize-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </Card>
        
        {/* XP Preview */}
        {exercises.length > 0 && duration && (
          <Card className="mb-6 p-4 bg-purple-500/10 light:bg-purple-50 border-purple-500/30 light:border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-purple-500 light:text-purple-700">XP Reward</p>
                <p className="text-xs text-gray-400 light:text-gray-600">
                  Base {XP_DRYLAND_BASE} XP + bonus
                </p>
              </div>
              <div className="text-3xl font-bold text-purple-500 light:text-purple-700 font-mono">
                +{XP_DRYLAND_BASE + (calories ? Math.floor(parseInt(calories) / 10) : 0)}
              </div>
            </div>
          </Card>
        )}
        
        {/* Save Button */}
        <Button onClick={handleSave} fullWidth size="lg">
          Log Dryland Workout
        </Button>
      </div>
    </div>
  );
}
