import { useEffect, useState } from 'react';
import { Plus, Trash2, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Meet } from '../lib/types';
import Card from '../components/Card';
import { createMeet, deleteMeet, fetchMeets } from '../lib/meets-api';
import LoadingScreen from '../components/LoadingScreen';
import InlineError from '../components/InlineError';
import EmptyStateCard from '../components/EmptyStateCard';
import Button from '../components/Button';

const MEET_TYPE_COLORS: Record<string, string> = {
  'dual': 'bg-blue-100 text-blue-700',
  'invitational': 'bg-green-100 text-green-700',
  'championship': 'bg-purple-100 text-purple-700',
  'time-trial': 'bg-orange-100 text-orange-700',
};

export default function Meets() {
  const [meets, setMeets] = useState<Meet[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    meetType: 'invitational' as Meet['meetType'],
    notes: ''
  });
  
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const data = await fetchMeets();
        if (!cancelled) setMeets(data);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to load meets';
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMeets();
      setMeets(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load meets';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  
  const upcomingMeets = meets
    .filter(m => m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  
  const pastMeets = meets
    .filter(m => m.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  
  const handleAddMeet = async () => {
    if (!formData.name || !formData.date) {
      toast.error('Please enter meet name and date');
      return;
    }

    setIsSaving(true);
    try {
      await createMeet({
        name: formData.name.trim(),
        date: formData.date,
        location: formData.location?.trim() ? formData.location.trim() : undefined,
        meetType: formData.meetType,
        notes: formData.notes?.trim() ? formData.notes.trim() : undefined,
      });

      const data = await fetchMeets();
      setMeets(data);

      setFormData({
        name: '',
        date: '',
        location: '',
        meetType: 'invitational',
        notes: ''
      });
      setShowAddForm(false);
      toast.success('Meet added!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add meet');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteMeet = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteMeet(id);
      const data = await fetchMeets();
      setMeets(data);
      toast.success('Meet deleted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete meet');
    } finally {
      setIsSaving(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const MeetCard = ({ meet }: { meet: Meet }) => (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-white light:text-gray-900 mb-1">{meet.name}</h3>
          <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${MEET_TYPE_COLORS[meet.meetType]}`}>
            {meet.meetType.replace('-', ' ')}
          </span>
        </div>
        <button
          onClick={() => handleDeleteMeet(meet.id)}
          className="text-red-500 hover:text-red-400 p-1"
          disabled={isSaving}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-400 light:text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(meet.date)}</span>
        </div>
        {meet.location && (
          <div className="flex items-center gap-2 text-sm text-gray-400 light:text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{meet.location}</span>
          </div>
        )}
      </div>
      
      {meet.notes && (
        <p className="mt-3 text-sm text-gray-400 light:text-gray-600 bg-black/30 light:bg-gray-50 rounded-lg p-2 border border-white/10 light:border-gray-200">
          {meet.notes}
        </p>
      )}
    </Card>
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight mb-4">Meets</h1>
        </div>
        <div className="px-6">
          <InlineError title="Couldn’t load meets" message={error} onRetry={load} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      {/* Header */}
      <div className="px-6 pt-16 pb-4 sticky top-0 z-10 bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Meets</h1>
          <Button onClick={() => setShowAddForm(!showAddForm)} variant="secondary">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
      
      <div className="px-6 pb-6">
        {/* Add Form */}
        {showAddForm && (
          <Card className="p-4 mb-6">
            <h3 className="font-semibold text-white light:text-gray-900 mb-3">Add Meet</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                  Meet Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Conference Championships"
                  className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Aquatic Center"
                  className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                  Meet Type
                </label>
                <select
                  value={formData.meetType}
                  onChange={(e) => setFormData({ ...formData, meetType: e.target.value as Meet['meetType'] })}
                  className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="dual">Dual Meet</option>
                  <option value="invitational">Invitational</option>
                  <option value="championship">Championship</option>
                  <option value="time-trial">Time Trial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Meet goals, events to swim..."
                  className="w-full h-24 px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 resize-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddMeet} fullWidth size="lg" disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Save Meet'}
                </Button>
                <Button onClick={() => setShowAddForm(false)} fullWidth size="lg" variant="secondary" disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        {/* Upcoming Meets */}
        {upcomingMeets.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white light:text-gray-900 mb-3">Upcoming</h2>
            <div className="space-y-3">
              {upcomingMeets.map(meet => (
                <MeetCard key={meet.id} meet={meet} />
              ))}
            </div>
          </div>
        )}
        
        {/* Past Meets */}
        {pastMeets.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white light:text-gray-900 mb-3">Past</h2>
            <div className="space-y-3">
              {pastMeets.map(meet => (
                <MeetCard key={meet.id} meet={meet} />
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {meets.length === 0 && (
          <EmptyStateCard
            icon={<Calendar className="w-12 h-12 text-gray-700" />}
            title="No meets scheduled"
            description="Add your next meet so you can keep notes and plan ahead."
            action={
              <Button fullWidth size="lg" variant="primary" onClick={() => setShowAddForm(true)} disabled={isSaving}>
                <Plus className="w-4 h-4" />
                Add a meet
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}