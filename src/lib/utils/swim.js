import { LEVELS, CUT_ORDER, WR_SCY_M, WR_SCY_F, WR_LCM_M, WR_LCM_F, CUTS_SCY_M, CUTS_SCY_F, CUTS_LCM_M, CUTS_LCM_F } from "../constants";

export const getLevel = (xp) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return { ...LEVELS[i], index: i };
  }
  return { ...LEVELS[0], index: 0 };
};

export const getNextLevel = (xp) => {
  const level = getLevel(xp);
  if (level.index >= LEVELS.length - 1) return null;
  return LEVELS[level.index + 1];
};

export const getLevelProgress = (xp) => {
  const level = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.min - level.min;
  const earned = xp - level.min;
  return Math.min(100, Math.round((earned / range) * 100));
};

// Format seconds to MM:SS.ss
export const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return "--";
  const m = Math.floor(secs / 60);
  const s = (secs % 60).toFixed(2).padStart(5, "0");
  return m > 0 ? `${m}:${s}` : `${s}`;
};

// Parse "1:23.45" or "23.45" to seconds
export const parseTime = (str) => {
  if (!str) return null;
  str = str.trim();
  const parts = str.split(":");
  if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(str);
};

export const calcFINAPoints = (event, course, gender, timeStr) => {
  const time = parseTime(timeStr);
  if (!time) return null;
  let wrTable;
  if (course === "SCY") wrTable = gender === "F" ? WR_SCY_F : WR_SCY_M;
  else wrTable = gender === "F" ? WR_LCM_F : WR_LCM_M;
  const wr = wrTable[event];
  if (!wr) return null;
  return Math.round(1000 * Math.pow(wr / time, 2));
};

export const getBestCut = (event, course, gender, timeStr) => {
  const time = parseTime(timeStr);
  if (!time) return null;
  let cutsTable;
  if (course === "SCY") cutsTable = gender === "F" ? CUTS_SCY_F : CUTS_SCY_M;
  else cutsTable = gender === "F" ? CUTS_LCM_F : CUTS_LCM_M;
  const cuts = cutsTable[event];
  if (!cuts) return null;
  for (const cut of CUT_ORDER) {
    if (cuts[cut] && time <= cuts[cut]) return cut;
  }
  return null;
};

export const getAllCutsAchieved = (times, course, gender) => {
  const achieved = [];
  const cutsTable = course === "SCY"
    ? (gender === "F" ? CUTS_SCY_F : CUTS_SCY_M)
    : (gender === "F" ? CUTS_LCM_F : CUTS_LCM_M);

  Object.entries(times).forEach(([key, timeStr]) => {
    const [event, c] = key.split("_");
    if (c !== course) return;
    const cut = getBestCut(event, course, gender, timeStr);
    if (cut) achieved.push({ event, cut });
  });
  return achieved;
};

export const getTotalYards = (practices) =>
  practices.reduce((sum, p) => sum + (p.totalYards || 0), 0);

export const getSwimScore = (xp) => Math.min(1000, Math.round(xp / 120));

// Workout text parser
export const parseWorkoutText = (text) => {
  const lines = text.split("\n").filter(l => l.trim());
  const sets = [];
  const strokeMap = { fr: "FR", free: "FR", freestyle: "FR", bk: "BK", back: "BK", backstroke: "BK", br: "BR", breast: "BR", breaststroke: "BR", fl: "FL", fly: "FL", butterfly: "FL", im: "IM", kick: "K", k: "K", pull: "P", p: "P", dr: "DR", drill: "DR" };
  const effortMap = { easy: "easy", ez: "easy", moderate: "mod", mod: "mod", build: "build", desc: "desc", descend: "desc", threshold: "threshold", thr: "threshold", "race pace": "race pace", rp: "race pace", "all out": "all out", sprint: "sprint", "neg split": "neg split", "negative split": "neg split" };

  for (const line of lines) {
    const l = line.trim().toLowerCase();

    let reps = 1, rounds = 1, distance = 0, stroke = "FR", effort = "", rest = "", confident = true;

    // Match rounds: "2 rounds of 4x100" or "2x4x100"
    const roundsOfMatch = l.match(/^(\d+)\s+rounds?\s+of\s+(\d+)\s*[x×\*]\s*(\d+)/);
    const tripleXMatch = l.match(/^(\d+)\s*[x×\*]\s*(\d+)\s*[x×\*]\s*(\d+)/);
    const repMatch = !roundsOfMatch && !tripleXMatch && l.match(/^(\d+)\s*[x×\*]\s*(\d+)/);
    const singleMatch = !roundsOfMatch && !tripleXMatch && !repMatch && l.match(/^(\d+)\s+(fr|bk|br|fl|im|kick?|k|pull|p|dr|drill|free|back|breast|butterfly|fly)/i);

    if (roundsOfMatch) {
      rounds = parseInt(roundsOfMatch[1]);
      reps = parseInt(roundsOfMatch[2]);
      distance = parseInt(roundsOfMatch[3]);
    } else if (tripleXMatch) {
      rounds = parseInt(tripleXMatch[1]);
      reps = parseInt(tripleXMatch[2]);
      distance = parseInt(tripleXMatch[3]);
    } else if (repMatch) {
      reps = parseInt(repMatch[1]);
      distance = parseInt(repMatch[2]);
    } else if (singleMatch) {
      distance = parseInt(singleMatch[1]);
    } else {
      confident = false;
      const numMatch = l.match(/(\d+)/);
      if (numMatch) distance = parseInt(numMatch[1]);
    }

    // Detect stroke
    for (const [key, val] of Object.entries(strokeMap)) {
      if (l.includes(key)) { stroke = val; break; }
    }

    // Detect effort
    for (const [key, val] of Object.entries(effortMap)) {
      if (l.includes(key)) { effort = val; break; }
    }

    // Detect rest/interval
    const restMatch = l.match(/(?:on|@|rest|r:)\s*(\d+:\d+|:\d+)/);
    if (restMatch) rest = restMatch[1];

    if (distance > 0) {
      sets.push({ description: line.trim(), reps, rounds, distance, stroke, effort, rest, hr: "", confident });
    }
  }
  return sets;
};

export const calcSetYards = (set) => {
  if (set.grouped && set.children) {
    const childYards = set.children.reduce((s, c) => s + (c.reps || 1) * (c.distance || 0), 0);
    return (set.rounds || 1) * childYards;
  }
  return (set.rounds || 1) * (set.reps || 1) * (set.distance || 0);
};

export const calcPracticeYards = (sets) => sets.reduce((s, set) => s + calcSetYards(set), 0);

// Split pacing profiles
export const PACING_PROFILES = {
  "100 FR": [0.475, 0.525],
  "100 BK": [0.48, 0.52],
  "100 BR": [0.485, 0.515],
  "100 FL": [0.47, 0.53],
  "100 IM": [0.48, 0.52],
  "200 FR": [0.235, 0.25, 0.255, 0.26],
  "200 BK": [0.24, 0.25, 0.255, 0.255],
  "200 BR": [0.24, 0.255, 0.255, 0.25],
  "200 FL": [0.23, 0.255, 0.26, 0.255],
  "200 IM": [0.23, 0.26, 0.255, 0.255],
  "400 IM": [0.115, 0.13, 0.13, 0.13, 0.13, 0.13, 0.13, 0.135],
  "500 FR": [0.19, 0.2, 0.2, 0.2, 0.21],
  "400 FR": [0.24, 0.25, 0.25, 0.26],
  "800 FR": [0.12, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.13],
  "1500 FR": [0.065, 0.067, 0.067, 0.067, 0.067, 0.067, 0.067, 0.067, 0.067, 0.067, 0.067, 0.067, 0.067, 0.067, 0.07],
  "1650 FR": [0.06, 0.061, 0.061, 0.061, 0.061, 0.061, 0.061, 0.061, 0.061, 0.061, 0.061, 0.061, 0.061, 0.061, 0.061, 0.063],
};