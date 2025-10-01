import DateNormalizer from '../src/normalizers/DateNormalizer';
import NumberNormalizer from '../src/normalizers/NumberNormalizer';
import BooleanNormalizer from '../src/normalizers/BooleanNormalizer';
import KeyNormalizer from '../src/normalizers/KeyNormalizer';
import { convertToTimezone } from '../src/utils/date';
import BaseNormalizer from '../src/normalizers/BaseNormalizer';
import { NormalizerConfig, BaseNormalizerConfig } from '../src/types';

describe('Branch coverage extras', () => {
  it('convertToTimezone returns input when timezone not parsed', () => {
    const d = new Date();
    const res = convertToTimezone(d, 'Invalid/Zone');
    expect(res).toBeInstanceOf(Date);
  });

  it('NumberNormalizer.shouldNormalize branch cases', () => {
    const n = new NumberNormalizer({});
    expect(n.shouldNormalize({}, undefined, {} as any)).toBe(false);
    // empty string should be false
    // @ts-ignore
    expect(n.shouldNormalize('   ', undefined, {})).toBe(false);
    // characters set pass through regexp branch true
    expect(n.shouldNormalize('1 234 567', undefined, {})).toBe(true);
  });

  it('KeyNormalizer.shouldNormalize respects targetKeys exclusion', () => {
    const config: NormalizerConfig = { key: { targetKeys: ['onlyThis'] } } as any;
    const k = new KeyNormalizer(config);
    expect(k.shouldNormalize(null, 'notThis', config)).toBe(false);
  });

  it('BaseNormalizer.isTargetKey branches', () => {
    class Dummy extends BaseNormalizer<BaseNormalizerConfig> {
      constructor() { super('key', { strictMode: false, targetKeys: [] }); }
      normalize(v: any) { return v; }
    }
    const d = new Dummy();
    expect(d.isTargetKey(undefined, {})).toBe(true);
    expect(d.isTargetKey('a', {})).toBe(true);
    expect(d.isTargetKey('b', { targetKeys: ['a'] } as any)).toBe(false);
  });

  it('BooleanNormalizer.shouldNormalize object returns false', () => {
    const b = new BooleanNormalizer({});
    expect(b.shouldNormalize({} as any)).toBe(false);
  });

  it('KeyNormalizer.shouldNormalize camel vs Pascal and separators', () => {
    const k = new KeyNormalizer({}); // default camel
    expect(k.shouldNormalize(null as any, 'UserName', {} as any)).toBe(false); // Pascal treated acceptable
    expect(k.shouldNormalize(null as any, 'user-name', {} as any)).toBe(true); // separators need normalization
  });

  it('NullNormalizer.shouldNormalize NaN and empty string', () => {
    const n = new (require('../src/normalizers/NullNormalizer').default)({});
    expect(n.shouldNormalize(NaN as any)).toBe(true);
    expect(n.shouldNormalize('')).toBe(true);
  });

  it('DateNormalizer.shouldNormalize Date objects and invalid strings', () => {
    const d = new DateNormalizer({});
    expect(d.shouldNormalize(new Date())).toBe(true);
    expect(d.shouldNormalize('not a date')).toBe(false);
  });
});
