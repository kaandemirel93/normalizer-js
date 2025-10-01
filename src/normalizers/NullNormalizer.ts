import { NullNormalizerConfig, NormalizerConfig } from '../types';
import BaseNormalizer from './BaseNormalizer';

/**
 * Normalizes various string/number representations of null/undefined to actual null.
 * 
 * @example
 * const normalizer = new NullNormalizer({ customNulls: ['empty', 'none'] });
 * normalizer.normalize('none'); // Returns null
 */
export default class NullNormalizer extends BaseNormalizer<NullNormalizerConfig> {
  static readonly DEFAULT_CONFIG: Required<NullNormalizerConfig> = {
    strictMode: false,
    customNulls: ['null', 'undefined', 'N/A', 'none', '-', '--'],
    targetKeys: []
  };

  private defaultNullValues: Set<string>;
  private allNullValues: Set<string>;

  constructor(config: Partial<NullNormalizerConfig> | NormalizerConfig = {}) {
    // Extract per-normalizer config if a global NormalizerConfig is passed
    const nullCfg = (config as NormalizerConfig)?.null;
    const perCfg: Partial<NullNormalizerConfig> =
      typeof nullCfg === 'object' && nullCfg !== null ? (nullCfg as Partial<NullNormalizerConfig>) : (config as Partial<NullNormalizerConfig>);

    // Create a merged config that includes both defaults and custom values
    const mergedConfig: Required<NullNormalizerConfig> = {
      ...NullNormalizer.DEFAULT_CONFIG,
      ...perCfg,
      customNulls: [
        ...(perCfg.customNulls || []),
        ...NullNormalizer.DEFAULT_CONFIG.customNulls
      ]
    } as Required<NullNormalizerConfig>;

    super('null', mergedConfig, perCfg);
    
    // Initialize all null values (both defaults and custom) for fast lookups
    this.allNullValues = new Set(
      mergedConfig.customNulls.map(v => String(v).toLowerCase())
    );
    
    // Keep default values separate for reference
    this.defaultNullValues = new Set(
      NullNormalizer.DEFAULT_CONFIG.customNulls.map(v => String(v).toLowerCase())
    );
  }

  public normalize(value: any, key?: string, config?: Partial<NormalizerConfig>): any {
    if (!this.shouldNormalize(value, key, config)) {
      return value;
    }

    try {
      const effectiveConfig = this.getEffectiveConfig(config);
      const isStrict = this.isStrictMode(effectiveConfig);
      
      // Handle special cases first
      if (value === null || value === undefined) {
        return null;
      }

      // Handle NaN
      if (typeof value === 'number' && isNaN(value)) {
        return null;
      }

      // Handle empty string (special case for strict mode)
      if (value === '') {
        return isStrict ? '' : null;
      }

      // Check if the value is in our null values set
      const strValue = String(value).trim().toLowerCase();
      if (this.allNullValues.has(strValue)) {
        return null;
      }

      // If we get here and we're in strict mode, throw an error
      if (isStrict) {
        throw new Error(`Value "${value}" is not a recognized null value`);
      }

      return value;
    } catch (error) {
      return this.handleError(error as Error, value, key);
    }
  }

  public shouldNormalize(value: any, key?: string, config: Partial<NormalizerConfig> = {}): boolean {
    // First check if we should normalize based on target keys
    if (!super.shouldNormalize(value, key, config)) {
      return false;
    }

    // Always normalize null/undefined
    if (value === null || value === undefined) {
      return true;
    }

    // Check if it's a number that's NaN
    if (typeof value === 'number' && isNaN(value)) {
      return true;
    }

    // Only process strings
    if (typeof value !== 'string') {
      return false;
    }

    // Empty string is always a candidate for normalization
    if (value === '') {
      return true;
    }

    // Check if the value is in our null values set
    const strValue = value.trim().toLowerCase();
    return this.allNullValues.has(strValue);
  }

  private getEffectiveConfig(config?: Partial<NormalizerConfig>): NullNormalizerConfig {
    const override = (config as NormalizerConfig)?.null;
    const overrideCfg: Partial<NullNormalizerConfig> = typeof override === 'object' && override !== null ? override : {};
    return {
      ...this.config,
      ...overrideCfg
    } as NullNormalizerConfig;
  }
}
