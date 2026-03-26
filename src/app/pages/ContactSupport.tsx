import { useState } from 'react';
import { ArrowLeft, Mail, MessageSquare, Send } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import Card from '../components/Card';

const SUPPORT_CATEGORIES = [
  'Technical Issue',
  'Billing Question',
  'Feature Request',
  'Data Export',
  'Account Help',
  'Other'
];

export default function ContactSupport() {
  const [category, setCategory] = useState('Technical Issue');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    toast.success('Support ticket sent!', {
      description: 'We\'ll respond to you within 24 hours'
    });
    
    setSubject('');
    setMessage('');
  };
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA] pb-20">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/profile" className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
          </Link>
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Contact Support</h1>
        </div>
      </div>
      
      <div className="px-6">
        {/* Support Info */}
        <Card className="mb-6 p-6 bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border-cyan-500/30">
          <Mail className="w-12 h-12 text-cyan-500 mb-3" />
          <h2 className="text-xl font-bold text-white light:text-gray-900 mb-2">We're Here to Help</h2>
          <p className="text-sm text-gray-300 light:text-gray-600 mb-4">
            Our support team typically responds within 24 hours. For urgent issues, email us directly at support@swimily.app
          </p>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-300 light:text-gray-600">Usually responds in under 12 hours</span>
          </div>
        </Card>
        
        {/* Contact Form */}
        <Card className="mb-6">
          <div className="divide-y divide-white/10 light:divide-gray-100">
            {/* Category */}
            <div className="p-4">
              <label className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-5 h-5 text-cyan-500" />
                <span className="text-sm font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider">Category</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORT_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-2.5 px-3 rounded-lg font-bold text-xs transition-all ${
                      category === cat
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white/5 light:bg-gray-100 text-gray-400 light:text-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Subject */}
            <div className="p-4">
              <label className="text-sm font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider mb-2 block">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full px-4 py-3 bg-white/5 light:bg-gray-50 border border-white/10 light:border-gray-200 rounded-xl text-white light:text-gray-900 placeholder-gray-500 light:placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            
            {/* Message */}
            <div className="p-4">
              <label className="text-sm font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider mb-2 block">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={8}
                className="w-full px-4 py-3 bg-white/5 light:bg-gray-50 border border-white/10 light:border-gray-200 rounded-xl text-white light:text-gray-900 placeholder-gray-500 light:placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Include as much detail as possible to help us resolve your issue quickly
              </p>
            </div>
          </div>
        </Card>
        
        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-cyan-500 text-black rounded-xl font-bold text-lg hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          Send Message
        </button>
        
        {/* Alternative Contact */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 light:text-gray-600 mb-2">
            Or email us directly
          </p>
          <a
            href="mailto:support@swimily.app"
            className="text-cyan-500 hover:text-cyan-400 font-semibold text-sm"
          >
            support@swimily.app
          </a>
        </div>
      </div>
    </div>
  );
}
