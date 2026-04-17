// Точка входа в приложение

import { generatePattern } from "./core/generator.js";
import type { Pattern, Tone } from "./models/pattern.js";
import { GridRenderer } from "./ui/gridRenderer.js";
import {
	validateBPM,
	validateLength,
	validateTone,
} from "./utils/validator.js";

// Глобальные переменные
let currentPattern: Pattern | null = null;
let gridRenderer: GridRenderer | null = null;

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
	const gridElement = document.getElementById("patternGrid");
	const noteLabelsElement = document.getElementById("noteLabels");

	if (gridElement && noteLabelsElement) {
		gridRenderer = new GridRenderer(gridElement, noteLabelsElement);
	}

	setupEventListeners();
	generateInitialPattern();
});

function setupEventListeners(): void {
	const toneSelect = document.getElementById("tone") as HTMLSelectElement;
	const lengthSlider = document.getElementById("length") as HTMLInputElement;
	const bpmSlider = document.getElementById("bpm") as HTMLInputElement;
	const lengthValue = document.getElementById("lengthValue");
	const bpmValue = document.getElementById("bpmValue");
	const generateBtn = document.getElementById(
		"generateBtn",
	) as HTMLButtonElement;

	if (!lengthValue || !bpmValue) {
		return;
	}

	// Отображение текущих значений
	lengthSlider.addEventListener("input", () => {
		lengthValue.textContent = `${lengthSlider.value} шагов`;
		// Обновляем значение для заполнения ползунка
		const percent =
			((parseInt(lengthSlider.value, 10) - parseInt(lengthSlider.min, 10)) /
				(parseInt(lengthSlider.max, 10) - parseInt(lengthSlider.min, 10))) *
			100;
		lengthSlider.style.setProperty("--value", `${percent}%`);
	});

	bpmSlider.addEventListener("input", () => {
		bpmValue.textContent = `${bpmSlider.value} BPM`;
		// Обновляем значение для заполнения ползунка
		const percent =
			((parseInt(bpmSlider.value, 10) - parseInt(bpmSlider.min, 10)) /
				(parseInt(bpmSlider.max, 10) - parseInt(bpmSlider.min, 10))) *
			100;
		bpmSlider.style.setProperty("--value", `${percent}%`);
	});

	// Устанавливаем начальные значения заполнения
	const initialLengthPercent =
		((parseInt(lengthSlider.value, 10) - parseInt(lengthSlider.min, 10)) /
			(parseInt(lengthSlider.max, 10) - parseInt(lengthSlider.min, 10))) *
		100;
	lengthSlider.style.setProperty("--value", `${initialLengthPercent}%`);

	const initialBpmPercent =
		((parseInt(bpmSlider.value, 10) - parseInt(bpmSlider.min, 10)) /
			(parseInt(bpmSlider.max, 10) - parseInt(bpmSlider.min, 10))) *
		100;
	bpmSlider.style.setProperty("--value", `${initialBpmPercent}%`);

	// Генерация паттерна
	generateBtn.addEventListener("click", () => {
		const tone = toneSelect.value as Tone;
		const length = parseInt(lengthSlider.value, 10);
		const bpm = parseInt(bpmSlider.value, 10);

		// Валидация
		const lengthValidation = validateLength(length);
		const bpmValidation = validateBPM(bpm);
		const toneValidation = validateTone(tone);

		if (
			!lengthValidation.valid ||
			!bpmValidation.valid ||
			!toneValidation.valid
		) {
			alert(
				`Ошибка: ${[lengthValidation.error, bpmValidation.error, toneValidation.error].filter((e) => e).join(", ")}`,
			);
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
	const toneSelect = document.getElementById("tone") as HTMLSelectElement;
	const lengthSlider = document.getElementById("length") as HTMLInputElement;
	const bpmSlider = document.getElementById("bpm") as HTMLInputElement;

	const tone = toneSelect.value as Tone;
	const length = parseInt(lengthSlider.value, 10);
	const bpm = parseInt(bpmSlider.value, 10);

	currentPattern = generatePattern({ tone, length, bpm });

	if (gridRenderer) {
		gridRenderer.setLength(length);
		gridRenderer.render(currentPattern);
	}

	renderPatternInfo(currentPattern);
}

function renderPatternInfo(pattern: Pattern): void {
	const infoEl = document.getElementById("patternInfo");

	if (!infoEl) return;

	let output = '<div class="pattern-metrics">';
	output += `<div class="metric-card"><span>Длина</span><strong>${pattern.length} шагов</strong></div>`;
	output += `<div class="metric-card"><span>Темп</span><strong>${pattern.bpm} BPM</strong></div>`;
	output += `<div class="metric-card"><span>Лад</span><strong>${pattern.tone === "major" ? "Мажор" : "Минор"}</strong></div>`;
	output += `<div class="metric-card"><span>Нот</span><strong>${pattern.notes.length}</strong></div>`;
	output += "</div>";

	if (pattern.notes.length > 0) {
		output += '<section class="pattern-note-list">';
		output += "<h3>Содержимое паттерна</h3>";
		output += "<pre>";
		pattern.notes.forEach((note, index) => {
			const noteName = getNoteName(note.pitch);
			output += `#${index + 1}: ${noteName}${note.octave} | Дл: ${note.duration} | Сила: ${note.velocity}\n`;
		});
		output += "</pre>";
		output += "</section>";
	}

	infoEl.innerHTML = output;
}

function getNoteName(pitch: number): string {
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
	return noteNames[pitch % 12];
}
