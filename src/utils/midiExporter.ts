// Экспорт паттернов в MIDI

import { Pattern, Note } from '../models/pattern.js';

export function patternToMidi(pattern: Pattern): string {
  // Простой MIDI файл (Type 1)
  // Header chunk
  let midi = 'MThd\n';
  midi += '00000006000100010060'; // Format 1, 1 track, PPQ 96
  
  // Track chunk
  midi += 'MTrk\n';
  midi += '00000000'; // Размер трека (будет обновлен)
  
  // Tempo: 120 BPM = 500000 microseconds per beat
  const tempo = 60000000 / pattern.bpm;
  midi += `00FF5103${tempo.toString(16).padStart(6, '0')}`;
  
  // Time signature: 4/4
  midi += '00FF580404021808';
  
  // Ноты
  let currentTime = 0;
  pattern.notes.forEach((note, index) => {
    const noteNumber = note.pitch + (note.octave + 1) * 12;
    const duration = note.duration * 24; // PPQ 96, 1 шаг = 24
    
    // Note On
    midi += `0090${noteNumber.toString(16).padStart(2, '0')}${note.velocity.toString(16).padStart(2, '0')}`;
    
    // Note Off
    midi += `${(currentTime + duration).toString(16).padStart(2, '0')}80${noteNumber.toString(16).padStart(2, '0')}40`;
    
    currentTime += duration;
  });
  
  // End of track
  midi += '00FF2F00';
  
  return midi;
}

export function downloadMidi(pattern: Pattern, filename: string = 'pattern.mid'): void {
  const midiData = patternToMidi(pattern);
  const blob = new Blob([midiData], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}