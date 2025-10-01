import { 
  NormalizerConfig, 
  NormalizerMap, 
  NormalizerType, 
  DateNormalizerConfig, 
  NumberNormalizerConfig, 
  BooleanNormalizerConfig, 
  NullNormalizerConfig, 
  KeyNormalizerConfig 
} from './types';
import BaseNormalizer from './normalizers/BaseNormalizer';
import DateNormalizer from './normalizers/DateNormalizer';
import NumberNormalizer from './normalizers/NumberNormalizer';
import BooleanNormalizer from './normalizers/BooleanNormalizer';
import NullNormalizer from './normalizers/NullNormalizer';
import KeyNormalizer from './normalizers/KeyNormalizer';
import { createLogger } from './utils/logger';

// Helper function to deep clone objects
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone((obj as any)[key]);
    }
  }
  
  return result as T;
}

// Helper function to check if a value is an object
function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Default configurations for each normalizer type
const DEFAULT_CONFIGS: Record<NormalizerType, any> = {
  date: {
    outputFormat: 'iso',
    timezone: 'UTC',
    strictMode: false,
    targetKeys: []
  },
  number: {
    allowFloat: true,
    strictMode: false,
    targetKeys: []
  },
  boolean: {
    truthyValues: ['true', 'yes', '1', 1, true],
    falsyValues: ['false', 'no', '0', 0, false, null, undefined],
    strictMode: false,
    targetKeys: []
  },
  null: {
    customNulls: ['', 'null', 'undefined', 'na', 'n/a', 'nan', 'none', '-', '--'],
    strictMode: false,
    targetKeys: []
  },
  key: {
    style: 'camel',
    recursive: true,
    strictMode: false,
    targetKeys: [],
    preserve: []
  }
};

class Normalizer {
  private config: NormalizerConfig;
  private normalizers: Record<NormalizerType, BaseNormalizer<any>>;
  private logger: Console;

  constructor(config: Partial<NormalizerConfig> = {}) {
    this.config = this.mergeWithDefaults(config);
    this.logger = createLogger(this.config);
    this.normalizers = this.initializeNormalizers();
  }

  private mergeWithDefaults(config: Partial<NormalizerConfig>): NormalizerConfig {
    const merged: NormalizerConfig = {
      mode: 'loose',
      deepClone: true,
      logging: false,
      strictMode: false,
      ...config
    };

    // Merge normalizer-specific configs
    (Object.keys(DEFAULT_CONFIGS) as NormalizerType[]).forEach(type => {
      const normalizerConfig = (config as any)[type];
      if (normalizerConfig === false) {
        // Skip if normalizer is disabled
        return;
      }
      
      (merged as any)[type] = {
        ...DEFAULT_CONFIGS[type as NormalizerType],
        ...(typeof normalizerConfig === 'object' ? normalizerConfig : {})
      };
    });

    return merged;
  }

  private initializeNormalizers(): Record<NormalizerType, BaseNormalizer<any>> {
    const normalizers: Partial<Record<NormalizerType, BaseNormalizer<any>>> = {};
    
    // Only initialize enabled normalizers
    (Object.keys(DEFAULT_CONFIGS) as NormalizerType[]).forEach(type => {
      const normalizerConfig = (this.config as any)[type];
      if (normalizerConfig === false) {
        return; // Skip disabled normalizers
      }
      
      switch (type) {
        case 'date':
          normalizers[type] = new DateNormalizer(this.config.date as DateNormalizerConfig);
          break;
        case 'number':
          normalizers[type] = new NumberNormalizer(this.config.number as NumberNormalizerConfig);
          break;
        case 'boolean':
          normalizers[type] = new BooleanNormalizer(this.config.boolean as BooleanNormalizerConfig);
          break;
        case 'null':
          normalizers[type] = new NullNormalizer(this.config.null as NullNormalizerConfig);
          break;
        case 'key':
          normalizers[type] = new KeyNormalizer(this.config.key as KeyNormalizerConfig);
          break;
      }
    });
    
    return normalizers as Record<NormalizerType, BaseNormalizer<any>>;
  }

  /**
   * Normalize data using all enabled normalizers
   */
  public normalize<T = any>(data: T, config?: Partial<NormalizerConfig>): T {
    // Merge config if provided
    const effectiveConfig = config ? this.mergeWithDefaults({ ...this.config, ...config }) : this.config;
    
    try {
      // Deep clone the data if needed
      const result = effectiveConfig.deepClone ? deepClone(data) : data;
      
      // Normalize the data
      return this.normalizeValue(result, effectiveConfig, undefined, true, !!config);
    } catch (error) {
      if (effectiveConfig.mode === 'strict') {
        throw error;
      }
      this.logger.error('Error during normalization:', error);
      return data;
    }
  }

  private normalizeValue<T>(value: T, config: NormalizerConfig, key?: string, atRoot: boolean = false, hasExplicitConfig: boolean = false): T {
    try {
      if (value === null || value === undefined) {
        return value;
      }

      // Handle arrays
      if (Array.isArray(value)) {
        return value.map(item => this.normalizeValue(item, config, key, false, hasExplicitConfig)) as unknown as T;
      }

      // Handle objects
      if (isObject(value)) {
        // Only normalize keys if key normalizer is explicitly enabled
        let result: Record<string, any> = value as unknown as Record<string, any>;
        if (config.key && config.key !== true && this.normalizers.key) {
          // When deepClone is false, avoid creating new object references
          if (config.deepClone) {
            result = this.normalizers.key.normalize(value, undefined, config);
          } else {
            const normalizedKeys = this.normalizers.key.normalize(value, undefined, config) as Record<string, any>;
            // Mutate in-place to preserve references
            Object.keys(result).forEach(k => delete result[k]);
            Object.keys(normalizedKeys).forEach(k => (result[k] = normalizedKeys[k]));
          }
        } else if (config.deepClone) {
          // Shallow clone when deepClone true and key normalizer disabled
          result = { ...value } as Record<string, any>;
        }
        
        // Then normalize each property
        for (const propKey in result) {
          if (Object.prototype.hasOwnProperty.call(result, propKey)) {
            // If key.preserve includes this key, skip value normalization
            const keyCfg = (config.key && config.key !== true ? config.key : undefined) as any;
            const preserveList: Array<string | RegExp> | undefined = keyCfg?.preserve;
            if (Array.isArray(preserveList) && preserveList.some(p => typeof p === 'string' ? p === propKey : p instanceof RegExp && p.test(propKey))) {
              continue;
            }
            result[propKey] = this.normalizeValue(result[propKey], config, propKey, false, hasExplicitConfig);
          }
        }
        
        return result as T;
      }

      // Apply normalizers based on value type
      // For top-level primitive values (no key), do not auto-normalize unless explicit config provided
      if (atRoot && key === undefined && (typeof value !== 'object' || value === null) && !hasExplicitConfig) {
        return value;
      }

      if (typeof value === 'string') {
        // Check if this key is in targetKeys (if specified)
        const isTargetKey = !config.targetKeys || (key && config.targetKeys.includes(key));
        if (!isTargetKey) {
          return value;
        }

        // Try date first
        if (this.normalizers.date) {
          const dateResult = this.normalizers.date.normalize(value, key, config);
          if (dateResult !== value) {
            this.logNormalization(config, key, value, dateResult, 'date');
            return dateResult as T;
          }
        }
        
        // Then try number
        if (this.normalizers.number) {
          const numberResult = this.normalizers.number.normalize(value, key, config);
          if (numberResult !== value) {
            this.logNormalization(config, key, value, numberResult, 'number');
            return numberResult as T;
          }
        }
        
        // Then try boolean
        if (this.normalizers.boolean) {
          const booleanResult = this.normalizers.boolean.normalize(value, key, config);
          if (booleanResult !== value) {
            this.logNormalization(config, key, value, booleanResult, 'boolean');
            return booleanResult as T;
          }
        }
        
        // Finally try null
        if (this.normalizers.null) {
          const nullResult = this.normalizers.null.normalize(value, key, config);
          if (nullResult === null) {
            this.logNormalization(config, key, value, null, 'null');
            return null as T;
          }
        }

        // In strict mode, if no normalizer applied but the value was a string, throw
        if (config.mode === 'strict') {
          throw new Error(`Strict mode: could not normalize value for key "${key}": ${value}`);
        }
      }
      
      return value;
    } catch (error) {
      if (config.mode === 'strict') {
        throw error;
      }
      this.logger.error(`Error normalizing value for key "${key}":`, error);
      return value;
    }
  }

  private logNormalization(config: NormalizerConfig, key: string | undefined, original: any, normalized: any, normalizerType: string): void {
    if (config.logging && key) {
      console.log(`Normalized value for key "${key}" using ${normalizerType} normalizer:`, {
        original,
        normalized
      });
    }
  }

  /**
   * Create a default instance for convenience
   */
  public static create(config: Partial<NormalizerConfig> = {}): Normalizer {
    return new Normalizer(config);
  }

  /**
   * Normalize data with a one-time config
   */
  public static normalize<T = any>(data: T, config?: Partial<NormalizerConfig>): T {
    return new Normalizer(config).normalize(data);
  }
}

// Create a default instance for convenience
export const normalizer = new Normalizer();

// Default export for ES modules
export default Normalizer;
