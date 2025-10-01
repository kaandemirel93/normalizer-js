import Normalizer, { normalizer } from '../src/Normalizer';
import { NormalizerConfig } from '../src/types';

describe('Normalizer', () => {
  let config: NormalizerConfig;

  beforeEach(() => {
    // Reset to default config before each test
    config = {};
  });

  it('should normalize a simple object', () => {
    const input = {
      created_at: '2023-01-01',
      price: '1,000.50',
      is_active: 'true',
      middle_name: 'N/A',
      user: {
        first_name: 'John',
        last_name: 'Doe',
        age: '30'
      },
      tags: ['tag_one', 'tag_two']
    };

    const result = normalizer.normalize(input, config);
    
    // Check the structure and types
    expect(result).toEqual({
      createdAt: expect.stringMatching(/^2023-01-01T\d{2}:00:00.000Z$/),
      price: 1000.5, // Number normalization is disabled by default
      isActive: true, // Boolean normalization is disabled by default
      middleName: null, // Null normalization is disabled by default
      user: {
        firstName: 'John', // Key normalization is disabled by default
        lastName: 'Doe',
        age: 30 // Number normalization is disabled by default
      },
      tags: ['tag_one', 'tag_two']
    });
  });

  it('should respect targetKeys option', () => {
    const input = {
      created_at: '2023-01-01',
      price: '1,000.50',
      is_active: 'true'
    };

    config.targetKeys = ['price'];
    config.number = true; // Enable number normalization for this test

    const result = normalizer.normalize(input, config);
    
    expect(result).toEqual({
      createdAt: '2023-01-01', // Not normalized (not in targetKeys)
      price: 1000.5,           // Normalized (in targetKeys)
      isActive: 'true'        // Not normalized (not in targetKeys)
    });
  });

  it('should handle deepClone option', () => {
    const input = {
      date: '2023-01-01',
      nested: { value: 'test' }
    };

    // With deepClone: true (default)
    const result1 = normalizer.normalize(input, config);
    expect(result1).not.toBe(input);
    expect(result1.nested).not.toBe(input.nested);

    // With deepClone: false
    config.deepClone = false;
    const result2 = normalizer.normalize(input, config);
    expect(result2).toBe(input);
    expect(result2.nested).toBe(input.nested);
  });

  it('should handle strict mode', () => {
    config.mode = 'strict';
    config.date = true; // Enable date normalization for this test
    
    // Should throw for invalid date
    expect(() => {
      normalizer.normalize({
        invalid_date: 'not a date',
        number: 'not a number'
      }, config);
    }).toThrow();
  });

  it('should handle custom configurations', () => {
    const input = {
      created_date: '2023-01-01',
      price: '1,000',
      is_active: 'yes',
      user: {
        first_name: 'John',
        middle_name: 'N/A',
        user_id: '123'
      }
    };

    // Enable all normalizers with custom configs
    config.date = {
      outputFormat: 'MM/dd/yyyy',
      strictMode: true
    };
    config.number = {
      allowFloat: false
    };
    config.boolean = {
      truthyValues: ['yes', 'true'],
      falsyValues: ['no', 'false', 'N/A']
    };
    config.null = {
      customNulls: ['N/A']
    };
    config.key = {
      style: 'camel',
      recursive: true,
      preserve: ['userId']
    };

    const result = normalizer.normalize(input, config);
    
    expect(result).toEqual({
      createdDate: '01/01/2023',
      price: 1000,
      isActive: true,
      user: {
        firstName: 'John',
        middleName: null,
        userId: '123' // Preserved as is
      }
    });
  });

  it('should handle arrays of objects', () => {
    const input = [
      { user_name: 'john_doe', join_date: '2023-01-01' },
      { user_name: 'jane_doe', join_date: '2023-02-01' }
    ];

    config.key = {
      style: 'camel',
      recursive: true
    };
    config.date = true;

    const result = normalizer.normalize(input);
    
    // Check the structure and date format
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    
    // Check first item
    expect(result[0]).toMatchObject({
      userName: 'john_doe',
      joinDate: expect.stringMatching(/^2023-01-01T\d{2}:00:00.000Z$/)
    });
    
    // Check second item
    expect(result[1]).toMatchObject({
      userName: 'jane_doe',
      joinDate: expect.stringMatching(/^2023-02-01T\d{2}:00:00.000Z$/)
    });
  });

  it('should handle primitive values', () => {
    // By default, normalizers are disabled
    expect(normalizer.normalize('2023-01-01')).toBe('2023-01-01');
    expect(normalizer.normalize('1,000.50')).toBe('1,000.50');
    expect(normalizer.normalize('true')).toBe('true');
    expect(normalizer.normalize('N/A')).toBe('N/A');
    expect(normalizer.normalize(42)).toBe(42);
    expect(normalizer.normalize(true)).toBe(true);
    expect(normalizer.normalize(null)).toBeNull();
    expect(normalizer.normalize(undefined)).toBeUndefined();
    
    // Test with normalizers enabled
    const testConfig: NormalizerConfig = {
      date: true,
      number: true,
      boolean: true,
      null: true
    };
    
    // Check date format with regex to be timezone-agnostic
    const dateResult = normalizer.normalize('2023-01-01', testConfig);
    expect(dateResult).toMatch(/^2023-01-01T\d{2}:00:00.000Z$/);
    
    expect(normalizer.normalize('1,000.50', testConfig)).toBe(1000.5);
    expect(normalizer.normalize('true', testConfig)).toBe(true);
    expect(normalizer.normalize('N/A', testConfig)).toBeNull();
  });

  it('should handle logging', () => {
    const originalConsoleLog = console.log;
    const logs: string[] = [];
    
    // Mock console.log to capture logs
    console.log = (message: string) => {
      logs.push(message);
    };

    try {
      // Enable logging
      config.logging = true;

      normalizer.normalize({
        created_at: '2023-01-01',
        price: '1,000.50'
      }, config);
      
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some(log => 
        typeof log === 'string' && 
        (log.includes('Normalized value for key "created_at"') || 
         log.includes('Normalized value for key "price"'))
      )).toBe(true);
    } finally {
      // Restore original console.log
      console.log = originalConsoleLog;
    }
  });
});
