// Браузер пресетов

import { Preset, Pattern } from '../models/pattern.js';
import { PRESETS, getPresetByName, getPresetNames } from '../presets/index.js';

export class PresetBrowser {
  private presets: Preset[] = PRESETS;
  
  public getPresetNames(): string[] {
    return getPresetNames();
  }
  
  public loadPreset(name: string): Pattern {
    const preset = getPresetByName(name);
    if (!preset) {
      throw new Error(`Пресет "${name}" не найден`);
    }
    
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
  
  public getPresets(): Preset[] {
    return this.presets;
  }
}