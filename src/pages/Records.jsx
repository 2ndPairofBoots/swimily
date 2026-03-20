import { useState } from "react";
import { getTimes, saveTimes, getProfile, saveProfile } from "@/lib/storage";
import { calcFINAPoints, getBestCut, formatTime, parseTime } from "@/lib/utils/swim";
import { SCY_EVENTS, LCM_EVENTS, CUT_ORDER, CUTS_SCY_M, CUTS_SCY_F, CUTS_LCM_M, CUTS_LCM_F, CUT_COLORS } from "@/lib/constants";
import { Star, Target } from "lucide-react";

const FINA_COLORS = (pts) => {
  if (!pts) return "text-white/30";
  if (pts >= 900) return "text-yellow-400";
  if (pts >= 700) return "text-gray-300";
  if (pts >= 500) return "text-amber-600";
  return "text-white/50";
};

export default function Records() {
  const profile = getProfile();
  const [course, setCourse] = useState(profile.coursePreference || "SCY");
  const [gender, setGender] = useState(profile.gender || "M");
  const [activeGroup, setActiveGroup] = useState("Free");
  const [times, setTimes] = useState(getTimes());
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [goalTimes, setGoalTimes] = useState(profile.goalTimes || {});

  const events = course === "SCY" ? SCY_EVENTS : LCM_EVENTS;
  const cutsTable = course === "SCY" ? (gender === "F" ? CUTS_SCY_F : CUTS_SCY_M) : (gender === "F" ? CUTS_LCM_F : CUTS_LCM_M);

  const handleTimeChange = (event, val) => {
    const updated = { ...times, [`${event}_${course}`]: val };
    setTimes(updated);
    saveTimes(updated);
  };

  const handleGoalTimeChange = (event, val) => {
    const updated = { ...goalTimes, [`${event}_${course}`]: val };
    setGoalTimes(updated);
    const p = getProfile();
    p.goalTimes = updated;
    saveProfile(p);
  };

  const groupEvents = events[activeGroup] || [];
  const hasAnyTime = groupEvents.some(e => times[`${e}_${course}`]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Personal Records</h1>
        <div className="flex items-center gap-2">
          {/* Course toggle */}
          <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            {["SCY", "LCM"].map(c => (
              <button key={c} onClick={() => setCourse(c)}
                className={`px-3 py-1.5 text-sm transition-colors ${course === c ? "bg-cyan-500 text-black font-bold" : "text-white/60 hover:text-white"}`}>
                {c}
              </button>
            ))}
          </div>
          {/* Gender toggle */}
          <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            {["M", "F"].map(g => (
              <button key={g} onClick={() => setGender(g)}
                className={`px-3 py-1.5 text-sm transition-colors ${gender === g ? "bg-cyan-500 text-black font-bold" : "text-white/60 hover:text-white"}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Event group tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.keys(events).map(g => (
          <button key={g} onClick={() => setActiveGroup(g)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${activeGroup === g ? "bg-white/20 text-white font-bold" : "text-white/40 hover:text-white"}`}>
            {g}
          </button>
        ))}
      </div>

      {/* Events table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr,120px,100px,80px,80px] text-xs text-white/30 px-4 py-2 border-b border-white/10">
          <span>Event</span><span>Time</span><span>Goal</span><span>FINA</span><span>Cut</span>
        </div>

        {/* Empty state */}
        {!hasAnyTime && (
          <div className="px-4 py-4 text-center">
            <p className="text-white/30 text-sm">No times entered for {activeGroup}.</p>
            <p className="text-white/20 text-xs mt-1">Click any row below and type your time in <span className="text-cyan-400/60 font-mono">M:SS.ss</span> format.</p>
          </div>
        )}

        {groupEvents.map(event => {
          const key = `${event}_${course}`;
          const timeVal = times[key] || "";
          const goalVal = goalTimes[key] || "";
          const finaPoints = timeVal ? calcFINAPoints(event, course, gender, timeVal) : null;
          const bestCut = timeVal ? getBestCut(event, course, gender, timeVal) : null;
          const cuts = cutsTable[event];
          const isExpanded = expandedEvent === event;

          // Goal comparison
          const goalSecs = goalVal ? parseTime(goalVal) : null;
          const timeSecs = timeVal ? parseTime(timeVal) : null;
          const goalDiff = goalSecs && timeSecs ? timeSecs - goalSecs : null;

          return (
            <div key={event} className="border-b border-white/5 last:border-0">
              <div className="grid grid-cols-[1fr,120px,100px,80px,80px] items-center px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedEvent(isExpanded ? null : event)}>
                <span className="text-white text-sm font-bold">{event}</span>
                <input
                  value={timeVal}
                  onClick={e => e.stopPropagation()}
                  onChange={e => handleTimeChange(event, e.target.value)}
                  placeholder="0:00.00"
                  className="bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-sm w-28 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <div className="flex items-center gap-1">
                  <input
                    value={goalVal}
                    onClick={e => e.stopPropagation()}
                    onChange={e => handleGoalTimeChange(event, e.target.value)}
                    placeholder="goal"
                    className="bg-black/20 border border-white/5 rounded px-1.5 py-1 text-white/50 text-xs w-20 focus:outline-none focus:border-yellow-500/50 font-mono"
                  />
                </div>
                <span className={`font-bold text-sm ${FINA_COLORS(finaPoints)}`}>
                  {finaPoints !== null ? finaPoints : "—"}
                </span>
                <span>
                  {bestCut ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${CUT_COLORS[bestCut]}`}>{bestCut}</span>
                  ) : <span className="text-white/20 text-sm">—</span>}
                </span>
              </div>

              {/* Goal diff indicator */}
              {goalDiff !== null && (
                <div className="px-4 pb-2 -mt-1">
                  <span className={`text-xs font-mono ${goalDiff <= 0 ? "text-green-400" : "text-orange-400"}`}>
                    <Target className="w-3 h-3 inline mr-1" />
                    {goalDiff <= 0 ? `${Math.abs(goalDiff).toFixed(2)}s under goal ✓` : `${goalDiff.toFixed(2)}s over goal`}
                  </span>
                </div>
              )}

              {isExpanded && cuts && (
                <div className="px-4 pb-3">
                  <div className="text-white/30 text-xs mb-2">Cut standards:</div>
                  <div className="flex flex-wrap gap-2">
                    {CUT_ORDER.map(cut => {
                      const standard = cuts[cut];
                      const achieved = timeVal && parseTime(timeVal) <= standard;
                      return (
                        <div key={cut} className={`text-xs px-2 py-1 rounded border transition-colors ${achieved ? CUT_COLORS[cut] : "text-white/20 border-white/10"}`}>
                          <div className="font-bold">{cut}</div>
                          <div>{formatTime(standard)}</div>
                          {achieved && <Star className="w-2.5 h-2.5 inline ml-0.5" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}