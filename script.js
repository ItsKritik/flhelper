// Константы гамм
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

// Названия нот
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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

// Генерация гаммы
function getScale(root = 0, tone = 'major') {
  const intervals = tone === 'major' 
    ? MAJOR_SCALE_INTERVALS 
    : MINOR_SCALE_INTERVALS;
  
  return intervals.map(interval => (root + interval) % 12);
}

// Проверка консонантности интервала
function isConsonant(interval) {
  const CONSONANT_INTERVALS = [0, 3, 4, 5, 7, 8, 9, 12];
  return CONSONANT_INTERVALS.includes(interval % 12);
}

// Генерация нот с учетом правил гармонии
function generateNotes(scale, length, options) {
  const notes = [];
  const rootNote = scale[0];
  
  for (let i = 0; i < length; i++) {
    let pitchIndex;
    
    if (i === 0 || Math.random() < 0.3) {
      const chordSteps = [0, 2, 4];
      pitchIndex = chordSteps[Math.floor(Math.random() * chordSteps.length)];
    } else {
      const prevNote = notes[i - 1];
      const prevStep = scale.indexOf(prevNote?.pitch || rootNote);
      const stepChange = Math.floor(Math.random() * 3) - 1;
      let nextStep = prevStep + stepChange;
      
      while (nextStep < 0) nextStep += scale.length;
      while (nextStep >= scale.length) nextStep -= scale.length;
      
      pitchIndex = nextStep;
    }
    
    const pitch = scale[pitchIndex];
    const octave = 4 + Math.floor(Math.random() * 2);
    const duration = Math.random() < 0.7 ? 1 : 2;
    const velocity = 80 + Math.floor(Math.random() * 48);
    
    notes.push({
      pitch,
      octave,
      duration,
      velocity,
      color: NOTE_COLORS[pitchIndex % NOTE_COLORS.length]
    });
  }
  
  return notes;
}

// Генерация паттерна
function generatePattern(options) {
  const scale = getScale(0, options.tone);
  const notes = generateNotes(scale, options.length, options);
  
  return {
    id: Date.now().toString(),
    notes,
    length: options.length,
    bpm: options.bpm,
    tone: options.tone,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Валидация параметров
function validateBPM(bpm) {
  if (bpm < 40 || bpm > 240) {
    return { valid: false, error: 'BPM должен быть от 40 до 240' };
  }
  return { valid: true };
}

function validateLength(length) {
  if (length < 1 || length > 64) {
    return { valid: false, error: 'Длина паттерна должна быть от 1 до 64' };
  }
  return { valid: true };
}

function validateTone(tone) {
  if (tone !== 'major' && tone !== 'minor') {
    return { valid: false, error: 'Тональность должна быть мажор или минор' };
  }
  return { valid: true };
}

// Создание сетки редактора
function createEditorGrid(length, pattern = null) {
  const grid = document.getElementById('patternGrid');
  grid.innerHTML = '';
  
  // Октавы для отображения (4-7)
  const octaves = [4, 5, 6, 7];
  const notesInOctave = 12;
  
  // Заголовок с названиями нот
  const noteLabels = document.getElementById('noteLabels');
  noteLabels.innerHTML = '';
  
  // Пустая ячейка в углу
  const corner = document.createElement('div');
  corner.className = 'note-label octave-header';
  corner.textContent = '';
  noteLabels.appendChild(corner);
  
  // Названия нот
  NOTE_NAMES.forEach(noteName => {
    const label = document.createElement('div');
    label.className = 'note-label';
    label.textContent = noteName;
    noteLabels.appendChild(label);
  });
  
  // Создание ячеек сетки
  for (let octave of octaves) {
    // Ячейка с номером октавы
    const octaveCell = document.createElement('div');
    octaveCell.className = 'grid-cell octave-header';
    octaveCell.textContent = `Octave ${octave}`;
    grid.appendChild(octaveCell);
    
    // Ячейки для каждого шага
    for (let step = 0; step < length; step++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.octave = octave;
      cell.dataset.step = step;
      
      // Проверяем, есть ли нота на этом шаге и октаве
      if (pattern) {
        const hasNote = pattern.notes.some(n => 
          n.octave === octave && 
          step >= pattern.notes.indexOf(n) && 
          step < pattern.notes.indexOf(n) + n.duration
        );
        
        if (hasNote) {
          cell.classList.add('active');
          // Находим ноту для цвета
          const note = pattern.notes.find(n => 
            n.octave === octave && 
            step >= pattern.notes.indexOf(n) && 
            step < pattern.notes.indexOf(n) + n.duration
          );
          if (note) {
            cell.style.backgroundColor = note.color;
          }
        }
      }
      
      cell.addEventListener('click', () => toggleNote(cell));
      grid.appendChild(cell);
    }
  }
}

// Переключение ноты
function toggleNote(cell) {
  cell.classList.toggle('active');
  
  if (cell.classList.contains('active')) {
    // Устанавливаем цвет на основе названия ноты
    const noteName = cell.previousElementSibling?.textContent || 'C';
    const noteIndex = NOTE_NAMES.indexOf(noteName);
    cell.style.backgroundColor = NOTE_COLORS[noteIndex % NOTE_COLORS.length];
  } else {
    cell.style.backgroundColor = '';
  }
}

// Сбор паттерна из сетки
function collectPatternFromGrid(length, tone) {
  const octaves = [4, 5, 6, 7];
  const notes = [];
  const scale = getScale(0, tone);
  
  for (let octave of octaves) {
    for (let step = 0; step < length; step++) {
      const cell = document.querySelector(`.grid-cell[data-octave="${octave}"][data-step="${step}"]`);
      
      if (cell && cell.classList.contains('active')) {
        // Определяем pitch на основе названия ноты
        const noteName = cell.previousElementSibling?.textContent || 'C';
        const pitch = NOTE_NAMES.indexOf(noteName);
        
        notes.push({
          pitch,
          octave,
          duration: 1,
          velocity: 100,
          color: cell.style.backgroundColor
        });
      }
    }
  }
  
  return {
    id: Date.now().toString(),
    notes,
    length,
    bpm: parseInt(document.getElementById('bpm').value),
    tone,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Отображение информации о паттерне
function renderPatternInfo(pattern) {
  const infoEl = document.getElementById('patternInfo');
  
  let output = `<strong>Паттерн:</strong> ${pattern.length} шагов, ${pattern.bpm} BPM, ${pattern.tone === 'major' ? 'мажор' : 'минор'}<br>`;
  output += `<strong>Нот:</strong> ${pattern.notes.length}<br><br>`;
  
  if (pattern.notes.length > 0) {
    output += '<strong>Ноты:</strong><br>';
    output += '<pre>';
    pattern.notes.forEach((note, index) => {
      const noteName = NOTE_NAMES[note.pitch];
      output += `#${index + 1}: ${noteName}${note.octave} | Дл: ${note.duration} | Сила: ${note.velocity}\n`;
    });
    output += '</pre>';
  }
  
  infoEl.innerHTML = output;
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', () => {
  const toneSelect = document.getElementById('tone');
  const lengthSlider = document.getElementById('length');
  const bpmSlider = document.getElementById('bpm');
  const generateBtn = document.getElementById('generateBtn');
  const exportBtn = document.getElementById('exportBtn');
  
  // Отображение текущих значений
  lengthSlider.addEventListener('input', () => {
    document.getElementById('lengthValue').textContent = lengthSlider.value;
    createEditorGrid(parseInt(lengthSlider.value));
  });
  
  bpmSlider.addEventListener('input', () => {
    document.getElementById('bpmValue').textContent = bpmSlider.value;
  });
  
  // Генерация паттерна
  generateBtn.addEventListener('click', () => {
    const tone = toneSelect.value;
    const length = parseInt(lengthSlider.value);
    const bpm = parseInt(bpmSlider.value);
    
    const lengthValidation = validateLength(length);
    const bpmValidation = validateBPM(bpm);
    const toneValidation = validateTone(tone);
    
    if (!lengthValidation.valid || !bpmValidation.valid || !toneValidation.valid) {
      alert(`Ошибка: ${[lengthValidation.error, bpmValidation.error, toneValidation.error].filter(e => e).join(', ')}`);
      return;
    }
    
    const pattern = generatePattern({ tone, length, bpm });
    createEditorGrid(length, pattern);
    renderPatternInfo(pattern);
  });
  
  // Экспорт в MIDI
  exportBtn.addEventListener('click', () => {
    const length = parseInt(lengthSlider.value);
    const tone = toneSelect.value;
    const bpm = parseInt(bpmSlider.value);
    
    const pattern = collectPatternFromGrid(length, tone);
    
    // Создаем простой MIDI файл
    let midi = 'MThd\n';
    midi += '00000006000100010060';
    
    // Добавляем данные трека
    midi += 'MTrk\n';
    midi += '00000000'; // Размер трека (будет обновлен)
    
    // Tempo
    midi += '00FF510307A120'; // 120 BPM в микросекундах
    
    // Ноты
    pattern.notes.forEach((note, index) => {
      const noteNumber = note.pitch + (note.octave + 1) * 12;
      const time = index * 48; // PPQ = 96, 1 шаг = 48
      const duration = note.duration * 48;
      
      // Note On
      midi += `0090${noteNumber.toString(16).padStart(2, '0')}64`;
      // Note Off
      midi += `${(time + duration).toString(16).padStart(2, '0')}80${noteNumber.toString(16).padStart(2, '0')}40`;
    });
    
    midi += '00FF2F00'; // End of track
    
    // Создаем Blob и скачиваем
    const blob = new Blob([midi], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pattern.mid';
    a.click();
    URL.revokeObjectURL(url);
  });
  
  // Генерация начального паттерна
  generateBtn.click();
});