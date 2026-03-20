// Предустановленные паттерны

import { Preset, Tone } from '../models/pattern.js';

export const PRESETS: Preset[] = [
  {
    name: 'Simple Major',
    description: 'Простой мажорный паттерн',
    tone: 'major',
    length: 16,
    bpm: 120,
    notes: [
      { pitch: 0, octave: 4, duration: 1, velocity: 100, color: '#FF6B6B' },
      { pitch: 4, octave: 4, duration: 1, velocity: 100, color: '#9D4EDD' },
      { pitch: 7, octave: 4, duration: 1, velocity: 100, color: '#4D96FF' },
      { pitch: 0, octave: 5, duration: 1, velocity: 100, color: '#FF6B6B' }
    ],
    author: 'System',
    createdAt: new Date()
  },
  {
    name: 'Minor Groove',
    description: 'Минорный грув',
    tone: 'minor',
    length: 16,
    bpm: 100,
    notes: [
      { pitch: 0, octave: 4, duration: 1, velocity: 100, color: '#FF6B6B' },
      { pitch: 3, octave: 4, duration: 1, velocity: 100, color: '#4D96FF' },
      { pitch: 7, octave: 4, duration: 1, velocity: 100, color: '#4D96FF' },
      { pitch: 10, octave: 4, duration: 1, velocity: 100, color: '#F72585' }
    ],
    author: 'System',
    createdAt: new Date()
  },
  {
    name: 'Fast Arpeggio',
    description: 'Быстрый арпеджио',
    tone: 'major',
    length: 32,
    bpm: 160,
    notes: [
      { pitch: 0, octave: 4, duration: 1, velocity: 100, color: '#FF6B6B' },
      { pitch: 4, octave: 4, duration: 1, velocity: 100, color: '#9D4EDD' },
      { pitch: 7, octave: 4, duration: 1, velocity: 100, color: '#4D96FF' },
      { pitch: 11, octave: 4, duration: 1, velocity: 100, color: '#F72585' },
      { pitch: 7, octave: 4, duration: 1, velocity: 100, color: '#4D96FF' },
      { pitch: 4, octave: 4, duration: 1, velocity: 100, color: '#9D4EDD' }
    ],
    author: 'System',
    createdAt: new Date()
  },
  {
    name: 'Slow Chords',
    description: 'Медленные аккорды',
    tone: 'minor',
    length: 8,
    bpm: 80,
    notes: [
      { pitch: 0, octave: 4, duration: 4, velocity: 100, color: '#FF6B6B' },
      { pitch: 3, octave: 4, duration: 4, velocity: 100, color: '#4D96FF' },
      { pitch: 7, octave: 4, duration: 4, velocity: 100, color: '#4D96FF' }
    ],
    author: 'System',
    createdAt: new Date()
  },
  {
    name: 'Complex Pattern',
    description: 'Сложный паттерн',
    tone: 'major',
    length: 64,
    bpm: 140,
    notes: [
      { pitch: 0, octave: 4, duration: 1, velocity: 100, color: '#FF6B6B' },
      { pitch: 2, octave: 4, duration: 1, velocity: 100, color: '#6BCB77' },
      { pitch: 4, octave: 4, duration: 1, velocity: 100, color: '#9D4EDD' },
      { pitch: 5, octave: 4, duration: 1, velocity: 100, color: '#FF9F1C' },
      { pitch: 7, octave: 4, duration: 1, velocity: 100, color: '#4D96FF' },
      { pitch: 9, octave: 4, duration: 1, velocity: 100, color: '#FFD93D' },
      { pitch: 11, octave: 4, duration: 1, velocity: 100, color: '#F72585' },
      { pitch: 7, octave: 4, duration: 1, velocity: 100, color: '#4D96FF' }
    ],
    author: 'System',
    createdAt: new Date()
  }
];

export function getPresetByName(name: string): Preset | undefined {
  return PRESETS.find(p => p.name === name);
}

export function getPresetNames(): string[] {
  return PRESETS.map(p => p.name);
}