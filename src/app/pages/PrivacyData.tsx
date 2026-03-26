import { ArrowLeft, Download, Trash2, Shield, Eye, Database } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import Card from '../components/Card';

export default function PrivacyData() {
  const handleExportData = () => {
    toast.success('Data export started', { description: 'You will receive an email with your data shortly' });
  };
  
  const handleDeleteAccount = () => {
    toast.error('Account deletion', { description: 'Please contact support to delete your account' });
  };
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA] pb-20">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/profile" className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
          </Link>
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Privacy & Data</h1>
        </div>
      </div>
      
      <div className="px-6">
        {/* Privacy Overview */}
        <Card className="mb-6 p-6 bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border-cyan-500/30">
          <Shield className="w-12 h-12 text-cyan-500 mb-3" />
          <h2 className="text-xl font-bold text-white light:text-gray-900 mb-2">Your Privacy Matters</h2>
          <p className="text-sm text-gray-300 light:text-gray-600">
            We take your privacy seriously. Your swimming data is encrypted and stored securely. We never sell your personal information to third parties.
          </p>
        </Card>
        
        {/* Data Management */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3 px-1">Data Management</h3>
          <Card>
            <div className="divide-y divide-white/10 light:divide-gray-100">
              <button
                onClick={handleExportData}
                className="w-full p-4 flex items-center gap-4 hover:bg-white/5 light:hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Download className="w-5 h-5 text-cyan-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white light:text-gray-900">Export My Data</p>
                  <p className="text-sm text-gray-400 light:text-gray-600">Download all your swimming data</p>
                </div>
              </button>
              
              <div className="p-4">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-white light:text-gray-900">Data Storage</p>
                    <p className="text-sm text-gray-400 light:text-gray-600">Approximately 2.4 MB used</p>
                  </div>
                </div>
                <div className="h-2 bg-white/10 light:bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" style={{ width: '24%' }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Privacy Settings */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3 px-1">Privacy Settings</h3>
          <Card>
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white light:text-gray-900">Profile Visibility</p>
                  <p className="text-sm text-gray-400 light:text-gray-600">Control who can see your profile</p>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full py-2.5 px-4 bg-cyan-500 text-black rounded-lg font-bold text-sm">
                  Private
                </button>
                <button className="w-full py-2.5 px-4 bg-white/5 light:bg-gray-100 text-gray-400 light:text-gray-600 rounded-lg font-bold text-sm">
                  Team Only
                </button>
                <button className="w-full py-2.5 px-4 bg-white/5 light:bg-gray-100 text-gray-400 light:text-gray-600 rounded-lg font-bold text-sm">
                  Public
                </button>
              </div>
            </div>
          </Card>
        </div>
        
        {/* What We Collect */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-3 px-1">What We Collect</h3>
          <Card className="p-4">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white light:text-gray-900">Practice Data</p>
                  <p className="text-gray-400 light:text-gray-600">Times, distances, and workout details</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white light:text-gray-900">Profile Information</p>
                  <p className="text-gray-400 light:text-gray-600">Name, team, and basic details</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white light:text-gray-900">Usage Analytics</p>
                  <p className="text-gray-400 light:text-gray-600">Anonymous app usage to improve features</p>
                </div>
              </li>
            </ul>
          </Card>
        </div>
        
        {/* Danger Zone */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 px-1">Danger Zone</h3>
          <Card className="border-red-500/30">
            <button
              onClick={handleDeleteAccount}
              className="w-full p-4 flex items-center gap-4 hover:bg-red-500/10 transition-colors"
            >
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-red-500">Delete Account</p>
                <p className="text-sm text-gray-400 light:text-gray-600">Permanently delete your account and all data</p>
              </div>
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
