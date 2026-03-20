import { useState } from "react";
import { getPractices } from "@/lib/storage";
import { ChevronLeft, ChevronRight, List, Grid } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function CalendarPage() {
  const practices = getPractices();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("grid");
  const [selectedDay, setSelectedDay] = useState(null);

  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group practices by date
  const byDate = {};
  practices.forEach(p => {
    const d = new Date(p.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate();
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(p);
    }
  });

  const monthPractices = Object.values(byDate).flat();
  const monthYards = monthPractices.reduce((s, p) => s + (p.totalYards || 0), 0);

  const getDotSize = (yards) => {
    if (yards > 8000) return "w-3 h-3 bg-cyan-400";
    if (yards > 5000) return "w-2.5 h-2.5 bg-cyan-500";
    if (yards > 3000) return "w-2 h-2 bg-cyan-600";
    return "w-1.5 h-1.5 bg-cyan-700";
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedPractices = selectedDay ? (byDate[selectedDay] || []) : [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(v => v === "grid" ? "list" : "grid")}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors">
            {view === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-white/40 text-xs mb-1">Practices</div>
          <div className="text-cyan-400 text-2xl font-bold">{monthPractices.length}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-white/40 text-xs mb-1">Total Yards</div>
          <div className="text-cyan-400 text-2xl font-bold">{monthYards.toLocaleString()}</div>
        </div>
      </div>

      {/* Month nav */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <button onClick={() => setDate(new Date(year, month - 1))}
            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-bold">{MONTHS[month]} {year}</span>
          <button onClick={() => setDate(new Date(year, month + 1))}
            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {view === "grid" ? (
          <div>
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-white/5">
              {DAYS.map(d => (
                <div key={d} className="text-center text-white/30 text-xs py-2">{d}</div>
              ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                const dayPractices = day ? (byDate[day] || []) : [];
                const dayYards = dayPractices.reduce((s, p) => s + (p.totalYards || 0), 0);
                const today = new Date();
                const isToday = day && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                const isSelected = day === selectedDay;

                return (
                  <div key={i} onClick={() => day && setSelectedDay(isSelected ? null : day)}
                    className={`min-h-[60px] border-b border-r border-white/5 p-2 cursor-pointer transition-colors
                      ${day ? "hover:bg-white/5" : ""}
                      ${isSelected ? "bg-cyan-900/20" : ""}
                    `}>
                    {day && (
                      <>
                        <div className={`text-xs mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-cyan-500 text-black font-bold" : "text-white/60"}`}>
                          {day}
                        </div>
                        {dayPractices.length > 0 && (
                          <div className="flex justify-center">
                            <div className={`rounded-full ${getDotSize(dayYards)}`} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d => byDate[d]).map(day => (
              <div key={day} className="px-4 py-3">
                <div className="text-white/50 text-xs mb-2">{MONTHS[month]} {day}</div>
                {byDate[day].map(p => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-white">{p.focus}</span>
                    <span className="text-cyan-400">{(p.totalYards || 0).toLocaleString()} yds</span>
                  </div>
                ))}
              </div>
            ))}
            {Object.keys(byDate).length === 0 && (
              <div className="px-4 py-8 text-white/30 text-center text-sm">No practices this month</div>
            )}
          </div>
        )}
      </div>

      {/* Selected day details */}
      {selectedDay && selectedPractices.length > 0 && (
        <div className="bg-white/5 border border-cyan-500/20 rounded-xl p-4">
          <h3 className="text-white font-bold mb-3">{MONTHS[month]} {selectedDay}</h3>
          {selectedPractices.map(p => (
            <div key={p.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-cyan-400">{p.focus} · {p.timeOfDay}</span>
                <span className="text-white">{(p.totalYards || 0).toLocaleString()} yds</span>
              </div>
              {p.sets?.length > 0 && (
                <div className="text-white/40 text-xs space-y-0.5">
                  {p.sets.slice(0, 5).map((s, i) => (
                    <div key={i}>{s.reps > 1 ? `${s.reps}×` : ""}{s.distance} {s.stroke} {s.effort && `(${s.effort})`}</div>
                  ))}
                  {p.sets.length > 5 && <div>+{p.sets.length - 5} more sets</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}