// Mock data for development

import { Profile, Practice, SwimTime, Meet } from './types';

export const mockProfile: Profile = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@swimily.app',
  age: 18,
  gender: 'M',
  team: 'Aquatic Masters',
  preferredCourse: 'SCY',
  xp: 3450,
  level: 4,
  streakDays: 7,
  lastPracticeDate: new Date().toISOString(),
  isPremium: false
};

export const mockPractices: Practice[] = [
  {
    id: '1',
    userId: '1',
    date: new Date().toISOString(),
    totalYards: 4500,
    duration: 90,
    xpEarned: 450,
    sets: [
      { id: 's1', distance: 400, repetitions: 1, stroke: 'Free', effort: 'Easy', notes: 'Warmup' },
      { id: 's2', distance: 100, repetitions: 8, stroke: 'Free', effort: 'Moderate', interval: '1:30' },
      { id: 's3', distance: 50, repetitions: 10, stroke: 'Fly', effort: 'Sprint', interval: ':45' },
      { id: 's4', distance: 200, repetitions: 6, stroke: 'IM', effort: 'Race Pace', interval: '3:00' },
      { id: 's5', distance: 100, repetitions: 4, stroke: 'Kick', effort: 'Moderate', notes: 'With board' }
    ],
    notes: 'Great practice! Felt strong on the IM set.',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: '1',
    date: new Date(Date.now() - 86400000).toISOString(),
    totalYards: 3800,
    duration: 75,
    xpEarned: 380,
    sets: [
      { id: 's6', distance: 300, repetitions: 1, stroke: 'Free', effort: 'Easy', notes: 'Warmup' },
      { id: 's7', distance: 200, repetitions: 6, stroke: 'Free', effort: 'Moderate', interval: '2:45' },
      { id: 's8', distance: 100, repetitions: 8, stroke: 'Back', effort: 'Moderate', interval: '1:40' }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const mockSwimTimes: SwimTime[] = [
  {
    id: '1',
    userId: '1',
    event: '50 Free',
    course: 'SCY',
    timeSeconds: 21.85,
    date: '2026-02-15',
    meetName: 'Conference Championships',
    finaPoints: 687,
    cuts: ['A', 'BB', 'B']
  },
  {
    id: '2',
    userId: '1',
    event: '100 Free',
    course: 'SCY',
    timeSeconds: 47.32,
    date: '2026-02-15',
    meetName: 'Conference Championships',
    finaPoints: 652,
    cuts: ['A', 'BB', 'B']
  },
  {
    id: '3',
    userId: '1',
    event: '100 Fly',
    course: 'SCY',
    timeSeconds: 52.18,
    date: '2026-01-20',
    meetName: 'Invitational Meet',
    finaPoints: 598,
    cuts: ['BB', 'B']
  }
];

export const mockMeets: Meet[] = [
  {
    id: '1',
    userId: '1',
    name: 'State Championships',
    date: '2026-04-10',
    location: 'State Aquatic Center',
    meetType: 'championship',
    notes: 'Taper meet - going for best times!'
  },
  {
    id: '2',
    userId: '1',
    name: 'Spring Invitational',
    date: '2026-03-28',
    location: 'University Pool',
    meetType: 'invitational',
    notes: 'Mid-season check'
  },
  {
    id: '3',
    userId: '1',
    name: 'Conference Championships',
    date: '2026-02-15',
    location: 'Home Pool',
    meetType: 'championship',
    notes: 'Great meet! PRs in 50 and 100 Free'
  }
];
