// Модели данных для паттернов

export type Tone = 'major' | 'minor';

export interface Note {
  pitch: number;         // 0-11 (номер в гамме)
  octave: number;        // Октава
  duration: number;      // Длительность в шагах
  velocity: number;      // 0-127 (сила нажатия)
  color: string;         // Цвет для визуализации
}

export interface Pattern {
  id: string;
  notes: Note[];
  length: number;        // 1-64
  bpm: number;           // 40-240
  tone: Tone;            // 'major' | 'minor'
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationOptions {
  tone: Tone;
  length: number;
  bpm: number;
  complexity?: number;   // 0-100
  randomness?: number;   // 0-100
}

export interface ProjectFile {
  version: string;
  pattern: Pattern;
  metadata: {
    creator: string;
    createdAt: Date;
    lastModified: Date;
  };
}

export interface Preset {
  name: string;
  description: string;
  tone: Tone;
  length: number;
  bpm: number;
  notes: Note[];
  author?: string;
  createdAt: Date;
}