// Рендеринг сетки паттерна

import { Pattern, Note } from '../models/pattern.js';

export interface GridConfig {
  length: number;
  octaves: number[];
  noteNames: string[];
}

export class GridRenderer {
  private grid: HTMLElement;
  private noteLabels: HTMLElement;
  private config: GridConfig;
  
  constructor(gridElement: HTMLElement, noteLabelsElement: HTMLElement) {
    this.grid = gridElement;
    this.noteLabels = noteLabelsElement;
    this.config = {
      length: 16,
      octaves: [4, 5, 6, 7],
      noteNames: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    };
  }
  
  public render(pattern: Pattern | null = null): void {
    this.grid.innerHTML = '';
    this.noteLabels.innerHTML = '';
    
    // Заголовок с названиями нот
    const corner = document.createElement('div');
    corner.className = 'note-label octave-header';
    corner.textContent = '';
    this.noteLabels.appendChild(corner);
    
    this.config.noteNames.forEach(noteName => {
      const label = document.createElement('div');
      label.className = 'note-label';
      label.textContent = noteName;
      this.noteLabels.appendChild(label);
    });
    
    // Создание ячеек сетки
    for (let octave of this.config.octaves) {
      const octaveCell = document.createElement('div');
      octaveCell.className = 'grid-cell octave-header';
      octaveCell.textContent = `Octave ${octave}`;
      this.grid.appendChild(octaveCell);
      
      for (let step = 0; step < this.config.length; step++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.octave = octave.toString();
        cell.dataset.step = step.toString();
        
        if (pattern) {
          this.highlightNote(cell, pattern, octave, step);
        }
        
        this.grid.appendChild(cell);
      }
    }
  }
  
  private highlightNote(cell: HTMLElement, pattern: Pattern, octave: number, step: number): void {
    const hasNote = pattern.notes.some(n => 
      n.octave === octave && 
      step >= pattern.notes.indexOf(n) && 
      step < pattern.notes.indexOf(n) + n.duration
    );
    
    if (hasNote) {
      cell.classList.add('active');
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
  
  public setLength(length: number): void {
    this.config.length = length;
  }
  
  public getActiveNotes(): Note[] {
    const notes: Note[] = [];
    const cells = this.grid.querySelectorAll('.grid-cell.active');
    
    cells.forEach(cell => {
      const htmlCell = cell as HTMLElement;
      const octave = parseInt(htmlCell.dataset.octave || '4');
      const step = parseInt(htmlCell.dataset.step || '0');
      
      // Определяем pitch на основе названия ноты (упрощенно)
      const noteName = (cell.previousElementSibling?.textContent || 'C').trim();
      const noteIndex = this.config.noteNames.indexOf(noteName);
      
      notes.push({
        pitch: noteIndex,
        octave,
        duration: 1,
        velocity: 100,
        color: htmlCell.style.backgroundColor || '#4CAF50'
      });
    });
    
    return notes;
  }
}