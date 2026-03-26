import { useState } from 'react';
import { ArrowLeft, Upload, Link as LinkIcon, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../contexts/UserContext';
import { upsertRecord } from '../lib/records-api';
import { calculateCuts, calculateFINAPoints, parseTimeToSeconds } from '../lib/swim-utils';

export default function ImportTimes() {
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState<'url' | 'file' | 'manual'>('url');
  const [usaSwimmingUrl, setUsaSwimmingUrl] = useState('');
  const [swimilyLink, setSwimilyLink] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
  const handleImportFromUrl = async () => {
    if (!usaSwimmingUrl.trim()) {
      toast.error('Please enter a USA Swimming profile URL');
      return;
    }

    // Backend import-by-URL is not implemented in this MVP yet.
    toast.info('URL import not implemented yet', {
      description: 'Please use File upload or manual import for now.',
    });
  };
  
  const handleImportFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Please upload a CSV or TXT file');
      return;
    }
    
    setIsImporting(true);

    try {
      const content = await file.text();
      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      const startIndex = lines[0]?.toLowerCase().includes('event') ? 1 : 0;
      let imported = 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length < 4) continue;

        const [event, courseRaw, timeStr, dateStr] = parts;
        const course = String(courseRaw).toUpperCase();

        if (!event || (course !== 'SCY' && course !== 'LCM')) continue;

        const seconds = parseTimeToSeconds(timeStr);
        if (seconds === 0) continue;

        const finaPoints = calculateFINAPoints(event, seconds, profile.gender, course);
        const cuts = calculateCuts(event, seconds, profile.gender, course);

        await upsertRecord({
          event,
          course,
          timeSeconds: seconds,
          finaPoints,
          cuts,
          meetDate: dateStr,
        });

        imported++;
      }

      toast.success('File imported successfully!', {
        description: `${imported} times saved to your profile`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to import file');
    } finally {
      setIsImporting(false);
    }
  };
  
  const generateSwimilyLink = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    setSwimilyLink(`https://swimily.app/share/${randomId}`);
    toast.success('Swimily share link created!', {
      description: 'Copy and share with friends'
    });
  };
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/more" className="w-10 h-10 bg-white/10 light:bg-gray-100 rounded-xl flex items-center justify-center hover:bg-white/20 light:hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
          </Link>
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Import Times</h1>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'url'
                ? 'bg-cyan-500 text-black'
                : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
            }`}
          >
            URL Import
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'file'
                ? 'bg-cyan-500 text-black'
                : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'manual'
                ? 'bg-cyan-500 text-black'
                : 'bg-white/10 light:bg-gray-100 text-gray-400 light:text-gray-600'
            }`}
          >
            Share Link
          </button>
        </div>
      </div>
      
      <div className="px-6">
        {/* URL Import Tab */}
        {activeTab === 'url' && (
          <div>
            <Card className="mb-6 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-cyan-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white light:text-gray-900 text-lg mb-1">USA Swimming Profile</h3>
                  <p className="text-sm text-gray-400 light:text-gray-600">
                    Automatically import all your times from USA Swimming
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white light:text-gray-900 mb-3">
                    USA Swimming Profile URL
                  </label>
                  <input
                    type="url"
                    value={usaSwimmingUrl}
                    onChange={(e) => setUsaSwimmingUrl(e.target.value)}
                    placeholder="https://www.usaswimming.org/times/..."
                    className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Find your profile at usaswimming.org and paste the URL here
                  </p>
                </div>
                
                <Button 
                  onClick={handleImportFromUrl} 
                  fullWidth 
                  size="lg"
                  disabled={isImporting}
                >
                  {isImporting ? 'Importing...' : 'Import Times'}
                </Button>
              </div>
            </Card>
            
            {/* Instructions */}
            <Card className="p-4 bg-cyan-500/10 light:bg-cyan-50 border-cyan-500/30 light:border-cyan-200">
              <h4 className="font-bold text-cyan-500 light:text-cyan-700 text-sm mb-2">How to find your URL</h4>
              <ol className="text-sm text-gray-400 light:text-gray-600 space-y-1 list-decimal list-inside">
                <li>Go to usaswimming.org/times</li>
                <li>Search for your name</li>
                <li>Click on your profile</li>
                <li>Copy the URL from your browser</li>
              </ol>
            </Card>
          </div>
        )}
        
        {/* File Upload Tab */}
        {activeTab === 'file' && (
          <div>
            <Card className="mb-6">
              <label className="block p-12 text-center cursor-pointer hover:bg-white/5 light:hover:bg-gray-50 transition-colors border-2 border-dashed border-white/20 light:border-gray-300 rounded-xl">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleImportFromFile}
                  className="hidden"
                />
                <Upload className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
                <h3 className="font-bold text-white light:text-gray-900 text-lg mb-2">Upload Times File</h3>
                <p className="text-gray-400 light:text-gray-600 text-sm mb-1">CSV or TXT format</p>
                <p className="text-gray-500 text-xs">Click to browse or drag and drop</p>
              </label>
            </Card>
            
            {/* Format Example */}
            <Card className="p-4">
              <h4 className="font-bold text-white light:text-gray-900 text-sm mb-3">Expected Format</h4>
              <div className="bg-black/40 light:bg-gray-100 rounded-lg p-3 font-mono text-xs text-gray-400 light:text-gray-700">
                <div>Event,Course,Time,Date</div>
                <div>50 Free,SCY,23.45,2024-03-15</div>
                <div>100 Free,SCY,51.23,2024-03-15</div>
                <div>100 Back,LCM,1:02.34,2024-02-20</div>
              </div>
            </Card>
          </div>
        )}
        
        {/* Share Link Tab */}
        {activeTab === 'manual' && (
          <div>
            <Card className="mb-6 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white light:text-gray-900 text-lg mb-1">Swimily Share Link</h3>
                  <p className="text-sm text-gray-400 light:text-gray-600">
                    Generate a shareable link to your times
                  </p>
                </div>
              </div>
              
              <Button onClick={generateSwimilyLink} fullWidth size="lg" className="mb-4">
                Generate Share Link
              </Button>
              
              {swimilyLink && (
                <div className="space-y-3">
                  <div className="bg-black/40 light:bg-gray-100 rounded-lg p-4 border border-white/10 light:border-gray-300">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <p className="text-sm font-bold text-white light:text-gray-900">Link Created!</p>
                    </div>
                    <p className="text-cyan-500 font-mono text-sm break-all">{swimilyLink}</p>
                  </div>
                  
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(swimilyLink);
                      toast.success('Link copied to clipboard!');
                    }}
                    fullWidth
                    variant="secondary"
                  >
                    Copy Link
                  </Button>
                </div>
              )}
            </Card>
            
            {/* Info */}
            <Card className="p-4 bg-purple-500/10 light:bg-purple-50 border-purple-500/30 light:border-purple-200">
              <h4 className="font-bold text-purple-500 light:text-purple-700 text-sm mb-2">How it works</h4>
              <ul className="text-sm text-gray-400 light:text-gray-600 space-y-1 list-disc list-inside">
                <li>Share your link with coaches or teammates</li>
                <li>They can view your times without creating an account</li>
                <li>You control who has access</li>
              </ul>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
