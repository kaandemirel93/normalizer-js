import { formatDate, convertToTimezone } from '../src/utils/date';

describe('date utils', () => {
  it('formatDate should handle common patterns', () => {
    const d = new Date(Date.UTC(2023, 0, 2, 3, 4, 5));
    expect(formatDate(d, 'YYYY-MM-DD')).toBe('2023-01-02');
    expect(formatDate(d, 'DD/MM/YYYY')).toBe('02/01/2023');
    expect(formatDate(d, 'MM/DD/YYYY')).toBe('01/02/2023');
    expect(formatDate(d, 'iso')).toBe('2023-01-02T03:04:05.000Z');
    expect(formatDate(d, 'timestamp')).toBe(d.getTime());
  });

  it('convertToTimezone should handle utc and local and offsets', () => {
    const base = new Date('2023-01-01T00:00:00Z');
    const utc = convertToTimezone(base, 'utc');
    expect(utc.toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:00:00.000Z$/);

    const local = convertToTimezone(base, 'local');
    expect(local instanceof Date).toBe(true);

    const plus3 = convertToTimezone(base, '+03:00');
    expect(plus3 instanceof Date).toBe(true);

    const minus2 = convertToTimezone(base, '-02:00');
    expect(minus2 instanceof Date).toBe(true);
  });
});
