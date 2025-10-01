import KeyNormalizer from '../src/normalizers/KeyNormalizer';
import { NormalizerConfig } from '../src/types';

describe('KeyNormalizer', () => {
  let normalizer: KeyNormalizer;
  let config: NormalizerConfig;

  beforeEach(() => {
    config = {};
    normalizer = new KeyNormalizer(config);
  });

  describe('shouldNormalize', () => {
    it('should return true for keys not in the target style', () => {
      // Default style is 'camel'
      expect(normalizer.shouldNormalize(null, 'user_name')).toBe(true);
      expect(normalizer.shouldNormalize(null, 'user-name')).toBe(true);
      expect(normalizer.shouldNormalize(null, 'User_Name')).toBe(true);
      expect(normalizer.shouldNormalize(null, 'UserName')).toBe(false);
      expect(normalizer.shouldNormalize(null, 'userName')).toBe(false);
    });

    it('should respect key style configuration', () => {
      config.key = { style: 'snake' };
      normalizer = new KeyNormalizer(config);
      
      expect(normalizer.shouldNormalize(null, 'userName')).toBe(true);
      expect(normalizer.shouldNormalize(null, 'user-name')).toBe(true);
      expect(normalizer.shouldNormalize(null, 'User_Name')).toBe(true);
      expect(normalizer.shouldNormalize(null, 'user_name')).toBe(false);
    });

    it('should respect preserve option', () => {
      config.key = { preserve: ['user_name', 'user-id'] };
      normalizer = new KeyNormalizer(config);
      
      expect(normalizer.shouldNormalize(null, 'user_name')).toBe(false);
      expect(normalizer.shouldNormalize(null, 'user-id')).toBe(false);
      expect(normalizer.shouldNormalize(null, 'userName')).toBe(true);
    });
  });

  describe('normalize', () => {
    it('should convert keys to camelCase by default', () => {
      const obj = {
        user_name: 'John',
        'first-name': 'John',
        LastName: 'Doe',
        address: {
          street_name: '123 Main St',
          'zip-code': '12345'
        },
        phone_numbers: ['123-456-7890', '098-765-4321']
      };

      const result = normalizer.normalize(obj);
      
      expect(result).toEqual({
        userName: 'John',
        firstName: 'John',
        lastName: 'Doe',
        address: {
          streetName: '123 Main St',
          zipCode: '12345'
        },
        phoneNumbers: ['123-456-7890', '098-765-4321']
      });
    });

    it('should respect different key styles', () => {
      // Test snake_case
      config.key = { style: 'snake' };
      normalizer = new KeyNormalizer(config);
      
      let result = normalizer.normalize({
        firstName: 'John',
        lastName: 'Doe',
        homeAddress: {
          streetName: '123 Main St',
          zipCode: '12345'
        }
      });
      
      expect(result).toEqual({
        first_name: 'John',
        last_name: 'Doe',
        home_address: {
          street_name: '123 Main St',
          zip_code: '12345'
        }
      });

      // Test kebab-case
      config.key = { style: 'kebab' };
      normalizer = new KeyNormalizer(config);
      
      result = normalizer.normalize({
        firstName: 'John',
        lastName: 'Doe'
      });
      
      expect(result).toEqual({
        'first-name': 'John',
        'last-name': 'Doe'
      });

      // Test PascalCase
      config.key = { style: 'pascal' };
      normalizer = new KeyNormalizer(config);
      
      result = normalizer.normalize({
        first_name: 'John',
        last_name: 'Doe'
      });
      
      expect(result).toEqual({
        FirstName: 'John',
        LastName: 'Doe'
      });
    });

    it('should respect recursive option', () => {
      config.key = { recursive: false };
      normalizer = new KeyNormalizer(config);
      
      const result = normalizer.normalize({
        user_name: 'John',
        address: {
          street_name: '123 Main St',
          'zip-code': '12345'
        }
      });
      
      expect(result).toEqual({
        userName: 'John',
        address: {
          street_name: '123 Main St',
          'zip-code': '12345'
        }
      });
    });

    it('should handle arrays of objects', () => {
      const result = normalizer.normalize({
        users: [
          { first_name: 'John', last_name: 'Doe' },
          { first_name: 'Jane', last_name: 'Smith' }
        ]
      });
      
      expect(result).toEqual({
        users: [
          { firstName: 'John', lastName: 'Doe' },
          { firstName: 'Jane', lastName: 'Smith' }
        ]
      });
    });
  });
});
