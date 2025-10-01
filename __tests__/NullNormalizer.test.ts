import NullNormalizer from '../src/normalizers/NullNormalizer';
import { NormalizerConfig } from '../src/types';

describe('NullNormalizer', () => {
  let normalizer: NullNormalizer;
  let config: NormalizerConfig;

  beforeEach(() => {
    config = {};
    normalizer = new NullNormalizer(config);
  });

  describe('shouldNormalize', () => {
    it('should return true for null-like strings', () => {
      expect(normalizer.shouldNormalize('')).toBe(true);
      expect(normalizer.shouldNormalize('null')).toBe(true);
      expect(normalizer.shouldNormalize('undefined')).toBe(true);
      expect(normalizer.shouldNormalize('N/A')).toBe(true);
      expect(normalizer.shouldNormalize('none')).toBe(true);
      expect(normalizer.shouldNormalize('-')).toBe(true);
      expect(normalizer.shouldNormalize('--')).toBe(true);
    });

    it('should return false for non-null strings', () => {
      expect(normalizer.shouldNormalize('not null')).toBe(false);
      expect(normalizer.shouldNormalize('0')).toBe(false);
      expect(normalizer.shouldNormalize('false')).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(normalizer.shouldNormalize(null)).toBe(false);
      expect(normalizer.shouldNormalize(undefined)).toBe(false);
    });

    it('should respect targetKeys', () => {
      config.targetKeys = ['nullField'];
      normalizer = new NullNormalizer(config);
      
      expect(normalizer.shouldNormalize('', 'nullField')).toBe(true);
      expect(normalizer.shouldNormalize('', 'otherField')).toBe(false);
    });
  });

  describe('normalize', () => {
    it('should convert null-like strings to null', () => {
      expect(normalizer.normalize('')).toBeNull();
      expect(normalizer.normalize('null')).toBeNull();
      expect(normalizer.normalize('undefined')).toBeNull();
      expect(normalizer.normalize('N/A')).toBeNull();
      expect(normalizer.normalize('none')).toBeNull();
      expect(normalizer.normalize('-')).toBeNull();
      expect(normalizer.normalize('--')).toBeNull();
    });

    it('should handle NaN', () => {
      expect(normalizer.normalize(NaN)).toBeNull();
    });

    it('should respect custom null values', () => {
      config.null = {
        customNulls: ['customNull', 'missing']
      };
      normalizer = new NullNormalizer(config);
      
      expect(normalizer.normalize('customNull')).toBeNull();
      expect(normalizer.normalize('missing')).toBeNull();
      
      // Default values should still work
      expect(normalizer.normalize('')).toBeNull();
      expect(normalizer.normalize('null')).toBeNull();
    });

    it('should handle strict mode', () => {
      config.null = { strictMode: true };
      normalizer = new NullNormalizer(config);
      
      // Empty string should remain empty in strict mode
      expect(normalizer.normalize('')).toBe('');
      
      // Other null values should still work
      expect(normalizer.normalize('null')).toBeNull();
      expect(normalizer.normalize('N/A')).toBeNull();
    });
  });
});
