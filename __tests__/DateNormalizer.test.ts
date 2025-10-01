import DateNormalizer from '../src/normalizers/DateNormalizer';
import { NormalizerConfig } from '../src/types';

describe('DateNormalizer', () => {
  let normalizer: DateNormalizer;
  let config: NormalizerConfig;

  beforeEach(() => {
    config = {};
    normalizer = new DateNormalizer(config);
  });

  describe('shouldNormalize', () => {
    it('should return true for date strings', () => {
      expect(normalizer.shouldNormalize('2023-01-01')).toBe(true);
      expect(normalizer.shouldNormalize('01/01/2023')).toBe(true);
      expect(normalizer.shouldNormalize('2023/01/01')).toBe(true);
      expect(normalizer.shouldNormalize('2023-01-01T12:00:00Z')).toBe(true);
    });

    it('should return true for timestamps', () => {
      expect(normalizer.shouldNormalize(1672531200000)).toBe(true);
      expect(normalizer.shouldNormalize('1672531200000')).toBe(true);
    });

    it('should return false for non-date strings', () => {
      expect(normalizer.shouldNormalize('not a date')).toBe(false);
      expect(normalizer.shouldNormalize('123abc')).toBe(false);
    });

    it('should respect targetKeys', () => {
      config.targetKeys = ['dateField'];
      normalizer = new DateNormalizer(config);
      
      expect(normalizer.shouldNormalize('2023-01-01', 'dateField')).toBe(true);
      expect(normalizer.shouldNormalize('2023-01-01', 'otherField')).toBe(false);
    });
  });

  describe('normalize', () => {
    it('should convert date strings to ISO format by default', () => {
      // Note: The exact time will depend on the local timezone
      expect(normalizer.normalize('2023-01-01')).toMatch(/^2023-01-01T\d{2}:00:00.000Z$/);
      expect(normalizer.normalize('01/01/2023')).toMatch(/^2023-01-01T\d{2}:00:00.000Z$/);
    });

    it('should handle timestamps', () => {
      const timestamp = new Date('2023-01-01').getTime();
      // The exact time will depend on the local timezone
      expect(normalizer.normalize(timestamp)).toMatch(/^2023-01-01T\d{2}:00:00.000Z$/);
      expect(normalizer.normalize(timestamp.toString())).toMatch(/^2023-01-01T\d{2}:00:00.000Z$/);
    });

    it('should respect outputFormat option', () => {
      config.date = { outputFormat: 'timestamp' };
      normalizer = new DateNormalizer(config);
      
      const date = new Date('2023-01-01');
      // The exact timestamp will depend on the local timezone
      const normalized = normalizer.normalize('2023-01-01');
      expect(typeof normalized).toBe('number');
      expect(normalized).toBeGreaterThan(0);
    });

    it('should respect timezone option', () => {
      config.date = { timezone: 'UTC' };
      normalizer = new DateNormalizer(config);
      
      // This test verifies timezone conversion
      const utcDate = normalizer.normalize('2023-01-01T00:00:00+03:00');
      // The exact time will depend on the local timezone
      expect(utcDate).toMatch(/^2022-12-31T\d{2}:00:00.000Z$/);
    });

    it('should handle strict mode', () => {
      config.date = { strictMode: true };
      normalizer = new DateNormalizer(config);
      
      // Valid date should work
      expect(normalizer.normalize('2023-01-01')).toMatch(/^2023-01-01T\d{2}:00:00.000Z$/);
      
      // Invalid date should throw in strict mode
      expect(() => normalizer.normalize('not a date')).toThrow();
    });
  });
});
