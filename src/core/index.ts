// Движок генерации

export { MAJOR_SCALE_INTERVALS, MINOR_SCALE_INTERVALS, getScale } from './scale.js';
export { isConsonant, isDissonant, checkIntervalConsonance, getChordSteps, getNextNoteStep } from './harmony.js';
export { generatePattern, generateFromPreset, generateNotes, getNoteColor } from './generator.js';