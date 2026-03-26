// Parse freeform workout text into structured sets

import { PracticeSet } from './types';
import { STROKES } from './constants';

export function parseWorkoutText(text: string): PracticeSet[] {
  const sets: PracticeSet[] = [];
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  for (const line of lines) {
    const parsed = parseSetLine(line);
    if (parsed) {
      sets.push(parsed);
    }
  }
  
  return sets;
}

function parseSetLine(line: string): PracticeSet | null {
  // Common patterns:
  // "8 x 100 Free @ 1:30"
  // "4x200 IM on 3:00"
  // "10 x 50 Fly :45"
  // "1 x 500 Free easy"
  
  const cleanLine = line.trim();
  
  // Pattern: repetitions x distance stroke [@ interval] [effort]
  const match = cleanLine.match(/(\d+)\s*x\s*(\d+)\s*([a-zA-Z]+)?(?:\s+(?:@|on|:)\s*([:\d.]+))?(?:\s+(.+))?/i);
  
  if (match) {
    const [, reps, dist, stroke, interval, rest] = match;
    
    return {
      id: crypto.randomUUID(),
      repetitions: parseInt(reps),
      distance: parseInt(dist),
      stroke: normalizeStroke(stroke || ''),
      effort: normalizeEffort(rest || ''),
      interval: interval || undefined,
      notes: undefined
    };
  }
  
  // Try simpler pattern: distance stroke
  const simpleMatch = cleanLine.match(/(\d+)\s*([a-zA-Z]+)?/);
  if (simpleMatch) {
    const [, dist, stroke] = simpleMatch;
    
    return {
      id: crypto.randomUUID(),
      repetitions: 1,
      distance: parseInt(dist),
      stroke: normalizeStroke(stroke || ''),
      effort: 'Moderate',
      notes: undefined
    };
  }
  
  return null;
}

function normalizeStroke(stroke: string): string {
  const lower = stroke.toLowerCase();
  
  if (lower.includes('free') || lower.includes('fr')) return 'Free';
  if (lower.includes('back') || lower.includes('bk')) return 'Back';
  if (lower.includes('breast') || lower.includes('br')) return 'Breast';
  if (lower.includes('fly') || lower.includes('fl')) return 'Fly';
  if (lower.includes('im')) return 'IM';
  if (lower.includes('kick')) return 'Kick';
  if (lower.includes('drill')) return 'Drill';
  
  return 'Free';
}

function normalizeEffort(text: string): string {
  const lower = text.toLowerCase();
  
  if (lower.includes('easy') || lower.includes('recovery')) return 'Easy';
  if (lower.includes('moderate') || lower.includes('steady')) return 'Moderate';
  if (lower.includes('race') || lower.includes('pace')) return 'Race Pace';
  if (lower.includes('sprint') || lower.includes('fast')) return 'Sprint';
  if (lower.includes('max') || lower.includes('all out')) return 'Max';
  
  return 'Moderate';
}
