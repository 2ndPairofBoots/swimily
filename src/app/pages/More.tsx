import { Link } from 'react-router';
import { 
  Calendar, 
  Trophy, 
  Timer, 
  Dumbbell, 
  BarChart3, 
  Sparkles, 
  Gift, 
  ChevronRight,
  Moon,
  Sun,
  Download
} from 'lucide-react';
import Card from '../components/Card';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';

export default function More() {
  const { theme, toggleTheme } = useTheme();
  
  const menuItems = [
    {
      title: 'Import Times',
      description: 'Upload from USA Swimming',
      icon: Download,
      path: '/import-times',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'Calendar',
      description: 'View practice history',
      icon: Calendar,
      path: '/calendar',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Meets',
      description: 'Manage upcoming meets',
      icon: Trophy,
      path: '/meets',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Race Splits',
      description: 'Calculate pacing',
      icon: Timer,
      path: '/race-splits',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Dryland',
      description: 'Log strength training',
      icon: Dumbbell,
      path: '/dryland',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Analytics',
      description: 'Track progress',
      icon: BarChart3,
      path: '/analytics',
      color: 'from-cyan-500 to-cyan-600',
      premium: true
    },
    {
      title: 'AI Trainer',
      description: 'Generate workouts',
      icon: Sparkles,
      path: '/ai-trainer',
      color: 'from-pink-500 to-pink-600',
      premium: true
    },
    {
      title: 'Rewards',
      description: 'Spin wheel & prizes',
      icon: Gift,
      path: '/rewards',
      color: 'from-red-500 to-red-600'
    }
  ];
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      {/* Header */}
      <div className="px-6 pt-16 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Logo size="sm" />
        </div>
        <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">More</h1>
      </div>
      
      <div className="px-6 -mt-3">
        {/* Theme Toggle */}
        <Card className="mb-6">
          <button
            onClick={toggleTheme}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm">
                {theme === 'dark' ? <Moon className="w-7 h-7" /> : <Sun className="w-7 h-7" />}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white light:text-gray-900 text-base">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </h3>
                <p className="text-sm text-gray-400 light:text-gray-600 font-medium">
                  {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
                </p>
              </div>
            </div>
            <div className={`w-14 h-8 rounded-full transition-colors ${theme === 'dark' ? 'bg-cyan-500' : 'bg-gray-300'} relative`}>
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </button>
        </Card>
        
        {/* Menu Items */}
        <div className="space-y-3 mb-8">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Card className="hover:border-cyan-500/50 transition-colors">
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`bg-gradient-to-br ${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-white light:text-gray-900 text-base">{item.title}</h3>
                        {item.premium && (
                          <span className="text-[9px] bg-purple-500/20 text-purple-400 light:bg-purple-100 light:text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 light:text-gray-600 font-medium">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 light:text-gray-400" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        
        {/* App Info */}
        <div className="mt-8 text-center pb-6">
          <p className="text-sm text-gray-400 light:text-gray-600 mb-1 font-mono">Swimily</p>
          <p className="text-xs text-gray-500 light:text-gray-500">Version 1.0.0</p>
          <p className="text-xs text-gray-500 light:text-gray-500 mt-2">Made for swimmers</p>
        </div>
      </div>
    </div>
  );
}