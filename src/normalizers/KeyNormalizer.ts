import { KeyNormalizerConfig, NormalizerConfig, CaseType } from '../types';
import BaseNormalizer from './BaseNormalizer';
import { convertCase, detectCase } from '../utils/case';

/**
 * Normalizes object keys to a consistent case style.
 * 
 * @example
 * const normalizer = new KeyNormalizer({ 
 *   style: 'camel',
 *   preserve: ['user_id'],
 *   recursive: true 
 * });
 * const result = normalizer.normalize({ 'user_name': 'john', 'user_id': 1 });
 * // Returns: { userName: 'john', user_id: 1 }
 */
export default class KeyNormalizer extends BaseNormalizer<KeyNormalizerConfig> {
  static readonly DEFAULT_CONFIG: KeyNormalizerConfig = {
    style: 'camel',
    preserve: [],
    recursive: true,
    strictMode: false
  };

  private preservedKeys: Set<string | RegExp>;

  constructor(config: Partial<KeyNormalizerConfig> | NormalizerConfig = {}) {
    // Extract per-normalizer config if a global NormalizerConfig is passed
    const keyConfig = (config as NormalizerConfig)?.key;
    const perNormalizerConfig: Partial<KeyNormalizerConfig> =
      typeof keyConfig === 'object' && keyConfig !== null ? (keyConfig as Partial<KeyNormalizerConfig>) : (config as Partial<KeyNormalizerConfig>);

    super(
      'key',
      { ...KeyNormalizer.DEFAULT_CONFIG },
      perNormalizerConfig
    );
    
    // Initialize preserved keys set for faster lookups
    const preserveList = Array.isArray(perNormalizerConfig.preserve)
      ? perNormalizerConfig.preserve
      : [];
    const preservedKeys = preserveList
      .filter((k: string | RegExp): k is string | RegExp => typeof k === 'string' || k instanceof RegExp)
      .map((k: string | RegExp) => (typeof k === 'string' ? k.toLowerCase() : k));
    this.preservedKeys = new Set(preservedKeys);
  }

  public normalize(value: any, key?: string, config?: Partial<NormalizerConfig>): any {
    // Only process objects (including arrays). Values are returned unchanged.
    if (value === null || typeof value !== 'object') {
      return value;
    }

    try {
      const effectiveConfig = this.getEffectiveConfig(config);
      
      // Handle non-object values (except arrays which are objects in JS)
      // (already ensured above)
      
      // Handle arrays
      if (Array.isArray(value)) {
        return value.map(item => this.normalize(item, undefined, config));
      }
      
      // Handle non-recursive case
      if (!effectiveConfig.recursive) {
        return this.normalizeObjectKeys(value, effectiveConfig);
      }

      // Deep clone the object to avoid mutating the original
      const result: Record<string, any> = {};
      
      // Process all keys recursively
      for (const [k, v] of Object.entries(value)) {
        const normalizedKey = this.normalizeKey(k, effectiveConfig);
        
        // Only process if the key changed or the value is an object/array
        if (normalizedKey !== k || (v !== null && typeof v === 'object')) {
          result[normalizedKey] = this.normalize(v, normalizedKey, config);
        } else {
          result[normalizedKey] = v;
        }
      }
      
      return result;
    } catch (error) {
      return this.handleError(error as Error, value, key);
    }
  }

  public shouldNormalize(value: any, key?: string, config: Partial<NormalizerConfig> = {}): boolean {
    const effectiveConfig = this.getEffectiveConfig(config);

    // Always process objects (including arrays) so nested keys can be normalized
    if (value !== null && typeof value === 'object') {
      return true;
    }

    // If checking by key only, decide without requiring a value
    if (typeof key === 'string') {
      // Honor target keys if specified
      const targetKeys = effectiveConfig.targetKeys || (config?.targetKeys as string[]);
      if (targetKeys?.length && !targetKeys.includes(key)) {
        return false;
      }

      // If preserve list is defined, only normalize non-preserved keys
      if (Array.isArray(effectiveConfig.preserve) && effectiveConfig.preserve.length > 0) {
        return !this.shouldPreserveKey(key, effectiveConfig);
      }

      // Otherwise, base on style needs
      const style = effectiveConfig.style || 'camel';
      const detected = detectCase(key);

      if (style === 'camel') {
        if (/[_.\-\/\s]/.test(key)) return true;
        // Treat PascalCase as acceptable for camel target
        if (/^[A-Z]/.test(key)) return false;
        return false;
      }
      if (style === 'snake') {
        return detected !== 'snake';
      }
      if (style === 'kebab') {
        return detected !== 'kebab';
      }

      const desired = convertCase(key, style);
      return desired !== key;
    }

    // For non-object values, fall back to original guard
    if (!super.shouldNormalize(value, key, config)) {
      return false;
    }
    return false;
  }

  private normalizeKey(key: string, config: KeyNormalizerConfig): string {
    // Check if key should be preserved
    if (this.shouldPreserveKey(key, config)) {
      return key;
    }
    
    // Convert case according to the specified style
    const style = config.style || 'camel';
    return convertCase(key, style);
  }

  private normalizeObjectKeys(obj: Record<string, any>, config: KeyNormalizerConfig): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const normalizedKey = this.normalizeKey(key, config);
      result[normalizedKey] = value;
    }
    
    return result;
  }

  private shouldPreserveKey(key: string, config: KeyNormalizerConfig): boolean {
    // Always preserve empty keys
    if (!key) return true;
    
    // Check if key is in the preserve list (case-insensitive)
    if (this.preservedKeys.has(key.toLowerCase())) {
      return true;
    }
    
    // Check if key matches any preserve patterns (if provided)
    if (Array.isArray(config.preserve)) {
      return config.preserve.some(
        pattern => {
          if (pattern instanceof RegExp) {
            return pattern.test(key);
          }
          if (typeof pattern === 'string') {
            return pattern.toLowerCase() === key.toLowerCase();
          }
          return false;
        }
      );
    }
    
    return false;
  }

  private getEffectiveConfig(config?: Partial<NormalizerConfig>): KeyNormalizerConfig {
    const override = (config as NormalizerConfig)?.key;
    const overrideCfg: Partial<KeyNormalizerConfig> = typeof override === 'object' && override !== null ? override : {};
    return {
      ...this.config,
      ...overrideCfg
    } as KeyNormalizerConfig;
  }
}
