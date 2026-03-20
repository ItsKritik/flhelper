// Панель настроек

import { Tone } from '../models/pattern.js';

export class SettingsPanel {
  private toneSelect: HTMLSelectElement;
  private lengthSlider: HTMLInputElement;
  private bpmSlider: HTMLInputElement;
  private lengthValue: HTMLElement;
  private bpmValue: HTMLElement;
  
  constructor() {
    this.toneSelect = document.getElementById('tone') as HTMLSelectElement;
    this.lengthSlider = document.getElementById('length') as HTMLInputElement;
    this.bpmSlider = document.getElementById('bpm') as HTMLInputElement;
    this.lengthValue = document.getElementById('lengthValue')!;
    this.bpmValue = document.getElementById('bpmValue')!;
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    this.lengthSlider.addEventListener('input', () => {
      this.lengthValue.textContent = this.lengthSlider.value;
    });
    
    this.bpmSlider.addEventListener('input', () => {
      this.bpmValue.textContent = this.bpmSlider.value;
    });
  }
  
  public getTone(): Tone {
    return this.toneSelect.value as Tone;
  }
  
  public getLength(): number {
    return parseInt(this.lengthSlider.value);
  }
  
  public getBpm(): number {
    return parseInt(this.bpmSlider.value);
  }
  
  public setLength(length: number): void {
    this.lengthSlider.value = length.toString();
    this.lengthValue.textContent = length.toString();
  }
  
  public setBpm(bpm: number): void {
    this.bpmSlider.value = bpm.toString();
    this.bpmValue.textContent = bpm.toString();
  }
  
  public setTone(tone: Tone): void {
    this.toneSelect.value = tone;
  }
}