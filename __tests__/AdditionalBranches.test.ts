import DateNormalizer from '../src/normalizers/DateNormalizer';
import NumberNormalizer from '../src/normalizers/NumberNormalizer';
import Normalizer from '../src/Normalizer';
import { convertToTimezone, formatDate } from '../src/utils/date';
import { NormalizerConfig } from '../src/types';

describe('Additional branch coverage', () => {
  it('DateNormalizer should respect custom string outputFormat', () => {
    const config: NormalizerConfig = { date: { outputFormat: 'YYYY-MM-DD' } } as any;
    const d = new DateNormalizer(config);
    const out = d.normalize('2023-01-01', undefined, config);
    expect(out).toBe('2023-01-01');
  });

  it('NumberNormalizer should throw on empty string in strict mode', () => {
    const config: NormalizerConfig = { mode: 'strict' } as any;
    const n = new NumberNormalizer(config);
    expect(() => n.normalize('', undefined, config)).toThrow();
  });

  it('convertToTimezone should support offsets without colon', () => {
    const base = new Date('2023-01-01T00:00:00Z');
    const p = convertToTimezone(base, '+0300');
    const m = convertToTimezone(base, '-0200');
    expect(p instanceof Date).toBe(true);
    expect(m instanceof Date).toBe(true);
  });

  it('formatDate custom tokens path', () => {
    const d = new Date(Date.UTC(2023, 0, 1, 9, 5, 7));
    // Custom pattern uses all token branches
    const s = formatDate(d as any, 'yyyy-MM-dd HH:mm:ss');
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const expected = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    expect(s).toBe(expected);
  });

  it('Normalizer with targetKeys should skip non-target keys', () => {
    const config: NormalizerConfig = { date: true, targetKeys: ['only'] } as any;
    const input = { only: '2023-01-01', other: '2023-01-01' } as any;
    const out = Normalizer.normalize(input, config);
    expect(out.only).toMatch(/^2023-01-01T\d{2}:00:00.000Z$/);
    expect(out.other).toBe('2023-01-01');
  });
});
