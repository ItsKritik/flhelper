// Рендеринг сетки паттерна

import type { Note, Pattern } from "../models/pattern.js";

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
			octaves: [7, 6, 5, 4, 3], // От высоких к низким
			noteNames: [
				"B",
				"A#",
				"A",
				"G#",
				"G",
				"F#",
				"F",
				"E",
				"D#",
				"D",
				"C#",
				"C",
			], // От высоких к низким
		};
	}

	public render(pattern: Pattern | null = null): void {
		// Определяем диапазон используемых нот в паттерне
		const usedNotes = pattern ? this.getUsedNoteRange(pattern) : null;

		// Если есть паттерн и использованные ноты, ограничиваем диапазон
		let renderOctaves = this.config.octaves;
		let renderNoteNames = this.config.noteNames;

		if (usedNotes) {
			renderOctaves = this.filterOctaves(
				this.config.octaves,
				usedNotes.minOctave,
				usedNotes.maxOctave,
			);

			// Также определяем используемые ноты в пределах октав
			renderNoteNames = this.filterNoteNames(
				this.config.noteNames,
				usedNotes.minPitch,
				usedNotes.maxPitch,
			);
		}

		this.grid.innerHTML = "";
		this.noteLabels.innerHTML = "";

		// Создаем структуру: каждая строка = одна нота (pitch + octave)
		const totalRows = renderOctaves.length * renderNoteNames.length;

		// Устанавливаем grid layout
		this.grid.style.display = "grid";
		this.grid.style.gridTemplateColumns = `repeat(${this.config.length}, 34px)`;
		this.grid.style.gridTemplateRows = `repeat(${totalRows}, 24px)`;
		this.grid.style.gap = "2px";
		this.grid.style.padding = "10px 10px 10px 0";
		this.grid.style.background = "transparent";

		this.noteLabels.style.display = "grid";
		this.noteLabels.style.gridTemplateColumns = "60px";
		this.noteLabels.style.gridTemplateRows = `repeat(${totalRows}, 24px)`;
		this.noteLabels.style.gap = "2px";
		this.noteLabels.style.padding = "10px 0 10px 10px";

		// Создаем карту нот из паттерна
		const noteMap = this.createNoteMap(pattern);

		// Рендерим каждую строку (нота + октава)
		for (const octave of renderOctaves) {
			for (let noteIndex = 0; noteIndex < renderNoteNames.length; noteIndex++) {
				const noteName = renderNoteNames[noteIndex];
				const pitch = this.config.noteNames.indexOf(noteName); // Используем реальный pitch

				// Лейбл ноты
				const label = document.createElement("div");
				label.className = "note-label";
				label.textContent = `${noteName}${octave}`;
				label.style.background = this.isBlackKey(pitch)
					? "var(--label-dark)"
					: "var(--label-light)";
				label.style.fontSize = "10px";
				label.style.display = "flex";
				label.style.alignItems = "center";
				label.style.justifyContent = "center";
				label.style.borderRight = "1px solid var(--border)";
				this.noteLabels.appendChild(label);

				// Ячейки для каждого шага
				for (let step = 0; step < this.config.length; step++) {
					const cell = document.createElement("div");
					cell.className = "grid-cell";
					cell.dataset.pitch = pitch.toString();
					cell.dataset.octave = octave.toString();
					cell.dataset.step = step.toString();

					// Стиль ячейки
					cell.style.background = this.isBlackKey(pitch)
						? "var(--cell-dark)"
						: "var(--cell-light)";
					cell.style.cursor = "pointer";
					cell.style.borderRadius = "8px";

					// Подсветка каждого 4-го шага
					if (step % 4 === 0) {
						cell.style.boxShadow = "inset 2px 0 0 rgba(124, 92, 255, 0.24)";
					}

					// Проверяем, есть ли нота в этой позиции
					const noteKey = `${pitch}-${octave}-${step}`;
					if (noteMap.has(noteKey)) {
						const note = noteMap.get(noteKey);
						if (note) {
							cell.classList.add("active");
							cell.style.background = note.color;
							cell.style.opacity = (note.velocity / 127).toString();
							cell.style.borderRadius = "10px";
							cell.title = `${noteName}${octave} - Velocity: ${note.velocity}`;

							// Если нота длится несколько шагов, растягиваем её
							if (note.duration > 1) {
								cell.style.gridColumn = `span ${note.duration}`;
							}
						}
					}

					// Hover эффект
					cell.addEventListener("mouseenter", () => {
						if (!cell.classList.contains("active")) {
							cell.style.background = "var(--cell-hover)";
						}
					});

					cell.addEventListener("mouseleave", () => {
						if (!cell.classList.contains("active")) {
							cell.style.background = this.isBlackKey(pitch)
								? "var(--cell-dark)"
								: "var(--cell-light)";
						}
					});

					this.grid.appendChild(cell);
				}
			}
		}
	}

	private getUsedNoteRange(pattern: Pattern): {
		minOctave: number;
		maxOctave: number;
		minPitch: number;
		maxPitch: number;
	} {
		if (!pattern || pattern.notes.length === 0) {
			return { minOctave: 4, maxOctave: 5, minPitch: 0, maxPitch: 11 }; // По умолчанию
		}

		let minOctave = 99;
		let maxOctave = -1;
		let minPitch = 99;
		let maxPitch = -1;

		for (const note of pattern.notes) {
			minOctave = Math.min(minOctave, note.octave);
			maxOctave = Math.max(maxOctave, note.octave);
			minPitch = Math.min(minPitch, note.pitch);
			maxPitch = Math.max(maxPitch, note.pitch);
		}

		return { minOctave, maxOctave, minPitch, maxPitch };
	}

	private filterOctaves(
		allOctaves: number[],
		minOctave: number,
		maxOctave: number,
	): number[] {
		// Убедимся, что хотя бы одна октава возвращается
		if (minOctave > maxOctave) {
			return [Math.max(...allOctaves)];
		}

		const filtered = allOctaves.filter(
			(octave) => octave >= minOctave && octave <= maxOctave,
		);
		return filtered.length > 0 ? filtered : [4]; // Если не нашли подходящие октавы, вернем 4
	}

	private filterNoteNames(
		allNoteNames: string[],
		minPitch: number,
		maxPitch: number,
	): string[] {
		// Получаем индексы нот на основе pitch
		const pitchesInRange = Array.from(
			{ length: maxPitch - minPitch + 1 },
			(_, i) => i + minPitch,
		);
		const filteredNoteNames = allNoteNames.filter((_, index) => {
			const pitch = allNoteNames.length - 1 - index; // Инвертируем индекс для правильного pitch
			return pitchesInRange.includes(pitch);
		});

		return filteredNoteNames.length > 0
			? filteredNoteNames
			: allNoteNames.slice(5, 8); // Вернем C, C#, D по умолчанию
	}

	private createNoteMap(pattern: Pattern | null): Map<string, Note> {
		const map = new Map<string, Note>();

		if (!pattern) return map;

		// Добавляем позицию для каждой ноты
		let currentStep = 0;
		for (const note of pattern.notes) {
			const key = `${note.pitch}-${note.octave}-${currentStep}`;
			map.set(key, note);
			currentStep += note.duration;
		}

		return map;
	}

	private isBlackKey(pitch: number): boolean {
		// Черные клавиши: C#, D#, F#, G#, A# (1, 3, 6, 8, 10)
		return [1, 3, 6, 8, 10].includes(pitch);
	}

	public setLength(length: number): void {
		this.config.length = length;
	}

	public getActiveNotes(): Note[] {
		const notes: Note[] = [];
		const cells = this.grid.querySelectorAll(".grid-cell.active");

		cells.forEach((cell) => {
			const htmlCell = cell as HTMLElement;
			const pitch = parseInt(htmlCell.dataset.pitch || "0", 10);
			const octave = parseInt(htmlCell.dataset.octave || "4", 10);
			const _step = parseInt(htmlCell.dataset.step || "0", 10);

			notes.push({
				pitch,
				octave,
				duration: 1,
				velocity: 100,
				color: htmlCell.style.backgroundColor || "#4CAF50",
			});
		});

		return notes;
	}
}
