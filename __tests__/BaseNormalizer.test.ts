import BaseNormalizer from '../src/normalizers/BaseNormalizer';
import { NormalizerConfig, BaseNormalizerConfig } from '../src/types';

class DummyNormalizer extends BaseNormalizer<BaseNormalizerConfig> {
  constructor(config: Partial<BaseNormalizerConfig> = {}) {
    super('key', { strictMode: false, targetKeys: [] }, config);
  }
  normalize(value: any): any { return value; }
}

describe('BaseNormalizer', () => {
  let normalizer: DummyNormalizer;
  let config: NormalizerConfig;

  beforeEach(() => {
    config = {};
    normalizer = new DummyNormalizer();
  });

  it('should respect targetKeys in shouldNormalize', () => {
    config.targetKeys = ['allowed'];
    expect(normalizer.shouldNormalize('val', 'allowed', config)).toBe(true);
    expect(normalizer.shouldNormalize('val', 'blocked', config)).toBe(false);
  });

  it('should check strict mode from config', () => {
    expect(normalizer.isStrictMode()).toBe(false);
    expect(normalizer.isStrictMode({ mode: 'strict' })).toBe(true);
    expect(normalizer.isStrictMode({ strictMode: true } as any)).toBe(true);
  });

  it('should log and return original value on handleError in non-strict mode', () => {
    const result = normalizer.handleError(new Error('test'), 'orig', 'k');
    expect(result).toBe('orig');
  });
});
