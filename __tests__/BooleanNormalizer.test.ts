import BooleanNormalizer from '../src/normalizers/BooleanNormalizer';
import { NormalizerConfig } from '../src/types';

describe('BooleanNormalizer', () => {
  let normalizer: BooleanNormalizer;
  let config: NormalizerConfig;

  beforeEach(() => {
    config = {};
    normalizer = new BooleanNormalizer(config);
  });

  describe('shouldNormalize', () => {
    it('should return true for boolean strings', () => {
      expect(normalizer.shouldNormalize('true')).toBe(true);
      expect(normalizer.shouldNormalize('false')).toBe(true);
      expect(normalizer.shouldNormalize('1')).toBe(true);
      expect(normalizer.shouldNormalize('0')).toBe(true);
    });

    it('should return false for non-boolean strings', () => {
      expect(normalizer.shouldNormalize('not a boolean')).toBe(false);
      expect(normalizer.shouldNormalize('123')).toBe(false);
      expect(normalizer.shouldNormalize('')).toBe(false);
    });

    it('should return false for booleans', () => {
      expect(normalizer.shouldNormalize(true)).toBe(false);
      expect(normalizer.shouldNormalize(false)).toBe(false);
    });

    it('should respect targetKeys', () => {
      config.targetKeys = ['boolField'];
      normalizer = new BooleanNormalizer(config);
      
      expect(normalizer.shouldNormalize('true', 'boolField')).toBe(true);
      expect(normalizer.shouldNormalize('true', 'otherField')).toBe(false);
    });
  });

  describe('normalize', () => {
    it('should convert truthy strings to true', () => {
      expect(normalizer.normalize('true')).toBe(true);
      expect(normalizer.normalize('1')).toBe(true);
    });

    it('should convert falsy strings to false', () => {
      expect(normalizer.normalize('false')).toBe(false);
      expect(normalizer.normalize('0')).toBe(false);
    });

    it('should respect custom truthy/falsy values', () => {
      config.boolean = {
        truthyValues: ['customTrue', 'enabled'],
        falsyValues: ['customFalse', 'disabled']
      };
      normalizer = new BooleanNormalizer(config);
      
      expect(normalizer.normalize('customTrue')).toBe(true);
      expect(normalizer.normalize('enabled')).toBe(true);
      expect(normalizer.normalize('customFalse')).toBe(false);
      expect(normalizer.normalize('disabled')).toBe(false);
      
      // Default values should still work
      expect(normalizer.normalize('true')).toBe(true);
      expect(normalizer.normalize('false')).toBe(false);
    });

    it('should handle strict mode', () => {
      config.boolean = { strictMode: true };
      normalizer = new BooleanNormalizer(config);
      
      // Valid values should work
      expect(normalizer.normalize('true')).toBe(true);
      expect(normalizer.normalize('false')).toBe(false);
      
      // Invalid value should throw in strict mode
      expect(() => normalizer.normalize('not a boolean')).toThrow();
    });
  });
});
