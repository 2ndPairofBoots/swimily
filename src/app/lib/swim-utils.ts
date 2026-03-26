// Utility functions for swim calculations

import { XP_PER_LEVEL, XP_PER_100_YARDS, LEVELS, CUT_STANDARDS_SCY_M, WORLD_RECORDS_SCY_M } from './constants';

// Level and XP calculations
export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function calculateXPForYards(yards: number): number {
  return Math.floor((yards / 100) * XP_PER_100_YARDS);
}

export function getProgressToNextLevel(xp: number): number {
  const currentLevelXP = (calculateLevel(xp) - 1) * XP_PER_LEVEL;
  const xpIntoCurrentLevel = xp - currentLevelXP;
  return (xpIntoCurrentLevel / XP_PER_LEVEL) * 100;
}

export function getLevelTitle(level: number): string {
  const levelData = LEVELS.find(l => l.level === level);
  return levelData?.title || 'Swimmer';
}

// Time parsing and formatting
export function parseTimeToSeconds(timeString: string): number {
  // Supports formats: "23.45", "1:23.45", "12:34.56"
  const parts = timeString.trim().split(':');
  
  if (parts.length === 1) {
    // Just seconds: "23.45"
    return parseFloat(parts[0]);
  } else if (parts.length === 2) {
    // Minutes:seconds: "1:23.45"
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    // Hours:minutes:seconds: "1:12:34.56"
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  }
  
  return 0;
}

export function formatTime(seconds: number): string {
  if (seconds >= 3600) {
    // Format as H:MM:SS.xx
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;
  } else if (seconds >= 60) {
    // Format as M:SS.xx
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, '0')}`;
  } else {
    // Format as SS.xx
    return seconds.toFixed(2);
  }
}

// FINA Points calculation (simplified - actual formula is more complex)
export function calculateFINAPoints(event: string, timeSeconds: number, gender: 'M' | 'F', course: string): number {
  // This is a simplified calculation. Real FINA uses base times and curve fitting.
  const worldRecord = WORLD_RECORDS_SCY_M[event];
  if (!worldRecord) return 0;
  
  // Simplified: Points = 1000 * (WR / Time)^3
  const ratio = worldRecord / timeSeconds;
  const points = Math.floor(1000 * Math.pow(ratio, 3));
  
  return Math.max(0, Math.min(1200, points)); // Cap between 0-1200
}

// Cut calculations
export function calculateCuts(event: string, timeSeconds: number, gender: 'M' | 'F', course: string): string[] {
  const cuts: string[] = [];
  const standards = CUT_STANDARDS_SCY_M[event];
  
  if (!standards) return cuts;
  
  const cutOrder = ['AAAA', 'AAA', 'AA', 'A', 'BB', 'B'];
  
  for (const cut of cutOrder) {
    if (standards[cut] && timeSeconds <= standards[cut]) {
      cuts.push(cut);
    }
  }
  
  return cuts;
}

export function getHighestCut(cuts: string[]): string | null {
  const cutOrder = ['AAAA', 'AAA', 'AA', 'A', 'BB', 'B'];
  
  for (const cut of cutOrder) {
    if (cuts.includes(cut)) {
      return cut;
    }
  }
  
  return null;
}

// Streak calculations
export function calculateStreak(practices: { date: string }[]): number {
  if (practices.length === 0) return 0;
  
  // Sort by date descending
  const sorted = [...practices].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const practice of sorted) {
    const practiceDate = new Date(practice.date);
    practiceDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - practiceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
      streak++;
      currentDate = practiceDate;
    } else {
      break;
    }
  }
  
  return streak;
}

// Yards calculations
export function calculateTotalYards(sets: { distance: number; repetitions: number }[]): number {
  return sets.reduce((total, set) => total + (set.distance * set.repetitions), 0);
}

// Generate race splits
export function generateRaceSplits(
  distance: number,
  goalTimeSeconds: number,
  profile: 'Even Split' | 'Negative Split' | 'Positive Split' | 'Fly & Die'
): { split: number; target: number; cumulative: number }[] {
  const splitDistance = distance === 200 ? 50 : distance === 100 ? 25 : 50;
  const numSplits = distance / splitDistance;
  const splits: { split: number; target: number; cumulative: number }[] = [];
  
  let cumulative = 0;
  
  for (let i = 0; i < numSplits; i++) {
    let splitTime: number;
    
    switch (profile) {
      case 'Even Split':
        splitTime = goalTimeSeconds / numSplits;
        break;
      case 'Negative Split':
        // First half slower, second half faster
        splitTime = i < numSplits / 2 
          ? (goalTimeSeconds / numSplits) * 1.05 
          : (goalTimeSeconds / numSplits) * 0.95;
        break;
      case 'Positive Split':
        // First half faster, second half slower
        splitTime = i < numSplits / 2 
          ? (goalTimeSeconds / numSplits) * 0.95 
          : (goalTimeSeconds / numSplits) * 1.05;
        break;
      case 'Fly & Die':
        // Fast start, fade
        splitTime = (goalTimeSeconds / numSplits) * (1 - 0.1 + (i * 0.05));
        break;
      default:
        splitTime = goalTimeSeconds / numSplits;
    }
    
    cumulative += splitTime;
    splits.push({
      split: (i + 1) * splitDistance,
      target: splitTime,
      cumulative
    });
  }
  
  return splits;
}
