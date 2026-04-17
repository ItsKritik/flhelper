// Генератор паттернов

import type {
	GenerationOptions,
	Note,
	Pattern,
	Tone,
} from "../models/pattern.js";
import { getScale } from "./scale.js";

export function generateNotes(
	scale: number[],
	length: number,
	options: GenerationOptions,
): Note[] {
	if (length <= 4) {
		return generateShortPattern(scale, length, options);
	}

	const notes: Note[] = [];
	const chordSteps = getChordStepsForTone(options.tone);
	const baseOctave = options.tone === "minor" ? 4 : 5;
	let currentStep = 0;
	let previousScaleIndex = 0;
	let previousOctave = baseOctave;

	while (currentStep < length) {
		const remainingSteps = length - currentStep;
		const isPhraseStart = currentStep === 0;
		const isStrongBeat = currentStep % 4 === 0;
		const isHalfBar = currentStep % 8 === 4;
		const isPhraseEnd = remainingSteps <= 2;

		const duration = pickDuration(currentStep, remainingSteps, isPhraseEnd);
		const scaleIndex = pickScaleIndex(
			previousScaleIndex,
			chordSteps,
			options.tone,
			isPhraseStart,
			isStrongBeat,
			isHalfBar,
			isPhraseEnd,
		);
		const octave = pickOctave(
			previousOctave,
			scaleIndex,
			previousScaleIndex,
			baseOctave,
		);
		const pitch = scale[scaleIndex];

		notes.push({
			pitch,
			octave,
			duration,
			velocity: pickVelocity(currentStep, isStrongBeat, isPhraseEnd),
			color: getNoteColor(scaleIndex),
		});

		previousScaleIndex = scaleIndex;
		previousOctave = octave;
		currentStep += duration;
	}

	return notes;
}

function generateShortPattern(
	scale: number[],
	length: number,
	options: GenerationOptions,
): Note[] {
	const baseOctave = options.tone === "minor" ? 4 : 5;
	const contour = options.tone === "major" ? [0, 2, 4, 0] : [0, 2, 4, 0];

	return Array.from({ length }, (_, step) => {
		const scaleIndex = contour[Math.min(step, contour.length - 1)];
		const pitch = scale[scaleIndex];
		const octave =
			step === 2 && options.tone === "major" ? baseOctave + 1 : baseOctave;

		return {
			pitch,
			octave,
			duration: 1,
			velocity: step === 0 || step === length - 1 ? 116 : 102,
			color: getNoteColor(scaleIndex),
		};
	});
}

function pickScaleIndex(
	previousScaleIndex: number,
	chordSteps: number[],
	tone: Tone,
	isPhraseStart: boolean,
	isStrongBeat: boolean,
	isHalfBar: boolean,
	isPhraseEnd: boolean,
): number {
	if (isPhraseStart || isPhraseEnd) {
		return 0;
	}

	if (isHalfBar) {
		return tone === "minor" ? 5 : 4;
	}

	if (isStrongBeat) {
		return chooseFrom(chordSteps);
	}

	const motion = chooseFrom([-1, 1, 1, 2, -2, 1]);
	const nextStep = previousScaleIndex + motion;
	return clampScaleIndex(nextStep);
}

function getChordStepsForTone(tone: Tone): number[] {
	if (tone === "minor") {
		return [0, 2, 4, 5];
	}

	return [0, 2, 4, 6];
}

function pickDuration(
	currentStep: number,
	remainingSteps: number,
	isPhraseEnd: boolean,
): number {
	if (remainingSteps === 1) {
		return 1;
	}

	if (isPhraseEnd) {
		return Math.min(2, remainingSteps);
	}

	if (currentStep % 4 === 0 && remainingSteps >= 2 && Math.random() < 0.55) {
		return 2;
	}

	return 1;
}

function pickOctave(
	previousOctave: number,
	scaleIndex: number,
	previousScaleIndex: number,
	baseOctave: number,
): number {
	let octave = previousOctave;

	if (scaleIndex - previousScaleIndex >= 3) {
		octave = Math.min(previousOctave + 1, baseOctave + 1);
	}

	if (previousScaleIndex - scaleIndex >= 3) {
		octave = Math.max(previousOctave - 1, baseOctave - 1);
	}

	return octave;
}

function pickVelocity(
	currentStep: number,
	isStrongBeat: boolean,
	isPhraseEnd: boolean,
): number {
	if (isPhraseEnd) {
		return 92;
	}

	if (isStrongBeat) {
		return currentStep % 8 === 0 ? 118 : 108;
	}

	return 88 + Math.floor(Math.random() * 12);
}

function clampScaleIndex(step: number): number {
	if (step < 0) {
		return 0;
	}

	if (step > 6) {
		return 6;
	}

	return step;
}

function chooseFrom<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)];
}

export function generatePattern(options: GenerationOptions): Pattern {
	const scale = getScale(0, options.tone);
	const notes = generateNotes(scale, options.length, options);

	return {
		id: crypto.randomUUID(),
		notes,
		length: options.length,
		bpm: options.bpm,
		tone: options.tone,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

export function generateFromPreset(preset: {
	notes: Note[];
	length: number;
	bpm: number;
	tone: Tone;
}): Pattern {
	return {
		id: crypto.randomUUID(),
		notes: preset.notes,
		length: preset.length,
		bpm: preset.bpm,
		tone: preset.tone,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

// Цвета для нот
const NOTE_COLORS = [
	"#FF6B6B", // C - красный
	"#FFD93D", // C# - желтый
	"#6BCB77", // D - зеленый
	"#4D96FF", // D# - синий
	"#9D4EDD", // E - фиолетовый
	"#FF9F1C", // F - оранжевый
	"#F72585", // F# - розовый
	"#FF6B6B", // G - красный
	"#FFD93D", // G# - желтый
	"#6BCB77", // A - зеленый
	"#4D96FF", // A# - синий
	"#9D4EDD", // B - фиолетовый
];

export function getNoteColor(pitchIndex: number): string {
	return NOTE_COLORS[pitchIndex % NOTE_COLORS.length];
}
