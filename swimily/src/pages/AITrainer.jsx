import db from "@/lib/db";

import { useState } from "react";
import { getProfile, getPractices, getDrylandSessions } from "@/lib/storage";

import { Brain, Waves, Dumbbell, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

const FOCUS_OPTIONS = ["Aerobic Base", "Speed/Sprint", "Race Pace", "Technique", "Taper", "Recovery", "General Strength"];
const WORKOUT_TYPES = ["Swim Practice", "Dryland / Weight Room", "Both"];

export default function AITrainer() {
  const [workoutType, setWorkoutType] = useState("Swim Practice");
  const [focus, setFocus] = useState("Aerobic Base");
  const [duration, setDuration] = useState(90);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState(null);
  const [expandedSection, setExpandedSection] = useState(0);

  const profile = getProfile();
  const practices = getPractices();
  const dryland = getDrylandSessions();

  const recentPractices = practices.slice(0, 5);
  const recentFoci = [...new Set(recentPractices.map(p => p.focus))].join(", ") || "none";
  const recentYardage = recentPractices.length > 0
    ? Math.round(recentPractices.reduce((s, p) => s + (p.totalYards || 0), 0) / recentPractices.length)
    : 0;
  const drylandDays = dryland.filter(d => {
    const diff = (Date.now() - new Date(d.date)) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  const generate = async () => {
    setLoading(true);
    setWorkout(null);

    const prompt = `You are an expert competitive swim coach and strength & conditioning specialist. Generate a personalized workout for this swimmer.

SWIMMER PROFILE:
- Name: ${profile.name || "Swimmer"}
- Specialty: ${profile.specialty || "Mid-distance"}
- Primary Strokes: ${(profile.primaryStrokes || []).join(", ") || "Free"}
- Course: ${profile.coursePreference || "SCY"}
- Goal Meet: ${profile.goalMeet || "Not set"}
- Goal Events: ${(profile.goalEvents || []).join(", ") || "Not set"}
- Injury History: ${profile.injuryHistory || "None"}
- Available Swim Equipment: ${(profile.swimEquipment || []).join(", ") || "Standard"}
- Available Gym Equipment: ${(profile.workoutEquipment || []).join(", ") || "Bodyweight only"}

RECENT TRAINING HISTORY (last 5 practices):
- Recent focus areas: ${recentFoci}
- Average yardage per practice: ${recentYardage.toLocaleString()} yards
- Dryland sessions in last 7 days: ${drylandDays}
- Total practices logged: ${practices.length}

WORKOUT REQUEST:
- Type: ${workoutType}
- Focus: ${focus}
- Duration: ${duration} minutes
- Additional Notes: ${notes || "None"}

Generate a complete, specific, and professional workout. For swim workouts include: warm-up sets, main sets (with reps x distance, stroke, interval/rest), and cool-down. For dryland include: warm-up, main exercises (with sets x reps, muscles targeted, swim benefit), and cool-down. Use real coach-style notation (e.g. "4x100 FR on 1:30 @ threshold pace").

Return a JSON object with this structure:
{
  "title": "Workout title",
  "overview": "Brief 1-2 sentence overview",
  "total_yards": number (for swim) or 0,
  "sections": [
    {
      "name": "section name (e.g. Warm-up, Main Set, Cool-down)",
      "items": ["item 1", "item 2", ...]
    }
  ],
  "coaching_notes": "Key coaching tips for this workout"
}`;

    const result = await db.integrations.Core.InvokeLLM({
      prompt,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          overview: { type: "string" },
          total_yards: { type: "number" },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                items: { type: "array", items: { type: "string" } }
              }
            }
          },
          coaching_notes: { type: "string" }
        }
      }
    });

    setWorkout(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Brain className="w-6 h-6 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white">AI Trainer</h1>
      </div>

      {/* Swimmer context summary */}
      <div className="bg-cyan-900/20 border border-cyan-500/20 rounded-xl p-4 text-sm">
        <div className="text-cyan-400 text-xs uppercase tracking-wider mb-2">Generating based on your data</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-white/60">
          <div><div className="text-white font-bold">{profile.specialty || "—"}</div><div className="text-xs">Specialty</div></div>
          <div><div className="text-white font-bold">{recentYardage.toLocaleString()}</div><div className="text-xs">Avg yds/practice</div></div>
          <div><div className="text-white font-bold">{practices.length}</div><div className="text-xs">Practices logged</div></div>
          <div><div className="text-white font-bold">{drylandDays}</div><div className="text-xs">Dryland this week</div></div>
        </div>
      </div>

      {/* Options */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-white/40 text-xs block mb-1">Workout Type</label>
            <select value={workoutType} onChange={e => setWorkoutType(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
              {WORKOUT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">Focus</label>
            <select value={focus} onChange={e => setFocus(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
              {FOCUS_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">Duration (min)</label>
            <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 90)} min={20} max={240}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>
        </div>
        <div>
          <label className="text-white/40 text-xs block mb-1">Additional Notes (optional)</label>
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="e.g. focus on turns, easy day, tired legs..."
            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <button onClick={generate} disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/10 disabled:text-white/30 text-black font-bold py-3 rounded-xl transition-colors">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating workout...</> : <><Brain className="w-5 h-5" /> Generate Workout</>}
        </button>
        <p className="text-white/20 text-xs text-center">Uses Claude AI · may use extra integration credits</p>
      </div>

      {/* Generated workout */}
      {workout && (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border border-cyan-500/20 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-white font-bold text-xl">{workout.title}</h2>
                <p className="text-white/60 text-sm mt-1">{workout.overview}</p>
              </div>
              {workout.total_yards > 0 && (
                <div className="text-right shrink-0">
                  <div className="text-cyan-400 font-bold text-xl">{workout.total_yards.toLocaleString()}</div>
                  <div className="text-white/30 text-xs">yards</div>
                </div>
              )}
            </div>
          </div>

          {/* Sections */}
          {workout.sections?.map((section, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  {section.name.toLowerCase().includes("swim") || section.name.toLowerCase().includes("warm") || section.name.toLowerCase().includes("cool") || section.name.toLowerCase().includes("main") ?
                    <Waves className="w-4 h-4 text-cyan-400" /> : <Dumbbell className="w-4 h-4 text-green-400" />}
                  <span className="text-white font-bold text-sm">{section.name}</span>
                  <span className="text-white/30 text-xs">({section.items?.length || 0} items)</span>
                </div>
                {expandedSection === i ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
              </button>
              {expandedSection === i && (
                <div className="border-t border-white/10 px-4 py-3 space-y-2">
                  {section.items?.map((item, j) => (
                    <div key={j} className="flex items-start gap-2 text-sm">
                      <span className="text-cyan-400 mt-0.5 shrink-0">·</span>
                      <span className="text-white/80 font-mono">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Coaching notes */}
          {workout.coaching_notes && (
            <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-4">
              <div className="text-yellow-400 text-xs uppercase tracking-wider mb-2">Coaching Notes</div>
              <p className="text-white/70 text-sm">{workout.coaching_notes}</p>
            </div>
          )}

          <button onClick={generate} disabled={loading}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm mx-auto transition-colors">
            <RefreshCw className="w-4 h-4" /> Regenerate
          </button>
        </div>
      )}
    </div>
  );
}