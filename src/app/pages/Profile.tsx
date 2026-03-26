import { ChevronRight, Trophy, Zap, Flame, Award, Crown, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import Card from '../components/Card';
import Logo from '../components/Logo';
import { useUser } from '../contexts/UserContext';
import { getLevelTitle, getProgressToNextLevel } from '../lib/swim-utils';
import { authService } from '../lib/auth';

export default function Profile() {
  const { profile, resetUser } = useUser();
  const navigate = useNavigate();
  
  const progress = getProgressToNextLevel(profile.xp);
  
  const handleSignOut = async () => {
    try {
      await authService.logout();
      toast.success('Signed out successfully', { description: 'See you at the pool!' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign out failed');
    } finally {
      resetUser();
      navigate('/login');
    }
  };
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-[#111111] dark:bg-[#111111] light:bg-white px-6 pt-16 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Logo size="sm" />
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Profile</h1>
          <Link 
            to="/settings"
            className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-5 h-5 text-white light:text-gray-600" />
          </Link>
        </div>
      </div>
      
      <div className="px-6 -mt-3">
        {/* Profile Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 light:from-cyan-500 light:to-cyan-600 p-6 text-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg border border-white/30">
                {profile.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold tracking-tight">{profile.name}</h2>
                <p className="text-white/90 font-medium">{getLevelTitle(profile.level)}</p>
                {profile.team && (
                  <p className="text-sm text-white/70 mt-0.5">{profile.team}</p>
                )}
              </div>
            </div>
            
            {/* Level Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/80 font-medium">Level {profile.level}</span>
                <span className="text-white font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-white/70 mt-2 font-medium">
                {profile.xp.toLocaleString()} XP • Next level at {((Math.floor(profile.xp / 1000) + 1) * 1000).toLocaleString()} XP
              </p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-xl font-bold font-mono">{profile.level}</p>
                <p className="text-[10px] text-white/70 uppercase font-semibold tracking-wide">Level</p>
              </div>
              <div className="text-center">
                <Zap className="w-5 h-5 text-white mx-auto mb-1" />
                <p className="text-xl font-bold font-mono">{(profile.xp / 1000).toFixed(1)}k</p>
                <p className="text-[10px] text-white/70 uppercase font-semibold tracking-wide">XP</p>
              </div>
              <div className="text-center">
                <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="text-xl font-bold font-mono">{profile.streakDays}</p>
                <p className="text-[10px] text-white/70 uppercase font-semibold tracking-wide">Streak</p>
              </div>
              <div className="text-center">
                <Award className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-xl font-bold font-mono">12</p>
                <p className="text-[10px] text-white/70 uppercase font-semibold tracking-wide">PRs</p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Premium Upgrade */}
        {!profile.isPremium && (
          <Link to="/rewards" className="block mb-6">
            <Card className="overflow-hidden hover:border-purple-500/50 transition-all">
              <div className="p-5 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white tracking-tight">Go Premium</h3>
                    <p className="text-white/90 text-sm font-medium">Unlock all features & insights</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </Link>
        )}
        
        {/* Account Settings */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3 px-1">Account</h3>
          <Card>
            <div className="divide-y divide-white/10 light:divide-gray-100">
              <Link 
                to="/edit-profile"
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-white light:text-gray-900">Edit Profile</span>
                <ChevronRight className="w-5 h-5 text-gray-500 light:text-gray-400" />
              </Link>
              
              <Link 
                to="/settings"
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-white light:text-gray-900">Preferences</span>
                <ChevronRight className="w-5 h-5 text-gray-500 light:text-gray-400" />
              </Link>
              
              <Link 
                to="/notifications"
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-white light:text-gray-900">Notifications</span>
                <ChevronRight className="w-5 h-5 text-gray-500 light:text-gray-400" />
              </Link>
              
              <Link 
                to="/privacy-data"
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-white light:text-gray-900">Privacy & Data</span>
                <ChevronRight className="w-5 h-5 text-gray-500 light:text-gray-400" />
              </Link>
            </div>
          </Card>
        </div>
        
        {/* Support */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3 px-1">Support</h3>
          <Card>
            <div className="divide-y divide-white/10 light:divide-gray-100">
              <Link 
                to="/help-center"
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-white light:text-gray-900">Help Center</span>
                <ChevronRight className="w-5 h-5 text-gray-500 light:text-gray-400" />
              </Link>
              
              <Link 
                to="/contact-support"
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-white light:text-gray-900">Contact Support</span>
                <ChevronRight className="w-5 h-5 text-gray-500 light:text-gray-400" />
              </Link>
              
              <Link 
                to="/terms-privacy"
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-white light:text-gray-900">Terms & Privacy</span>
                <ChevronRight className="w-5 h-5 text-gray-500 light:text-gray-400" />
              </Link>
            </div>
          </Card>
        </div>
        
        {/* Sign Out */}
        <button 
          onClick={handleSignOut}
          className="w-full py-4 bg-white/10 light:bg-white border border-white/20 light:border-gray-200 text-red-500 light:text-red-600 rounded-xl font-semibold hover:bg-red-500/10 light:hover:bg-red-50 transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
        
        {/* Debug Settings Link */}
        <Link 
          to="/debug-settings"
          className="block w-full py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 rounded-xl font-semibold hover:bg-cyan-500/20 transition-colors text-center mb-4"
        >
          🔍 View Current Settings (Debug)
        </Link>
        
        {/* Version */}
        <p className="text-center text-sm text-gray-500 light:text-gray-600 mb-6">
          Swimily v1.0.0
        </p>
      </div>
    </div>
  );
}