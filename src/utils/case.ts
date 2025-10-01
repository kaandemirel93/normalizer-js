/**
 * Case conversion utilities
 */

type CaseType = 'camel' | 'snake' | 'pascal' | 'kebab' | 'dot' | 'path' | 'constant' | 'pascal-snake' | 'capital' | 'header' | 'no' | 'param';

/**
 * Splits a string into words based on common separators and casing
 */
function splitIntoWords(str: string): string[] {
  if (!str) return [];
  
  // Handle camelCase, PascalCase, etc.
  const withSplitCamel = str.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Handle kebab-case, snake_case, etc.
  const words = withSplitCamel
    .replace(/[_-]/g, ' ')  // Convert separators to spaces
    .replace(/\./g, ' ')    // Handle dot notation
    .replace(/\//g, ' ')    // Handle path separators
    .split(/\s+/);          // Split on any whitespace
    
  return words.filter(Boolean);
}

/**
 * Converts a string to camelCase
 */
function toCamelCase(str: string): string {
  const words = splitIntoWords(str);
  if (words.length === 0) return '';
  
  return words
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Converts a string to snake_case
 */
function toSnakeCase(str: string): string {
  return splitIntoWords(str)
    .map(word => word.toLowerCase())
    .join('_');
}

/**
 * Converts a string to PascalCase
 */
function toPascalCase(str: string): string {
  return splitIntoWords(str)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Converts a string to kebab-case
 */
function toKebabCase(str: string): string {
  return splitIntoWords(str)
    .map(word => word.toLowerCase())
    .join('-');
}

/**
 * Converts a string to CONSTANT_CASE
 */
function toConstantCase(str: string): string {
  return splitIntoWords(str)
    .map(word => word.toUpperCase())
    .join('_');
}

/**
 * Converts a string to dot.case
 */
function toDotCase(str: string): string {
  return splitIntoWords(str)
    .map(word => word.toLowerCase())
    .join('.');
}

/**
 * Converts a string to path/case
 */
function toPathCase(str: string): string {
  return splitIntoWords(str)
    .map(word => word.toLowerCase())
    .join('/');
}

/**
 * Converts a string to Pascal_Snake_Case
 */
function toPascalSnakeCase(str: string): string {
  return splitIntoWords(str)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('_');
}

/**
 * Converts a string to Capital case
 */
function toCapitalCase(str: string): string {
  return splitIntoWords(str)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Converts a string to Header-Case
 */
function toHeaderCase(str: string): string {
  return splitIntoWords(str)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('-');
}

/**
 * Converts a string to no case (lowercase with spaces)
 */
function toNoCase(str: string): string {
  return splitIntoWords(str)
    .map(word => word.toLowerCase())
    .join(' ');
}

/**
 * Converts a string to param-case (same as kebab-case)
 */
function toParamCase(str: string): string {
  return toKebabCase(str);
}

/**
 * Converts a string to the specified case type
 */
export function convertCase(str: string, type: CaseType): string {
  if (!str) return str;
  
  switch (type) {
    case 'camel':
      return toCamelCase(str);
    case 'snake':
      return toSnakeCase(str);
    case 'pascal':
      return toPascalCase(str);
    case 'kebab':
      return toKebabCase(str);
    case 'dot':
      return toDotCase(str);
    case 'path':
      return toPathCase(str);
    case 'constant':
      return toConstantCase(str);
    case 'pascal-snake':
      return toPascalSnakeCase(str);
    case 'capital':
      return toCapitalCase(str);
    case 'header':
      return toHeaderCase(str);
    case 'no':
      return toNoCase(str);
    case 'param':
      return toParamCase(str);
    default:
      return str;
  }
}

/**
 * Detects the case of a string
 */
export function detectCase(str: string): CaseType | undefined {
  if (!str) return undefined;
  
  if (/^[a-z][a-z0-9]*([A-Z][a-z0-9]*)*$/.test(str)) return 'camel';
  if (/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(str)) return 'snake';
  if (/^[A-Z][a-z0-9]*([A-Z][a-z0-9]*)*$/.test(str)) return 'pascal';
  if (/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(str)) return 'kebab';
  if (/^[a-z][a-z0-9]*(?:\.[a-z0-9]+)*$/.test(str)) return 'dot';
  if (/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/.test(str)) return 'constant';
  
  return undefined;
}
