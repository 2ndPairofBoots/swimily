// Domain types for Swimily

export interface Profile {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender: 'M' | 'F';
  team?: string;
  preferredCourse: 'SCY' | 'LCM' | 'SCM';
  xp: number;
  level: number;
  streakDays: number;
  lastPracticeDate?: string;
  isPremium: boolean;
  profileImageUrl?: string;
}

export interface Practice {
  id: string;
  userId: string;
  date: string;
  totalYards: number;
  duration: number; // minutes
  course?: 'SCY' | 'LCM' | 'SCM';
  focus?: string;
  intensity?: string;
  sets: PracticeSet[];
  notes?: string;
  xpEarned: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PracticeSet {
  id: string;
  distance: number;
  repetitions: number;
  stroke: string;
  effort: string;
  interval?: string;
  notes?: string;
}

export interface SwimTime {
  id: string;
  userId: string;
  event: string;
  course: 'SCY' | 'LCM' | 'SCM';
  timeSeconds: number;
  date: string;
  meetName?: string;
  finaPoints?: number;
  cuts?: string[];
}

export interface GoalTime {
  id: string;
  userId: string;
  event: string;
  course: 'SCY' | 'LCM' | 'SCM';
  goalTimeSeconds: number;
}

export interface Meet {
  id: string;
  userId: string;
  name: string;
  date: string;
  location?: string;
  meetType: 'dual' | 'invitational' | 'championship' | 'time-trial';
  notes?: string;
}

export interface AIWorkout {
  id: string;
  userId: string;
  workoutType: string;
  focus: string;
  duration: number;
  sets: PracticeSet[];
  totalYards: number;
  notes: string;
  createdAt: string;
}

export interface DrylandLog {
  id: string;
  userId: string;
  date: string;
  workoutType: 'push' | 'pull' | 'legs';
  exercises: string[];
  duration: number;
  xpEarned: number;
}

export interface Reward {
  id: string;
  type: 'xp' | 'badge' | 'feature';
  name: string;
  description: string;
  value?: number;
}
