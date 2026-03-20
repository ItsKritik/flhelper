// Точка входа в приложение

import { Pattern, Tone, GenerationOptions } from './models/pattern.js';
import { validateBPM, validateLength, validateTone } from './utils/validator.js';
import { generatePattern } from './core/generator.js';
import { GridRenderer } from './ui/gridRenderer.js';

// Глобальные переменные
let currentPattern: Pattern | null = null;
let gridRenderer: GridRenderer | null = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  const gridElement = document.getElementById('patternGrid');
  const noteLabelsElement = document.getElementById('noteLabels');
  
  if (gridElement && noteLabelsElement) {
    gridRenderer = new GridRenderer(gridElement, noteLabelsElement);
  }
  
  setupEventListeners();
  generateInitialPattern();
});

function setupEventListeners(): void {
  const toneSelect = document.getElementById('tone') as HTMLSelectElement;
  const lengthSlider = document.getElementById('length') as HTMLInputElement;
  const bpmSlider = document.getElementById('bpm') as HTMLInputElement;
  const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
  
  // Отображение текущих значений
  lengthSlider.addEventListener('input', () => {
    document.getElementById('lengthValue')!.textContent = lengthSlider.value;
  });
  
  bpmSlider.addEventListener('input', () => {
    document.getElementById('bpmValue')!.textContent = bpmSlider.value;
  });
  
  // Генерация паттерна
  generateBtn.addEventListener('click', () => {
    const tone = toneSelect.value as Tone;
    const length = parseInt(lengthSlider.value);
    const bpm = parseInt(bpmSlider.value);
    
    // Валидация
    const lengthValidation = validateLength(length);
    const bpmValidation = validateBPM(bpm);
    const toneValidation = validateTone(tone);
    
    if (!lengthValidation.valid || !bpmValidation.valid || !toneValidation.valid) {
      alert(`Ошибка: ${[lengthValidation.error, bpmValidation.error, toneValidation.error].filter(e => e).join(', ')}`);
      return;
    }
    
    // Генерация
    currentPattern = generatePattern({ tone, length, bpm });
    
    // Отрисовка
    if (gridRenderer) {
      gridRenderer.setLength(length);
      gridRenderer.render(currentPattern);
    }
    
    renderPatternInfo(currentPattern);
  });
}

function generateInitialPattern(): void {
  const toneSelect = document.getElementById('tone') as HTMLSelectElement;
  const lengthSlider = document.getElementById('length') as HTMLInputElement;
  const bpmSlider = document.getElementById('bpm') as HTMLInputElement;
  
  const tone = toneSelect.value as Tone;
  const length = parseInt(lengthSlider.value);
  const bpm = parseInt(bpmSlider.value);
  
  currentPattern = generatePattern({ tone, length, bpm });
  
  if (gridRenderer) {
    gridRenderer.setLength(length);
    gridRenderer.render(currentPattern);
  }
  
  renderPatternInfo(currentPattern);
}

function renderPatternInfo(pattern: Pattern): void {
  const infoEl = document.getElementById('patternInfo');
  
  if (!infoEl) return;
  
  let output = `<strong>Паттерн:</strong> ${pattern.length} шагов, ${pattern.bpm} BPM, ${pattern.tone === 'major' ? 'мажор' : 'минор'}<br>`;
  output += `<strong>Нот:</strong> ${pattern.notes.length}<br><br>`;
  
  if (pattern.notes.length > 0) {
    output += '<strong>Ноты:</strong><br>';
    output += '<pre>';
    pattern.notes.forEach((note, index) => {
      const noteName = getNoteName(note.pitch);
      output += `#${index + 1}: ${noteName}${note.octave} | Дл: ${note.duration} | Сила: ${note.velocity}\n`;
    });
    output += '</pre>';
  }
  
  infoEl.innerHTML = output;
}

function getNoteName(pitch: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return noteNames[pitch % 12];
}