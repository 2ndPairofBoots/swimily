// Constants for Swimily

// XP and Leveling
export const XP_PER_LEVEL = 1000;
export const XP_PER_100_YARDS = 10;
export const XP_DRYLAND_BASE = 150;

export const LEVELS = Array.from({ length: 50 }, (_, i) => {
  const level = i + 1;
  let title = 'Novice';
  
  if (level >= 40) title = 'Olympian';
  else if (level >= 30) title = 'All-American';
  else if (level >= 20) title = 'Elite';
  else if (level >= 10) title = 'Varsity';
  else if (level >= 5) title = 'Club Swimmer';
  
  return {
    level,
    xpRequired: level * XP_PER_LEVEL,
    title
  };
});

// Strokes
export const STROKES = [
  'Free',
  'Back',
  'Breast',
  'Fly',
  'IM',
  'Kick',
  'Drill',
  'Choice'
];

// Effort Levels
export const EFFORT_LEVELS = [
  'Easy',
  'Moderate',
  'Race Pace',
  'Sprint',
  'Max'
];

// Focus Areas
export const FOCUS_AREAS = [
  'Endurance',
  'Speed',
  'Technique',
  'Starts/Turns',
  'Race Prep',
  'Recovery'
];

// Event Groups
export const EVENT_GROUPS = {
  Sprint: ['50 Free', '100 Free', '50 Back', '50 Breast', '50 Fly'],
  Mid: ['100 Back', '100 Breast', '100 Fly', '200 Free', '200 IM'],
  Distance: ['500 Free', '1000 Free', '1650 Free', '400 IM']
};

// Standard Events
export const EVENTS_SCY = [
  '50 Free', '100 Free', '200 Free', '500 Free', '1000 Free', '1650 Free',
  '50 Back', '100 Back', '200 Back',
  '50 Breast', '100 Breast', '200 Breast',
  '50 Fly', '100 Fly', '200 Fly',
  '100 IM', '200 IM', '400 IM'
];

export const EVENTS_LCM = [
  '50 Free', '100 Free', '200 Free', '400 Free', '800 Free', '1500 Free',
  '50 Back', '100 Back', '200 Back',
  '50 Breast', '100 Breast', '200 Breast',
  '50 Fly', '100 Fly', '200 Fly',
  '200 IM', '400 IM'
];

// Cut Standards (example data - SCY Men)
export const CUT_STANDARDS_SCY_M: Record<string, Record<string, number>> = {
  '50 Free': {
    'B': 23.99,
    'BB': 22.49,
    'A': 21.39,
    'AA': 20.29,
    'AAA': 19.49,
    'AAAA': 18.89
  },
  '100 Free': {
    'B': 52.99,
    'BB': 49.49,
    'A': 46.79,
    'AA': 44.49,
    'AAA': 42.79,
    'AAAA': 41.49
  },
  '200 Free': {
    'B': 1 * 60 + 57.99,
    'BB': 1 * 60 + 50.99,
    'A': 1 * 60 + 42.99,
    'AA': 1 * 60 + 36.69,
    'AAA': 1 * 60 + 32.29,
    'AAAA': 1 * 60 + 29.09
  },
  '500 Free': {
    'B': 5 * 60 + 19.99,
    'BB': 4 * 60 + 58.99,
    'A': 4 * 60 + 38.99,
    'AA': 4 * 60 + 23.79,
    'AAA': 4 * 60 + 13.19,
    'AAAA': 4 * 60 + 5.59
  }
};

// World Records (SCY Men - example)
export const WORLD_RECORDS_SCY_M: Record<string, number> = {
  '50 Free': 17.63,
  '100 Free': 39.90,
  '200 Free': 1 * 60 + 29.15,
  '500 Free': 4 * 60 + 2.31,
  '100 Back': 43.49,
  '100 Breast': 49.69,
  '100 Fly': 42.80,
  '200 IM': 1 * 60 + 38.27
};

// Distances for practice sets
export const DISTANCES = [25, 50, 75, 100, 150, 200, 300, 400, 500, 1000, 1650];

// Pacing Profiles
export const PACING_PROFILES = {
  'Even Split': { name: 'Even Split', description: 'Consistent pace throughout' },
  'Negative Split': { name: 'Negative Split', description: 'Faster second half' },
  'Positive Split': { name: 'Positive Split', description: 'Faster first half' },
  'Fly & Die': { name: 'Fly & Die', description: 'Fast start, fade finish' }
};

// Equipment
export const EQUIPMENT = [
  'Fins',
  'Paddles',
  'Pull Buoy',
  'Kickboard',
  'Snorkel',
  'Parachute',
  'Tempo Trainer',
  'None'
];

// Dryland Exercises
export const DRYLAND_EXERCISES = {
  push: [
    'Push-ups',
    'Bench Press',
    'Shoulder Press',
    'Tricep Dips',
    'Incline Press',
    'Chest Fly'
  ],
  pull: [
    'Pull-ups',
    'Rows',
    'Lat Pulldown',
    'Face Pulls',
    'Bicep Curls',
    'Reverse Fly'
  ],
  legs: [
    'Squats',
    'Lunges',
    'Deadlifts',
    'Box Jumps',
    'Leg Press',
    'Calf Raises'
  ]
};

// Spin Wheel Prizes
export const SPIN_PRIZES = [
  { id: 1, name: '+100 XP', type: 'xp' as const, value: 100, color: '#3b82f6' },
  { id: 2, name: '+250 XP', type: 'xp' as const, value: 250, color: '#8b5cf6' },
  { id: 3, name: '+500 XP', type: 'xp' as const, value: 500, color: '#ec4899' },
  { id: 4, name: 'Motivational Quote', type: 'badge' as const, value: 0, color: '#10b981' },
  { id: 5, name: '+50 XP', type: 'xp' as const, value: 50, color: '#f59e0b' },
  { id: 6, name: '+1000 XP', type: 'xp' as const, value: 1000, color: '#ef4444' },
];