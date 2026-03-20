// Генератор гамм

import { Tone } from '../models/pattern.js';

export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
export const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

export function getScale(root: number = 0, tone: Tone = 'major'): number[] {
  const intervals = tone === 'major' 
    ? MAJOR_SCALE_INTERVALS 
    : MINOR_SCALE_INTERVALS;
  
  return intervals.map(interval => (root + interval) % 12);
}

export function getScaleWithOctaves(root: number = 0, tone: Tone = 'major', octaves: number[] = [4]): number[] {
  const scale = getScale(root, tone);
  const result: number[] = [];
  
  for (let octave of octaves) {
    for (let pitch of scale) {
      result.push(pitch + (octave + 1) * 12);
    }
  }
  
  return result;
}