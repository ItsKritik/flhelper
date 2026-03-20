// Генератор паттернов

import { Tone, Note, GenerationOptions, Pattern } from '../models/pattern.js';
import { getScale } from './scale.js';
import { isConsonant, getChordSteps, getNextNoteStep } from './harmony.js';

export function generateNotes(scale: number[], length: number, options: GenerationOptions): Note[] {
  const notes: Note[] = [];
  const rootNote = scale[0];
  
  for (let i = 0; i < length; i++) {
    let pitchIndex: number;
    
    if (i === 0 || Math.random() < 0.3) {
      // Начальная нота или прыжок на аккордовую (1, 3, 5 ступени)
      const chordSteps = getChordSteps();
      pitchIndex = chordSteps[Math.floor(Math.random() * chordSteps.length)];
    } else {
      // Ход по ступеням
      const prevNote = notes[i - 1];
      const prevStep = scale.indexOf(prevNote?.pitch ?? rootNote);
      pitchIndex = getNextNoteStep(prevStep, scale.length, options);
    }
    
    const pitch = scale[pitchIndex];
    const octave = 4 + Math.floor(Math.random() * 2); // Октавы 4-5
    const duration = Math.random() < 0.7 ? 1 : 2; // 70% - короткие, 30% - длинные
    const velocity = 80 + Math.floor(Math.random() * 48); // 80-127
    
    notes.push({
      pitch,
      octave,
      duration,
      velocity,
      color: getNoteColor(pitchIndex)
    });
  }
  
  return notes;
}

export function generatePattern(options: GenerationOptions): Pattern {
  const scale = getScale(0, options.tone);
  const notes = generateNotes(scale, options.length, options);
  
  return {
    id: crypto.randomUUID(),
    notes,
    length: options.length,
    bpm: options.bpm,
    tone: options.tone,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export function generateFromPreset(preset: any): Pattern {
  return {
    id: crypto.randomUUID(),
    notes: preset.notes,
    length: preset.length,
    bpm: preset.bpm,
    tone: preset.tone,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Цвета для нот
const NOTE_COLORS = [
  '#FF6B6B', // C - красный
  '#FFD93D', // C# - желтый
  '#6BCB77', // D - зеленый
  '#4D96FF', // D# - синий
  '#9D4EDD', // E - фиолетовый
  '#FF9F1C', // F - оранжевый
  '#F72585', // F# - розовый
  '#FF6B6B', // G - красный
  '#FFD93D', // G# - желтый
  '#6BCB77', // A - зеленый
  '#4D96FF', // A# - синий
  '#9D4EDD'  // B - фиолетовый
];

export function getNoteColor(pitchIndex: number): string {
  return NOTE_COLORS[pitchIndex % NOTE_COLORS.length];
}