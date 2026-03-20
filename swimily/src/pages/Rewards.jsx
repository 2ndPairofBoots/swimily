import { useState, useRef } from "react";
import { getProfile, addXP, getPractices, getDrylandSessions, getSpinData, saveSpinData } from "@/lib/storage";
import { getLevel, getNextLevel, getLevelProgress } from "@/lib/utils/swim";
import { Zap, Gift, Star, Award, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";

const SPIN_PRIZES = [
  { label: "+25 XP", xp: 25, color: "text-white/60", bg: "#334155" },
  { label: "+50 XP", xp: 50, color: "text-green-400", bg: "#065f46" },
  { label: "+100 XP", xp: 100, color: "text-cyan-400", bg: "#164e63" },
  { label: "+200 XP", xp: 200, color: "text-yellow-400", bg: "#713f12" },
  { label: "Rest Day Pass", xp: 0, color: "text-blue-400", bg: "#1e3a5f" },
  { label: "Motivation Boost", xp: 0, color: "text-purple-400", bg: "#4c1d95" },
  { label: "Surprise Challenge", xp: 0, color: "text-orange-400", bg: "#7c2d12" },
  { label: "Double XP Day", xp: 0, color: "text-red-400", bg: "#7f1d1d" },
];

const BADGE_TIERS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
const BADGE_COLORS = { Bronze: "text-amber-600", Silver: "text-gray-300", Gold: "text-yellow-400", Platinum: "text-cyan-300", Diamond: "text-purple-400" };

const BADGES = [
  { name: "Practices Logged", thresholds: [10, 50, 100, 250, 500], getValue: (p, d) => p.length },
  { name: "Total Yards", thresholds: [10000, 50000, 100000, 250000, 1000000], getValue: (p) => p.reduce((s, x) => s + (x.totalYards || 0), 0) },
  { name: "Dryland Sessions", thresholds: [5, 15, 30, 75, 150], getValue: (p, d) => d.length },
  { name: "Early Bird", thresholds: [5, 15, 30, 60, 100], getValue: (p) => p.filter(x => x.timeOfDay === "Morning").length },
];

const getCurrentWeekKey = () => {
  const d = new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
};

const loggedPracticeToday = (practices) => {
  const today = new Date().toDateString();
  return practices.some(p => new Date(p.date).toDateString() === today);
};

export default function Rewards() {
  const [profile, setProfile] = useState(getProfile());
  const practices = getPractices();
  const dryland = getDrylandSessions();
  const [spinData, setSpinData] = useState(getSpinData());
  const [spinResult, setSpinResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);

  const xp = profile.xp || 0;
  const level = getLevel(xp);
  const nextLevel = getNextLevel(xp);
  const progress = getLevelProgress(xp);

  const weekKey = getCurrentWeekKey();
  const canSpin = loggedPracticeToday(practices) && spinData.weekKey !== weekKey;

  const doSpin = () => {
    if (!canSpin || spinning) return;
    setSpinning(true);
    setSpinResult(null);

    const prizeIndex = Math.floor(Math.random() * SPIN_PRIZES.length);
    const prize = SPIN_PRIZES[prizeIndex];

    // Calculate rotation: land on the prize segment
    const segmentAngle = 360 / SPIN_PRIZES.length;
    const prizeAngle = segmentAngle * prizeIndex + segmentAngle / 2;
    // Spin multiple full rotations + offset to land on prize
    const newRotation = rotation + 360 * 5 + (360 - prizeAngle);
    setRotation(newRotation);

    setTimeout(() => {
      setSpinResult(prize);
      if (prize.xp > 0) {
        addXP(prize.xp);
        setProfile(getProfile());
      }
      const newSpinData = { weekKey, spinsUsed: (spinData.spinsUsed || 0) + 1 };
      setSpinData(newSpinData);
      saveSpinData(newSpinData);
      setSpinning(false);

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#06b6d4", "#eab308", "#a855f7", "#22c55e"],
      });
    }, 3500);
  };

  // Daily challenges
  const todayPractices = practices.filter(p => new Date(p.date).toDateString() === new Date().toDateString());
  const todaySets = todayPractices.flatMap(p => p.sets || []);
  const todayYards = todayPractices.reduce((s, p) => s + (p.totalYards || 0), 0);
  const todayDryland = dryland.filter(d => new Date(d.date).toDateString() === new Date().toDateString()).length;

  const challenges = [
    { label: "Log 3+ sets today", progress: Math.min(todaySets.length, 3), max: 3 },
    { label: "5,000 yards today", progress: Math.min(todayYards, 5000), max: 5000, format: v => `${v.toLocaleString()}` },
    { label: "Add splits to every set", progress: todaySets.filter(s => s.rest).length, max: Math.max(todaySets.length, 1) },
    { label: "Complete a dryland session", progress: Math.min(todayDryland, 1), max: 1 },
  ];

  const segmentAngle = 360 / SPIN_PRIZES.length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Rewards</h1>

      {/* Level */}
      <div className="bg-gradient-to-br from-yellow-900/20 to-cyan-900/20 border border-yellow-500/20 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-yellow-400 font-bold text-xl">{level.name}</div>
            <div className="text-white/40 text-sm flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> {xp.toLocaleString()} XP</div>
          </div>
          {nextLevel && (
            <div className="text-right text-white/30 text-sm">
              <div>{nextLevel.min - xp} XP to</div>
              <div className="text-cyan-400 font-bold">{nextLevel.name}</div>
            </div>
          )}
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-500 to-cyan-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Weekly Spin — Animated Wheel */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-bold mb-1 flex items-center gap-2"><Gift className="w-4 h-4 text-purple-400" /> Weekly Spin</h3>
        <p className="text-white/40 text-xs mb-5">Log a practice today to unlock. 1 spin per week.</p>

        {spinResult && (
          <div className={`mb-4 text-center text-xl font-bold ${spinResult.color} animate-bounce`}>
            🎉 {spinResult.label}!
          </div>
        )}

        {/* Wheel */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-64 h-64 md:w-72 md:h-72">
            {/* Pointer */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-cyan-400 drop-shadow-lg" />

            {/* Spinning wheel */}
            <div
              ref={wheelRef}
              className="w-full h-full rounded-full border-4 border-white/20 overflow-hidden relative"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? "transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              }}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {SPIN_PRIZES.map((prize, i) => {
                  const startAngle = i * segmentAngle;
                  const endAngle = startAngle + segmentAngle;
                  const startRad = (Math.PI * (startAngle - 90)) / 180;
                  const endRad = (Math.PI * (endAngle - 90)) / 180;
                  const x1 = 100 + 100 * Math.cos(startRad);
                  const y1 = 100 + 100 * Math.sin(startRad);
                  const x2 = 100 + 100 * Math.cos(endRad);
                  const y2 = 100 + 100 * Math.sin(endRad);
                  const largeArc = segmentAngle > 180 ? 1 : 0;

                  // Text position
                  const midAngle = (startAngle + endAngle) / 2;
                  const midRad = (Math.PI * (midAngle - 90)) / 180;
                  const textX = 100 + 62 * Math.cos(midRad);
                  const textY = 100 + 62 * Math.sin(midRad);

                  return (
                    <g key={i}>
                      <path
                        d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                        fill={prize.bg}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="0.5"
                      />
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="7"
                        fontWeight="bold"
                        fontFamily="JetBrains Mono, monospace"
                        transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                      >
                        {prize.label}
                      </text>
                    </g>
                  );
                })}
                {/* Center circle */}
                <circle cx="100" cy="100" r="18" fill="#111" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                <text x="100" y="100" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="8" fontWeight="bold">SPIN</text>
              </svg>
            </div>
          </div>
        </div>

        <button onClick={doSpin} disabled={!canSpin || spinning}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${canSpin && !spinning ? "bg-purple-500 hover:bg-purple-400 text-white" : "bg-white/5 text-white/20 cursor-not-allowed"}`}>
          {spinning ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Spinning...</>
          ) : canSpin ? (
            <><Gift className="w-4 h-4" /> Spin Now!</>
          ) : (
            <span>{loggedPracticeToday(practices) ? "Already spun this week" : "Log a practice today to unlock"}</span>
          )}
        </button>
      </div>

      {/* Daily Challenges */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> Daily Challenges</h3>
        <div className="space-y-4">
          {challenges.map(ch => {
            const pct = Math.min(100, (ch.progress / ch.max) * 100);
            const done = ch.progress >= ch.max;
            return (
              <div key={ch.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className={done ? "text-green-400" : "text-white/70"}>{ch.label}</span>
                  <span className="text-white/40 font-mono text-xs">
                    {ch.format ? ch.format(ch.progress) : ch.progress}/{ch.format ? ch.format(ch.max) : ch.max}
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${done ? "bg-green-500" : "bg-cyan-500"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-400" /> Badges</h3>
        <div className="space-y-4">
          {BADGES.map(badge => {
            const value = badge.getValue(practices, dryland);
            const achieved = badge.thresholds.filter(t => value >= t).length;
            const currentTier = achieved > 0 ? BADGE_TIERS[achieved - 1] : null;
            const nextTier = achieved < BADGE_TIERS.length ? BADGE_TIERS[achieved] : null;
            const nextThreshold = badge.thresholds[achieved];

            return (
              <div key={badge.name}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-white text-sm">{badge.name}</span>
                    {currentTier && <span className={`ml-2 text-xs ${BADGE_COLORS[currentTier]}`}>{currentTier}</span>}
                  </div>
                  <span className="text-white/30 text-xs">{typeof value === "number" && value > 1000 ? value.toLocaleString() : value}</span>
                </div>
                <div className="flex gap-1">
                  {BADGE_TIERS.map((tier, i) => (
                    <div key={tier} className={`h-2 flex-1 rounded-full ${i < achieved ? "bg-gradient-to-r from-yellow-500 to-cyan-500" : "bg-white/10"}`} />
                  ))}
                </div>
                {nextTier && nextThreshold && (
                  <div className="text-white/20 text-xs mt-1">{nextThreshold - value > 0 ? `${(nextThreshold - value).toLocaleString()} until ${nextTier}` : ""}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}