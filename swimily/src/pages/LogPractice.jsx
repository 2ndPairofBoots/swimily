import db from "@/lib/db";

import { useState, useRef } from "react";
import { addPractice, addXP, getProfile, getPractices, deletePractice } from "@/lib/storage";
import { parseWorkoutText, calcPracticeYards, calcSetYards } from "@/lib/utils/swim";
import { STROKES, EFFORT_TAGS, FOCUS_OPTIONS, TIME_OF_DAY, XP_PRACTICE } from "@/lib/constants";

import { Plus, Trash2, AlertTriangle, Check, ChevronDown, ChevronUp, Camera, FileText, Edit3, Zap, Loader2, Undo2 } from "lucide-react";

const defaultSet = () => ({ description: "", reps: 1, rounds: 1, distance: 0, stroke: "FR", effort: "", rest: "", hr: "", confident: true });

const SCY_DISTANCES = [25, 50, 75, 100, 150, 200, 300, 400, 500, 600, 800, 1000, 1650];
const LCM_DISTANCES = [50, 100, 150, 200, 400, 600, 800, 1500];

function getTimeOfDayFromHour(hour) {
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Night";
}

export default function LogPractice() {
  const [tab, setTab] = useState("manual");
  const [pasteText, setPasteText] = useState("");
  const [sets, setSets] = useState([]);
  const [details, setDetails] = useState({ focus: "Aerobic", timeOfDay: "Morning", startTime: "", duration: "" });
  const [saved, setSaved] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [history, setHistory] = useState(getPractices());
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [undoPractice, setUndoPractice] = useState(null);
  const fileRef = useRef();

  const profile = getProfile();
  const course = profile.coursePreference || "SCY";
  const distances = course === "LCM" ? LCM_DISTANCES : SCY_DISTANCES;

  const handleStartTimeChange = (val) => {
    const hour = parseInt(val.split(":")[0]);
    const tod = getTimeOfDayFromHour(hour);
    setDetails(d => ({ ...d, startTime: val, timeOfDay: tod }));
  };

  const parsePaste = () => {
    const parsed = parseWorkoutText(pasteText);
    setSets(parsed);
    setTab("manual");
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    setPhotoError("");
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are a swim coach assistant. Look at this image of a swim workout written on a whiteboard, paper, or screen. Extract ALL sets and return them as a JSON array. Each set should have: description (string, original text), reps (number, default 1), rounds (number, default 1, for "2 rounds of 4x100" rounds=2), distance (number in yards, nearest 25), stroke (one of: FR, BK, BR, FL, IM, K, P, DR), effort (one of: easy, mod, build, desc, threshold, race pace, all out, sprint, neg split, or empty string), rest (string like "1:30" or ":45" or empty). Return ONLY a valid JSON object: {"sets": [...]}`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          sets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                reps: { type: "number" },
                rounds: { type: "number" },
                distance: { type: "number" },
                stroke: { type: "string" },
                effort: { type: "string" },
                rest: { type: "string" },
              }
            }
          }
        }
      }
    });
    if (result?.sets?.length > 0) {
      setSets(result.sets.map(s => ({ ...defaultSet(), ...s, confident: true })));
      setTab("manual");
    } else {
      setPhotoError("Could not read workout from image. Try a clearer photo.");
    }
    setPhotoLoading(false);
  };

  const addSet = () => setSets([...sets, defaultSet()]);

  const updateSet = (i, field, val) => {
    const updated = [...sets];
    updated[i] = { ...updated[i], [field]: val };
    setSets(updated);
  };

  const removeSet = (i) => setSets(sets.filter((_, idx) => idx !== i));

  const totalYards = calcPracticeYards(sets);

  const savePractice = () => {
    const practice = { ...details, sets, totalYards, date: new Date().toISOString() };
    const savedPractice = addPractice(practice);
    addXP(XP_PRACTICE);
    setXpGained(XP_PRACTICE);
    setSaved(true);
    setHistory(getPractices());

    // Store for undo
    setUndoPractice(savedPractice);

    setTimeout(() => {
      setSaved(false);
      setUndoPractice(null);
    }, 5000);

    setSets([]);
    setPasteText("");
  };

  const handleUndo = () => {
    if (!undoPractice) return;
    deletePractice(undoPractice.id);
    setHistory(getPractices());
    setSaved(false);
    setUndoPractice(null);
  };

  const handleDeletePractice = (id) => {
    deletePractice(id);
    setHistory(getPractices());
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Log Practice</h1>
        <span className="text-white/40 text-sm">{totalYards.toLocaleString()} yds</span>
      </div>

      {saved && (
        <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-green-400 font-bold">Practice Saved!</div>
              <div className="text-green-400/60 text-sm flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> +{xpGained} XP earned</div>
            </div>
          </div>
          {undoPractice && (
            <button onClick={handleUndo} className="flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors">
              <Undo2 className="w-4 h-4" /> Undo
            </button>
          )}
        </div>
      )}

      {/* Practice Details */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-white/40 text-xs block mb-1">Focus</label>
          <select value={details.focus} onChange={e => setDetails({...details, focus: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500">
            {FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="text-white/40 text-xs block mb-1">Time of Day</label>
          <select value={details.timeOfDay} onChange={e => setDetails({...details, timeOfDay: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500">
            {TIME_OF_DAY.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-white/40 text-xs block mb-1">Start Time <span className="text-cyan-400/50">(auto-fills above)</span></label>
          <input type="time" value={details.startTime} onChange={e => handleStartTimeChange(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="text-white/40 text-xs block mb-1">Duration (min)</label>
          <input type="number" value={details.duration} onChange={e => setDetails({...details, duration: e.target.value})}
            placeholder="90" className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
      </div>

      {/* Import tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "manual", label: "Manual", icon: Edit3 },
          { id: "paste", label: "Paste Text", icon: FileText },
          { id: "photo", label: "Photo → AI", icon: Camera },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${tab === t.id ? "bg-cyan-500 text-black font-bold" : "bg-white/5 text-white/60 hover:text-white"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Paste tab */}
      {tab === "paste" && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <p className="text-white/50 text-sm">Supports: <span className="text-cyan-400">4x100 FR on 1:30</span>, <span className="text-cyan-400">2 rounds of 4x50 kick</span>, <span className="text-cyan-400">200 IM easy</span></p>
          <textarea value={pasteText} onChange={e => setPasteText(e.target.value)}
            placeholder={"4x100 FR on 1:30\n2 rounds of 4x50 kick :45\n200 IM easy\n2x4x100 BK @ 1:15"}
            rows={8} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm font-mono focus:outline-none focus:border-cyan-500 resize-none" />
          <button onClick={parsePaste} className="bg-cyan-500 text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-cyan-400 transition-colors">
            Parse Workout
          </button>
        </div>
      )}

      {/* Photo AI tab */}
      {tab === "photo" && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center space-y-4">
          <Camera className="w-10 h-10 text-cyan-400 mx-auto opacity-60" />
          <p className="text-white/60 text-sm">Take a photo of your whiteboard or workout sheet and AI will parse it into sets automatically.</p>
          {photoError && <p className="text-red-400 text-sm">{photoError}</p>}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          <button onClick={() => fileRef.current?.click()} disabled={photoLoading}
            className="flex items-center gap-2 mx-auto bg-cyan-500 text-black font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-cyan-400 transition-colors disabled:opacity-50">
            {photoLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Camera className="w-4 h-4" /> Upload Photo</>}
          </button>
        </div>
      )}

      {/* Sets list */}
      <div className="space-y-2">
        {sets.map((set, i) => (
          <SetRow key={i} set={set} index={i} distances={distances} isEditing={editingIdx === i}
            onEdit={() => setEditingIdx(editingIdx === i ? null : i)}
            onUpdate={(f, v) => updateSet(i, f, v)}
            onRemove={() => removeSet(i)} />
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={addSet} className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus className="w-4 h-4" /> Add Set
        </button>
        {sets.length > 0 && (
          <button onClick={savePractice} className="flex items-center gap-2 bg-cyan-500 text-black font-bold px-6 py-2 rounded-lg text-sm hover:bg-cyan-400 transition-colors">
            <Check className="w-4 h-4" /> Save Practice (+{XP_PRACTICE} XP)
          </button>
        )}
      </div>

      {/* History */}
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <button onClick={() => setHistoryOpen(!historyOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-white/50 text-sm hover:text-white hover:bg-white/5 transition-colors">
          <span>Practice History ({history.length})</span>
          {historyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {historyOpen && (
          <div className="divide-y divide-white/5">
            {history.length === 0 && (
              <div className="px-4 py-6 text-white/30 text-center text-sm">No practices logged yet.</div>
            )}
            {history.slice(0, 20).map(p => (
              <div key={p.id} className="px-4 py-3 group">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{p.focus} · {p.timeOfDay}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400">{(p.totalYards || 0).toLocaleString()} yds</span>
                    <button
                      onClick={() => handleDeletePractice(p.id)}
                      className="text-white/0 group-hover:text-white/30 hover:!text-red-400 transition-colors"
                      title="Delete practice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-white/30 text-xs mt-1">{new Date(p.date).toLocaleDateString()} · {p.sets?.length || 0} sets</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SetRow({ set, distances, isEditing, onEdit, onUpdate, onRemove }) {
  const yards = calcSetYards(set);
  const needsReview = !set.confident;
  const rounds = set.rounds || 1;

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${needsReview ? "border-yellow-500/30 bg-yellow-900/10" : "border-white/10 bg-white/5"}`}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={onEdit}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {needsReview && <AlertTriangle className="w-3 h-3 text-yellow-400 shrink-0" />}
            <span className="text-white text-sm truncate">
              {rounds > 1 ? `${rounds} rounds of ` : ""}{set.reps > 1 ? `${set.reps}×` : ""}{set.distance} {set.stroke}
              {set.description && set.description !== `${set.reps}×${set.distance} ${set.stroke}` ? ` — ${set.description}` : ""}
            </span>
            {set.effort && <span className="text-white/40 text-xs">{set.effort}</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-white/30">
            <span>{yards} yds</span>
            {set.rest && <span>· {set.rest}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-white/20 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          {isEditing ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
        </div>
      </div>

      {isEditing && (
        <div className="border-t border-white/10 px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="text-white/40 text-xs block mb-1">Description</label>
            <input value={set.description} onChange={e => onUpdate("description", e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">Rounds</label>
            <input type="number" min="1" value={rounds} onChange={e => onUpdate("rounds", parseInt(e.target.value) || 1)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">Reps</label>
            <input type="number" min="1" value={set.reps} onChange={e => onUpdate("reps", parseInt(e.target.value) || 1)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">Distance</label>
            <select value={set.distance} onChange={e => onUpdate("distance", parseInt(e.target.value))}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500">
              {distances.map(d => <option key={d} value={d}>{d} yds</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">Stroke</label>
            <select value={set.stroke} onChange={e => onUpdate("stroke", e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500">
              {STROKES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">Effort</label>
            <select value={set.effort} onChange={e => onUpdate("effort", e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500">
              <option value="">—</option>
              {EFFORT_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">Rest / Interval</label>
            <input value={set.rest} onChange={e => onUpdate("rest", e.target.value)}
              placeholder=":30 or 1:30" className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">HR</label>
            <input value={set.hr} onChange={e => onUpdate("hr", e.target.value)}
              placeholder="bpm" className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>
        </div>
      )}
    </div>
  );
}