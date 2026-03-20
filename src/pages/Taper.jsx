import { useState } from "react";
import { getProfile } from "@/lib/storage";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Calendar } from "lucide-react";

export default function Taper() {
  const profile = getProfile();
  const [meetDate, setMeetDate] = useState("");
  const [weeklyYardage, setWeeklyYardage] = useState(30000);

  const taperWeeks = [
    { week: "Week 1", pct: 1.0, label: "100%" },
    { week: "Week 2", pct: 0.8, label: "80%" },
    { week: "Week 3", pct: 0.6, label: "60%" },
    { week: "Week 4", pct: 0.4, label: "40%" },
  ];

  const taperData = taperWeeks.map(w => ({
    ...w,
    yards: Math.round(weeklyYardage * w.pct),
  }));

  const weeksUntilMeet = meetDate
    ? Math.max(0, Math.ceil((new Date(meetDate) - new Date()) / (7 * 24 * 60 * 60 * 1000)))
    : null;

  const currentWeekData = weeksUntilMeet !== null && weeksUntilMeet <= 4
    ? taperData[4 - Math.min(weeksUntilMeet, 4)]
    : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Taper Planner</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Meet date */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <label className="text-white/40 text-xs block mb-2 flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Meet Date
          </label>
          <input type="date" value={meetDate} onChange={e => setMeetDate(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
          {profile.goalMeet && (
            <p className="text-white/30 text-xs mt-2">Goal meet: {profile.goalMeet}</p>
          )}
          {weeksUntilMeet !== null && (
            <p className="text-cyan-400 text-sm mt-2 font-bold">{weeksUntilMeet} weeks until meet</p>
          )}
        </div>

        {/* Yardage slider */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <label className="text-white/40 text-xs block mb-2">Peak Weekly Yardage</label>
          <div className="text-cyan-400 text-2xl font-bold mb-3">{weeklyYardage.toLocaleString()} yds</div>
          <input type="range" min={10000} max={60000} step={1000} value={weeklyYardage}
            onChange={e => setWeeklyYardage(parseInt(e.target.value))}
            className="w-full accent-cyan-500" />
          <div className="flex justify-between text-white/30 text-xs mt-1">
            <span>10k</span><span>60k</span>
          </div>
        </div>
      </div>

      {/* Current week highlight */}
      {currentWeekData && (
        <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-4">
          <div className="text-cyan-400 text-xs uppercase tracking-wider mb-1">This Week's Target</div>
          <div className="text-white text-2xl font-bold">{currentWeekData.yards.toLocaleString()} yards</div>
          <div className="text-white/40 text-sm">{currentWeekData.label} of peak · {weeksUntilMeet} weeks out</div>
        </div>
      )}

      {/* Taper curve chart */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-white/50 text-xs uppercase tracking-wider mb-4">4-Week Taper Curve</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={taperData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis dataKey="week" stroke="#ffffff30" tick={{ fill: "#ffffff60", fontSize: 12 }} />
            <YAxis stroke="#ffffff30" tick={{ fill: "#ffffff60", fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              labelStyle={{ color: "#fff" }}
              formatter={(v) => [v.toLocaleString() + " yds", "Target"]}
            />
            {taperData.map((entry, i) => (
              <Cell key={i} fill={`rgba(6,182,212,${0.3 + i * 0.17})`} />
            ))}
            <Bar dataKey="yards" radius={[4, 4, 0, 0]}>
              {taperData.map((_, i) => (
                <Cell key={i} fill={`rgba(6,182,212,${1 - i * 0.2})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Week breakdown table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-white/50 text-xs uppercase tracking-wider">Weekly Yard Targets</h3>
        </div>
        <div className="divide-y divide-white/5">
          {taperData.map((w, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-white text-sm">{w.week} <span className="text-white/30 text-xs">({w.label})</span></div>
                <div className="text-white/30 text-xs">{i === 0 ? "Full training" : i === 1 ? "Begin taper" : i === 2 ? "Mid taper" : "Race week"}</div>
              </div>
              <div className="text-cyan-400 font-bold">{w.yards.toLocaleString()} yds</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}