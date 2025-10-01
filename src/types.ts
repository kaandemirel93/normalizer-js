/**
 * Type definitions for Normalizer JS
 */

export type NormalizerMode = 'strict' | 'loose';

/** Base configuration for all normalizers */
export interface BaseNormalizerConfig {
  /** Whether to throw errors for invalid values */
  strictMode?: boolean;
  /** Specific keys to target for normalization */
  targetKeys?: string[];
}

/** Configuration for date normalization */
export interface DateNormalizerConfig extends BaseNormalizerConfig {
  /** Output format for dates */
  outputFormat?: 'iso' | 'timestamp' | 'utc' | 'local' | string;
  /** Timezone for date conversion */
  timezone?: string;
}

/** Configuration for number normalization */
export interface NumberNormalizerConfig extends BaseNormalizerConfig {
  /** Whether to allow floating point numbers */
  allowFloat?: boolean;
}

/** Configuration for boolean normalization */
export interface BooleanNormalizerConfig extends BaseNormalizerConfig {
  /** Custom values that should be considered truthy */
  truthyValues?: Array<string | number | boolean>;
  /** Custom values that should be considered falsy */
  falsyValues?: Array<string | number | boolean>;
}

/** Configuration for null normalization */
export interface NullNormalizerConfig extends BaseNormalizerConfig {
  /** Custom values that should be converted to null */
  customNulls?: Array<string | number | boolean>;
}

/** Supported case styles for key normalization */
export type CaseType = 
  | 'camel' 
  | 'snake' 
  | 'kebab' 
  | 'pascal' 
  | 'constant' 
  | 'dot' 
  | 'path' 
  | 'pascal-snake' 
  | 'capital' 
  | 'header' 
  | 'no' 
  | 'param';

/** Configuration for key normalization */
export interface KeyNormalizerConfig extends BaseNormalizerConfig {
  /** Case style to convert keys to */
  style?: CaseType;
  /** Whether to recursively normalize nested objects */
  recursive?: boolean;
  /** Keys or patterns to preserve (case-insensitive) */
  preserve?: Array<string | RegExp>;
}

/** Global configuration for the normalizer */
export interface NormalizerConfig {
  /** Global mode (overrides individual normalizer settings) */
  mode?: NormalizerMode;
  /** Whether to deep clone objects before normalization */
  deepClone?: boolean;
  /** Whether to enable logging */
  logging?: boolean;
  /** Whether to enable strict mode globally */
  strictMode?: boolean;
  /** Specific keys to target for normalization (applies to all normalizers) */
  targetKeys?: string[];
  
  /** Per-normalizer configurations */
  date?: boolean | (Partial<DateNormalizerConfig> & { targetKeys?: string[] });
  number?: boolean | (Partial<NumberNormalizerConfig> & { targetKeys?: string[] });
  boolean?: boolean | (Partial<BooleanNormalizerConfig> & { targetKeys?: string[] });
  null?: boolean | (Partial<NullNormalizerConfig> & { targetKeys?: string[] });
  key?: boolean | (Partial<KeyNormalizerConfig> & { targetKeys?: string[] });
}

/** Type of normalizer */
export type NormalizerType = 'date' | 'number' | 'boolean' | 'null' | 'key';

/** Normalizer interface that all normalizers must implement */
export interface Normalizer<TConfig extends BaseNormalizerConfig = BaseNormalizerConfig> {
  /** The type of normalizer */
  readonly type: NormalizerType;
  
  /** Normalize a value */
  normalize(value: any, key?: string, config?: Partial<NormalizerConfig>): any;
  
  /** Check if a value should be normalized */
  shouldNormalize(value: any, key?: string, config?: Partial<NormalizerConfig>): boolean;
  
  /** Handle normalization errors */
  handleError(error: Error, value: any, key?: string): any;
  
  /** Check if strict mode is enabled */
  isStrictMode(config?: any): boolean;
  
  /** Check if a key is a target for normalization */
  isTargetKey(key?: string, config?: any): boolean;
  
  /** Logger instance */
  logger: Console;
  
  /** Default configuration */
  defaultConfig: TConfig;
  
  /** Current configuration */
  config: TConfig;
}

/** Map of normalizer types to their instances */
export type NormalizerMap = {
  [K in NormalizerType]?: Normalizer<any>;
};

/** Map of normalizer types to their configurations */
export type NormalizerConfigMap = {
  [K in NormalizerType]?: Partial<NormalizerConfig[K]>;
};
