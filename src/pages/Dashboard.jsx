import { useState } from "react";
import { Link } from "react-router-dom";
import { getProfile, getPractices, getDrylandSessions, getTimes, getStreak } from "@/lib/storage";
import { getLevel, getNextLevel, getLevelProgress, formatTime, calcFINAPoints, getBestCut, getAllCutsAchieved, getTotalYards, getSwimScore } from "@/lib/utils/swim";
import { SCY_EVENTS, LCM_EVENTS, CUT_COLORS, LEVELS } from "@/lib/constants";
import { Zap, Waves, Dumbbell, Star, Trophy, Target, ChevronRight, Calendar, Flame } from "lucide-react";

export default function Dashboard() {
  const [profile] = useState(getProfile());
  const [practices] = useState(getPractices());
  const [times] = useState(getTimes());
  const [drylandSessions] = useState(getDrylandSessions());

  const xp = profile.xp || 0;
  const level = getLevel(xp);
  const nextLevel = getNextLevel(xp);
  const progress = getLevelProgress(xp);
  const totalYards = getTotalYards(practices);
  const swimScore = getSwimScore(xp);
  const streak = getStreak(practices);
  const course = profile.coursePreference || "SCY";
  const gender = profile.gender || "M";
  const cutsAchieved = getAllCutsAchieved(times, course, gender);

  // Best event by FINA points
  const allEvents = course === "SCY" ? Object.values(SCY_EVENTS).flat() : Object.values(LCM_EVENTS).flat();
  let bestEvent = null, bestFINA = 0, bestTime = null;
  allEvents.forEach(event => {
    const key = `${event}_${course}`;
    if (times[key]) {
      const pts = calcFINAPoints(event, course, gender, times[key]);
      if (pts && pts > bestFINA) { bestFINA = pts; bestEvent = event; bestTime = times[key]; }
    }
  });

  const recentPractices = practices.slice(0, 5);

  const statCards = [
    { label: "Practices", value: practices.length, icon: Waves, color: "text-cyan-400" },
    { label: "Season Yards", value: totalYards.toLocaleString(), icon: Target, color: "text-blue-400" },
    { label: "Swim Score", value: swimScore, icon: Star, color: "text-yellow-400" },
    { label: "Dryland", value: drylandSessions.length, icon: Dumbbell, color: "text-green-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-white/50 text-sm mb-1">Welcome back</p>
            <h1 className="text-3xl font-bold text-white">{profile.name || "Swimmer"}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-cyan-400 text-sm font-bold">{level.name}</span>
              {profile.club && <span className="text-white/40 text-sm">· {profile.club}</span>}
              {streak > 0 && (
                <span className="flex items-center gap-1 text-orange-400 text-sm font-bold">
                  <Flame className="w-3.5 h-3.5" /> {streak} day{streak !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-2xl">{xp.toLocaleString()}</span>
              <span className="text-white/40 text-sm">XP</span>
            </div>
            {nextLevel && (
              <p className="text-white/40 text-xs">{nextLevel.min - xp} XP to {nextLevel.name}</p>
            )}
          </div>
        </div>

        {/* XP Progress with level labels */}
        <div className="mt-4">
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            {LEVELS.map((l, i) => {
              const isActive = l.name === level.name;
              const isPast = l.min <= xp;
              return (
                <div key={l.name} className="flex flex-col items-center" style={{ width: `${100 / LEVELS.length}%` }}>
                  <div className={`w-2 h-2 rounded-full mb-1 ${isActive ? "bg-cyan-400 ring-2 ring-cyan-400/30" : isPast ? "bg-cyan-600" : "bg-white/15"}`} />
                  <span className={`text-[9px] leading-tight text-center ${isActive ? "text-cyan-400 font-bold" : isPast ? "text-white/50" : "text-white/20"}`}>
                    {l.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(card => (
          <div key={card.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-white/40 text-xs mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Best Event */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Trophy className="w-3 h-3" /> Best Event
          </h3>
          {bestEvent ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-lg">{bestEvent}</div>
                <div className="text-white/40 text-sm font-mono">{bestTime} · {course}</div>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 font-bold text-xl">{bestFINA}</div>
                <div className="text-white/30 text-xs">FINA pts</div>
              </div>
            </div>
          ) : (
            <Link to="/records" className="text-white/30 text-sm hover:text-cyan-400 transition-colors">
              No times entered → Add in Records
            </Link>
          )}
        </div>

        {/* Goal Meet */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Target className="w-3 h-3" /> Goal Meet
          </h3>
          {profile.goalMeet ? (
            <div className="text-white font-bold">{profile.goalMeet}</div>
          ) : (
            <Link to="/profile" className="text-white/30 text-sm hover:text-cyan-400 transition-colors">
              Set in Profile →
            </Link>
          )}
        </div>
      </div>

      {/* Qualifying Cuts */}
      {cutsAchieved.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star className="w-3 h-3" /> Qualifying Cuts Achieved
          </h3>
          <div className="flex flex-wrap gap-2">
            {cutsAchieved.map(({ event, cut }) => (
              <span key={`${event}_${cut}`} className={`text-xs border px-2 py-1 rounded-full ${CUT_COLORS[cut] || "text-white border-white/20"}`}>
                {cut} · {event}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Practices */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/50 text-xs uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Recent Practices
          </h3>
          <Link to="/log-practice" className="text-cyan-400 text-xs hover:text-cyan-300 flex items-center gap-1">
            Log Practice <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {recentPractices.length === 0 ? (
          <p className="text-white/30 text-sm">No practices logged yet.</p>
        ) : (
          <div className="space-y-2">
            {recentPractices.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <span className="text-white text-sm">{p.focus || "Practice"}</span>
                  <span className="text-white/30 text-xs ml-2">{new Date(p.date).toLocaleDateString()}</span>
                </div>
                <span className="text-cyan-400 text-sm">{(p.totalYards || 0).toLocaleString()} yds</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}