import { convertCase, detectCase } from '../src/utils/case';

describe('case utils', () => {
  it('convertCase should handle multiple styles', () => {
    expect(convertCase('first_name', 'camel')).toBe('firstName');
    expect(convertCase('first-name', 'camel')).toBe('firstName');
    expect(convertCase('FirstName', 'snake')).toBe('first_name');
    expect(convertCase('firstName', 'snake')).toBe('first_name');
    expect(convertCase('first_name', 'kebab')).toBe('first-name');
    expect(convertCase('first.name', 'path')).toBe('first/name');
    expect(convertCase('first name', 'constant')).toBe('FIRST_NAME');
    expect(convertCase('first_name', 'pascal')).toBe('FirstName');
    expect(convertCase('first_name', 'pascal-snake')).toBe('First_Name');
    expect(convertCase('first name', 'capital')).toBe('First Name');
    expect(convertCase('first_name', 'header')).toBe('First-Name');
    expect(convertCase('first.name', 'dot')).toBe('first.name');
    expect(convertCase('first/name', 'param')).toBe('first-name');
    // unknown style should return input
    expect(convertCase('unchanged', 'no' as any)).toBe('unchanged');
  });

  it('detectCase should detect common styles', () => {
    expect(detectCase('firstName')).toBe('camel');
    expect(detectCase('first_name')).toBe('snake');
    expect(detectCase('FirstName')).toBe('pascal');
    expect(detectCase('first-name')).toBe('kebab');
    expect(detectCase('first.name')).toBe('dot');
    expect(detectCase('FIRST_NAME')).toBe('constant');
    expect(detectCase('unknown format')).toBeUndefined();
    expect(detectCase('')).toBeUndefined();
  });
});
