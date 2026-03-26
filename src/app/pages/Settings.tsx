import { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Sun, Ruler, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import Card from '../components/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { preferences, updatePreferences } = useUser();
  
  const [units, setUnits] = useState(preferences.units);
  const [preferredCourse, setPreferredCourse] = useState(preferences.preferredCourse);
  const [haptics, setHaptics] = useState(preferences.haptics);
  const [analytics, setAnalytics] = useState(preferences.analytics);
  
  // Update local state when preferences change
  useEffect(() => {
    setUnits(preferences.units);
    setPreferredCourse(preferences.preferredCourse);
    setHaptics(preferences.haptics);
    setAnalytics(preferences.analytics);
  }, [preferences]);
  
  const handleSave = () => {
    updatePreferences({
      units,
      preferredCourse,
      haptics,
      analytics,
    });
    toast.success('Settings saved successfully', {
      description: 'Your preferences have been updated'
    });
  };
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA] pb-20">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/profile" className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
          </Link>
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Settings</h1>
        </div>
      </div>
      
      <div className="px-6">
        {/* Appearance */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3 px-1">Appearance</h3>
          <Card>
            <button
              onClick={toggleTheme}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-cyan-500" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
                <div className="text-left">
                  <p className="font-semibold text-white light:text-gray-900">Theme</p>
                  <p className="text-sm text-gray-400 light:text-gray-600">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                </div>
              </div>
              <div className={`w-14 h-8 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-cyan-500' : 'bg-gray-300'}`}>
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </button>
          </Card>
        </div>
        
        {/* Units & Preferences */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3 px-1">Units & Preferences</h3>
          <Card>
            <div className="divide-y divide-white/10 light:divide-gray-100">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Ruler className="w-5 h-5 text-cyan-500" />
                  <p className="font-semibold text-white light:text-gray-900">Distance Units</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setUnits('yards')}
                    className={`py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
                      units === 'yards'
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white/5 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    }`}
                  >
                    Yards
                  </button>
                  <button
                    onClick={() => setUnits('meters')}
                    className={`py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
                      units === 'meters'
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white/5 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    }`}
                  >
                    Meters
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <p className="font-semibold text-white light:text-gray-900">Preferred Course</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPreferredCourse('SCY')}
                    className={`py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
                      preferredCourse === 'SCY'
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    }`}
                  >
                    SCY
                  </button>
                  <button
                    onClick={() => setPreferredCourse('LCM')}
                    className={`py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
                      preferredCourse === 'LCM'
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    }`}
                  >
                    LCM
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* App Behavior */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3 px-1">App Behavior</h3>
          <Card>
            <div className="divide-y divide-white/10 light:divide-gray-100">
              <button
                onClick={() => setHaptics(!haptics)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <div className="text-left">
                  <p className="font-semibold text-white light:text-gray-900">Haptic Feedback</p>
                  <p className="text-sm text-gray-400 light:text-gray-600">Vibrate on interactions</p>
                </div>
                <div className={`w-14 h-8 rounded-full relative transition-colors ${haptics ? 'bg-cyan-500' : 'bg-gray-600 light:bg-gray-300'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${haptics ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </button>
              
              <button
                onClick={() => setAnalytics(!analytics)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <div className="text-left">
                  <p className="font-semibold text-white light:text-gray-900">Usage Analytics</p>
                  <p className="text-sm text-gray-400 light:text-gray-600">Help improve Swimily</p>
                </div>
                <div className={`w-14 h-8 rounded-full relative transition-colors ${analytics ? 'bg-cyan-500' : 'bg-gray-600 light:bg-gray-300'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${analytics ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </button>
            </div>
          </Card>
        </div>
        
        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-cyan-500 text-black rounded-xl font-bold text-lg hover:bg-cyan-400 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}