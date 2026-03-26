import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, User, Users, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import Card from '../components/Card';
import { useUser } from '../contexts/UserContext';

export default function EditProfile() {
  const { profile, updateProfile } = useUser();
  const navigate = useNavigate();
  
  const [name, setName] = useState(profile.name);
  const [team, setTeam] = useState(profile.team || '');
  const [email, setEmail] = useState(profile.email);
  const [age, setAge] = useState(profile.age);
  
  // Update local state when profile changes
  useEffect(() => {
    setName(profile.name);
    setTeam(profile.team || '');
    setEmail(profile.email);
    setAge(profile.age);
  }, [profile]);
  
  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    updateProfile({
      name: name.trim(),
      team: team.trim(),
      email: email.trim(),
      age: age.trim(),
    });
    
    toast.success('Profile updated successfully', {
      description: 'Your changes have been saved'
    });
    
    // Navigate back to profile after a short delay
    setTimeout(() => {
      navigate('/profile');
    }, 1000);
  };
  
  const handlePhotoUpload = () => {
    toast.info('Photo upload', { description: 'Camera integration coming soon!' });
  };
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA] pb-20">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/profile" className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
          </Link>
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Edit Profile</h1>
        </div>
      </div>
      
      <div className="px-6">
        {/* Profile Photo */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={handlePhotoUpload}
            className="relative group"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-600 to-cyan-700 light:from-cyan-500 light:to-cyan-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {name.charAt(0)}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </button>
        </div>
        
        {/* Form Fields */}
        <Card className="mb-6">
          <div className="divide-y divide-white/10 light:divide-gray-100">
            {/* Name */}
            <div className="p-4">
              <label className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-cyan-500" />
                <span className="text-sm font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider">Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 light:bg-gray-50 border border-white/10 light:border-gray-200 rounded-xl text-white light:text-gray-900 font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
            
            {/* Team */}
            <div className="p-4">
              <label className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider">Team</span>
              </label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 light:bg-gray-50 border border-white/10 light:border-gray-200 rounded-xl text-white light:text-gray-900 font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter your team"
              />
            </div>
            
            {/* Email */}
            <div className="p-4">
              <label className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-green-500" />
                <span className="text-sm font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider">Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 light:bg-gray-50 border border-white/10 light:border-gray-200 rounded-xl text-white light:text-gray-900 font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            
            {/* Age */}
            <div className="p-4">
              <label className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider">Age</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 light:bg-gray-50 border border-white/10 light:border-gray-200 rounded-xl text-white light:text-gray-900 font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter your age"
              />
            </div>
          </div>
        </Card>
        
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