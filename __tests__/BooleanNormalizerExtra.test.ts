import BooleanNormalizer from '../src/normalizers/BooleanNormalizer';
import { NormalizerConfig } from '../src/types';

describe('BooleanNormalizer extra', () => {
  it('should handle default truthy/falsy values for strings', () => {
    const normalizer = new BooleanNormalizer({});
    expect(normalizer.normalize('true')).toBe(true);
    expect(normalizer.normalize('false')).toBe(false);
    expect(normalizer.normalize('1')).toBe(true);
    expect(normalizer.normalize('0')).toBe(false);
  });

  it('should respect custom truthy/falsy and throw in strict mode for unknown', () => {
    const config: NormalizerConfig = { boolean: { truthyValues: ['y', 'yes'], falsyValues: ['n', 'no'], strictMode: true } };
    const normalizer = new BooleanNormalizer(config);

    expect(normalizer.normalize('yes', undefined, config)).toBe(true);
    expect(normalizer.normalize('no', undefined, config)).toBe(false);
    expect(() => normalizer.normalize('maybe', undefined, config)).toThrow();
  });
});
