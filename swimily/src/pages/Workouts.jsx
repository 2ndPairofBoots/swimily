import { useState } from "react";
import { addDrylandSession, addXP, getProfile } from "@/lib/storage";
import { DRYLAND_WORKOUTS, XP_DRYLAND } from "@/lib/constants";
import { Dumbbell, Check, ChevronDown, ChevronUp, Zap, Info } from "lucide-react";

export default function Workouts() {
  const [activeTab, setActiveTab] = useState("Push");
  const [saved, setSaved] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState(null);

  const profile = getProfile();
  const userEquip = profile.workoutEquipment || [];

  const canDo = (exercise) => {
    if (!exercise.equipment || exercise.equipment.length === 0) return true;
    return exercise.equipment.some(e => userEquip.includes(e));
  };

  const workout = DRYLAND_WORKOUTS[activeTab];

  const logSession = () => {
    addDrylandSession({ type: activeTab, date: new Date().toISOString() });
    addXP(XP_DRYLAND);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dryland Workouts</h1>
        {saved && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <Check className="w-4 h-4" /> Session logged! <Zap className="w-3 h-3 text-yellow-400" />+{XP_DRYLAND}
          </div>
        )}
      </div>

      {/* PPL Tabs */}
      <div className="flex gap-2">
        {["Push", "Pull", "Legs"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === tab ? "bg-cyan-500 text-black" : "bg-white/5 border border-white/10 text-white/60 hover:text-white"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Warm-up */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">Warm-up</h3>
        <ul className="space-y-1">
          {workout.warmup.map((item, i) => (
            <li key={i} className="text-white/70 text-sm flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">·</span> {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Main exercises */}
      <div className="space-y-2">
        <h3 className="text-white/50 text-xs uppercase tracking-wider">Main Exercises</h3>
        {workout.exercises.map((ex, i) => {
          const canDoEx = canDo(ex);
          const isExpanded = expandedExercise === i;

          return (
            <div key={i} className={`border rounded-xl overflow-hidden transition-colors ${canDoEx ? "border-white/10 bg-white/5" : "border-white/5 bg-white/2 opacity-60"}`}>
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpandedExercise(isExpanded ? null : i)}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${canDoEx ? "text-white" : "text-white/40"}`}>{ex.name}</span>
                    <span className="text-cyan-400 text-xs font-mono">{ex.sets}</span>
                    {!canDoEx && (
                      <span className="text-yellow-400/60 text-xs flex items-center gap-1">
                        <Info className="w-3 h-3" /> needs equipment
                      </span>
                    )}
                  </div>
                  <div className="text-white/30 text-xs mt-0.5">{ex.muscle}</div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
              </div>
              {isExpanded && (
                <div className="border-t border-white/10 px-4 py-3 space-y-2">
                  <div className="text-white/60 text-sm">
                    <span className="text-white/30 text-xs">Swim benefit: </span>{ex.benefit}
                  </div>
                  {ex.equipment.length > 0 && (
                    <div className="text-white/40 text-xs">
                      <span className="text-white/20">Requires: </span>
                      {ex.equipment.map((e, ei) => (
                        <span key={ei} className={`mr-1 ${userEquip.includes(e) ? "text-green-400" : "text-white/30"}`}>{e}</span>
                      ))}
                    </div>
                  )}
                  {!canDoEx && (
                    <div className="text-yellow-400/60 text-xs">
                      Alt: Bodyweight variation — {ex.name.replace("Barbell", "Bodyweight").replace("DB ", "").replace("Machine", "Cable")}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cool-down */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">Cool-down</h3>
        <ul className="space-y-1">
          {workout.cooldown.map((item, i) => (
            <li key={i} className="text-white/70 text-sm flex items-start gap-2">
              <span className="text-green-400 mt-0.5">·</span> {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Log button */}
      <button onClick={logSession}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
        <Dumbbell className="w-5 h-5" /> Log {activeTab} Session (+{XP_DRYLAND} XP)
      </button>
    </div>
  );
}