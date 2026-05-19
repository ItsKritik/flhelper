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
	const context = createGenerationContext(options);

	if (length <= 4) {
		return generateShortPattern(scale, length, context);
	}

	const notes: Note[] = [];
	const chordSteps = getChordStepsForTone(context.tone, context.lengthCategory);
	const baseOctave = getBaseOctave(context);
	let currentStep = 0;
	let previousScaleIndex = 0;
	let previousOctave = baseOctave;

	while (currentStep < length) {
		const remainingSteps = length - currentStep;
		const isPhraseStart = currentStep === 0;
		const isStrongBeat = currentStep % 4 === 0;
		const isHalfBar = currentStep % context.phraseSize === context.phraseSize / 2;
		const isPhraseEnd = remainingSteps <= context.closingWindow;

		const duration = pickDuration(currentStep, remainingSteps, isPhraseEnd, context);
		const scaleIndex = pickScaleIndex(
			previousScaleIndex,
			chordSteps,
			context,
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
			velocity: pickVelocity(currentStep, isStrongBeat, isPhraseEnd, context),
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
	context: GenerationContext,
): Note[] {
	const baseOctave = getBaseOctave(context);
	const contour = context.tone === "major" ? [0, 2, 4, 0] : [0, 2, 3, 0];

	return Array.from({ length }, (_, step) => {
		const scaleIndex = contour[Math.min(step, contour.length - 1)];
		const pitch = scale[scaleIndex];
		const octave =
			step === 2 && context.tone === "major" && context.bpmCategory !== "fast"
				? baseOctave + 1
				: baseOctave;

		return {
			pitch,
			octave,
			duration: 1,
			velocity: step === 0 || step === length - 1 ? context.accentVelocity : context.ghostVelocity,
			color: getNoteColor(scaleIndex),
		};
	});
}

type BpmCategory = "slow" | "mid" | "fast";
type LengthCategory = "short" | "medium" | "long";

interface GenerationContext {
	tone: Tone;
	length: number;
	bpm: number;
	bpmCategory: BpmCategory;
	lengthCategory: LengthCategory;
	phraseSize: 4 | 8 | 16;
	closingWindow: 1 | 2 | 4;
	noteDensity: number;
	stepMotionBias: number[];
	accentVelocity: number;
	ghostVelocity: number;
}

function createGenerationContext(options: GenerationOptions): GenerationContext {
	const bpmCategory: BpmCategory =
		options.bpm < 90 ? "slow" : options.bpm > 150 ? "fast" : "mid";
	const lengthCategory: LengthCategory =
		options.length <= 8 ? "short" : options.length >= 32 ? "long" : "medium";
	const phraseSize: 4 | 8 | 16 =
		lengthCategory === "short" ? 4 : lengthCategory === "long" ? 16 : 8;
	const closingWindow: 1 | 2 | 4 =
		lengthCategory === "long" ? 4 : lengthCategory === "short" ? 1 : 2;

	return {
		tone: options.tone,
		length: options.length,
		bpm: options.bpm,
		bpmCategory,
		lengthCategory,
		phraseSize,
		closingWindow,
		noteDensity: bpmCategory === "slow" ? 0.45 : bpmCategory === "fast" ? 0.8 : 0.6,
		stepMotionBias:
			options.tone === "minor"
				? [-2, -1, -1, 1, 1, 2]
				: [-1, 1, 1, 2, 2, -2],
		accentVelocity: options.tone === "minor" ? 110 : 118,
		ghostVelocity: bpmCategory === "fast" ? 84 : 96,
	};
}

function pickScaleIndex(
	previousScaleIndex: number,
	chordSteps: number[],
	context: GenerationContext,
	isPhraseStart: boolean,
	isStrongBeat: boolean,
	isHalfBar: boolean,
	isPhraseEnd: boolean,
): number {
	if (isPhraseStart || isPhraseEnd) {
		return context.tone === "minor" && isPhraseEnd && context.lengthCategory !== "short" ? 2 : 0;
	}

	if (isHalfBar) {
		return context.tone === "minor" ? 5 : 4;
	}

	if (isStrongBeat) {
		return chooseFrom(chordSteps);
	}

	const motion = chooseFrom(context.stepMotionBias);
	const nextStep = previousScaleIndex + motion;
	return clampScaleIndex(nextStep);
}

function getChordStepsForTone(tone: Tone, lengthCategory: LengthCategory): number[] {
	if (tone === "minor") {
		return lengthCategory === "long" ? [0, 2, 3, 4, 5] : [0, 2, 3, 5];
	}

	return lengthCategory === "long" ? [0, 2, 4, 5, 6] : [0, 2, 4, 6];
}

function pickDuration(
	currentStep: number,
	remainingSteps: number,
	isPhraseEnd: boolean,
	context: GenerationContext,
): number {
	if (remainingSteps === 1) {
		return 1;
	}

	if (isPhraseEnd) {
		return Math.min(context.bpmCategory === "slow" ? 4 : 2, remainingSteps);
	}

	if (
		context.bpmCategory === "slow" &&
		currentStep % 4 === 0 &&
		remainingSteps >= 4 &&
		Math.random() < 0.35
	) {
		return 4;
	}

	if (
		currentStep % 4 === 0 &&
		remainingSteps >= 2 &&
		Math.random() > context.noteDensity
	) {
		return 2;
	}

	return 1;
}

function getBaseOctave(context: GenerationContext): number {
	if (context.tone === "minor") {
		return context.bpmCategory === "fast" ? 4 : 3;
	}

	return context.bpmCategory === "slow" ? 4 : 5;
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
	context: GenerationContext,
): number {
	if (isPhraseEnd) {
		return context.tone === "minor" ? 88 : 96;
	}

	if (isStrongBeat) {
		return currentStep % context.phraseSize === 0
			? context.accentVelocity
			: context.accentVelocity - 10;
	}

	return context.ghostVelocity + Math.floor(Math.random() * 12);
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
