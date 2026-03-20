import { useState } from "react";
import { getMeets, saveMeets } from "@/lib/storage";
import { Plus, Trash2, MapPin, Calendar, Trophy } from "lucide-react";

const MEET_TYPES = ["Invitational", "Championship", "Dual", "Time Trial"];
const TYPE_COLORS = {
  Invitational: "text-blue-400 border-blue-400/30 bg-blue-500/10",
  Championship: "text-yellow-400 border-yellow-400/30 bg-yellow-500/10",
  Dual: "text-green-400 border-green-400/30 bg-green-500/10",
  "Time Trial": "text-purple-400 border-purple-400/30 bg-purple-500/10",
};

const defaultMeet = () => ({ name: "", date: "", type: "Invitational", location: "" });

export default function MeetSchedule() {
  const [meets, setMeets] = useState(getMeets());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultMeet());

  const now = new Date();
  const upcoming = meets.filter(m => new Date(m.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = meets.filter(m => new Date(m.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date));

  const addMeet = () => {
    if (!form.name || !form.date) return;
    const updated = [...meets, { ...form, id: Date.now().toString() }];
    setMeets(updated);
    saveMeets(updated);
    setForm(defaultMeet());
    setShowForm(false);
  };

  const removeMeet = (id) => {
    const updated = meets.filter(m => m.id !== id);
    setMeets(updated);
    saveMeets(updated);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Meet Schedule</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-cyan-500 text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-cyan-400 transition-colors">
          <Plus className="w-4 h-4" /> Add Meet
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h3 className="text-white text-sm font-bold">New Meet</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-white/40 text-xs block mb-1">Meet Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Championships 2026" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="text-white/40 text-xs block mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="text-white/40 text-xs block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
                {MEET_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-white/40 text-xs block mb-1">Location</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                placeholder="Aquatic Center" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addMeet} className="bg-cyan-500 text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-cyan-400">Add Meet</button>
            <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-white/50 text-xs uppercase tracking-wider mb-3">Upcoming</h2>
          <div className="space-y-2">
            {upcoming.map(meet => (
              <MeetCard key={meet.id} meet={meet} onRemove={() => removeMeet(meet.id)} upcoming />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="text-white/50 text-xs uppercase tracking-wider mb-3">Past</h2>
          <div className="space-y-2">
            {past.map(meet => (
              <MeetCard key={meet.id} meet={meet} onRemove={() => removeMeet(meet.id)} />
            ))}
          </div>
        </div>
      )}

      {meets.length === 0 && (
        <div className="text-center py-12 text-white/30">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No meets scheduled. Add your first meet!</p>
        </div>
      )}
    </div>
  );
}

function MeetCard({ meet, onRemove, upcoming }) {
  return (
    <div className={`bg-white/5 border rounded-xl px-4 py-3 flex items-center justify-between ${upcoming ? "border-white/10" : "border-white/5 opacity-60"}`}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-bold text-sm">{meet.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[meet.type] || "text-white/40 border-white/20"}`}>
            {meet.type}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(meet.date).toLocaleDateString()}</span>
          {meet.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {meet.location}</span>}
        </div>
      </div>
      <button onClick={onRemove} className="text-white/20 hover:text-red-400 transition-colors">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}