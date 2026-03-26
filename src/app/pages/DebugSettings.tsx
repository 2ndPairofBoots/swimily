import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import Card from '../components/Card';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

export default function DebugSettings() {
  const { profile, preferences, notifications } = useUser();
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA] pb-20">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/profile" className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
          </Link>
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Debug: Current Settings</h1>
        </div>
        <p className="text-sm text-gray-400 light:text-gray-600">
          This page shows all your current settings in real-time. Changes you make in Settings, Edit Profile, or Notifications will appear here instantly.
        </p>
      </div>
      
      <div className="px-6">
        {/* Theme */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3 px-1">Theme</h3>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-white light:text-gray-900 font-semibold">Current Theme</span>
              <span className="text-cyan-500 font-mono font-bold">{theme.toUpperCase()}</span>
            </div>
          </Card>
        </div>
        
        {/* Profile Data */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3 px-1">Profile Data</h3>
          <Card className="divide-y divide-white/10 light:divide-gray-100">
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Name</span>
              <span className="text-white light:text-gray-900 font-semibold">{profile.name}</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Team</span>
              <span className="text-white light:text-gray-900 font-semibold">{profile.team || 'Not set'}</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Email</span>
              <span className="text-white light:text-gray-900 font-semibold">{profile.email}</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Age</span>
              <span className="text-white light:text-gray-900 font-semibold">{profile.age}</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Level</span>
              <span className="text-white light:text-gray-900 font-semibold">{profile.level}</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">XP</span>
              <span className="text-white light:text-gray-900 font-semibold">{profile.xp.toLocaleString()}</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Streak Days</span>
              <span className="text-white light:text-gray-900 font-semibold">{profile.streakDays}</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Premium</span>
              <span className={`font-semibold ${profile.isPremium ? 'text-yellow-500' : 'text-gray-500'}`}>
                {profile.isPremium ? 'Yes ✓' : 'No'}
              </span>
            </div>
          </Card>
        </div>
        
        {/* Preferences */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3 px-1">Preferences</h3>
          <Card className="divide-y divide-white/10 light:divide-gray-100">
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Distance Units</span>
              <span className="text-cyan-500 font-mono font-bold">{preferences.units.toUpperCase()}</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Preferred Course</span>
              <span className="text-purple-500 font-mono font-bold">{preferences.preferredCourse}</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Haptic Feedback</span>
              <span className={`font-semibold ${preferences.haptics ? 'text-green-500' : 'text-gray-500'}`}>
                {preferences.haptics ? 'Enabled ✓' : 'Disabled'}
              </span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Usage Analytics</span>
              <span className={`font-semibold ${preferences.analytics ? 'text-green-500' : 'text-gray-500'}`}>
                {preferences.analytics ? 'Enabled ✓' : 'Disabled'}
              </span>
            </div>
          </Card>
        </div>
        
        {/* Notifications */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3 px-1">Notifications</h3>
          <Card className="divide-y divide-white/10 light:divide-gray-100">
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Push Notifications</span>
              <span className={`font-semibold ${notifications.pushEnabled ? 'text-green-500' : 'text-gray-500'}`}>
                {notifications.pushEnabled ? 'Enabled ✓' : 'Disabled'}
              </span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Email Notifications</span>
              <span className={`font-semibold ${notifications.emailEnabled ? 'text-green-500' : 'text-gray-500'}`}>
                {notifications.emailEnabled ? 'Enabled ✓' : 'Disabled'}
              </span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Practice Reminders</span>
              <span className={`font-semibold ${notifications.practiceReminders ? 'text-green-500' : 'text-gray-500'}`}>
                {notifications.practiceReminders ? 'Enabled ✓' : 'Disabled'}
              </span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Achievements</span>
              <span className={`font-semibold ${notifications.achievements ? 'text-green-500' : 'text-gray-500'}`}>
                {notifications.achievements ? 'Enabled ✓' : 'Disabled'}
              </span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Weekly Reports</span>
              <span className={`font-semibold ${notifications.weeklyReports ? 'text-green-500' : 'text-gray-500'}`}>
                {notifications.weeklyReports ? 'Enabled ✓' : 'Disabled'}
              </span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">Meet Reminders</span>
              <span className={`font-semibold ${notifications.meetReminders ? 'text-green-500' : 'text-gray-500'}`}>
                {notifications.meetReminders ? 'Enabled ✓' : 'Disabled'}
              </span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400 light:text-gray-600">PR Alerts</span>
              <span className={`font-semibold ${notifications.prAlerts ? 'text-green-500' : 'text-gray-500'}`}>
                {notifications.prAlerts ? 'Enabled ✓' : 'Disabled'}
              </span>
            </div>
          </Card>
        </div>
        
        {/* Storage Info */}
        <Card className="p-6 bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border-cyan-500/30">
          <h3 className="text-lg font-bold text-white light:text-gray-900 mb-2">💾 Persistent Storage</h3>
          <p className="text-sm text-gray-300 light:text-gray-600 mb-3">
            All changes are automatically saved to localStorage and will persist even after refreshing the page or closing the browser.
          </p>
          <p className="text-xs text-gray-400 light:text-gray-600 font-mono">
            Storage Key: swimily_user_data
          </p>
        </Card>
      </div>
    </div>
  );
}
