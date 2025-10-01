import { NormalizerConfig, NormalizerType, DateNormalizerConfig } from '../types';
import BaseNormalizer from './BaseNormalizer';
import { parseDate, formatDate } from '../utils/date';

/**
 * Normalizes date strings and timestamps to a consistent format.
 * 
 * @example
 * const normalizer = new DateNormalizer({ outputFormat: 'iso', timezone: 'UTC' });
 * normalizer.normalize('2023-01-01'); // Returns '2023-01-01T00:00:00.000Z'
 */
export default class DateNormalizer extends BaseNormalizer<DateNormalizerConfig> {
  static readonly DEFAULT_CONFIG: DateNormalizerConfig = {
    outputFormat: 'iso',
    timezone: 'UTC',
    strictMode: false,
    targetKeys: undefined
  };

  constructor(config: Partial<DateNormalizerConfig> | NormalizerConfig = {}) {
    // Extract per-normalizer config if a global NormalizerConfig is passed
    const dateConfig = (config as NormalizerConfig)?.date;
    const perNormalizerConfig: Partial<DateNormalizerConfig> =
      typeof dateConfig === 'object' && dateConfig !== null ? (dateConfig as Partial<DateNormalizerConfig>) : (config as Partial<DateNormalizerConfig>);

    super(
      'date',
      { ...DateNormalizer.DEFAULT_CONFIG },
      perNormalizerConfig
    );
  }

  public normalize(value: any, key?: string, config?: Partial<NormalizerConfig>): any {
    // Determine effective config first to respect strict mode behavior
    const effectiveConfig = this.getEffectiveConfig(config);
    if (!this.shouldNormalize(value, key, config)) {
      // In strict mode, attempt to parse and throw on invalid dates
      if (this.isStrictMode(config)) {
        throw new Error(`Invalid date value: ${value}`);
      }
      return value;
    }

    try {
      
      // If the value is already a Date object, use it directly
      let date: Date | null = value instanceof Date ? new Date(value) : null;
      
      // If not a Date, try to parse it
      if (!date && (typeof value === 'string' || typeof value === 'number')) {
        date = parseDate(value);
      }

      // If we still don't have a valid date
      if (!date || isNaN(date.getTime())) {
        // In strict mode, throw an error for invalid dates
        if (this.isStrictMode(config)) {
          throw new Error(`Invalid date value: ${value}`);
        }
        return value;
      }

      // Format the date according to output format
      if (effectiveConfig.outputFormat === 'timestamp') {
        return date.getTime();
      } else if (effectiveConfig.outputFormat === 'iso') {
        // ISO string already represents time in UTC
        return date.toISOString();
      } else if (typeof effectiveConfig.outputFormat === 'string') {
        return formatDate(date, effectiveConfig.outputFormat);
      }

      // Default to returning the Date object
      return date;
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

    // In strict mode, attempt to normalize/validate string or number values
    if (this.isStrictMode(config)) {
      if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
        return true;
      }
    }

    // Support Date objects directly
    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }

    // Support numeric timestamps (milliseconds since epoch)
    if (typeof value === 'number') {
      return Number.isFinite(value);
    }

    // Support numeric string timestamps
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (/^\d{10,13}$/.test(trimmed)) {
        return true;
      }
      return !isNaN(Date.parse(trimmed));
    }

    return false;
  }

  private getEffectiveConfig(config?: Partial<NormalizerConfig>): DateNormalizerConfig {
    const override = (config as NormalizerConfig)?.date;
    const overrideCfg: Partial<DateNormalizerConfig> = typeof override === 'object' && override !== null ? override : {};
    return {
      ...this.config,
      ...overrideCfg,
    } as DateNormalizerConfig;
  }
}
