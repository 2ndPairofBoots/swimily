import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Mail, Trophy, Zap, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import Card from '../components/Card';
import { useUser } from '../contexts/UserContext';

export default function Notifications() {
  const { notifications, updateNotifications } = useUser();
  
  const [pushEnabled, setPushEnabled] = useState(notifications.pushEnabled);
  const [emailEnabled, setEmailEnabled] = useState(notifications.emailEnabled);
  const [practiceReminders, setPracticeReminders] = useState(notifications.practiceReminders);
  const [achievements, setAchievements] = useState(notifications.achievements);
  const [weeklyReports, setWeeklyReports] = useState(notifications.weeklyReports);
  const [meetReminders, setMeetReminders] = useState(notifications.meetReminders);
  const [prAlerts, setPrAlerts] = useState(notifications.prAlerts);
  
  // Update local state when notifications change
  useEffect(() => {
    setPushEnabled(notifications.pushEnabled);
    setEmailEnabled(notifications.emailEnabled);
    setPracticeReminders(notifications.practiceReminders);
    setAchievements(notifications.achievements);
    setWeeklyReports(notifications.weeklyReports);
    setMeetReminders(notifications.meetReminders);
    setPrAlerts(notifications.prAlerts);
  }, [notifications]);
  
  const handleSave = () => {
    updateNotifications({
      pushEnabled,
      emailEnabled,
      practiceReminders,
      achievements,
      weeklyReports,
      meetReminders,
      prAlerts,
    });
    toast.success('Notification settings saved', {
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
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Notifications</h1>
        </div>
      </div>
      
      <div className="px-6">
        {/* Notification Channels */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3 px-1">Channels</h3>
          <Card>
            <div className="divide-y divide-white/10 light:divide-gray-100">
              <button
                onClick={() => setPushEnabled(!pushEnabled)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-cyan-500" />
                  <div className="text-left">
                    <p className="font-semibold text-white light:text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-400 light:text-gray-600">Receive notifications on your device</p>
                  </div>
                </div>
                <div className={`w-14 h-8 rounded-full relative transition-colors ${pushEnabled ? 'bg-cyan-500' : 'bg-gray-600 light:bg-gray-300'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${pushEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </button>
              
              <button
                onClick={() => setEmailEnabled(!emailEnabled)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <p className="font-semibold text-white light:text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-400 light:text-gray-600">Receive updates via email</p>
                  </div>
                </div>
                <div className={`w-14 h-8 rounded-full relative transition-colors ${emailEnabled ? 'bg-purple-500' : 'bg-gray-600 light:bg-gray-300'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${emailEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </button>
            </div>
          </Card>
        </div>
        
        {/* Notification Types */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3 px-1">What to Notify</h3>
          <Card>
            <div className="divide-y divide-white/10 light:divide-gray-100">
              <button
                onClick={() => setPracticeReminders(!practiceReminders)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-cyan-500" />
                  <div className="text-left">
                    <p className="font-semibold text-white light:text-gray-900">Practice Reminders</p>
                    <p className="text-sm text-gray-400 light:text-gray-600">Daily reminder to log practice</p>
                  </div>
                </div>
                <div className={`w-14 h-8 rounded-full relative transition-colors ${practiceReminders ? 'bg-cyan-500' : 'bg-gray-600 light:bg-gray-300'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${practiceReminders ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </button>
              
              <button
                onClick={() => setAchievements(!achievements)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div className="text-left">
                    <p className="font-semibold text-white light:text-gray-900">Achievements</p>
                    <p className="text-sm text-gray-400 light:text-gray-600">Level ups and milestones</p>
                  </div>
                </div>
                <div className={`w-14 h-8 rounded-full relative transition-colors ${achievements ? 'bg-yellow-500' : 'bg-gray-600 light:bg-gray-300'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${achievements ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </button>
              
              <button
                onClick={() => setPrAlerts(!prAlerts)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <div className="text-left">
                    <p className="font-semibold text-white light:text-gray-900">Personal Records</p>
                    <p className="text-sm text-gray-400 light:text-gray-600">Notify when you set a new PR</p>
                  </div>
                </div>
                <div className={`w-14 h-8 rounded-full relative transition-colors ${prAlerts ? 'bg-orange-500' : 'bg-gray-600 light:bg-gray-300'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${prAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </button>
              
              <button
                onClick={() => setMeetReminders(!meetReminders)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <div className="text-left">
                    <p className="font-semibold text-white light:text-gray-900">Meet Reminders</p>
                    <p className="text-sm text-gray-400 light:text-gray-600">Upcoming swim meets</p>
                  </div>
                </div>
                <div className={`w-14 h-8 rounded-full relative transition-colors ${meetReminders ? 'bg-green-500' : 'bg-gray-600 light:bg-gray-300'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${meetReminders ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </button>
              
              <button
                onClick={() => setWeeklyReports(!weeklyReports)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <p className="font-semibold text-white light:text-gray-900">Weekly Reports</p>
                    <p className="text-sm text-gray-400 light:text-gray-600">Training summary every week</p>
                  </div>
                </div>
                <div className={`w-14 h-8 rounded-full relative transition-colors ${weeklyReports ? 'bg-purple-500' : 'bg-gray-600 light:bg-gray-300'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${weeklyReports ? 'translate-x-7' : 'translate-x-1'}`} />
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