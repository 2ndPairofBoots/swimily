import { useState } from "react";
import { getProfile } from "@/lib/storage";
import { parseTime, formatTime, PACING_PROFILES } from "@/lib/utils/swim";
import { SCY_EVENTS, LCM_EVENTS } from "@/lib/constants";
import { Calculator } from "lucide-react";

const ALL_EVENTS = [...new Set([...Object.values(SCY_EVENTS).flat(), ...Object.values(LCM_EVENTS).flat()])];

export default function RaceSplits() {
  const profile = getProfile();
  const [event, setEvent] = useState("100 FR");
  const [goalTime, setGoalTime] = useState("");
  const [paceType, setPaceType] = useState("elite");
  const [splits, setSplits] = useState([]);
  const [actualSplits, setActualSplits] = useState([]);
  const [calculated, setCalculated] = useState(false);

  const calculate = () => {
    const total = parseTime(goalTime);
    if (!total) return;
    const pacingProfile = PACING_PROFILES[event];
    if (!pacingProfile) return;

    const newSplits = pacingProfile.map(pct => ({ target: total * pct, actual: "" }));
    setSplits(newSplits);
    setActualSplits(newSplits.map(() => ""));
    setCalculated(true);
  };

  const getEventDist = (event) => parseInt(event.split(" ")[0]);
  const getEventLaps = (event) => {
    const dist = getEventDist(event);
    return PACING_PROFILES[event]?.length || Math.ceil(dist / 50);
  };

  const lapSize = getEventDist(event) / (PACING_PROFILES[event]?.length || 1);

  let cumulative = 0;
  const splitRows = splits.map((split, i) => {
    const rangeStart = Math.round(i * lapSize);
    const rangeEnd = Math.round((i + 1) * lapSize);
    const actual = parseTime(actualSplits[i]);
    const diff = actual ? actual - split.target : null;
    cumulative += split.target;
    return {
      range: `${rangeStart}–${rangeEnd}`,
      target: split.target,
      cumulative,
      actual,
      diff,
    };
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Race Splits</h1>

      {/* Swimmer profile */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-white/30 text-xs mb-1">Specialty</div>
          <div className="text-white">{profile.specialty || "—"}</div>
        </div>
        <div>
          <div className="text-white/30 text-xs mb-1">Primary Strokes</div>
          <div className="text-white">{profile.primaryStrokes?.join(", ") || "—"}</div>
        </div>
        <div>
          <div className="text-white/30 text-xs mb-1">Warmup Distance</div>
          <div className="text-white">{profile.warmupDistance || 400} yds</div>
        </div>
      </div>

      {/* Calculator inputs */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="col-span-2 md:col-span-1">
            <label className="text-white/40 text-xs block mb-1">Event</label>
            <select value={event} onChange={e => { setEvent(e.target.value); setCalculated(false); }}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500">
              {ALL_EVENTS.filter(e => PACING_PROFILES[e]).map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">Goal Time</label>
            <input value={goalTime} onChange={e => setGoalTime(e.target.value)}
              placeholder="1:45.00" className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1">Pace Profile</label>
            <select value={paceType} onChange={e => setPaceType(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500">
              <option value="elite">Elite</option>
              <option value="age_group">Age Group</option>
            </select>
          </div>
        </div>
        <button onClick={calculate}
          className="flex items-center gap-2 bg-cyan-500 text-black font-bold px-6 py-2 rounded-lg text-sm hover:bg-cyan-400 transition-colors">
          <Calculator className="w-4 h-4" /> Calculate Splits
        </button>
      </div>

      {/* Splits table */}
      {calculated && splitRows.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[80px,1fr,1fr,1fr,1fr] text-xs text-white/30 px-4 py-2 border-b border-white/10">
            <span>Lap</span><span>Target</span><span>Cumulative</span><span>Actual</span><span>Diff</span>
          </div>
          {splitRows.map((row, i) => (
            <div key={i} className="grid grid-cols-[80px,1fr,1fr,1fr,1fr] items-center px-4 py-2.5 border-b border-white/5 last:border-0">
              <span className="text-white/50 text-xs">{row.range}</span>
              <span className="text-white font-mono text-sm">{formatTime(row.target)}</span>
              <span className="text-white/50 font-mono text-sm">{formatTime(row.cumulative)}</span>
              <input
                value={actualSplits[i] || ""}
                onChange={e => {
                  const updated = [...actualSplits];
                  updated[i] = e.target.value;
                  setActualSplits(updated);
                }}
                placeholder="0:00.00"
                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm font-mono text-white w-24 focus:outline-none focus:border-cyan-500"
              />
              <span className={`font-mono text-sm font-bold ${row.diff === null ? "text-white/20" : row.diff <= 0 ? "text-green-400" : "text-red-400"}`}>
                {row.diff !== null ? (row.diff <= 0 ? "-" : "+") + Math.abs(row.diff).toFixed(2) : "—"}
              </span>
            </div>
          ))}
          <div className="px-4 py-3 border-t border-white/10 flex justify-between text-sm">
            <span className="text-white/40">Goal Total</span>
            <span className="text-cyan-400 font-mono font-bold">{formatTime(parseTime(goalTime))}</span>
          </div>
        </div>
      )}
    </div>
  );
}