import NumberNormalizer from '../src/normalizers/NumberNormalizer';
import { NormalizerConfig } from '../src/types';

describe('NumberNormalizer', () => {
  let normalizer: NumberNormalizer;
  let config: NormalizerConfig;

  beforeEach(() => {
    config = {};
    normalizer = new NumberNormalizer(config);
  });

  describe('shouldNormalize', () => {
    it('should return true for number strings', () => {
      expect(normalizer.shouldNormalize('42')).toBe(true);
      expect(normalizer.shouldNormalize('3.14')).toBe(true);
      expect(normalizer.shouldNormalize('1,234.56')).toBe(true);
    });

    it('should return false for non-number strings', () => {
      expect(normalizer.shouldNormalize('not a number')).toBe(false);
      expect(normalizer.shouldNormalize('123abc')).toBe(false);
      expect(normalizer.shouldNormalize('$123')).toBe(false);
      expect(normalizer.shouldNormalize('123kg')).toBe(false);
    });

    it('should return false for numbers', () => {
      expect(normalizer.shouldNormalize(42)).toBe(false);
      expect(normalizer.shouldNormalize(3.14)).toBe(false);
    });

    it('should respect targetKeys', () => {
      config.targetKeys = ['numberField'];
      normalizer = new NumberNormalizer(config);
      
      expect(normalizer.shouldNormalize('42', 'numberField')).toBe(true);
      expect(normalizer.shouldNormalize('42', 'otherField')).toBe(false);
    });
  });

  describe('normalize', () => {
    it('should convert number strings to numbers', () => {
      expect(normalizer.normalize('42')).toBe(42);
      expect(normalizer.normalize('3.14')).toBe(3.14);
      expect(normalizer.normalize('1,234.56')).toBe(1234.56);
    });

    it('should handle negative numbers', () => {
      expect(normalizer.normalize('-42')).toBe(-42);
      expect(normalizer.normalize('-3.14')).toBe(-3.14);
      expect(normalizer.normalize('-1,234.56')).toBe(-1234.56);
    });

    it('should respect allowFloat option', () => {
      config.number = { allowFloat: false };
      normalizer = new NumberNormalizer(config);
      
      expect(normalizer.normalize('42')).toBe(42);
      expect(normalizer.normalize('3.14')).toBe(3);
      expect(normalizer.normalize('1,234.56')).toBe(1234);
    });

    it('should return original value for invalid numbers in non-strict mode', () => {
      expect(normalizer.normalize('not a number')).toBe('not a number');
      expect(normalizer.normalize('123abc')).toBe('123abc');
    });
  });
});
