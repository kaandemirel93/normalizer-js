import { BooleanNormalizerConfig, NormalizerConfig } from '../types';
import BaseNormalizer from './BaseNormalizer';

/**
 * Normalizes various representations of boolean values to actual booleans.
 * 
 * @example
 * const normalizer = new BooleanNormalizer({ 
 *   truthyValues: ['yes', 'y', '1'],
 *   falsyValues: ['no', 'n', '0']
 * });
 * normalizer.normalize('yes'); // Returns true
 * normalizer.normalize('no');  // Returns false
 */
export default class BooleanNormalizer extends BaseNormalizer<BooleanNormalizerConfig> {
  static readonly DEFAULT_CONFIG: BooleanNormalizerConfig = {
    strictMode: false,
    truthyValues: ['true', '1'],
    falsyValues: ['false', '0']
  };

  private truthyValues: Set<string | boolean | number>;
  private falsyValues: Set<string | boolean | number>;

  constructor(config: Partial<BooleanNormalizerConfig> & { boolean?: boolean | Partial<BooleanNormalizerConfig> } = {}) {
    // Handle both direct config and config.boolean
    const booleanConfig = (typeof config.boolean === 'object' ? config.boolean : {}) || {};
    const mergedConfig = {
      ...BooleanNormalizer.DEFAULT_CONFIG,
      ...config,
      ...booleanConfig,
      // Merge truthy/falsy values from both config levels
      truthyValues: [
        ...(BooleanNormalizer.DEFAULT_CONFIG.truthyValues || []),
        ...((config.truthyValues as string[]) || []),
        ...((booleanConfig.truthyValues as string[]) || [])
      ],
      falsyValues: [
        ...(BooleanNormalizer.DEFAULT_CONFIG.falsyValues || []),
        ...((config.falsyValues as string[]) || []),
        ...((booleanConfig.falsyValues as string[]) || [])
      ]
    };

    super('boolean', mergedConfig, config);
    
    // Initialize truthy/falsy values sets for faster lookups
    this.truthyValues = new Set([true, ...mergedConfig.truthyValues]);
    this.falsyValues = new Set([false, ...mergedConfig.falsyValues]);
  }

  public normalize(value: any, key?: string, config?: Partial<NormalizerConfig>): any {
    if (!this.shouldNormalize(value, key, config)) {
      return value;
    }

    try {
      const effectiveConfig = this.getEffectiveConfig(config);
      
      // Handle boolean values directly
      if (value === true || value === false) {
        return value;
      }
      
      // Convert to string for comparison (case-insensitive)
      const strValue = String(value).toLowerCase().trim();
      
      // Check if we have custom truthy/falsy values
      const hasCustomTruthy = effectiveConfig.truthyValues && 
        effectiveConfig.truthyValues.length > 0 && 
        effectiveConfig.truthyValues !== BooleanNormalizer.DEFAULT_CONFIG.truthyValues;
        
      const hasCustomFalsy = effectiveConfig.falsyValues && 
        effectiveConfig.falsyValues.length > 0 && 
        effectiveConfig.falsyValues !== BooleanNormalizer.DEFAULT_CONFIG.falsyValues;
      
      // Check against truthy values
      const isTruthy = hasCustomTruthy
        ? effectiveConfig.truthyValues?.some(v => String(v).toLowerCase() === strValue)
        : this.truthyValues.has(strValue) || this.truthyValues.has(value);
      
      if (isTruthy) {
        return true;
      }
      
      // Check against falsy values
      const isFalsy = hasCustomFalsy
        ? effectiveConfig.falsyValues?.some(v => String(v).toLowerCase() === strValue)
        : this.falsyValues.has(strValue) || this.falsyValues.has(value) || strValue === '';
      
      if (isFalsy) {
        return false;
      }

      // If we get here and we're in strict mode, throw an error
      if (this.isStrictMode(effectiveConfig)) {
        throw new Error(`Value "${value}" is not a recognized boolean value`);
      }
      
      // In non-strict mode, return the original value
      return value;
    } catch (error) {
      return this.handleError(error as Error, value, key);
    }
  }

  public shouldNormalize(value: any, key?: string, config: Partial<NormalizerConfig> = {}): boolean {
    if (!super.shouldNormalize(value, key, config)) {
      return false;
    }

    // Get the effective config
    const effectiveConfig = this.getEffectiveConfig(config);
    
    // If we have targetKeys, only normalize if the key is in targetKeys
    if (effectiveConfig.targetKeys && effectiveConfig.targetKeys.length > 0) {
      if (!key || !effectiveConfig.targetKeys.includes(key)) {
        return false;
      }
    }

    // If we're in strict mode, we need to normalize all values
    if (this.isStrictMode(effectiveConfig)) {
      return true;
    }

    // Skip non-primitive values (except null/undefined which are handled by super)
    if (value !== null && value !== undefined && typeof value === 'object') {
      return false;
    }

    // If the value is already a boolean, no need to normalize
    if (typeof value === 'boolean') {
      return false;
    }

    // For non-strings, check if they're in our truthy/falsy sets
    if (typeof value !== 'string') {
      return this.truthyValues.has(value) || this.falsyValues.has(value);
    }

    // For strings, check if they match any of our truthy/falsy values
    const strValue = value.toLowerCase().trim();
    if (strValue === '') {
      return false;
    }

    // Check against truthy and falsy values
    return effectiveConfig.truthyValues?.some(v => String(v).toLowerCase() === strValue) || 
           this.truthyValues.has(strValue) ||
           effectiveConfig.falsyValues?.some(v => String(v).toLowerCase() === strValue) ||
           this.falsyValues.has(strValue);
  }

  private getEffectiveConfig(config?: Partial<NormalizerConfig>): BooleanNormalizerConfig {
    return {
      ...this.config,
      ...(config || {})
    } as BooleanNormalizerConfig;
  }
}
