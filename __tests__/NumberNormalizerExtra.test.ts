import NumberNormalizer from '../src/normalizers/NumberNormalizer';
import { NormalizerConfig } from '../src/types';

describe('NumberNormalizer extra', () => {
  it('should throw on invalid number in strict mode', () => {
    const config: NormalizerConfig = { mode: 'strict' };
    const n = new NumberNormalizer(config);
    expect(() => n.normalize('12abc', undefined, config)).toThrow();
  });

  it('should handle thousand separators and spaces', () => {
    const n = new NumberNormalizer({});
    expect(n.normalize('1 234.56')).toBe(1234.56);
    expect(n.normalize('1,234  .56'.replace('  ', ''))).toBe(1234.56);
  });

  it('should truncate decimals when allowFloat=false', () => {
    const config: NormalizerConfig = { number: { allowFloat: false } };
    const n = new NumberNormalizer(config);
    expect(n.normalize('1,234.56', undefined, config)).toBe(1234);
  });
});
