import { getPractices, getDrylandSessions, getTimes, getProfile } from "@/lib/storage";
import { calcFINAPoints, getBestCut, getTotalYards } from "@/lib/utils/swim";
import { SCY_EVENTS, LCM_EVENTS, TIME_OF_DAY, CUT_COLORS } from "@/lib/constants";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Analytics() {
  const practices = getPractices();
  const drylandSessions = getDrylandSessions();
  const times = getTimes();
  const profile = getProfile();

  const course = profile.coursePreference || "SCY";
  const gender = profile.gender || "M";

  const totalYards = getTotalYards(practices);
  const avgYards = practices.length > 0 ? Math.round(totalYards / practices.length) : 0;
  const peakYards = practices.reduce((m, p) => Math.max(m, p.totalYards || 0), 0);

  // Yardage trend (last 8 practices)
  const trend = practices.slice(0, 8).reverse().map((p, i) => ({
    name: `#${i + 1}`,
    yards: p.totalYards || 0,
    date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  // Weekly volume (last 8 weeks)
  const getWeekLabel = (date) => {
    const d = new Date(date);
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - d.getDay());
    return startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const weeklyMap = {};
  practices.forEach(p => {
    const d = new Date(p.date);
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - d.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const key = startOfWeek.getTime();
    if (!weeklyMap[key]) weeklyMap[key] = { yards: 0, practices: 0, label: getWeekLabel(p.date) };
    weeklyMap[key].yards += p.totalYards || 0;
    weeklyMap[key].practices += 1;
  });

  const weeklyVolume = Object.entries(weeklyMap)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .slice(0, 8)
    .reverse()
    .map(([, val]) => val);

  // Time of day distribution
  const timeDist = TIME_OF_DAY.reduce((acc, t) => {
    acc[t] = practices.filter(p => p.timeOfDay === t).length;
    return acc;
  }, {});

  // Top swims by FINA
  const allEvents = course === "SCY" ? Object.values(SCY_EVENTS).flat() : Object.values(LCM_EVENTS).flat();
  const topSwims = allEvents.map(event => {
    const key = `${event}_${course}`;
    const timeVal = times[key];
    if (!timeVal) return null;
    const pts = calcFINAPoints(event, course, gender, timeVal);
    const cut = getBestCut(event, course, gender, timeVal);
    return { event, time: timeVal, pts, cut };
  }).filter(Boolean).filter(s => s.pts).sort((a, b) => b.pts - a.pts).slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      {/* Season stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Yards", value: totalYards.toLocaleString(), color: "text-cyan-400" },
          { label: "Avg / Practice", value: avgYards.toLocaleString(), color: "text-blue-400" },
          { label: "Peak Practice", value: peakYards.toLocaleString(), color: "text-purple-400" },
          { label: "Dryland Sessions", value: drylandSessions.length, color: "text-green-400" },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-white/30 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly Volume Chart */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-white/50 text-xs uppercase tracking-wider mb-4">Weekly Training Volume (Last 8 Weeks)</h3>
        {weeklyVolume.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyVolume}>
              <XAxis dataKey="label" stroke="#ffffff20" tick={{ fill: "#ffffff40", fontSize: 10 }} />
              <YAxis stroke="#ffffff20" tick={{ fill: "#ffffff40", fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
                formatter={(v, name) => {
                  if (name === "yards") return [v.toLocaleString() + " yds", "Yards"];
                  return [v, name];
                }}
              />
              <Bar dataKey="yards" radius={[4, 4, 0, 0]}>
                {weeklyVolume.map((entry, i) => (
                  <Cell key={i} fill={`rgba(99,102,241,${0.4 + (i / weeklyVolume.length) * 0.6})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-white/20 text-center py-8 text-sm">No practice data yet</div>
        )}
      </div>

      {/* Yardage trend */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-white/50 text-xs uppercase tracking-wider mb-4">Yardage Trend (Last 8 Practices)</h3>
        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={trend}>
              <XAxis dataKey="date" stroke="#ffffff20" tick={{ fill: "#ffffff40", fontSize: 10 }} />
              <YAxis stroke="#ffffff20" tick={{ fill: "#ffffff40", fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
                formatter={v => [v.toLocaleString() + " yds", "Yards"]}
              />
              <Bar dataKey="yards" radius={[3, 3, 0, 0]}>
                {trend.map((_, i) => (
                  <Cell key={i} fill={`rgba(6,182,212,${0.5 + (i / trend.length) * 0.5})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-white/20 text-center py-8 text-sm">No practice data yet</div>
        )}
      </div>

      {/* Time of day */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-white/50 text-xs uppercase tracking-wider mb-4">Practice Time Distribution</h3>
        <div className="grid grid-cols-4 gap-3">
          {TIME_OF_DAY.map(t => (
            <div key={t} className="text-center">
              <div className="text-white font-bold text-xl">{timeDist[t] || 0}</div>
              <div className="text-white/30 text-xs mt-1">{t}</div>
              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${practices.length > 0 ? (timeDist[t] / practices.length) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top swims table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-white/50 text-xs uppercase tracking-wider">Top Swims by FINA Points ({course})</h3>
        </div>
        {topSwims.length === 0 ? (
          <div className="px-4 py-8 text-white/20 text-center text-sm">No times entered in Records</div>
        ) : (
          <div className="divide-y divide-white/5">
            {topSwims.map((swim, i) => (
              <div key={swim.event} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-white/20 text-sm w-5 text-right">{i + 1}</span>
                  <div>
                    <div className="text-white text-sm font-bold">{swim.event}</div>
                    <div className="text-white/40 text-xs font-mono">{swim.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {swim.cut && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${CUT_COLORS[swim.cut]}`}>{swim.cut}</span>
                  )}
                  <span className="text-yellow-400 font-bold text-sm">{swim.pts}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}