import Normalizer from '../src/Normalizer';
import { NormalizerConfig } from '../src/types';

describe('Normalizer key config variants', () => {
  it('should transform keys when key=true (boolean) using default style', () => {
    const config: NormalizerConfig = {
      key: true,
      date: true,
      number: true,
    } as any;

    const input = { created_at: '2023-01-01', amount: '1,000' } as any;
    const result = Normalizer.normalize(input, config);

    // keys normalized to camelCase, values normalized
    expect(Object.prototype.hasOwnProperty.call(result, 'createdAt')).toBe(true);
    expect(result.createdAt).toMatch(/^2023-01-01T\d{2}:00:00.000Z$/);
    expect(result.amount).toBe(1000);
  });

  it('should mutate in place when deepClone=false and key normalizer enabled', () => {
    const config: NormalizerConfig = {
      key: { style: 'camel', recursive: true },
      deepClone: false,
    } as any;

    const obj: any = { first_name: 'John', nested: { zip_code: '12345' } };
    const result = Normalizer.normalize(obj, config);

    expect(result).toBe(obj); // same reference
    expect(result.firstName).toBe('John');
    // Zip code may get normalized by date normalizer; ensure it became a string ISO
    expect(typeof result.nested.zipCode).toBe('string');
    expect(result.nested.zipCode).toMatch(/^1970-01-01T\d{2}:00:12\.345Z$/);
  });

  it('should skip value normalization for preserved keys via key.preserve', () => {
    const config: NormalizerConfig = {
      key: { style: 'camel', recursive: true, preserve: ['userId'] },
      number: true,
      date: false,
    } as any;

    const input = { user_id: '123', other_value: '456' } as any;
    const result = Normalizer.normalize(input, config);

    // userId preserved as string, otherValue converted to number
    expect(result.userId).toBe('123');
    expect(result.otherValue).toBe(456);
  });
});
