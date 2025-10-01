// Core exports
import Normalizer, { normalizer } from './Normalizer';

export { normalizer };
export { Normalizer };

// Type exports
export type {
  NormalizerConfig,
  NormalizerMode,
  DateNormalizerConfig,
  NumberNormalizerConfig,
  BooleanNormalizerConfig,
  NullNormalizerConfig,
  KeyNormalizerConfig
} from './types';

// Individual normalizers for advanced usage
export { default as DateNormalizer } from './normalizers/DateNormalizer';
export { default as NumberNormalizer } from './normalizers/NumberNormalizer';
export { default as BooleanNormalizer } from './normalizers/BooleanNormalizer';
export { default as NullNormalizer } from './normalizers/NullNormalizer';
export { default as KeyNormalizer } from './normalizers/KeyNormalizer';

// Default export for simpler imports
export { normalizer as default } from './Normalizer';
