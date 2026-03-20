import { validateBPM, validateLength, validateTone, validatePattern } from './src/utils/validator';

describe('Валидатор', () => {
  describe('validateBPM', () => {
    it('должен возвращать true для валидного BPM', () => {
      expect(validateBPM(120).valid).toBe(true);
    });

    it('должен возвращать false для BPM меньше 40', () => {
      expect(validateBPM(30).valid).toBe(false);
    });

    it('должен возвращать false для BPM больше 240', () => {
      expect(validateBPM(300).valid).toBe(false);
    });

    it('должен возвращать false для нецелого BPM', () => {
      expect(validateBPM(120.5).valid).toBe(false);
    });
  });

  describe('validateLength', () => {
    it('должен возвращать true для валидной длины', () => {
      expect(validateLength(16).valid).toBe(true);
    });

    it('должен возвращать false для длины меньше 1', () => {
      expect(validateLength(0).valid).toBe(false);
    });

    it('должен возвращать false для длины больше 64', () => {
      expect(validateLength(100).valid).toBe(false);
    });
  });

  describe('validateTone', () => {
    it('должен возвращать true для major', () => {
      expect(validateTone('major').valid).toBe(true);
    });

    it('должен возвращать true для minor', () => {
      expect(validateTone('minor').valid).toBe(true);
    });

    it('должен возвращать false для невалидной тональности', () => {
      expect(validateTone('dorian' as 'major' | 'minor').valid).toBe(false);
    });
  });

  describe('validatePattern', () => {
    it('должен возвращать true для валидного паттерна', () => {
      const pattern = {
        notes: [],
        length: 16,
        bpm: 120,
        tone: 'major'
      };
      expect(validatePattern(pattern).valid).toBe(true);
    });

    it('должен возвращать false для null паттерна', () => {
      expect(validatePattern(null).valid).toBe(false);
    });
  });
});