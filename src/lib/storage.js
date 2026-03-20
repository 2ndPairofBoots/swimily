// LocalStorage helpers
const PREFIX = "swimily_";

export const storage = {
  get: (key, defaultVal = null) => {
    try {
      const val = localStorage.getItem(PREFIX + key);
      return val ? JSON.parse(val) : defaultVal;
    } catch { return defaultVal; }
  },
  set: (key, val) => {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch {}
  },
  remove: (key) => { localStorage.removeItem(PREFIX + key); },
};

export const getProfile = () => storage.get("profile", {
  name: "Swimmer",
  gender: "M",
  age: "",
  club: "",
  lsc: "",
  usaSwimmingId: "",
  yearsCompetitive: "",
  avgSleep: "",
  swimcloudUrl: "",
  coursePreference: "SCY",
  specialty: "Mid-distance",
  primaryStrokes: [],
  goalMeet: "",
  goalEvents: [],
  goalTimes: {},
  warmupDistance: 400,
  injuryHistory: "",
  swimEquipment: [],
  workoutEquipment: [],
  recoveryEquipment: [],
  xp: 0,
});

export const saveProfile = (profile) => storage.set("profile", profile);

export const getPractices = () => storage.get("practices", []);
export const savePractices = (p) => storage.set("practices", p);

export const addPractice = (practice) => {
  const practices = getPractices();
  const newPractice = { ...practice, id: Date.now().toString(), date: practice.date || new Date().toISOString() };
  practices.unshift(newPractice);
  savePractices(practices);
  return newPractice;
};

export const getTimes = () => storage.get("times", {});
export const saveTimes = (t) => storage.set("times", t);

export const getMeets = () => storage.get("meets", [
  { id: "1", name: "Conference Championships", date: "2026-02-20", type: "Championship", location: "Aquatic Center" },
  { id: "2", name: "Winter Invitational", date: "2026-01-15", type: "Invitational", location: "City Pool" },
  { id: "3", name: "Spring Dual Meet", date: "2026-03-01", type: "Dual", location: "Home Pool" },
  { id: "4", name: "Summer Time Trial", date: "2026-04-10", type: "Time Trial", location: "Outdoor Pool" },
]);
export const saveMeets = (m) => storage.set("meets", m);

export const getDrylandSessions = () => storage.get("drylandSessions", []);
export const addDrylandSession = (session) => {
  const sessions = getDrylandSessions();
  sessions.unshift({ ...session, id: Date.now().toString(), date: new Date().toISOString() });
  storage.set("drylandSessions", sessions);
};

export const getSpinData = () => storage.get("spinData", { weekKey: "", spinsUsed: 0 });
export const saveSpinData = (d) => storage.set("spinData", d);

export const addXP = (amount) => {
  const profile = getProfile();
  profile.xp = (profile.xp || 0) + amount;
  saveProfile(profile);
  return profile.xp;
};

export const deletePractice = (id) => {
  const practices = getPractices();
  savePractices(practices.filter(p => p.id !== id));
};

export const getStreak = (practices) => {
  if (practices.length === 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get unique practice dates sorted descending
  const dates = [...new Set(practices.map(p => {
    const d = new Date(p.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }))].sort((a, b) => b - a);
  
  const DAY = 86400000;
  // Check if practiced today or yesterday (streak is still alive)
  if (dates[0] < today.getTime() - DAY) return 0;
  
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    if (dates[i - 1] - dates[i] === DAY) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};