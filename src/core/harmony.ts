// Правила гармонии

export const CONSONANT_INTERVALS = [0, 3, 4, 5, 7, 8, 9, 12];
export const DISSONANT_INTERVALS = [1, 6, 11];

export function isConsonant(interval: number): boolean {
  return CONSONANT_INTERVALS.includes(interval % 12);
}

export function isDissonant(interval: number): boolean {
  return DISSONANT_INTERVALS.includes(interval % 12);
}

export function checkIntervalConsonance(notes: number[]): boolean {
  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const interval = Math.abs(notes[i] - notes[j]);
      if (isDissonant(interval)) {
        return false;
      }
    }
  }
  return true;
}

export function getChordSteps(): number[] {
  return [0, 2, 4]; // Тоника, маж. 3-я, квинта
}

export function getNextNoteStep(currentStep: number, scaleLength: number, options?: { randomness?: number }): number {
  const stepChange = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
  let nextStep = currentStep + stepChange;
  
  while (nextStep < 0) nextStep += scaleLength;
  while (nextStep >= scaleLength) nextStep -= scaleLength;
  
  return nextStep;
}