import db from "@/lib/db";

import { useState } from "react";
import { getProfile, saveProfile, getTimes, saveTimes } from "@/lib/storage";
import { getAllCutsAchieved } from "@/lib/utils/swim";
import { SWIM_EQUIPMENT, WORKOUT_EQUIPMENT, RECOVERY_EQUIPMENT, CUT_COLORS } from "@/lib/constants";

import { Check, User, Download, Loader2 } from "lucide-react";



export default function Profile() {
  const [profile, setProfile] = useState(getProfile());
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const times = getTimes();

  const cutsAchieved = getAllCutsAchieved(times, profile.coursePreference || "SCY", profile.gender || "M");

  const update = (key, val) => setProfile(p => ({ ...p, [key]: val }));

  const toggleArray = (key, val) => {
    const arr = profile[key] || [];
    update(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const save = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const importFromSwimCloud = async () => {
    if (!profile.swimcloudUrl) return;
    setImporting(true);
    setImportMsg("");
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `Go to this SwimCloud profile page: ${profile.swimcloudUrl}
      
Extract all personal best swim times from this swimmer's profile. Return them as a JSON object where keys are in the format "EVENT_COURSE" (e.g. "100 FR_SCY", "200 IM_LCM") and values are time strings in "M:SS.ss" or "SS.ss" format (e.g. "1:45.23" or "48.50"). 

Only include events where you can find a specific time. Return {"times": {"100 FR_SCY": "48.50", ...}}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          times: { type: "object" }
        }
      }
    });
    if (result?.times && Object.keys(result.times).length > 0) {
      const existing = getTimes();
      const merged = { ...existing, ...result.times };
      saveTimes(merged);
      setImportMsg(`Imported ${Object.keys(result.times).length} times from SwimCloud!`);
    } else {
      setImportMsg("Could not find times. Make sure the URL is a public SwimCloud profile.");
    }
    setImporting(false);
    setTimeout(() => setImportMsg(""), 5000);
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="text-white/40 text-xs block mb-1">{label}</label>
      {children}
    </div>
  );

  const inputClass = "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500";
  const selectClass = inputClass;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><User className="w-5 h-5" /> Profile</h1>
        {saved && (
          <span className="text-green-400 text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Saved!</span>
        )}
      </div>

      {/* Basic info */}
      <Section title="Personal Info">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="Name"><input value={profile.name || ""} onChange={e => update("name", e.target.value)} className={inputClass} /></Field>
          <Field label="Gender">
            <select value={profile.gender || "M"} onChange={e => update("gender", e.target.value)} className={selectClass}>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </Field>
          <Field label="Age"><input type="number" value={profile.age || ""} onChange={e => update("age", e.target.value)} className={inputClass} /></Field>
          <Field label="Club"><input value={profile.club || ""} onChange={e => update("club", e.target.value)} className={inputClass} /></Field>
          <Field label="LSC"><input value={profile.lsc || ""} onChange={e => update("lsc", e.target.value)} className={inputClass} /></Field>
          <Field label="USA Swimming ID"><input value={profile.usaSwimmingId || ""} onChange={e => update("usaSwimmingId", e.target.value)} className={inputClass} /></Field>
          <Field label="Years Competitive"><input type="number" value={profile.yearsCompetitive || ""} onChange={e => update("yearsCompetitive", e.target.value)} className={inputClass} /></Field>
          <Field label="Avg Sleep (hrs)"><input type="number" value={profile.avgSleep || ""} onChange={e => update("avgSleep", e.target.value)} className={inputClass} /></Field>
          <Field label="SwimCloud URL">
            <div className="flex gap-2">
              <input value={profile.swimcloudUrl || ""} onChange={e => update("swimcloudUrl", e.target.value)} className={inputClass} placeholder="https://www.swimcloud.com/swimmer/..." />
              {profile.swimcloudUrl && (
                <button onClick={importFromSwimCloud} disabled={importing}
                  className="shrink-0 flex items-center gap-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 px-3 py-2 rounded-lg text-xs transition-colors disabled:opacity-50">
                  {importing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  Import
                </button>
              )}
            </div>
            {importMsg && <p className={`text-xs mt-1 ${importMsg.includes("Could not") ? "text-red-400" : "text-green-400"}`}>{importMsg}</p>}
          </Field>
        </div>
      </Section>

      {/* Swimming profile */}
      <Section title="Swimming Profile">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="Course Preference">
            <select value={profile.coursePreference || "SCY"} onChange={e => update("coursePreference", e.target.value)} className={selectClass}>
              <option value="SCY">SCY</option>
              <option value="LCM">LCM</option>
              <option value="Both">Both</option>
            </select>
          </Field>
          <Field label="Specialty">
            <select value={profile.specialty || "Mid-distance"} onChange={e => update("specialty", e.target.value)} className={selectClass}>
              {["Sprinter", "Mid-distance", "Distance"].map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Warmup Distance (yds)"><input type="number" value={profile.warmupDistance || ""} onChange={e => update("warmupDistance", parseInt(e.target.value) || 400)} className={inputClass} /></Field>
        </div>
        <div className="mt-3">
          <label className="text-white/40 text-xs block mb-2">Primary Strokes</label>
          <div className="flex flex-wrap gap-2">
            {["Free", "Back", "Breast", "Fly", "IM"].map(s => (
              <Toggle key={s} active={(profile.primaryStrokes || []).includes(s)} onClick={() => toggleArray("primaryStrokes", s)}>{s}</Toggle>
            ))}
          </div>
        </div>
      </Section>

      {/* Goals */}
      <Section title="Goals">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Goal Meet"><input value={profile.goalMeet || ""} onChange={e => update("goalMeet", e.target.value)} className={inputClass} /></Field>
          <Field label="Goal Events (comma separated)">
            <input value={(profile.goalEvents || []).join(", ")} onChange={e => update("goalEvents", e.target.value.split(",").map(x => x.trim()).filter(Boolean))} className={inputClass} />
          </Field>
        </div>
        <div className="mt-3">
          <label className="text-white/40 text-xs block mb-1">Injury History</label>
          <textarea value={profile.injuryHistory || ""} onChange={e => update("injuryHistory", e.target.value)}
            rows={2} className={`${inputClass} resize-none`} placeholder="e.g. Left shoulder strain 2024" />
        </div>
      </Section>

      {/* Swim equipment */}
      <Section title="Swim Equipment">
        <div className="flex flex-wrap gap-2">
          {SWIM_EQUIPMENT.map(e => (
            <Toggle key={e} active={(profile.swimEquipment || []).includes(e)} onClick={() => toggleArray("swimEquipment", e)}>{e}</Toggle>
          ))}
        </div>
      </Section>

      {/* Workout equipment */}
      <Section title="Workout Equipment">
        {Object.entries(WORKOUT_EQUIPMENT).map(([cat, items]) => (
          <div key={cat} className="mb-3">
            <div className="text-white/30 text-xs mb-2">{cat}</div>
            <div className="flex flex-wrap gap-2">
              {items.map(e => (
                <Toggle key={e} active={(profile.workoutEquipment || []).includes(e)} onClick={() => toggleArray("workoutEquipment", e)}>{e}</Toggle>
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* Recovery equipment */}
      <Section title="Recovery Equipment">
        <div className="flex flex-wrap gap-2">
          {RECOVERY_EQUIPMENT.map(e => (
            <Toggle key={e} active={(profile.recoveryEquipment || []).includes(e)} onClick={() => toggleArray("recoveryEquipment", e)}>{e}</Toggle>
          ))}
        </div>
      </Section>

      {/* Qualifying cuts */}
      {cutsAchieved.length > 0 && (
        <Section title="Qualifying Cuts Achieved">
          <div className="flex flex-wrap gap-2">
            {cutsAchieved.map(({ event, cut }) => (
              <span key={`${event}_${cut}`} className={`text-xs border px-2 py-1 rounded-full ${CUT_COLORS[cut]}`}>
                {cut} · {event}
              </span>
            ))}
          </div>
        </Section>
      )}

      <button onClick={save}
        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-colors">
        Save Profile
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h3 className="text-white/50 text-xs uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${active ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "bg-white/5 border-white/10 text-white/50 hover:text-white"}`}>
      {children}
    </button>
  );
}