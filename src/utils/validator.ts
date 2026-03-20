// Валидатор параметров

import { Tone } from '../models/pattern.js';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateBPM(bpm: number): ValidationResult {
  if (bpm < 40 || bpm > 240) {
    return { valid: false, error: 'BPM должен быть от 40 до 240' };
  }
  if (!Number.isInteger(bpm)) {
    return { valid: false, error: 'BPM должен быть целым числом' };
  }
  return { valid: true };
}

export function validateLength(length: number): ValidationResult {
  if (length < 1 || length > 64) {
    return { valid: false, error: 'Длина паттерна должна быть от 1 до 64' };
  }
  if (!Number.isInteger(length)) {
    return { valid: false, error: 'Длина должна быть целым числом' };
  }
  return { valid: true };
}

export function validateTone(tone: Tone): ValidationResult {
  if (tone !== 'major' && tone !== 'minor') {
    return { valid: false, error: 'Тональность должна быть "major" или "minor"' };
  }
  return { valid: true };
}

export function validatePattern(pattern: any): ValidationResult {
  if (!pattern || !Array.isArray(pattern.notes)) {
    return { valid: false, error: 'Паттерн должен содержать массив нот' };
  }
  if (typeof pattern.length !== 'number' || pattern.length < 1 || pattern.length > 64) {
    return { valid: false, error: 'Длина паттерна должна быть от 1 до 64' };
  }
  if (typeof pattern.bpm !== 'number' || pattern.bpm < 40 || pattern.bpm > 240) {
    return { valid: false, error: 'BPM должен быть от 40 до 240' };
  }
  if (pattern.tone !== 'major' && pattern.tone !== 'minor') {
    return { valid: false, error: 'Тональность должна быть "major" или "minor"' };
  }
  return { valid: true };
}