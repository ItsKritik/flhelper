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
		const rows = this.getRenderRows(pattern);

		this.grid.innerHTML = "";
		this.noteLabels.innerHTML = "";

		const totalRows = rows.length;

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
		for (const row of rows) {
			const noteName = this.getNoteName(row.pitch);

			const label = document.createElement("div");
			label.className = "note-label";
			label.textContent = `${noteName}${row.octave}`;
			label.style.background = this.isBlackKey(row.pitch)
				? "var(--label-dark)"
				: "var(--label-light)";
			label.style.fontSize = "10px";
			label.style.display = "flex";
			label.style.alignItems = "center";
			label.style.justifyContent = "center";
			label.style.borderRight = "1px solid var(--border)";
			this.noteLabels.appendChild(label);

			for (let step = 0; step < this.config.length; step++) {
				const cell = document.createElement("div");
				cell.className = "grid-cell";
				cell.dataset.pitch = row.pitch.toString();
				cell.dataset.octave = row.octave.toString();
				cell.dataset.step = step.toString();

				cell.style.background = this.isBlackKey(row.pitch)
					? "var(--cell-dark)"
					: "var(--cell-light)";
				cell.style.cursor = "pointer";
				cell.style.borderRadius = "8px";

				if (step % 4 === 0) {
					cell.style.boxShadow = "inset 2px 0 0 rgba(124, 92, 255, 0.24)";
				}

				const noteKey = `${row.pitch}-${row.octave}-${step}`;
				if (noteMap.has(noteKey)) {
					const note = noteMap.get(noteKey);
					if (note) {
						cell.classList.add("active");
						cell.style.background = note.color;
						cell.style.opacity = (note.velocity / 127).toString();
						cell.style.borderRadius = "10px";
						cell.title = `${noteName}${row.octave} - Velocity: ${note.velocity}`;

						if (note.duration > 1) {
							cell.style.gridColumn = `span ${note.duration}`;
						}
					}
				}

				cell.addEventListener("mouseenter", () => {
					if (!cell.classList.contains("active")) {
						cell.style.background = "var(--cell-hover)";
					}
				});

				cell.addEventListener("mouseleave", () => {
					if (!cell.classList.contains("active")) {
						cell.style.background = this.isBlackKey(row.pitch)
							? "var(--cell-dark)"
							: "var(--cell-light)";
					}
				});

				this.grid.appendChild(cell);
			}
		}
	}

	private getRenderRows(pattern: Pattern | null): Array<{
		pitch: number;
		octave: number;
	}> {
		if (!pattern || pattern.notes.length === 0) {
			return [
				{ pitch: 7, octave: 5 },
				{ pitch: 4, octave: 5 },
				{ pitch: 0, octave: 5 },
				{ pitch: 7, octave: 4 },
				{ pitch: 4, octave: 4 },
				{ pitch: 0, octave: 4 },
			];
		}

		const rows = new Map<string, { pitch: number; octave: number }>();
		for (const note of pattern.notes) {
			rows.set(`${note.octave}-${note.pitch}`, {
				pitch: note.pitch,
				octave: note.octave,
			});
		}

		return Array.from(rows.values()).sort((left, right) => {
			if (left.octave !== right.octave) {
				return right.octave - left.octave;
			}

			return right.pitch - left.pitch;
		});
	}

	private getNoteName(pitch: number): string {
		const noteNames = [
			"C",
			"C#",
			"D",
			"D#",
			"E",
			"F",
			"F#",
			"G",
			"G#",
			"A",
			"A#",
			"B",
		];

		return noteNames[pitch] ?? "C";
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
