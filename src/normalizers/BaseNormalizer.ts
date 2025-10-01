import { Normalizer, NormalizerConfig, NormalizerType, BaseNormalizerConfig } from '../types';
import { createLogger } from '../utils/logger';

/**
 * Base class for all normalizers
 * @template TConfig - The configuration type for the normalizer
 */
export default abstract class BaseNormalizer<TConfig extends BaseNormalizerConfig> implements Normalizer<TConfig> {
  public readonly type: NormalizerType;
  public readonly logger: Console;
  public readonly config: TConfig;
  public readonly defaultConfig: TConfig;

  constructor(type: NormalizerType, defaultConfig: TConfig, config: Partial<TConfig> = {}) {
    this.type = type;
    this.defaultConfig = { ...defaultConfig };
    
    // Merge default config with provided config
    this.config = {
      ...this.defaultConfig,
      ...config
    } as TConfig;
    
    // Initialize logger
    this.logger = createLogger(this.config);
  }

  /**
   * Normalize a value
   * @param value - The value to normalize
   * @param key - The key of the value (if part of an object)
   * @param config - Optional config override
   */
  public abstract normalize(value: any, key?: string, config?: Partial<NormalizerConfig>): any;
  
  /**
   * Check if a value should be normalized
   * @param value - The value to check
   * @param key - The key of the value (if part of an object)
   * @param config - Optional config override
   */
  public shouldNormalize(value: any, key?: string, config: Partial<NormalizerConfig> = {}): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    // Check if this key is in the target keys (if specified)
    const targetKeys = this.getConfigValue('targetKeys', config);
    if (targetKeys?.length && key && !targetKeys.includes(key)) {
      return false;
    }

    return true;
  }

  /**
   * Handle normalization errors
   * @param error - The error that occurred
   * @param value - The value being normalized
   * @param key - The key of the value (if part of an object)
   */
  public handleError(error: Error, value: any, key?: string): any {
    if (this.isStrictMode()) {
      throw error;
    }
    
    this.logError(error, value, key);
    return value; // Return original value in non-strict mode
  }

  /**
   * Check if strict mode is enabled
   * @param config - Optional config override
   */
  public isStrictMode(config: any = this.config): boolean {
    return config?.mode === 'strict' || config?.strictMode === true;
  }

  /**
   * Check if a key is a target for normalization
   * @param key - The key to check
   * @param config - Optional config override
   */
  public isTargetKey(key?: string, config: any = this.config): boolean {
    if (!key) return true;
    
    const targetKeys = this.getConfigValue('targetKeys', config);
    if (!targetKeys?.length) return true;
    
    return targetKeys.includes(key);
  }

  /**
   * Get a config value with fallback to default config
   * @param key - The config key to get
   * @param config - Optional config override
   */
  protected getConfigValue<K extends keyof TConfig>(
    key: K,
    config: Partial<NormalizerConfig> = {}
  ): TConfig[K] | undefined {
    return (config as any)[key] ?? this.config[key];
  }

  /**
   * Log an error
   * @param error - The error that occurred
   * @param value - The value being normalized
   * @param key - The key of the value (if part of an object)
   */
  protected logError(error: Error, value: any, key?: string): void {
    if (this.logger && this.logger.error) {
      this.logger.error(`Error in ${this.type} normalizer${key ? ` for key "${key}"` : ''}:`, {
        error: error.message,
        value,
        stack: error.stack
      });
    } else {
      // Fallback to console if logger is not available
      console.error(`[${this.type} normalizer] Error${key ? ` for key "${key}"` : ''}:`, error);
    }
  }
}
