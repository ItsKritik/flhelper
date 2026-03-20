// Ввод/вывод файлов

import { Pattern, ProjectFile, Preset } from '../models/pattern.js';

export function savePattern(pattern: Pattern, filename: string = 'pattern.fpp'): void {
  const projectFile: ProjectFile = {
    version: '1.0.0',
    pattern,
    metadata: {
      creator: 'FL-Studio Pattern Generator',
      createdAt: new Date(),
      lastModified: new Date()
    }
  };
  
  const data = JSON.stringify(projectFile, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}

export function loadPattern(file: File): Promise<Pattern> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const projectFile: ProjectFile = JSON.parse(data);
        
        if (projectFile.version !== '1.0.0') {
          reject(new Error('Неверная версия файла'));
          return;
        }
        
        resolve(projectFile.pattern);
      } catch (error) {
        reject(new Error(`Ошибка загрузки: ${(error as Error).message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
}

export function savePreset(preset: Preset, filename: string): void {
  const presetFile = {
    version: '1.0.0',
    preset
  };
  
  const data = JSON.stringify(presetFile, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}

export function loadPreset(file: File): Promise<Preset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const presetFile = JSON.parse(data);
        
        if (presetFile.version !== '1.0.0') {
          reject(new Error('Неверная версия файла'));
          return;
        }
        
        resolve(presetFile.preset);
      } catch (error) {
        reject(new Error(`Ошибка загрузки: ${(error as Error).message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
}