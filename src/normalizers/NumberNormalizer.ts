import { NumberNormalizerConfig, NormalizerConfig } from '../types';
import BaseNormalizer from './BaseNormalizer';

/**
 * Normalizes various string representations of numbers to actual numbers.
 * 
 * @example
 * const normalizer = new NumberNormalizer({ allowFloat: true });
 * normalizer.normalize('1,234.56'); // Returns 1234.56
 * normalizer.normalize('42'); // Returns 42
 */
export default class NumberNormalizer extends BaseNormalizer<NumberNormalizerConfig> {
  static readonly DEFAULT_CONFIG: NumberNormalizerConfig = {
    allowFloat: true,
    strictMode: false
  };

  constructor(config: Partial<NumberNormalizerConfig> | NormalizerConfig = {}) {
    const numConfig = (config as NormalizerConfig)?.number;
    const perConfig: Partial<NumberNormalizerConfig> =
      typeof numConfig === 'object' && numConfig !== null ? (numConfig as Partial<NumberNormalizerConfig>) : (config as Partial<NumberNormalizerConfig>);
    super(
      'number',
      { ...NumberNormalizer.DEFAULT_CONFIG },
      perConfig
    );
  }

  public normalize(value: any, key?: string, config?: Partial<NormalizerConfig>): any {
    if (!this.shouldNormalize(value, key, config)) {
      return value;
    }

    try {
      const effectiveConfig = this.getEffectiveConfig(config);
      const strValue = String(value).trim();
      
      // Handle empty string
      if (strValue === '') {
        if (this.isStrictMode(config)) {
          throw new Error('Empty string cannot be converted to a number');
        }
        return value;
      }
      
      // Check for invalid characters first
      if (!/^-?[\d,.\s]+$/.test(strValue)) {
        if (this.isStrictMode(config)) {
          throw new Error(`Invalid number format: ${value}`);
        }
        return value;
      }
      
      // Remove thousand separators and normalize decimal point
      const normalizedStr = strValue
        .replace(/,/g, '')
        .replace(/\s+/g, '')
        .replace(/^\s+|\s+$/g, '');
      
      // Parse the number based on allowFloat setting
      let num: number;
      if (effectiveConfig.allowFloat) {
        num = parseFloat(normalizedStr);
      } else {
        // For integers, we need to ensure there's no decimal part
        if (normalizedStr.includes('.')) {
          num = parseInt(normalizedStr.split('.')[0], 10);
        } else {
          num = parseInt(normalizedStr, 10);
        }
      }
      
      if (isNaN(num)) {
        if (this.isStrictMode(config)) {
          throw new Error(`Could not parse number from: ${value}`);
        }
        return value;
      }
      
      return num;
    } catch (error) {
      if (this.isStrictMode(config)) {
        throw error;
      }
      return this.handleError(error as Error, value, key);
    }
  }

  public shouldNormalize(value: any, key?: string, config: Partial<NormalizerConfig> = {}): boolean {
    if (!super.shouldNormalize(value, key, config)) {
      return false;
    }

    // In strict mode, attempt to normalize/validate string values
    if (this.isStrictMode(config)) {
      if (typeof value === 'string') {
        return true;
      }
    }

    // Skip if already a number
    if (typeof value === 'number') {
      return false;
    }
    
    // Only process strings or stringifiable values
    if (value === null || value === undefined || typeof value === 'object' || Array.isArray(value)) {
      return false;
    }
    
    const strValue = String(value).trim();
    if (strValue === '') {
      return false;
    }
    
    // Check if it's a number with commas as thousand separators and optional decimal part
    if (/^-?\d{1,3}(,\d{3})*(\.\d+)?$/.test(strValue)) {
      return true;
    }
    
    // Check if it's a simple number (with optional decimal part)
    if (/^-?\d+(\.\d+)?$/.test(strValue)) {
      return true;
    }
    
    // Check for numbers with other non-digit characters (will fail in normalize if strict)
    if (/^-?[\d,.\s]+$/.test(strValue)) {
      return true;
    }
    
    return false;
  }

  private getEffectiveConfig(config?: Partial<NormalizerConfig>): NumberNormalizerConfig {
    const override = (config as NormalizerConfig)?.number;
    const overrideCfg: Partial<NumberNormalizerConfig> = typeof override === 'object' && override !== null ? override : {};
    return {
      ...this.config,
      ...overrideCfg
    } as NumberNormalizerConfig;
  }
  
  private getNumberConfig(config?: NormalizerConfig): boolean | NumberNormalizerConfig {
    // If config is provided, use its number property, otherwise use the instance's config
    if (config) {
      return config.number === undefined ? true : config.number;
    }
    // For the instance config, we can directly access the properties
    return this.config;
  }
}
